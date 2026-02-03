from copy import deepcopy

def dfs(adjacencyList,preAndPost, visited,node,clock):
    visited.append(node)
    preAndPost[node].append(clock)
    clock+=1
    for neighbor in adjacencyList[node]:
        if neighbor not in visited:
            clock = dfs(adjacencyList, preAndPost, visited, neighbor,clock)
    preAndPost[node].append(clock)
    clock+=1
    return clock

def topologicalSort(nodes,edges): # add typing, nodes has ids of int, edges has source, target int concept ids
    adjacencyList: dict[int,list[int]] = {node: [] for node in nodes}
    preAndPost: dict[int,list[int]] = {node: [] for node in nodes}
    for edge in edges:
        adjacencyList[edge[0]].append(edge[1])
    visited: list[int] = []
    clock: int = 0
    for node in nodes:
        if node not in visited:
            clock = dfs(adjacencyList, preAndPost, visited,node,clock)
    orderedList = [(node,tuple[0],tuple[1]) for node,tuple in preAndPost.items()]
    orderedList.sort(key = lambda x: x[2], reverse=True)
    orderedList = [node[0] for node in orderedList]
    return orderedList

def trackDFSTree(adjacencyList,visited,node,currentPath, selectedNodes,missedPrereqs, ancestor):
    visited.append(node)
    if node not in selectedNodes:
        currentPath.append(node)
    elif node in selectedNodes and node != ancestor:
        missedPrereqs += currentPath
        currentPath = []

    for neighbor in adjacencyList[node]:
        if neighbor not in visited:
            trackDFSTree(adjacencyList, visited, neighbor, deepcopy(currentPath),selectedNodes,missedPrereqs,ancestor)
        elif neighbor in visited and neighbor in selectedNodes or neighbor in missedPrereqs:
            missedPrereqs += currentPath
            currentPath = []


def verifyLessonPlan(subGraph,wholeGraph): #adjacency list is entire graph
    selectedNodes: list[int] = [int(node["id"]) for node in subGraph["nodes"]]
    allNodes: list[int] = [int(node["id"]) for node in wholeGraph["nodes"]] #could request whole graph once then find selected
    allEdges: list[tuple[int,int]] = [(int(edge["source"]), int(edge["target"])) for edge in wholeGraph["edges"]]
    adjacencyList: dict[int,list[int]] = {node: [] for node in allNodes}
    missedPrereqs: list[int] = []
    for edge in allEdges:
        adjacencyList[edge[0]].append(edge[1])
    visited: list[int] = []
    for node in selectedNodes:
        if node not in visited:
            trackDFSTree(adjacencyList, visited, node, [], selectedNodes, missedPrereqs,node)
    return missedPrereqs
