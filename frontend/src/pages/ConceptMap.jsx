import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import AddTopics from '../components/AddTopics'
import '@xyflow/react/dist/style.css';
 
//wanna pass in course data, user data
//initial positions could be updated via a save button after the user drags nodes around?
//wanna have a course label on this page
const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Pointers' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Linked List' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];
 
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
 
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
    <div className = "bottomleft"> <AddTopics/> </div>
    {/* pass prop containing which course */}
    </>
  );
}