import { useParams } from 'react-router-dom';
export default function NestedLevel(){
// add header that says "welcome, username"
const {topic} = useParams();
    return(
        <>
            <div>hello you are at {topic}</div>
        </>
    )

}