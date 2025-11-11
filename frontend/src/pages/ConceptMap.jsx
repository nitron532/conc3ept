import ELK from 'elkjs/lib/elk.bundled.js';
import Button from '@mui/material/Button';
import { useCallback, useLayoutEffect , useEffect, useState} from 'react';
import axios from "axios";
import AddEditTopics from '../components/AddEditTopics';
import MiddleArrowEdge from '../components/MiddleArrowEdge';
import CustomNode from '../components/CustomNode';
import Appearance from '../components/Appearance';


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
  'elk.spacing.nodeNode': '100',
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
  const [baseNodes, setBaseNodes] = useState([]);
  const [baseEdges, setBaseEdges] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [appearanceSettings, setAppearanceSettings] = useState({
    layoutDirection: "RIGHT",
    nodeSpacing: 100,
    layerSpacing: 100,
    edgeType: "middleArrow",
    edgeAnimated: true,
    nodeStyle:{
      backgroundColor: '#1f1f1f',
      color: '#fff',
      borderRadius: 12,
    }
  })
  const { fitView } = useReactFlow();

  const getGraph = useCallback(async () =>{
    try{
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/GetGraph`
      )
      setBaseNodes(response.data.nodes);
      setBaseEdges(response.data.edges);
    }
    catch (Error){
      console.log("Failed to retrieve graph: ", Error);
    }
  },[]);

  const refreshNodes = useCallback (async (forceRefresh = false) =>{
    try{
      const elkOptionsWithState = {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': appearanceSettings.layerSpacing.toString(),
        'elk.spacing.nodeNode': appearanceSettings.nodeSpacing.toString(),
        'elk.direction': appearanceSettings.layoutDirection
      };
        const layouted = await getLayoutedElements(baseNodes, baseEdges, {
          ...elkOptionsWithState,
        });
        // const nodes = layouted.nodes.map( (n)=>({
        //   ...n,
        //   style: appearanceSettings.nodeStyle,
        // }));
        const edges = layouted.edges.map((e)=>({
          ...e,
          type:appearanceSettings.edgeType,
          animated: Boolean(appearanceSettings.edgeAnimated),
        }));
        setNodes(layouted.nodes);
        setEdges(edges);
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    }
    catch(Error){
      console.error("Failed to retrieve graph: ", Error);
    }
  }, [appearanceSettings, baseNodes, baseEdges]);

  useEffect(()=>{
    getGraph();
  }, [getGraph]);
  useEffect(()=>{
  refreshNodes();
  }, [refreshNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onLayout = useCallback(
    ({direction}) => {
      const opts = { 'elk.direction': direction, ...elkOptions};
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
        </ReactFlow>
        <div className = "bottomleft"> <AddEditTopics getGraph = {getGraph} baseNodes = {baseNodes}/> </div>
        <div className = "bottomright"><Appearance appearanceSettings = {appearanceSettings} 
                                        setAppearanceSettings={setAppearanceSettings}
                                        refreshNodes={refreshNodes}
                                        getLayoutedElements = {getLayoutedElements}
                                        onLayout = {onLayout}/>
                                        </div>
      </div>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <ConceptMap />
  </ReactFlowProvider>
  
);
