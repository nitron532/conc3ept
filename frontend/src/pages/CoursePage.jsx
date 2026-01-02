import ConceptMap from "../components/ConceptMap";
import { useCallback, useLayoutEffect , useEffect, useState,useMemo} from 'react';
import {useParams, useLocation} from "react-router-dom";
import axios from "axios"
import {
  ReactFlowProvider,
} from '@xyflow/react';


function CoursePage(){
    const courseName = decodeURIComponent(useParams().course);
    const [courseId, setCourseId] = useState(useLocation().state?.courseId);
    const [selectedNodesNames, setSelectedNodesNames] = useState([]);
    const [selectedNodesObjects, setSelectedNodesObjects] = useState([]);
    const [baseNodes, setBaseNodes] = useState([]); //objects
    const [baseEdges, setBaseEdges] = useState([]); //objects

    const getConceptMapArguments = async () =>{
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

    useEffect( ()=>{
        //if courseId?
        getConceptMapArguments();
    },[])

    function RenderConceptMap({baseNodes, baseEdges, courseId}){
        if(baseNodes.length > 0){
            console.log(baseNodes, "from inside rcm")
            return <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId}/> </ReactFlowProvider>
        }
    }

    /*
    lesson plans, the concept map, whatever else belongs to the course.
    expandable/collapsable concept map? (alter size vwh or whatever it was)
    */
    return (
        <>
            <p>hi you are at {courseName}'s home page</p>
            <RenderConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} />
        </>
    )
}

export default CoursePage