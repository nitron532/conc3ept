import  {useState, useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import DeleteAlert from './DeleteAlert';
import axios from "axios"

export default function SelectedNodesMenu({selectedNodes, setSelectedNodes, courseId, getGraph}) {
  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const navigate = useNavigate();
  const deleteSelectedNodes = async (e) =>{
    e.preventDefault();
    const formData = {
        "selectedNodes": selectedNodes,
        "courseId" : courseId,
    }
    try{
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/DeleteSelectedNodes`,
        {data: formData},
        {headers:{"Content-Type" : "application/json"}}
      )
      setSelectedNodes([]);
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
    //TODO isnt doing animation
  }

  const handleClickPlan = () =>{
        navigate(`lessonplan`, {
            state: {selectedNodesNames:selectedNodes, courseId:courseId}  , //passing by copy
      });
  }

  const Menu = (
    <Box sx={{ width: 300 }} role="presentation">
      {/* add top padding for input fields  */}

        <Button onClick = {clearAll}>Clear Selections</Button>
        <Button onClick = {handleClickPlan} >Create Lesson Plan</Button>
        <DeleteAlert deleteSelectedNodes={deleteSelectedNodes}/>

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
