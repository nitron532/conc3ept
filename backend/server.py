from flask import Flask, request, jsonify
import json
from flask_cors import CORS
import os
import psycopg
from dotenv import load_dotenv
from lessonplan import createLessonPlan
from graph import verifyLessonPlan

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

load_dotenv()
conn = psycopg.connect(
    host="localhost",
    dbname=os.environ.get("POSTGRESDB"),
    user=os.environ.get("POSTGRESUSER"),
    password=os.environ.get("POSTGRESPASSWORD")
)

@app.route("/AddNode", methods=["POST"])
def AddNode():
    data = request.json
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]
    outgoingConnections: list[str] = data["outgoingConnections"]
    incomingConnections: list[str] = data["incomingConnections"]

    with conn.cursor() as cur:
        cur.execute(
            'INSERT INTO "Concepts" ("conceptName", courseid) VALUES (%s, %s) RETURNING id',
            (conceptName, courseId)
        )
        conceptId: int = cur.fetchone()[0]

        allRows = [(conceptId, int(id), "", courseId) for id in outgoingConnections]
        incomingRows = [(int(id), conceptId, "", courseId) for id in incomingConnections]
        allRows.extend(incomingRows)

        if allRows:
            cur.executemany(
                "INSERT INTO conceptlinks (sourceconceptid, targetconceptid, linktype, courseid) VALUES (%s, %s, %s, %s)",
                allRows
            )
        conn.commit()
    return "OK", 200


@app.route("/EditNodeName", methods=["PATCH"])
def EditNodeName():
    data = request.json
    with conn.cursor() as cur:
        cur.execute(
            'UPDATE "Concepts" SET "conceptName" = %s WHERE id = %s',
            (data["newName"], data["id"])
        )
        conn.commit()
    return "OK", 200


@app.route("/DeleteSelectedNodes", methods=["DELETE"])
def DeleteSelectedNodes():
    data = request.json
    courseId: int = data["courseId"]
    conceptNames: list[str] = data["selectedNodes"]

    with conn.cursor() as cur:
        cur.execute(
            'SELECT id FROM "Concepts" WHERE courseid = %s AND "conceptName" = ANY(%s)',
            (courseId, conceptNames)
        )
        conceptIds = [row[0] for row in cur.fetchall()]

        cur.execute(
            'DELETE FROM "Concepts" WHERE id = ANY(%s) AND courseid = %s',
            (conceptIds, courseId)
        )
        conn.commit()
    return "OK", 200


@app.route("/DeleteNode", methods=["DELETE"])
def DeleteNode():
    data = request.json
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]

    with conn.cursor() as cur:
        cur.execute(
            'DELETE FROM "Concepts" WHERE "conceptName" = %s AND courseid = %s',
            (conceptName, courseId)
        )
        conn.commit()
    return "OK", 200


@app.route("/EditEdgeLabel", methods=["PATCH"])
def EditEdgeLabel():
    data = request.json
    newLabel = data["newLabel"]
    sourceId = data["id"][:data["id"].find("-")]
    targetId = data["id"][data["id"].find("-") + 1:]

    with conn.cursor() as cur:
        cur.execute(
            "UPDATE conceptlinks SET linktype = %s WHERE sourceconceptid = %s AND targetconceptid = %s",
            (newLabel, sourceId, targetId)
        )
        conn.commit()
    return "OK", 200


@app.route("/EditNodeEdges", methods=["PATCH"])
def EditNodeEdges():
    data = request.json
    courseId: int = data["courseId"]
    conceptId: int = data["id"]
    sourceToTargetPairs = (
        [(int(id), conceptId) for id in data["incomingConnections"]] +
        [(conceptId, int(id)) for id in data["outgoingConnections"]]
    )

    with conn.cursor() as cur:
        cur.execute(
            """SELECT sourceconceptid, targetconceptid FROM conceptlinks
               WHERE (sourceconceptid = %s OR targetconceptid = %s) AND courseid = %s""",
            (conceptId, conceptId, courseId)
        )
        existingPairs = {(row[0], row[1]) for row in cur.fetchall()}

        toInsert = [
            (sTTP[0], sTTP[1], "", courseId)
            for sTTP in sourceToTargetPairs if sTTP not in existingPairs
        ]
        toDelete = existingPairs - set(sourceToTargetPairs)

        if toInsert:
            cur.executemany(
                "INSERT INTO conceptlinks (sourceconceptid, targetconceptid, linktype, courseid) VALUES (%s, %s, %s, %s)",
                toInsert
            )

        if toDelete:
            cur.executemany(
                "DELETE FROM conceptlinks WHERE sourceconceptid = %s AND targetconceptid = %s AND courseid = %s",
                [(source, target, courseId) for source, target in toDelete]
            )

        conn.commit()
    return "OK", 200


@app.route("/GetGraph", methods=["GET"])
def GetGraph():
    courseId = request.args.get("id")
    if not courseId:
        return "Failed", 500
    courseId = int(courseId)
    return getGraphHelper(courseId, [])


