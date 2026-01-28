from flask import Flask, request, jsonify, Response
import json
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import pydantic
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

@app.route("/EditNodeOutgoing", methods = ["PATCH"]) #could rewrite this to encompass both editnodeoutgoingandincoming
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

@app.route("/GetGraph", methods = ["GET"])
def GetGraph():
    #query db for graph
    courseId = request.args.get("id")
    if not courseId:
        return "Failed", 500
    courseId = int(courseId)
    return getGraphHelper(courseId, [])


@app.route("/GetConceptIds", methods = ["GET"])
def GetConceptIds():
    courseId: int = int(request.args.get("id"))
    conceptNames: pydantic.List[str] = []
    conceptName: str = request.args.get("0")
    i = 0
    while(conceptName):
        conceptNames.append(conceptName)
        i+=1
        conceptName = request.args.get(f"{i}")
    conceptIdsResponse = (
        supabase.table("Concepts")
        .select("id")
        .eq("courseid",courseId)
        .in_("conceptName", conceptNames)
        .execute()
    )

    return jsonify([id["id"] for id in conceptIdsResponse.data])

def getGraphHelper(courseId:int, selectedNodes):
    getConceptsResponse = ()
    getConnectionsResponse = ()
    conceptNames: pydantic.List[str] = selectedNodes
    conceptIds: pydantic.List[int] = []
    nameId: pydantic.List[pydantic.Tuple[str,int]] = []
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
            .select("sourceconceptid, targetconceptid")
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
        conceptIds: pydantic.List[int] = [concept["id"] for concept in getConceptsResponse.data]
        nameId = [(concept["conceptName"], concept["id"]) for concept in getConceptsResponse.data]
        getConnectionsResponse = (
            supabase.table("conceptlinks")
            .select("sourceconceptid, targetconceptid")
            .eq("courseid",courseId)
            .in_("sourceconceptid", conceptIds)
            .in_("targetconceptid", conceptIds)
            .execute()
        )
    sourcesToTargets: pydantic.List[pydantic.Tuple[int,int]] = []
    for row in getConnectionsResponse.data:
        sourcesToTargets.append((row["sourceconceptid"], row["targetconceptid"]))
    nodes = []
    edges = []
    for conceptTuple in nameId:
        nodes.append(
            {
                "id": str(conceptTuple[1]), "position":{"x": 0, "y": 0}, "data": {"label": conceptTuple[0], "courseId": courseId}, "type":"custom"
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
    (
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
    courseName: str = request.args.get("courseName")
    courseIdResponse = (
        supabase.table("Courses")
        .select("id")
        .eq("courseName",courseName)
        .execute()
    )
    return jsonify({"courseId": courseIdResponse.data[0]["id"]})


@app.route("/GetConceptMapArguments", methods = ["GET"])
def GetConceptMapArguments():
    courseId: int = int(request.args.get("id"))
    conceptNames: pydantic.List[str] = []
    conceptName: str = request.args.get("0")
    lessonPlan:int = int(request.args.get("lessonPlan"))
    #needs extra param to see if im creating a lessonplan, so i know if i need to verify it
    i = 0
    while(conceptName):
        conceptNames.append(conceptName)
        i+=1
        conceptName = request.args.get(f"{i}")
    subGraphJSON = getGraphHelper(courseId, conceptNames)
    responseObject = {"graph": subGraphJSON, "message": ""}#store subgraphjson and message
    if lessonPlan == 1:
        wholeGraph = json.loads(getGraphHelper(courseId, []).data.decode('utf-8'))
        subGraph = json.loads(subGraphJSON.data.decode('utf-8'))
        missedPrereqs = verifyLessonPlan(subGraph, wholeGraph)
        
    # return jsonify(responseObject)
    return subGraphJSON


@app.route("/GenerateLessonPlan", methods = ["POST"])
def GenerateLessonPlan():
    data = request.json
    courseName:str = data["courseName"]
    courseId:str = data["courseId"]
    nodes: pydantic.List[pydantic.Tuple[int,str]] = [(int(concept["id"]),concept["label"]) for concept in data["nodes"]]
    edges: pydantic.List[pydantic.Tuple] = [(int(edge["source"]),int(edge["target"])) for edge in data["edges"]]
    data = {"courseName":courseName, "courseId": courseId, "nodes":nodes, "edges": edges}
    createLessonPlan(data)

    return "OK", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
