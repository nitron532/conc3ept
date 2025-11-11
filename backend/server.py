from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import datetime
import requests
import json
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
@app.route("/AddTopic", methods = ["POST"])
#add option in UI to allow topical cycles (?)
def AddTopic():
    data = request.json
    topicName: str = data["topicInput"]
    connections: pydantic.List[str] = data["connections"]
    #try
    responseConcept = (
        supabase.table("Concepts")
        .insert({"conceptName": topicName})
        .execute()
    )
    #if not exception:
    preReqId: int = responseConcept.data[0]["id"]

    rows = [
        {"sourceconceptid": preReqId, "targetconceptid": id, "linktype": "source_is_prereq_to_target"}
        for id in connections
    ]
    responseLink = (
        supabase.table("conceptlinks")
        .insert(rows)
        .execute()
    )
    return "OK", 200

@app.route("/EditTopic", methods = ["PATCH"])
def EditTopic():
    print("edit")

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
