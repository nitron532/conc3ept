import  {useState, useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import axios from "axios"

export default function SelectedNodesMenu({selectedNodes, setSelectedNodes, courseId}) {
  const [open, setOpen] = useState(false);
  const [submittable, setSubmittable] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const navigate = useNavigate();
  const deleteNode = async (e) =>{
    e.preventDefault();
    try{
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/DeleteNode`,
        {data: formData},
        {headers:{"Content-Type" : "application/json"}}
      )
      setFormData(initialState);
      getGraph(courseId);
    }
    catch(error){
      console.log("Failed to delete: ", error)
    }
  }

  const clearAll = () =>{
    toggleDrawer(false);
    setSelectedNodes([]);
    // setTimeout(() => {setSelectedNodes([]);}, 250);
    //TODO isnt doing animation, also green highlight isnt clearing
  }

  const handleClickPlan = () =>{
        navigate(`lessonplan`, {
            state: { courseId:courseId, selectedNodes:selectedNodes }  ,  // pass extra data (by copy) without adding to URL
      });
  }

  const Menu = (
    <Box sx={{ width: 300 }} role="presentation">
      {/* add top padding for input fields  */}

        <Button onClick = {clearAll}>Clear Selections</Button>
        <Button onClick = {handleClickPlan} >Create Lesson Plan</Button>
        <div>
        {selectedNodes.map((node)=>(
            <p key = {node}>{node}</p>
        ))}


        </div>
    
    </Box>

  );

  return (
    <div className = "bottomcenter">
      <Button onClick={toggleDrawer(true)}>Selected Nodes</Button>
      <Drawer anchor = "right" open={open} onClose={toggleDrawer(false)}>
        {Menu}
      </Drawer>
    </div>
  );
}
