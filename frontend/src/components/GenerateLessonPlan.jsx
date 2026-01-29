import  {useState,useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import axios from "axios"


function GenerateLessonPlan({data}){
    const [formData, setFormData] = useState({});
    const sendLessonPlan = async()=>{
        try{
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
            let subNodesObject = {};
            for(let i = 0; i < data.edges.length; i++){
                edgesList.push({
                    source: data.edges[i].source,
                    target: data.edges[i].target
                })
            }
            for(let i = 0; i < data.nodes.length; i++){
                let concept = data.nodes[i].data.label;
                let lastIndex = concept.lastIndexOf(" ");
                let firstIndex = concept.indexOf(" ");
                    switch (concept.substring(lastIndex+1)){
                        case "Remember":
                        case "Understand":
                        case "Apply":
                        case "Analyze":
                        case "Evaluate":
                        case "Create":
                            data.nodes[i].data.parentConcept in subNodesObject 
                            ? subNodesObject[data.nodes[i].data.parentConcept].push(data.nodes[i].data.label)
                            : subNodesObject[data.nodes[i].data.parentConcept] = [data.nodes[i].data.label]
                            break;
                        default:
                            nodesList.push({
                                id: data.nodes[i].id,
                                label: data.nodes[i].data.label
                            });
                            break;
                    }
            }
            setFormData({
                courseId: data.courseId,
                courseName: data.nodes[0].data.courseName,
                edges: edgesList,
                nodes: nodesList,
                subNodes: subNodesObject
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