from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import datetime
import requests
import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from flask import g
import pydantic


# class ConceptGraphService:
#     def __init__(self, supabase_url, supabase_key, user_session=None):
#         """
#         supabase_url/key: credentials to connect to Supabase
#         user_session: optional dict or object with user info
#         """
#         from supabase import create_client
#         self.client = create_client(supabase_url, supabase_key)
#         self.user_session = user_session  # store authenticated user info

#     # ----------------------------
#     # Authentication methods
#     # ----------------------------
#     def sign_in(self, email, password):
#         auth_resp = self.client.auth.sign_in_with_password({
#             "email": email,
#             "password": password
#         })
#         self.user_session = auth_resp.data
#         return auth_resp

#     def sign_out(self):
#         self.user_session = None
#         return self.client.auth.sign_out()

#     # ----------------------------
#     # Graph methods
#     # ----------------------------
#     def get_nodes(self):
#         resp = self.client.table("concepts").select("*").execute()
#         return resp.data

#     def add_node(self, concept_name):
#         resp = self.client.table("concepts").insert({"concept_name": concept_name}).execute()
#         return resp.data

#     def add_link(self, source_id, target_id):
#         resp = self.client.table("concept_links").insert({
#             "source_concept_id": source_id,
#             "target_concept_id": target_id
#         }).execute()
#         return resp.data

#     # more helper functions: update, delete, fetch connections...


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
#add option in UI to allow topical cycles
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

@app.route("/EditTopic", methods = ["POST"])
def EditTopic():
    print("edit")

#courseName/GetGraph to specify which topics to grab
#only display nodes that belong in the course(so if they are linked to other things, dont show those other things)

@app.route("/GetNodes", methods = ["GET"])
def getNodes():
    getNodesResponse = (
        supabase.table("Concepts")
        .select("id, conceptName")
        .execute()
    )
    nodes = [{"id": row["id"], "conceptName": row["conceptName"]} 
             for row in getNodesResponse.data]
    return jsonify(nodes)

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
    #need to implement auto layout feature (dagre bookmark in conc3ept folder)
    i = 0
    for topic, id in zip(topicNames,topicIds):
        nodes.append(
            {
                "id": str(id), "position":{"x": 100*i+30, "y": 50*i+30}, "data": {"label": topic}
            }
        )
        i+=1
    for tuple in sourcesToTargets:
        edges.append(
                {"id":f"{tuple[0]}-{tuple[1]}", "source": str(tuple[0]), "target": str(tuple[1])}
        )
    return jsonify({"nodes":nodes, "edges":edges})

    """
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

    const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Pointers' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Linked List' } },
];
"""
    

    


    




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)