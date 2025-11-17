from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import pydantic

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"]) 
#connect to supabase
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url,key)

@app.route("/home")
def fetchCourses():
    print("yay")
    #return json of user's courses

@app.route("/LoadGraph", methods = ["GET"])
def LoadGraph():
    print("request graphs from supabase and return as json (maybe just request updated things perhaps?)")


#need prevention of empty data
@app.route("/AddNode", methods = ["POST"])
#add option in UI to allow topical cycles (?)
def AddNode():
    data = request.json
    topicName: str = data["topicInput"]
    outgoingConnections: pydantic.List[str] = data["outgoingConnections"]
    incomingConnections: pydantic.List[str] = data["incomingConnections"]
    #try
    responseConcept = (
        supabase.table("Concepts")
        .insert({"conceptName": topicName})
        .execute()
    )
    #if not exception:
    topicId: int = responseConcept.data[0]["id"]

    allRows = [
        {"sourceconceptid": topicId, "targetconceptid": id, "linktype": "source_is_prereq_to_target"}
        for id in outgoingConnections
    ]
    incomingRows = [
        {"sourceconceptid": id, "targetconceptid": topicId, "linktype": "source_is_prereq_to_target"}
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

@app.route("/DeleteNode", methods = ["DELETE"])
def DeleteNode():
    data = request.json
    topicName: str = data["topicInput"]
    topic = (
        supabase.table("Concepts")
        .select("id")
        .eq("conceptName", topicName)
        .execute()
    )
    topicId = topic.data[0]["id"]
    (
        supabase.table("conceptlinks")
        .delete()
        .or_(f"sourceconceptid.eq.{topicId},targetconceptid.eq.{topicId}")
        .execute()
    )
    (
        supabase.table("Concepts")
        .delete()
        .eq("id", topicId)
        .execute()
    )
    #will need to delete from courses as well later
    return "OK", 200

@app.route("/EditNodeOutgoing", methods = ["PATCH"])
def EditNodeOutgoing():
    data = request.json
    topicName: str = data["topicInput"]
    outgoingConnections: pydantic.List[str] = data["outgoingConnections"]
    topic = (
        supabase.table("Concepts")
        .select("id")
        .eq("conceptName", topicName)
        .execute()
    )
    topicId = topic.data[0]["id"]
    (
        supabase.table("conceptlinks")
        .delete()
        .eq("sourceconceptid", topicId)
        .execute()
    )
    rows = [
        {"sourceconceptid": topicId, "targetconceptid": id, "linktype": "source_is_prereq_to_target"}
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
    topicName: str = data["topicInput"]
    incomingConnections: pydantic.List[str] = data["incomingConnections"]
    topic = (
        supabase.table("Concepts")
        .select("id")
        .eq("conceptName", topicName)
        .execute()
    )
    topicId = topic.data[0]["id"]
    (
        supabase.table("conceptlinks")
        .delete()
        .eq("targetconceptid", topicId)
        .execute()
    )
    rows = [
        {"sourceconceptid": id, "targetconceptid": topicId, "linktype": "source_is_prereq_to_target"}
        for id in incomingConnections
    ]
    if rows:
        (
            supabase.table("conceptlinks")
            .insert(rows)
            .execute()
        )
    return "OK", 200


#courseName/GetGraph to specify which topics to grab
#only display nodes that belong in the course(so if they are linked to other things, dont show those other things)

@app.route("/GetGraph", methods = ["GET"])
def GetGraph():
    #query db for graph
    getConceptsResponse = (
        supabase.table("Concepts")
        .select("id,conceptName")
        .execute()
    )
    topicNames: pydantic.List[str] = [row["conceptName"] for row in getConceptsResponse.data]
    topicIds: pydantic.List[int] = [row["id"] for row in getConceptsResponse.data]
    getConnectionsResponse = (
        supabase.table("conceptlinks")
        .select("sourceconceptid, targetconceptid")
        .execute()
    )
    sourcesToTargets: pydantic.List[pydantic.Tuple[int,int]] =[]
    for row in getConnectionsResponse.data:
        sourcesToTargets.append((row["sourceconceptid"], row["targetconceptid"]))
    nodes = []
    edges = []
    for topic, id in zip(topicNames,topicIds):
        nodes.append(
            {
                "id": str(id), "position":{"x": 0, "y": 0}, "data": {"label": topic}, "type":"custom"
            }
        )
    for tuple in sourcesToTargets:
        edges.append( # can add type of edge 
                {"id":f"{tuple[0]}-{tuple[1]}", "source": str(tuple[0]), "target": str(tuple[1])}
        )
    return jsonify({"nodes":nodes, "edges":edges})



if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=True)
