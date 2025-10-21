
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';
import { Link as RouterLink } from 'react-router-dom';
import axios from "axios"

export default function AddTopics() {
  const [open, setOpen] = React.useState(false);
  const initialState = {topic: "", connections : []}
  const [formData, setFormData] = React.useState(initialState) //to db
  const [courseNodes, setCourseNodes] = React.useState([{}]) //from db

  const handleChange = (e) =>{
    const {name, value} = e.target
    setFormData({
        ...formData,
        [name]: value
    })
  }
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const refreshNodes = React.useCallback(async (forceRefresh = false)=>{
    try{
        
    }
    catch(error){
        console.log("Failed to fetch graph data:", error)
    }
  })
  const postNewNode = async (e) => {
    e.preventDefault();
    console.log("submitted:", formData)
    try{
        await axios.post(
            "localhost/AddTopic",
            formData,
            {headers:{"Content-Type": "application/json"}}
        )
        setFormData(initialState)
        refreshNodes(true)
        //fetch new node stuff
    }
    catch(error){
        console.error("Submission failed: ", error);
    }
  }
  const AddMenu = (
    <Box sx={{ width: 450 }} role="presentation">
        <Button sx ={{my:1}} onClick={toggleDrawer(false)}> Back </Button>
      <Divider />
    <TextField name = "topicInput" sx ={{t:3}} fullWidth id="topicInput" label="Topic" variant="outlined" onChange = {handleChange()}/>
    <Button variant="outlined" onClick={function(event){toggleDrawer(false); postNewNode()}}>Add</Button>
    </Box>
  );

  return (
    <div className = "bottomleft">
      <Button onClick={toggleDrawer(true)}>Add Topic</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {AddMenu}
      </Drawer>
    </div>
  );
}
