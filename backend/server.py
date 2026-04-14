from flask import Flask, request, jsonify, Response
import json
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from lessonplan import createLessonPlan
from graph import verifyLessonPlan

#eventually should eliminate the need to query db for concept id, since we can just pass it with concept name data

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"]) 
#connect to supabase
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url,key)

#need prevention of empty data
@app.route("/AddNode", methods = ["POST"])

def AddNode():
    data = request.json
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]
    outgoingConnections: list[str] = data["outgoingConnections"]
    incomingConnections: list[str] = data["incomingConnections"]

    #try
    responseConcept = (
        supabase.table("Concepts")
        .insert({"conceptName": conceptName, "courseid": courseId})
        .execute()
    )
    #if not exception:
    conceptId: int = responseConcept.data[0]["id"]

    allRows = [
        {"sourceconceptid": conceptId, "targetconceptid": id, "linktype": "", "courseid":courseId}
        for id in outgoingConnections
    ]
    incomingRows = [
        {"sourceconceptid": id, "targetconceptid": conceptId, "linktype": "", "courseid":courseId}
        for id in incomingConnections
    ]
    allRows.extend(incomingRows)
    if allRows:
        (
            supabase.table("conceptlinks")
            .insert(allRows)
            .execute()
        )
    return "OK", 200

@app.route("/EditNodeName", methods = ["PATCH"])
def EditNodeName():
    data = request.json
    (
        supabase.table("Concepts")
        .update({"conceptName": data["newName"]})
        .eq("id", data["id"])
        .execute()
    )
    return "OK", 200

@app.route("/DeleteSelectedNodes", methods = ["DELETE"])
def DeleteSelectedNodes():
    data = request.json
    courseId: int = data["courseId"]
    conceptNames: list[str] = data["selectedNodes"]
    #TODO pass ids to remove extra supabase query
    concepts = (
        supabase.table("Concepts")
        .select("id")
        .eq("courseid", courseId)
        .in_("conceptName", conceptNames)
        .execute()
    )

    conceptIds = [t["id"] for t in concepts.data]

    # Step 2: delete all in one batch
    (supabase.table("Concepts")
        .delete()
        .in_("id", conceptIds)
        .eq("courseid", courseId)
        .execute()
    )
    return "OK", 200

@app.route("/DeleteNode", methods = ["DELETE"])
def DeleteNode():
    data = request.json
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]
    #TODO Pass id to remove instead
    concept = (
        supabase.table("Concepts")
        .select("id")
        .eq("conceptName", conceptName)
        .eq("courseid", courseId)
        .execute()
    )
    conceptId = concept.data[0]["id"]
    (
        supabase.table("Concepts")
        .delete()
        .eq("id", conceptId)
        .eq("courseid", courseId)
        .execute()
    )
    #will need to delete from courses as well later
    return "OK", 200


@app.route("/EditEdgeLabel", methods = ["PATCH"])
def EditEdgeLabel():
    data = request.json
    newLabel = data["newLabel"]
    sourceId = data["id"][:data["id"].find("-")]
    targetId = data["id"][data["id"].find("-") + 1:]
    (
        supabase.table("conceptlinks")
        .update({"linktype":newLabel})
        .eq("sourceconceptid", sourceId)
        .eq("targetconceptid", targetId)
        .execute()
    )
    return "OK", 200

