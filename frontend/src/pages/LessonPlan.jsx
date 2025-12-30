import ELK from 'elkjs/lib/elk.bundled.js';
import { useCallback, useLayoutEffect , useEffect, useState,useMemo} from 'react';
import {useParams, useLocation} from "react-router-dom";
import axios from "axios";
import AddEditConcepts from '../components/AddEditConcepts';
import SelectedNodesMenu from '../components/SelectedNodesMenu';
import MiddleArrowEdge from '../components/MiddleArrowEdge';
import CustomNode from '../components/CustomNode';
import Appearance from '../components/Appearance';


import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const elk = new ELK();

// const getLayoutedElements = (nodes, edges, options = {}) => {
//   const isHorizontal = options?.['elk.direction'] === 'RIGHT';
//   const graph = {
//     id: 'root',
//     layoutOptions: options,
//     children: nodes.map((node) => ({
//       ...node,
//       // Adjust the target and source handle positions based on the layout
//       // direction.
//       targetPosition: isHorizontal ? 'left' : 'top',
//       sourcePosition: isHorizontal ? 'right' : 'bottom',
      
//       // Hardcode a width and height for elk to use when layouting.
//       width: 150,
//       height: 50,
//     })),
//     edges: edges,
//   };

//   return elk
//     .layout(graph)
//     .then((layoutedGraph) => ({
//       nodes: layoutedGraph.children.map((node) => ({
//         ...node,
//         // React Flow expects a position property on the node instead of `x`
//         // and `y` fields.
//         position: { x: node.x, y: node.y },
//         data:{
//           layout: isHorizontal,
//           label: node.data.label
//         }
//       })),
//       edges: layoutedGraph.edges,
//     }))
//     .catch(console.error);
// };

//render graph of only selected nodes. if there exists edges between them, show those too.

