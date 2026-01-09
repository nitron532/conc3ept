import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ConceptMap from '../components/ConceptMap';
import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';

export default function NestedLevel({lessonPlanStatus}){
const conceptName = useParams().concept;
const courseName = useParams().course;
const courseId = useLocation().state?.courseId;
const [baseNodes, setBaseNodes] = useState([
    {id: "0", position:{x: 0, y: 0}, data: {label: `${conceptName} Syntax`, courseId: courseId}, type:"custom"},
    {id: "1", position:{x: 0, y: 0}, data: {label: `${conceptName} Purpose`, courseId: courseId}, type:"custom"},
    {id: "2", position:{x: 0, y: 0}, data: {label: `${conceptName} Combination`, courseId: courseId}, type:"custom"},
    {id: "3", position:{x: 0, y: 0}, data: {label: `${conceptName} Creation`, courseId: courseId}, type:"custom"}
]);
const [baseEdges, setBaseEdges] = useState([
    {id:"0-1", source: "0", target: "1",courseId:courseId},
    {id:"1-2", source: "1", target: "2",courseId:courseId},
    {id:"2-3", source: "2", target: "3",courseId:courseId}
]);

    return(
        <>
        {/* lessonplan status to true; maybe i wanna create a lessonplan of just syntax of something */}
        {/* TODO differentiate between complexity hierarchy nested level and questions nested level */}
            <ReactFlowProvider><ConceptMap baseNodes = {baseNodes} baseEdges = {baseEdges} courseId = {courseId} setBaseNodes = {setBaseNodes} setBaseEdges = {setBaseEdges} lessonPlanStatus={lessonPlanStatus}></ConceptMap></ReactFlowProvider>
        </>
    )

}