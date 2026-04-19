from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore
from ollama import Client

print("connecting to ollama...")
qwen = Client(host = "localhost:11434")


print("connecting to neo4j desktop")
graph = Neo4jPropertyGraphStore(
    username="neo4j",
    password="carlovonaba",
    url="neo4j://127.0.0.1:7687",
    database="neo4j",
)

print("querying neo4j db...")
response = (graph.structured_query(query = "MATCH p=()-[]->() RETURN p LIMIT 25;"))


messages = [
    {"role": "system", "content": "You are a helpful assistant that answers questions about concept map graphs."},
     {"role" :"user", "content" : "In the next message, I am going to give you only the structured_query response from a Neo4jPropertyGraphStore instance of the llamaindex framework.\
             You will analyze the response and outline the graph in these ways: 1. How many nodes are there, and what are their labels? 2. How many edges are there, and what are their labels?\
                 3. List each triplet in the given graph."},
    {"role": "user","content": f"{response}"}

]

print("sending query:")
response = qwen.chat(
    model = "qwen3.5:35b-a3b", messages = messages, think = False
)
print(response["message"]["content"])




"""
response = chat(
    model='qwen3.5:35b-a3b',
    messages=[...],
    think=False,
    options={
        "temperature": 0.7,
        "top_p": 0.8,
        "top_k": 20,
        "presence_penalty": 1.5,
        "num_predict": 200      # cap output tokens for classification
    }
)

"""