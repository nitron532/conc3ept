import  {useState,useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import axios from "axios"


function GenerateLessonPlan({data}){
    const [formData, setFormData] = useState({});
    const sendLessonPlan = async()=>{
        try{
            console.log(formData)
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/GenerateLessonPlan`,
                formData,
                {headers:{"Content-Type": "application/json"}}
            )
            // setFormData(initialState);
            // load lesson plan in embedded viewer? or just save it to a path?
            // hide button afterwards
        }
        catch (Error){
            console.error("Couldn't generate lesson plan: ", Error);
        }
    }

    //clean data
    useEffect(function(){
        if(data.nodes.length>0){
            let edgesList = [];
            let nodesList = [];
            for(let i = 0; i < data.edges.length; i++){
                edgesList.push({
                    source: data.edges[i].source,
                    target: data.edges[i].target
                })
            }
            for(let i = 0; i < data.nodes.length; i++){
                nodesList.push({
                    id: data.nodes[i].id,
                    label: data.nodes[i].data.label
                })
            }
            setFormData({
                courseId: data.courseId,
                courseName: data.nodes[0].data.courseName,
                edges: edgesList,
                nodes: nodesList
            })
    }
    },[data])

    return(
    <div className = "bottomcenter">
      <Button onClick={sendLessonPlan}>Generate Lesson Plan</Button>
    </div>
    )


}


export default GenerateLessonPlan