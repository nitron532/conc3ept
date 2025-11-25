import { useParams, useLocation } from 'react-router-dom';

export default function NestedLevel(){
const topic = useParams();
const courseId = useLocation().state?.courseId;
    return(
        <>
            <div>hello you are at {topic.topic} in course {topic.course}</div>
        </>
    )

}