@app.route("/EditNodeEdges", methods = ["PATCH"])
def EditNodeEdges():
    data = request.json
    courseId: int = data["courseId"]
    conceptId: int = data["id"]
    sourceToTargetPairs = [(int(id), conceptId) for id in data["incomingConnections"]] + [(conceptId,int(id)) for id in data["outgoingConnections"]]
    existing = (
        supabase.table("conceptlinks") 
            .select("sourceconceptid, targetconceptid") 
            .or_(f"sourceconceptid.eq.{conceptId}, targetconceptid.eq.{conceptId}")
            .eq("courseid", courseId) 
            .execute().data
        )

    existingPairs = {(e["sourceconceptid"], e["targetconceptid"]) for e in existing}

    toInsert = [sTTP for sTTP in sourceToTargetPairs if sTTP not in existingPairs]
    toInsert = [
        {"sourceconceptid": sTTP[0], "targetconceptid": sTTP[1], "linktype": "","courseid":courseId} for sTTP in toInsert
        ]
    
    toDelete = existingPairs - set(sourceToTargetPairs)
    if toInsert:
        supabase.table("conceptlinks").insert(toInsert).execute()

    toDelete = existingPairs - set(sourceToTargetPairs)
    for (source, target) in toDelete:
        (
            supabase.table("conceptlinks") 
                .delete()
                .eq("sourceconceptid", source) 
                .eq("targetconceptid", target) 
                .eq("courseid", courseId) 
                .execute()
        )
    return "OK", 200

@app.route("/GetGraph", methods = ["GET"])
def GetGraph():
    #query db for graph
    courseId = request.args.get("id")
    if not courseId:
        return "Failed", 500
    courseId = int(courseId)
    return getGraphHelper(courseId, [])

def getGraphHelper(courseId:int, selectedNodes):
    getConceptsResponse = ()
    getConnectionsResponse = ()
    conceptNames: list[str] = selectedNodes
    #TODO pass ids to selected Nodes (whole object) instead of names to avoid extra db request
    conceptIds: list[int] = []
    nameId: list[tuple[str,int]] = []
    if len(selectedNodes) == 0: # fetch all nodes and connections from db
        getConceptsResponse = (
            supabase.table("Concepts")
            .select("id,conceptName")
            .eq("courseid",courseId)
            .execute()
        )
        conceptIds = [row["id"] for row in getConceptsResponse.data]
        nameId = [(concept["conceptName"], concept["id"]) for concept in getConceptsResponse.data]
        getConnectionsResponse = (
            supabase.table("conceptlinks")
            .select("sourceconceptid, targetconceptid, linktype")
            .eq("courseid",courseId)
            .execute()
        )
    else: # fetch selected nodes and connections from db
        getConceptsResponse = (
            supabase.table("Concepts")
            .select("id,conceptName")
            .eq("courseid", courseId)
            .in_("conceptName",conceptNames)
            .execute()
        )
        # conceptIds: list[int] = [concept["id"] for concept in getConceptsResponse.data]
        nameId = [(concept["conceptName"], concept["id"]) for concept in getConceptsResponse.data]
        getConnectionsResponse = (
            supabase.table("conceptlinks")
            .select("sourceconceptid, targetconceptid, linktype")
            .eq("courseid",courseId)
            .in_("sourceconceptid", conceptIds)
            .in_("targetconceptid", conceptIds)
            .execute()
        )

    sourcesToTargets: list[tuple[int,int]] = []
    for row in getConnectionsResponse.data:
        sourcesToTargets.append((row["sourceconceptid"], row["targetconceptid"], row["linktype"]))
    nodes = []
    edges = []
    for conceptTuple in nameId:
        nodes.append(
            {
                "id": str(conceptTuple[1]), "position":{"x": 0, "y": 0}, "data": {"label": conceptTuple[0], "courseId": courseId, "conceptId": conceptTuple[1]}, "type":"custom"
            }
        )
    for tuple in sourcesToTargets:
        edges.append( # can add type of edge 
                {"id":f"{tuple[0]}-{tuple[1]}", "source": str(tuple[0]), "target": str(tuple[1]),"courseId":courseId, "data":{"label": tuple[2]}}
        )
    
    return jsonify({"nodes":nodes, "edges":edges})

@app.route("/GetCourses", methods = ["GET"])
def GetCourses():
    courses = (
        supabase.table("Courses")
        .select("id","courseName")
        .execute()
    )
    courseNamesList: list[str] = [object["courseName"] for object in courses.data]
    courseIdList: list[int] = [object["id"] for object in courses.data]
    nameId = list(zip(courseNamesList, courseIdList))
    return jsonify([{"courseName": nId[0], "courseId": nId[1]} for nId in nameId])

