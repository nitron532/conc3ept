import ConceptMap from "../components/ConceptMap";
import { ReactFlowProvider } from "@xyflow/react";
import {useLocation } from "react-router-dom";
import { useState,useEffect} from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
import MissedPrereqsAlert from "../components/MissedPrereqsAlert";
import { useSelectedNodesStore } from "../states/SelectedNodesStore";

function LessonPlan(){
    const location = useLocation();
    const {courseId} = location.state || {};
    const [baseNodes, setBaseNodes] = useState([]);
    const [baseEdges, setBaseEdges] = useState([]);
    const [missedPrereqs, setMissedPrereqs] = useState("initialState");
    const selectedNodes = useSelectedNodesStore(state => state.selectedNodes);


    //could eventually just pass entire top level nodes in with edges to avoid extra backend communication
    const getConceptMapArgumentsPlan = async (courseId) =>{
        try{
            let selectedNodesList = Array.from(selectedNodes);
            
            // Remove sub level concepts from the request string.
            for(let i = 0; i < selectedNodesList.length; i++){
                let concept = selectedNodesList[i].label;
                let lastIndex = concept.lastIndexOf(" ");
                switch (concept.substring(lastIndex+1)){
                    case "Remember":
                    case "Understand":
                    case "Apply":
                    case "Analyze":
                    case "Evaluate":
                    case "Create":
                        selectedNodesList.splice(i, 1);
                        i--;
                        break;
                    default:
                        break;
                }
            }
            let requestString = `${import.meta.env.VITE_SERVER_URL}/GetConceptMapArguments?id=${courseId}`
            for(let i = 0; i < selectedNodesList.length; i++){
                requestString += `&${i}=${selectedNodesList[i].label}`
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