def getGraphHelper(courseId: int, selectedNodes):
    with conn.cursor() as cur:
        if len(selectedNodes) == 0:
            cur.execute(
                'SELECT id, "conceptName" FROM "Concepts" WHERE courseid = %s',
                (courseId,)
            )
            conceptRows = cur.fetchall()
            nameId = [(row[1], row[0]) for row in conceptRows]

            cur.execute(
                "SELECT sourceconceptid, targetconceptid, linktype FROM conceptlinks WHERE courseid = %s",
                (courseId,)
            )
        else:
            cur.execute(
                'SELECT id, "conceptName" FROM "Concepts" WHERE courseid = %s AND "conceptName" = ANY(%s)',
                (courseId, selectedNodes)
            )
            conceptRows = cur.fetchall()
            nameId = [(row[1], row[0]) for row in conceptRows]
            conceptIds = [row[0] for row in conceptRows]

            cur.execute(
                """SELECT sourceconceptid, targetconceptid, linktype FROM conceptlinks
                   WHERE courseid = %s AND sourceconceptid = ANY(%s) AND targetconceptid = ANY(%s)""",
                (courseId, conceptIds, conceptIds)
            )

        sourcesToTargets = [(row[0], row[1], row[2]) for row in cur.fetchall()]

    nodes = [
        {
            "id": str(conceptTuple[1]),
            "position": {"x": 0, "y": 0},
            "data": {"label": conceptTuple[0], "courseId": courseId, "conceptId": conceptTuple[1]},
            "type": "custom"
        }
        for conceptTuple in nameId
    ]
    edges = [
        {
            "id": f"{t[0]}-{t[1]}",
            "source": str(t[0]),
            "target": str(t[1]),
            "courseId": courseId,
            "data": {"label": t[2]}
        }
        for t in sourcesToTargets
    ]
    return jsonify({"nodes": nodes, "edges": edges})


@app.route("/GetCourses", methods=["GET"])
def GetCourses():
    with conn.cursor() as cur:
        cur.execute('SELECT id, "courseName" FROM "Courses"')
        rows = cur.fetchall()
    return jsonify([{"courseName": row[1], "courseId": row[0]} for row in rows])


@app.route("/DeleteCourse", methods=["DELETE"])
def DeleteCourse():
    data = request.json
    courseId: int = data["courseId"]
    with conn.cursor() as cur:
        cur.execute('DELETE FROM "Courses" WHERE id = %s', (courseId,))
        conn.commit()
    return "OK", 200


@app.route("/AddCourse", methods=["POST"])
def AddCourse():
    data = request.json
    with conn.cursor() as cur:
        cur.execute('INSERT INTO "Courses" ("courseName") VALUES (%s)', (data["courseInput"],))
        conn.commit()
    return "OK", 200


@app.route("/EditCourse", methods=["PATCH"])
def EditCourse():
    data = request.json
    with conn.cursor() as cur:
        cur.execute(
            'UPDATE "Courses" SET "courseName" = %s WHERE id = %s',
            (data["newName"], data["courseId"])
        )
        conn.commit()
    return "OK", 200


@app.route("/GetConceptMapArguments", methods=["GET"])
def GetConceptMapArguments():
    courseId: int = int(request.args.get("id"))
    conceptNames: list[str] = []
    conceptName: str = request.args.get("0")
    lessonPlan: int = int(request.args.get("lessonPlan"))
    i = 0
    while conceptName:
        conceptNames.append(conceptName)
        i += 1
        conceptName = request.args.get(f"{i}")

    subGraphJSON = getGraphHelper(courseId, conceptNames)
    responseObject = {"graph": subGraphJSON.get_json(), "message": ""}

    if lessonPlan == 1:
        wholeGraph = json.loads(getGraphHelper(courseId, []).data.decode('utf-8'))
        subGraph = json.loads(subGraphJSON.data.decode('utf-8'))
        missedPrereqs: list[int] = verifyLessonPlan(subGraph, wholeGraph)
        if missedPrereqs:
            responseObject["message"] = "Your current lesson plan skips the following prerequisite topics: "
            for concept in wholeGraph["nodes"]:
                if int(concept["id"]) in missedPrereqs:
                    responseObject["message"] += f"{concept['data']['label']}, "
        responseObject["message"] = responseObject["message"][:-2]

    return jsonify(responseObject)


@app.route("/GenerateLessonPlan", methods=["POST"])
def GenerateLessonPlan():
    data = request.json
    courseName: str = data["courseName"]
    courseId: str = data["courseId"]
    nodes: list[tuple[int, str]] = [(int(concept["id"]), concept["label"]) for concept in data["nodes"]]
    edges: list[tuple[int, int]] = [(int(edge["source"]), int(edge["target"])) for edge in data["edges"]]
    subNodes: dict[str, list[str]] = {parent: list for parent, list in data["subNodes"].items()}
    data = {"courseName": courseName, "courseId": courseId, "nodes": nodes, "edges": edges, "subNodes": subNodes}
    createLessonPlan(data)
    return "OK", 200


@app.route("/RequestOldRepo", methods=["GET"])
def RequestOldRepo():
    conceptId: int = int(request.args.get("conceptId"))
    courseId: int = int(request.args.get("courseId"))
    questions = json.load(open("test.json"))
    matched = []
    for q in questions["questions"]:
        if q["classification"]["id"] == conceptId:
            matched.append({
                "id": str(q["qId"]),
                "data": {
                    "label": str(q["qId"]),
                    "courseId": courseId,
                    "conceptName": q["classification"]["topic"],
                    "conceptId": conceptId,
                    "conceptLevel": q["classification"]["level"],
                    "questionText": q["question_text"]
                },
                "type": "question"
            })
    return jsonify(matched)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)