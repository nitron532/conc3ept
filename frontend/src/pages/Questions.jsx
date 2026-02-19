import ConceptMap from "../components/ConceptMap";
import {useEffect, useState} from 'react';
import {useParams, useLocation} from "react-router-dom";
import BackButton from "../components/BackButton";
import QuestionPreview from "../components/QuestionPreview";
import axios from "axios"
import {
  ReactFlowProvider,
} from '@xyflow/react';
import { useSelectedNodesStore } from "../states/SelectedNodesStore";
import { useQuestionStore } from "../states/QuestionStore";


function Questions(){
    const [parentConceptId, setParentConceptId] = useState(useLocation().state?.parentConceptId);
    const [conceptLevel, setConceptLevel] = useState(useLocation().state?.conceptLevel); // taxonomy level
    const [courseId, setCourseId] = useState(useLocation().state?.courseId);
    const [baseNodes, setBaseNodes] = useState([]); //objects
    const [baseEdges, setBaseEdges] = useState([]); //objects
    const question = useQuestionStore(state => state.question);
    const clearQuestion = useQuestionStore(state=> state.clearQuestion);
    const conceptName = useParams().concept;
    let levelId = 0;
    //try {}
    switch (conceptLevel){
        case "Remember":
            levelId = 0;
            break;
        case "Understand":
            levelId = 1;
            break;
        case "Apply":
            levelId = 2;
            break;
        case "Analyze":
            levelId = 3;
            break;
        case "Evaluate":
            levelId = 4;
            break;
        case "Create":
            levelId = 5;
            break;
        default:
            break; //throw exception?
    }
    //get oldrepo questions
    //for now, we get canterbury
    const requestOldRepo = async (courseId) =>{
        try{
            let requestString = `${import.meta.env.VITE_SERVER_URL}/RequestOldRepo?courseId=${courseId}&conceptId=${parentConceptId}&conceptLevel=${levelId}`
            const response = await axios.get(
                requestString
            )
            setBaseNodes(response.data)
        }
            catch (Error){
            console.log("Couldn't get concept map arguments: ", Error);
        }
    }

    useEffect( ()=>{
        //if courseId?
        requestOldRepo(courseId);
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
            <div className = "topcenter">{conceptName} {conceptLevel}</div>
            {question?.questionText && <QuestionPreview/>}
            <BackButton position = {"bottomleft"}></BackButton>
        </>
    )
}
/*
      {data.level === "q" && showQuestion && <QuestionPreview showQuestion={showQuestion} setShowQuestion={setShowQuestion} data = {data}/>}
*/

export default Questions