import ELK from 'elkjs/lib/elk.bundled.js';
import Button from '@mui/material/Button';
import { useCallback, useLayoutEffect , useEffect} from 'react';
import axios from "axios"
import AddEditTopics from '../components/AddEditTopics'
import MiddleArrowEdge from '../components/MiddleArrowEdge';
import CustomNode from '../components/CustomNode';

import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};


const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      
      // Hardcode a width and height for elk to use when layouting.
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
        data:{
          layout: isHorizontal,
          label: node.data.label
        }
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

function ConceptMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();


  const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style }) => (
  <path
    d={`M${sourceX},${sourceY} C...`} // custom curved path
    stroke="white"
    fill="none"
    markerMid="url(#arrow)" // middle arrow
  />
)

  const getGraph = async () =>{
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/GetGraph`
    )
    return response.data;
  }

  const refreshNodes = useCallback (async (forceRefresh = false) =>{
    try{
        const responseData = await getGraph();
        const layouted = await getLayoutedElements(responseData.nodes, responseData.edges, {
          'elk.direction': 'RIGHT',
          ...elkOptions,
        });
        const edges = layouted.edges.map((e)=>({
          ...e,
          type:'middleArrow',
          animated: true,
        }));
        // const nodes = responseData.nodes.map((n) => ({
        //   ...n,
        //   type: "custom", 
        //   data: {
        //     label: n.label,
        //     layout: orientat, 
        //   },
        //   position: n.position,
        // }));
        setNodes(layouted.nodes);
        setEdges(edges);
        requestAnimationFrame(() => fitView());
    }
    catch(Error){
      console.error("Failed to retrieve graph: ", Error);
    }
  }, []);

  useEffect(()=>{
    refreshNodes();
  }, [refreshNodes])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onLayout = useCallback(
    ({direction}) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = nodes;
      const es = edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          fitView();
        },
      );
    },
    [nodes, edges],
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN'});
  }, []);


  return (
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
      <div style={{ width: '90vw', height: '90vh'}}>
        <ReactFlow
          className="react-flow"
          nodeTypes = {{custom: CustomNode}}
          nodes={nodes}
          edges={edges}
          edgeTypes = {{middleArrow:MiddleArrowEdge}}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Panel position="top-right">
            <Button sx ={{my:1}} onClick={() => onLayout({direction:'DOWN'})}> Vertical </Button>
            <Button sx ={{my:1}} onClick={() => onLayout({direction:'RIGHT'})}> Horizontal </Button>
          </Panel>
          {/* <Background /> */}
        </ReactFlow>
        <div className = "bottomleft"> <AddEditTopics refreshNodes = {refreshNodes}/> </div>
      </div>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <ConceptMap />
  </ReactFlowProvider>
  
);
