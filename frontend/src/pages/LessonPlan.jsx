import ConceptMap from "../components/ConceptMap";
import { ReactFlowProvider } from "@xyflow/react";
import {useLocation } from "react-router-dom";
import { useState,useEffect} from "react";
import axios from "axios";

function LessonPlan(){
    const location = useLocation();
    const {selectedNodesNames, courseId} = location.state || {};
    const [baseNodes, setBaseNodes] = useState([]);
    const [baseEdges, setBaseEdges] = useState([]);

    const getConceptMapArgumentsPlan = async (courseId) =>{
        try{
            let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptMapArguments?id=${courseId}`
            for(let i = 0; i < selectedNodesNames.length; i++){
                requestString += `&${i}=${selectedNodesNames[i]}`
            }
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
    useEffect(() =>{
        getConceptMapArgumentsPlan(courseId);
    },[])
    
    //TODO selected taxonomy levels need to be considered in lesson plan generation.

    function RenderConceptMap({baseNodes, baseEdges, courseId, setBaseNodes, setBaseEdges}){
        if(baseNodes.length > 0){
            return (
            <>
                <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} lessonPlanStatus={true} level = {"c"}/> </ReactFlowProvider>
            </>
            )
        }
    }
    return (
    <>
        <RenderConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges}/>
    </>
    )
}

export default LessonPlan