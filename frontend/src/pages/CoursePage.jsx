import ConceptMap from "../components/ConceptMap";
import AddEditConcepts from "../components/AddEditConcepts";
import {useEffect, useState} from 'react';
import { useCourseEdgesStore } from "../states/CourseEdgesStore";
import { useCourseNodesStore } from "../states/CourseNodesStore";
import {useParams, useLocation} from "react-router-dom";
import axios from "axios"
import {
  ReactFlowProvider,
} from '@xyflow/react';


function CoursePage(){
    const courseName = decodeURIComponent(useParams().course);
    const [courseId, setCourseId] = useState(useLocation().state?.courseId);
    const setNodesStoreCourseId = useCourseNodesStore(state=>state.setCourseId)
    const setEdgesStoreCourseId = useCourseEdgesStore(state=>state.setCourseId)
    const nodesCourseId = useCourseNodesStore(state=>state.courseId);
    const courseNodes = useCourseNodesStore(state => state.courseNodes)
    const courseEdges = useCourseEdgesStore(state => state.courseEdges)
    const setNodes = useCourseNodesStore(state => state.setNodes)
    const setEdges = useCourseEdgesStore(state => state.setEdges)
    const [renderReady, setRenderReady] = useState(false)

    const getConceptMapArguments = async (courseId) =>{
        try{
            let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptMapArguments?id=${courseId}&lessonPlan=0`
            const response = await axios.get(
                requestString
            )
            setNodes(response.data.graph.nodes)
            setEdges(response.data.graph.edges)
            setNodesStoreCourseId(courseId);
            setEdgesStoreCourseId(courseId);

        }
            catch (Error){
            console.log("Couldn't get concept map arguments: ", Error);
        }
    }

    useEffect( ()=>{
        if(courseNodes.length == 0 || (nodesCourseId == -1 || nodesCourseId !== courseId)){
            getConceptMapArguments(courseId);
            setRenderReady(true);
        }
    },[courseNodes])

    function RenderConceptMap({courseId}){
        if(renderReady){
            return(
            <>
                <ReactFlowProvider><ConceptMap baseNodes = {courseNodes} baseEdges = {courseEdges} courseId = {courseId} setBaseNodes = {setNodes} setBaseEdges = {setEdges} lessonPlanStatus={false} level = "c"/> </ReactFlowProvider>
                <div className = "bottomleft"> <AddEditConcepts getConceptMapArguments = {getConceptMapArguments} courseId = {courseId} baseNodes = {courseNodes} baseEdges = {courseEdges}/> </div>
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
            <RenderConceptMap courseId = {courseId} />
        </>
    )
}

export default CoursePage