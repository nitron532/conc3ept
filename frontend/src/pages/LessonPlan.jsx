import {useParams, useLocation} from "react-router-dom";
import {useState} from "react"

export default function LessonPlan(){
    const courseName = decodeURIComponent(useParams().course);
    const location = useLocation();
    const { courseId, selectedNodes } = location.state || {};
    console.log(selectedNodes)
    return (
        <>
            <div>{courseName}, id: {courseId}</div>
            {selectedNodes.map((node) =>(
                <p key = {node}>{node}</p>
            ))}
        </>
    )
}