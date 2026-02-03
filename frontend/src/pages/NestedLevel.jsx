import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ConceptMap from '../components/ConceptMap';
import { ReactFlowProvider } from '@xyflow/react';
import BackButton from '../components/BackButton';
import React from 'react';
import { useSelectedNodesStore } from '../states/SelectedNodesStore';

export default function NestedLevel({lessonPlanStatus}){
const conceptName = useParams().concept;
const courseId = useLocation().state?.courseId;
const conceptId = useLocation().state?.conceptId;
const selectedNodes = useSelectedNodesStore(state => state.selectedNodes);

const [baseNodes, setBaseNodes] = useState([
    {id: "0", position:{x: 0, y: 0}, data: {label: `${conceptName} Remember`, courseId: courseId}, type:"custom"},
    {id: "1", position:{x: 0, y: 0}, data: {label: `${conceptName} Understand`, courseId: courseId}, type:"custom"},
    {id: "2", position:{x: 0, y: 0}, data: {label: `${conceptName} Apply`, courseId: courseId}, type:"custom"},
    {id: "3", position:{x: 0, y: 0}, data: {label: `${conceptName} Analyze`, courseId: courseId}, type:"custom"},
    {id: "4", position:{x: 0, y: 0}, data: {label: `${conceptName} Evaluate`, courseId: courseId}, type:"custom"},
    {id: "5", position:{x: 0, y: 0}, data: {label: `${conceptName} Create`, courseId: courseId}, type:"custom"},
]);
const [baseEdges, setBaseEdges] = useState([
    {id:"0-1", source: "0", target: "1",courseId:courseId},
    {id:"1-2", source: "1", target: "2",courseId:courseId},
    {id:"2-3", source: "2", target: "3",courseId:courseId},
    {id:"3-4", source: "3", target: "4",courseId:courseId},
    {id:"4-5", source: "4", target: "5",courseId:courseId}
]);

    return(
        <>
        {/* lessonplan status to true; maybe i wanna create a lessonplan of just syntax of something */}
        {/* TODO differentiate between complexity hierarchy nested level and questions nested level */}
            <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} lessonPlanStatus={lessonPlanStatus} level = {"t"} parentConcept={conceptId}></ConceptMap></ReactFlowProvider>
            <BackButton position={"bottomleft"}></BackButton>
        </>
    )

}