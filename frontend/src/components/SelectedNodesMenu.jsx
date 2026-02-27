import  {useState} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import DeleteAlert from './DeleteAlert';
import axios from "axios"
import { useSelectedItemsStore } from '../states/SelectedItemsStore';

export default function SelectedItemsMenu({courseId, }) {
  const [open, setOpen] = useState(false);
  const selectedItems = useSelectedItemsStore(state=> state.selectedItems)
  const clearSelectedItems = useSelectedItemsStore(state=> state.clear)
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const navigate = useNavigate();
  const deleteSelectedNodes = async (e) =>{
    e.preventDefault();
    
    const formData = {
        "selectedNodes": selectedItems.map(item => item.label),
        "courseId" : courseId,
    }
    try{
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/DeleteSelectedNodes`,
        {data: formData},
        {headers:{"Content-Type" : "application/json"}}
      )
      clearSelectedItems();
      (courseId);
    }
    catch(error){
      console.log("Failed to delete: ", error)
    }
  }

  const clearAll = () =>{
    toggleDrawer(false);
    clearSelectedItems();
    // setTimeout(() => {setSelectedNodes([]);}, 250);
    //TODO isnt doing animation
  }

  const handleClickPlan = () =>{
        navigate(`lessonplan`, {
            state: {courseId:courseId}  , //passing by copy
      });
  }

  const Menu = (
    <Box sx={{ width: 300 }} role="presentation">
      {/* add top padding for input fields  */}

        <Button onClick = {clearAll}>Clear Selections</Button>
        <Button onClick = {handleClickPlan} >Create Lesson Plan</Button>
        <DeleteAlert deleteSelectedNodes={deleteSelectedNodes}/>

        <div>
          {selectedItems.map((node)=>{
          if(node.level === "c"){
            return(
              <p key = {node.id}>{node.label}</p>
            )
          }
          else{
            return(
              <p key = {node.id}>{`${node.data.conceptName} Question ${node.id}`}</p>
            )
          }
          })}
        </div>
    
    </Box>

  );

  return (
    <div className = "bottomcenter">
      <Button onClick={toggleDrawer(true)}>Selected Items</Button>
      <Drawer anchor = "right" open={open} onClose={toggleDrawer(false)}>
        {Menu}
      </Drawer>
    </div>
  );
}