function LessonPlan() {
    const courseName = decodeURIComponent(useParams().course);
    const location = useLocation();
    const {selectedNodes, baseEdges } = location.state || {};
    const courseId = baseEdges[0].courseId;
    const [conceptIds, setConceptIds] = useState([]) //should be in the same order as selectedNodes
    const [baseNodes, setBaseNodes] = useState([])
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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

    const getConceptIds = async() =>{
        try{
            let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptIds?id=${courseId}`
            for(let i = 0; i < selectedNodes.length; i++){
                requestString += `&${i}=${selectedNodes[i]}`
            }
            const response = await axios.get(
                requestString
            )
            setConceptIds(response.data);
        }
        catch (Error){
            console.log("Couldn't fetch concept ids:", Error);
        }
    }
    useEffect(() => {
        getConceptIds();
    }, [selectedNodes, courseId]);

    // useEffect(()=>{
    //     console.log("test")
    //     if(conceptIds.length == 0){
    //         return;
    //     }
    //     let nodeObjects = []
    //     let idSet = new Set([]);
    //     for(let i = 0; i < conceptIds.length; i++){
    //         nodeObjects.push({id: conceptIds[i].toString(), position:{x: 0, y: 0}, data: {label: selectedNodes[i], courseId: courseId}, type:"custom"});
    //         idSet.add(conceptIds[i]);
    //     }
    //     setBaseNodes(nodeObjects);
        
    //     let edgeList = []
    //     //searching through all edges, ideally find a more efficient way
    //     for(let i = 0; i < baseEdges.length; i++){
    //         if(idSet.has(baseEdges[i].source) && idSet.has(baseEdges[i].target)){
    //             edgeList.push(baseEdges[i]);
    //         }
    //     }
    //     setEdges(edgeList);
    // },[conceptIds])

    // useEffect(()=>{
    //     console.log(conceptIds)
    // },[conceptIds])

    // const refreshNodes = useCallback (async (forceRefresh = false) =>{
    //     try{
    //         let elkOptionsWithState = {
    //             'elk.algorithm': 'layered',
    //             'elk.layered.spacing.nodeNodeBetweenLayers': appearanceSettings.layerSpacing.toString(),
    //             'elk.spacing.nodeNode': appearanceSettings.nodeSpacing.toString(),
    //             'elk.direction': appearanceSettings.layoutDirection
    //         };
    //             const layouted = await getLayoutedElements(baseNodes, baseEdges, {
    //             ...elkOptionsWithState,
    //             });
    //             const edges = layouted.edges.map((e)=>({
    //             ...e,
    //             type:appearanceSettings.edgeType,
    //             animated: Boolean(appearanceSettings.edgeAnimated),
    //             }));
    //             setEdges(edges);
    //             setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    //     }
    //     catch(Error){
    //         console.error("Failed to retrieve graph: ", Error);
    //     }
    // }, [appearanceSettings, baseNodes, baseEdges]);


    // /*
    // for concept, id in zip(conceptNames,conceptIds):
    //     nodes.append(
    //         {
    //             "id": str(id), "position":{"x": 0, "y": 0}, "data": {"label": concept, "courseId": courseId}, "type":"custom"
    //         }
    //     )
    // */


  // const { fitView } = useReactFlow();

  // useEffect(()=>{
  // refreshNodes();
  // }, [refreshNodes]);

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  // const onLayout = useCallback(
  //   ({direction}) => {
  //     if(direction === appearanceSettings.layoutDirection){return;}
  //     const newAppearanceSettings = { ...appearanceSettings, layoutDirection: direction };
  //     setAppearanceSettings(newAppearanceSettings);
  //     const opts = {
  //       'elk.algorithm': 'layered',
  //       'elk.layered.spacing.nodeNodeBetweenLayers': newAppearanceSettings.layerSpacing.toString(),
  //       'elk.spacing.nodeNode': newAppearanceSettings.nodeSpacing.toString(),
  //       'elk.direction': newAppearanceSettings.layoutDirection,
  //     };
  //     const ns = nodes;
  //     const es = edges;
  //     getLayoutedElements(ns, es, opts).then(
  //       ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
  //         setNodes(layoutedNodes);
  //         setEdges(layoutedEdges);
  //         fitView();
  //       },
  //     );
  //   },
  //   [nodes, edges],
  // );

  // Calculate the initial layout on mount.
  // useLayoutEffect(() => {
  //   onLayout({ direction: 'DOWN'});
  // }, []);

  return (
    <div>
          {conceptIds.map((node)=>(
            <p key = {node}>{node}</p>
        ))}

      </div>
    // <div style={{
    //   position: 'absolute',
    //   top: 0,
    //   left: 0,
    //   width: '100vw',
    //   height: '100vh',
    //   display: 'flex',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   }}>
    //   <div style={{ width: '85vw', height: '85vh'}}>
    //     <ReactFlow
    //       className="react-flow"
    //       nodeTypes = {{custom: CustomNode}}
    //       nodes={selectedNodes}
    //       edges={edges}
    //       edgeTypes = {{middleArrow:MiddleArrowEdge}}
    //       onConnect={onConnect}
    //       onNodesChange={onNodesChange}
    //       onEdgesChange={onEdgesChange}
    //       fitView
    //     >
    //     </ReactFlow>
    //     <div className = "bottomright"><Appearance appearanceSettings = {appearanceSettings} 
    //                                     setAppearanceSettings={setAppearanceSettings}
    //                                     refreshNodes={refreshNodes}
    //                                     getLayoutedElements = {getLayoutedElements}
    //                                     onLayout = {onLayout}/>
    //                                     </div>
    //   </div>
    //     {/* {selectedNodes.length > 0 && <SelectedNodesMenu courseId = {courseId} selectedNodes = {selectedNodes} setSelectedNodes = {setSelectedNodes}/>} */}
    // </div>
  );

}

export default () => (
  <ReactFlowProvider>
    <LessonPlan />
  </ReactFlowProvider>
  
);
