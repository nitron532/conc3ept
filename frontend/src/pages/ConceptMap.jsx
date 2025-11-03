import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import axios from "axios"
import AddEditTopics from '../components/AddEditTopics'
import '@xyflow/react/dist/style.css';
 
//wanna pass in course data, user data
//initial positions could be updated via a save button after the user drags nodes around?
//wanna have a course label on this page

//wanna  make a search function to find a specific topic or edge


const initialNodes = [

];

const initialEdges = [];

const getGraph = async () =>{
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/GetGraph`
  )
  return response.data;
}
 
export default function ConceptMap() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const refreshNodes = useCallback (async (forceRefresh = false) =>{
    try{
        const responseData = await getGraph();
        setNodes(responseData.nodes)
        setEdges(responseData.edges)
    }
    catch(Error){
      console.error("Failed to retrieve graph: ", Error);
    }
  }, []);

  useEffect(()=>{
    refreshNodes();
  }, [refreshNodes])
 
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
 
  return (
    <>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div style={{ width: '90vw', height: '90vh' }}>
          <ReactFlow
            colorMode = "dark"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ backgroundColor: '#0000' }}
          />
        </div>
      </div>
    <div className = "bottomleft"> <AddEditTopics refreshNodes = {refreshNodes}/> </div>
    {/* pass prop containing which course */}
    </>
  );
}