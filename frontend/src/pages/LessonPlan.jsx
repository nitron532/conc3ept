import ConceptMap from "../components/ConceptMap";
import { ReactFlowProvider } from "@xyflow/react";
import {useLocation } from "react-router-dom";
import { useState,useEffect} from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
import MissedPrereqsAlert from "../components/MissedPrereqsAlert";
import { useSelectedItemsStore } from "../states/SelectedItemsStore";

function LessonPlan(){
    const location = useLocation();
    const {courseId} = location.state || {};
    const [baseNodes, setBaseNodes] = useState([]);
    const [baseEdges, setBaseEdges] = useState([]);
    const [missedPrereqs, setMissedPrereqs] = useState("initialState");
    const selectedItems = useSelectedItemsStore(state => state.selectedItems);


    //could eventually just pass entire top level nodes in with edges to avoid extra backend communication USE ZUSTAND
    const getConceptMapArgumentsPlan = async (courseId) =>{
        try{
            let selectedItemsList = Array.from(selectedItems);
            
            // Remove sub level concepts from the request string.
            for(let i = 0; i < selectedItemsList.length; i++){
                let concept = selectedItemsList[i].label; // !!!! TODO, need to support asking to put questions in lesson plan
                let lastIndex = concept.lastIndexOf(" ");
                switch (concept.substring(lastIndex+1)){ //do i even need this anymore
                    case "Remember":
                    case "Understand":
                    case "Apply":
                    case "Analyze":
                    case "Evaluate":
                    case "Create":
                        selectedItemsList.splice(i, 1);
                        i--;
                        break;
                    default:
                        break;
                }
            }
            let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptMapArguments?id=${courseId}`
            for(let i = 0; i < selectedItemsList.length; i++){
                requestString += `&${i}=${selectedItemsList[i].label}`
            }
            requestString += "&lessonPlan=1";
            const response = await axios.get(
                requestString
            )
            setBaseNodes(response.data.graph.nodes)
            setBaseEdges(response.data.graph.edges)
            setMissedPrereqs(response.data.message)
        }
            catch (Error){
            console.log("Couldn't get concept map arguments: ", Error);
        }
    }
    useEffect(() =>{
        getConceptMapArgumentsPlan(courseId);
    },[])

    function RenderConceptMap({baseNodes, baseEdges, courseId, setBaseNodes, setBaseEdges}){
        if(baseNodes.length > 0){
            return (
            <>
                <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} lessonPlanStatus={true} level = {"l"}/> </ReactFlowProvider>
            </>
            )
        }
    }
    return (
    <>
        <RenderConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges}/>
        <BackButton position={"bottomleft"}/>
       {baseNodes && missedPrereqs !== "initialState" && <MissedPrereqsAlert message = {missedPrereqs}/> }
    </>
    )
}

export default LessonPlan