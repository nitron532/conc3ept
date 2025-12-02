from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import pydantic

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
#add option in UI to allow conceptal cycles (?)
def AddNode():
    data = request.json
    print(data)
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]
    outgoingConnections: pydantic.List[str] = data["outgoingConnections"]
    incomingConnections: pydantic.List[str] = data["incomingConnections"]

    #try
    responseConcept = (
        supabase.table("Concepts")
        .insert({"conceptName": conceptName, "courseid": courseId})
        .execute()
    )
    #if not exception:
    conceptId: int = responseConcept.data[0]["id"]

    allRows = [
        {"sourceconceptid": conceptId, "targetconceptid": id, "linktype": "source_is_prereq_to_target", "courseid":courseId}
        for id in outgoingConnections
    ]
    incomingRows = [
        {"sourceconceptid": id, "targetconceptid": conceptId, "linktype": "source_is_prereq_to_target", "courseid":courseId}
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

@app.route("/DeleteSelectedNodes", methods = ["DELETE"])
def DeleteSelectedNodes():
    data = request.json
    courseId: int = data["courseId"]
    conceptNames: pydantic.List[str] = data["selectedNodes"]
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

@app.route("/EditNodeOutgoing", methods = ["PATCH"]) #could rewrite this to encomposs both editnodeoutgoingandincoming
def EditNodeOutgoing():
    data = request.json
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]
    outgoingConnections: pydantic.List[int] = [int(id) for id in data["outgoingConnections"]]
    concept = (
        supabase.table("Concepts")
        .select("id")
        .eq("courseid", courseId)
        .eq("conceptName", conceptName)
        .execute()
    )
    conceptId = concept.data[0]["id"]
    (
        supabase.table("conceptlinks")
        .delete()
        .eq("sourceconceptid", conceptId)
        .eq("courseid",courseId)
        .execute()
    )
    rows = [
        {"sourceconceptid": conceptId, "targetconceptid": id, "linktype": "source_is_prereq_to_target","courseid":courseId}
        for id in outgoingConnections
    ]
    if rows:
        (
            supabase.table("conceptlinks")
            .insert(rows)
            .execute()
        )
    return "OK", 200
    
@app.route("/EditNodeIncoming", methods = ["PATCH"])
def EditNodeIncoming():
    data = request.json
    courseId: int = data["courseId"]
    conceptName: str = data["conceptInput"]
    incomingConnections: pydantic.List[int] = [int(id) for id in data["incomingConnections"]]
    concept = (
        supabase.table("Concepts")
        .select("id")
        .eq("courseid",courseId)
        .eq("conceptName", conceptName)
        .execute()
    )
    conceptId = concept.data[0]["id"]
    (
        supabase.table("conceptlinks")
        .delete()
        .eq("courseid",courseId)
        .eq("targetconceptid", conceptId)
        .execute()
    )
    rows = [
        {"sourceconceptid": id, "targetconceptid": conceptId, "linktype": "source_is_prereq_to_target", "courseid": courseId}
        for id in incomingConnections
    ]
    if rows:
        (
            supabase.table("conceptlinks")
            .insert(rows)
            .execute()
        )
    return "OK", 200


#courseName/GetGraph to specify which concepts to grab
#only display nodes that belong in the course(so if they are linked to other things, dont show those other things)

@app.route("/GetGraph", methods = ["GET"])
def GetGraph():
    #query db for graph
    courseId = request.args.get("id")
    if not courseId:
        return "Failed", 500
    courseId = int(courseId)
    getConceptsResponse = (
        supabase.table("Concepts")
        .select("id,conceptName")
        .eq("courseid",courseId)
        .execute()
    )
    conceptNames: pydantic.List[str] = [row["conceptName"] for row in getConceptsResponse.data]
    conceptIds: pydantic.List[int] = [row["id"] for row in getConceptsResponse.data]
    getConnectionsResponse = (
        supabase.table("conceptlinks")
        .select("sourceconceptid, targetconceptid")
        .eq("courseid",courseId)
        .execute()
    )
    sourcesToTargets: pydantic.List[pydantic.Tuple[int,int]] =[]
    for row in getConnectionsResponse.data:
        sourcesToTargets.append((row["sourceconceptid"], row["targetconceptid"]))
    nodes = []
    edges = []
    for concept, id in zip(conceptNames,conceptIds):
        nodes.append(
            {
                "id": str(id), "position":{"x": 0, "y": 0}, "data": {"label": concept, "courseId": courseId}, "type":"custom"
            }
        )
    for tuple in sourcesToTargets:
        edges.append( # can add type of edge 
                {"id":f"{tuple[0]}-{tuple[1]}", "source": str(tuple[0]), "target": str(tuple[1]),"courseId":courseId}
        )
    return jsonify({"nodes":nodes, "edges":edges})


@app.route("/AddCourse", methods = ["POST"])
def AddCourse():
    data = request.json
    addCourseResponse = (
        supabase.table("Courses")
        .insert({"courseName":data["courseInput"]})
        .execute()
    )
    return "OK", 200

@app.route("/GetCourses", methods = ["GET"])
def GetCourses():
    courses = (
        supabase.table("Courses")
        .select("id","courseName")
        .execute()
    )
    courseNamesList: pydantic.List[str] = [object["courseName"] for object in courses.data]
    courseIdList: pydantic.List[int] = [object["id"] for object in courses.data]
    nameId = list(zip(courseNamesList, courseIdList))
    return jsonify({"courses":nameId})

@app.route("/GetCourseId", methods = ["GET"]) # TODO fallback if courseid is undefined. Needs error handling
def GetCourseId():
    courseName = request.args.get("courseName")
    courseIdResponse = (
        supabase.table("Courses")
        .select("id")
        .eq("courseName",courseName)
        .execute()
    )
    return jsonify({"courseId": courseIdResponse.data[0]["id"]})


if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=True)
