import  {useState, useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import axios from "axios"


function GenerateLessonPlan({formData}){

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


    return(
    <div className = "bottomcenter">
      <Button onClick={sendLessonPlan}>Generate Lesson Plan</Button>
    </div>
    )


}

/*
  const addNode = async (e) => {
    e.preventDefault();
    if(formData.outgoingConnections.length === 0 && formData.conceptInput.length === 0 && formData.incomingConnections){
      //add warning saying it cant be empty?
      return
    }
    try{
        await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/AddNode`,
            formData,
            {headers:{"Content-Type": "application/json"}}
        )
        setFormData(initialState);
        getConceptMapArguments(courseId);
    }
    catch(error){
        console.error("Submission failed: ", error);
    }
  }

*/


export default GenerateLessonPlan