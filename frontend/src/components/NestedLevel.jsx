import { useParams, useLocation } from 'react-router-dom';

export default function NestedLevel(){
const concept = useParams();
const courseId = useLocation().state?.courseId;
    return(
        <>
            <div>hello you are at {concept.concept} in course {concept.course}</div>
        </>
    )

}