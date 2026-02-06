import ELK from 'elkjs/lib/elk.bundled.js';
import { useCallback, useLayoutEffect , useEffect, useState,useMemo} from 'react';
import {useParams} from "react-router-dom";
import axios from "axios";
import SelectedNodesMenu from './SelectedNodesMenu';
import MiddleArrowEdge from './MiddleArrowEdge';
import CustomNode from './CustomNode';
import Appearance from './Appearance';
import GenerateLessonPlan from './GenerateLessonPlan';
import { useSelectedNodesStore } from '../states/SelectedNodesStore';

import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const elk = new ELK();

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
        position: { x: node.x, y: node.y },
        data:{
          layout: isHorizontal,
          label: node.data.label,
        }
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

function ConceptMap({baseNodes,setBaseNodes, baseEdges,setBaseEdges, courseId, lessonPlanStatus,level, parentConcept}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const courseName = decodeURIComponent(useParams().course);
  const selectedNodes = useSelectedNodesStore(state => state.selectedNodes)
  const [appearanceSettings, setAppearanceSettings] = useState({
    layoutDirection: "RIGHT",
    nodeSpacing: 100,
    layerSpacing: 100,
    edgeType: "middleArrow",
    edgeAnimated: false,
    nodeStyle:{
      backgroundColor: '#1f1f1f',
      color: '#fff',
      borderRadius: 12,
    }
  })
  const { fitView } = useReactFlow();

  const getGraph = async(courseId) =>{
    try{
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/GetGraph?id=${courseId}`
      )
      setBaseNodes(response.data.nodes);
      setBaseEdges(response.data.edges);
    }
    catch (Error){
      console.log("Failed to retrieve graph: ", Error);
      setTimeout(() => getGraph(courseId), 2000);
    }
  };

  const refreshNodes = useCallback (async (forceRefresh = false) =>{
    try{
      let elkOptionsWithState = {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': appearanceSettings.layerSpacing.toString(),
        'elk.spacing.nodeNode': appearanceSettings.nodeSpacing.toString(),
        'elk.direction': appearanceSettings.layoutDirection
      };
        const layouted = await getLayoutedElements(baseNodes, baseEdges, {
          ...elkOptionsWithState,
        });
        const nodes = layouted.nodes.map( (n)=>({
          ...n,
          data:{
            ...n.data,
            id:level === "t" ? parentConcept : n.id,
            courseName: courseName,
            courseId: courseId,
          }
        }));
        const edges = layouted.edges.map((e)=>({
          ...e,
          type:appearanceSettings.edgeType,
          animated: Boolean(appearanceSettings.edgeAnimated),
        }));
        setNodes(nodes);
        setEdges(edges);
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    }
    catch(Error){
      console.error("Failed to retrieve graph: ", Error);
    }
  }, [appearanceSettings, baseNodes, baseEdges]);

  useEffect(()=>{
  refreshNodes();
  }, [refreshNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []); //TODO implement dragging edges to create them
  const onLayout = useCallback(
    ({direction}) => {
      if(direction === appearanceSettings.layoutDirection){return;}
      const newAppearanceSettings = { ...appearanceSettings, layoutDirection: direction };
      setAppearanceSettings(newAppearanceSettings);
      const opts = {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': newAppearanceSettings.layerSpacing.toString(),
        'elk.spacing.nodeNode': newAppearanceSettings.nodeSpacing.toString(),
        'elk.direction': newAppearanceSettings.layoutDirection,
      };
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

  const nodesWithState = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        level
      }
    }));
  }, [nodes, selectedNodes]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), []);

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
       <div style={{ width: '85vw', height: '85vh'}}>
        <ReactFlow
          className="react-flow"
          nodeTypes = {nodeTypes}
          nodes={nodesWithState}
          edges={edges}
          edgeTypes = {{middleArrow:MiddleArrowEdge}}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
        </ReactFlow>
        <div className = "bottomright"><Appearance appearanceSettings = {appearanceSettings} 
                                        setAppearanceSettings={setAppearanceSettings}
                                        refreshNodes={refreshNodes}
                                        getLayoutedElements = {getLayoutedElements}
                                        onLayout = {onLayout}/>
                                        </div>
      </div>
        {selectedNodes.length > 0 && !lessonPlanStatus && level !== "l" && level !== "t" && <SelectedNodesMenu baseEdges = {baseEdges} courseId = {courseId} getGraph = {getGraph}/>} 
        {lessonPlanStatus && <GenerateLessonPlan data = {{nodes:nodes, edges:edges,courseId:courseId}}></GenerateLessonPlan>}
    </div>
  );
}

export default ConceptMap

