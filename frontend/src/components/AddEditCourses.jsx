import  {useState, useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import axios from "axios"
import NodeSelector from './NodeSelector';
import EdgesSelector from './EdgesSelector';

export default function AddEditCourses({getCourses, courses}) {
  const [open, setOpen] = useState(false);
  const initialState = {courseInput: ""}
  const [formData, setFormData] = useState(initialState) //to db
  const [submittable, setSubmittable] = useState(false);
  const [add, setAdd] = useState(true); //boolean flipped?

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const deleteCourse = async (e) =>{ //should say warning making sure you want to delete this, all questions and nodes will be deleted as well
    e.preventDefault();
    try{
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/DeleteCourse`,
        {data: formData},
        {headers:{"Content-Type" : "application/json"}}
      )
      setFormData(initialState);
      getCourses();
    }
    catch(error){
      console.log("Failed to delete: ", error)
    }
  }

  const editCourse = async (e) => {
    e.preventDefault();
    try{
      await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/EditCourse`,
        formData,
        {headers:{"Content-Type": "application/json"}}
      )
      setFormData(initialState);
      getCourses();
    }
    catch (error){
      console.error("Failed to update: ", error);
    }
  }

  const addCourse = async (e) => {
    e.preventDefault();
    if(formData.courseInput.length === 0){
      //add warning saying it cant be empty?
      return
    }
    try{
        await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/AddCourse`,
            formData,
            {headers:{"Content-Type": "application/json"}}
        )
        setFormData(initialState);
        getGraph();
    }
    catch(error){
        console.error("Submission failed: ", error);
    }
  }

  useEffect(() => {
      setSubmittable(formData.courseInput?.trim().length > 0);
      const addOrEdit = courses?.some((c)=> c.data.label.trim().toLowerCase() === formData.courseInput.trim().toLowerCase());
      setAdd(!addOrEdit);
  }, [formData.topicInput]);

  const AddEditMenu = (
    <Box sx={{ width: 450 }} role="presentation">
      {/* add top padding for input fields  */}
    <NodeSelector baseNodes = {courses} formData = {formData} setFormData = {setFormData}/>
    {submittable && add && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); addCourse(event)}}>Add {formData.courseInput}</Button>}
    {submittable && !add && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); editCourse(event)}}>Edit {formData.courseInput}</Button>}
    <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); deleteCourse(event)}}>Delete {formData.courseInput}</Button>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Add / Edit Course</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {AddEditMenu}
      </Drawer>
    </div>
  );
}
