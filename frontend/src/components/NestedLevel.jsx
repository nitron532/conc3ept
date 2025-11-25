import { useParams } from 'react-router-dom';
export default function NestedLevel(){
const {topic} = useParams();
    return(
        <>
            <div>hello you are at {topic}</div>
        </>
    )

}