@app.route("/DeleteCourse", methods = ["DELETE"])
def DeleteCourse():
    data = request.json
    courseId: int = data["courseId"]
    (
        supabase.table("Courses")
        .delete()
        .eq("id", courseId)
        .execute()
    )
    return "OK", 200

@app.route("/AddCourse", methods = ["POST"])
def AddCourse():
    data = request.json
    (
        supabase.table("Courses")
        .insert({"courseName":data["courseInput"]})
        .execute()
    )
    return "OK", 200

@app.route("/EditCourse", methods = ["PATCH"])
def EditCourse():
    data = request.json
    (
        supabase.table("Courses")
        .update({"courseName": data["newName"]})
        .eq("id", data["courseId"])
        .execute()
    )
    return "OK", 200


@app.route("/GetConceptMapArguments", methods = ["GET"])
def GetConceptMapArguments():
    courseId: int = int(request.args.get("id"))
    conceptNames: list[str] = []
    #TODO pass IDs instead of names to avoid extra request for ids
    conceptName: str = request.args.get("0")
    lessonPlan:int = int(request.args.get("lessonPlan"))
    i = 0
    while(conceptName):
        conceptNames.append(conceptName)
        i+=1
        conceptName = request.args.get(f"{i}")
    subGraphJSON = getGraphHelper(courseId, conceptNames)
    responseObject = {"graph": subGraphJSON.get_json(), "message": ""}
    if lessonPlan == 1:
        wholeGraph = json.loads(getGraphHelper(courseId, []).data.decode('utf-8'))
        subGraph = json.loads(subGraphJSON.data.decode('utf-8'))
        missedPrereqs: list[int] = verifyLessonPlan(subGraph, wholeGraph) #ids
        if(missedPrereqs):
            responseObject["message"] = "Your current lesson plan skips the following prerequisite topics: "
            for concept in wholeGraph["nodes"]:
                if int(concept["id"]) in missedPrereqs:
                    responseObject["message"] += f"{concept["data"]["label"]}, "
        responseObject["message"] = responseObject["message"][:-2]
    return jsonify(responseObject)


@app.route("/GenerateLessonPlan", methods = ["POST"])
def GenerateLessonPlan():
    data = request.json
    courseName:str = data["courseName"]
    courseId:str = data["courseId"]
    nodes: list[tuple[int,str]] = [(int(concept["id"]),concept["label"]) for concept in data["nodes"]]
    edges: list[tuple[int,int]] = [(int(edge["source"]),int(edge["target"])) for edge in data["edges"]]
    subNodes: dict[str,list[str]] = {parent:list for parent, list in data["subNodes"].items()}
    data = {"courseName":courseName, "courseId": courseId, "nodes":nodes, "edges": edges,"subNodes": subNodes}
    createLessonPlan(data)

    return "OK", 200

#eventually this should be request questionRepo so people can plugin their own question banks
@app.route("/RequestOldRepo", methods = ["GET"])
def RequestOldRepo():
    conceptId: int = int(request.args.get("conceptId"))
    courseId: int = int(request.args.get("courseId"))
    # request...
    #following is for testing only
    questions = json.load(open("test.json")) # this would be json returned from EQUAL or oldrepo. will also return answers as well for question info view
    matched = []
    print(f" conceptId: {conceptId}")
    for q in questions["questions"]: #wont need to search since it will have been requested via concept keyword and level
        if q["classification"]["id"] == conceptId:
            matched.append({
                "id":str(q["qId"]), "data":{"label": str(q["qId"]), "courseId": courseId, "conceptName": q["classification"]["topic"], "conceptId": conceptId, "conceptLevel": q["classification"]["level"], "questionText":q["question_text"]}, "type": "question"
            })
    return jsonify(matched)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
