from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import datetime
import requests
import json
import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
from flask import g


#nodes in db only have outgoing edges so we don't have to reupdate everytime a new node is inserted, and also cuz its DAG

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"]) 
#connect to neo4j aura
loadStatus = load_dotenv("../Neo4j-809eb53f-Created-2025-10-20.txt")
if loadStatus is False:
    raise RuntimeError("Env variables not loaded")
URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
with GraphDatabase.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity()
    print("Connection established.")

@app.route("/home")
def fetchCourses():
    print("yay")
    #return json of user's courses

@app.route("/LoadGraph", methods = ["GET"])
def LoadGraph():
    print("request graphs from neo4j and return as json (maybe just request updated things perhaps?)")

@app.route("/AddTopic", methods = ["POST"])
def AddTopic():
    data = request.json
    print(data)
    return "OK", 200




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)