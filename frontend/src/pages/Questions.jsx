import ConceptMap from "../components/ConceptMap";
import {useEffect, useState} from 'react';
import {useParams, useLocation} from "react-router-dom";
import BackButton from "../components/BackButton";
import axios from "axios"
import {
  ReactFlowProvider,
} from '@xyflow/react';
import { useSelectedNodesStore } from "../states/SelectedNodesStore";


function Questions(){
    const [parentConceptId, setParentConceptId] = useState(useLocation().state?.parentConceptId);
    const [conceptLevel, setConceptLevel] = useState(useLocation().state?.conceptLevel); // taxonomy level
    const [courseId, setCourseId] = useState(useLocation().state?.courseId);
    const [baseNodes, setBaseNodes] = useState([]); //objects
    const [baseEdges, setBaseEdges] = useState([]); //objects
    const conceptName = useParams().concept;


    //get associated questions
    // const getConceptMapArguments = async (courseId) =>{
    //     try{
    //         let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptMapArguments?id=${courseId}&lessonPlan=0`
    //         const response = await axios.get(
    //             requestString
    //         )
    //         setBaseNodes(response.data.nodes)
    //         setBaseEdges(response.data.edges)
    //     }
    //         catch (Error){
    //         console.log("Couldn't get concept map arguments: ", Error);
    //     }
    // }

    useEffect( ()=>{
        //if courseId?

        // getConceptMapArguments(courseId);
        setBaseNodes([
            {id: "0", position:{x: 0, y: 0}, data: {label: `Question 1`, courseId: courseId}, type:"custom"},
            {id: "1", position:{x: 0, y: 0}, data: {label: `Question 2`, courseId: courseId}, type:"custom"},
            {id: "2", position:{x: 0, y: 0}, data: {label: `Question 3`, courseId: courseId}, type:"custom"},
            {id: "3", position:{x: 0, y: 0}, data: {label: `Question 4`, courseId: courseId}, type:"custom"},
            {id: "4", position:{x: 0, y: 0}, data: {label: `Question 5`, courseId: courseId}, type:"custom"},
            {id: "5", position:{x: 0, y: 0}, data: {label: `Question 6`, courseId: courseId}, type:"custom"},
            ])

    },[])

    function RenderConceptMap({baseNodes, setBaseNodes, baseEdges, setBaseEdges, courseId}){
        if(baseNodes.length > 0){
            return(
            <>
                <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} lessonPlanStatus={false} level = {"q"} parentConcept={parentConceptId}/> </ReactFlowProvider>
        
            </>
            )
        }
    }

    /*
    lesson plans, the concept map, whatever else belongs to the course.
    expandable/collapsable concept map? (alter size vwh or whatever it was)
    */
    return (
        <>
            <p>Loading questions...</p>
            <RenderConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges}/>
            <div class = "topcenter">{conceptName} {conceptLevel}</div>
            <BackButton position = {"bottomleft"}></BackButton>
        </>
    )
}

export default Questions