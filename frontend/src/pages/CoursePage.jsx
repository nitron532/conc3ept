import ConceptMap from "../components/ConceptMap";
import AddEditConcepts from "../components/AddEditConcepts";
import {useEffect, useState} from 'react';
import {useParams, useLocation} from "react-router-dom";
import axios from "axios"
import {
  ReactFlowProvider,
} from '@xyflow/react';


function CoursePage(){
    const courseName = decodeURIComponent(useParams().course);
    const [courseId, setCourseId] = useState(useLocation().state?.courseId);
    const [baseNodes, setBaseNodes] = useState([]); //objects
    const [baseEdges, setBaseEdges] = useState([]); //objects

    const getConceptMapArguments = async (courseId) =>{
        try{
            let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptMapArguments?id=${courseId}&lessonPlan=0`
            const response = await axios.get(
                requestString
            )
            setBaseNodes(response.data.nodes)
            setBaseEdges(response.data.edges)
        }
            catch (Error){
            console.log("Couldn't get concept map arguments: ", Error);
        }
    }

    useEffect( ()=>{
        //if courseId?
        getConceptMapArguments(courseId);
    },[])

    function RenderConceptMap({baseNodes, setBaseNodes, baseEdges, setBaseEdges, courseId}){
        if(baseNodes.length > 0){
            return(
            <>
                <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} lessonPlanStatus={false}/> </ReactFlowProvider>
                <div className = "bottomleft"> <AddEditConcepts getConceptMapArguments = {getConceptMapArguments} courseId = {courseId} baseNodes = {baseNodes} baseEdges = {baseEdges}/> </div>
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
            <p>Loading {courseName}...</p>
            <RenderConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} />
        </>
    )
}

export default CoursePage