
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
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Link as RouterLink } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios"

export default function AddTopics({refreshNodes}) {
  const [open, setOpen] = React.useState(false);
  const initialState = {topicInput: "", connections : []}
  const [formData, setFormData] = React.useState(initialState) //to db
  const [courseNodes, setCourseNodes] = React.useState([]) //from db


  const handleChange = (e) =>{
    const {name, value} = e.target
    setFormData({
        ...formData,
        [name] : value
    });
  }
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
    if(newOpen) getNodes();
  };
  const postNewNode = async (e) => {
    e.preventDefault();
    console.log("submitted:", formData)
    try{
        await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/AddTopic`,
            formData,
            {headers:{"Content-Type": "application/json"}}
        )
        setFormData(initialState)
        refreshNodes(true)
        //fetch new node stuff from supabase
    }
    catch(error){
        console.error("Submission failed: ", error);
    }
  }
  //could just pass prop from conceptmapjsx to here containing the nodes
  const getNodes = async (e) =>{
    console.log("retrieving nodes")
    try{
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/GetNodes`
        );
        setCourseNodes(response.data);
    }
    catch (error){
        console.error("Retrieval failed: ", error);
    }
  }
  const AddMenu = (
    <Box sx={{ width: 450 }} role="presentation">
        <Button sx ={{my:1}} onClick={toggleDrawer(false)}> Back </Button>
    <Divider/>
    <TextField name = "topicInput" sx ={{t:3}} fullWidth id="topicInput" label="Topic" variant="outlined" onChange = {handleChange}/>
    <FormControl fullWidth>
    <InputLabel>Edges</InputLabel>
        <Select
            multiple
            name = "connections"
            id="connections"
            value={formData.connections}
            label="Is prereq to: "
            onChange={handleChange}
            renderValue={(selected) => selected.map(
            id => courseNodes.find(t => t.id === id)?.conceptName
            ).join(", ")}
        >
            <MenuItem value={"None"}> None </MenuItem>
            
             {/* pull topics from DB */}
            {courseNodes.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                {topic.conceptName}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
    <Button variant="outlined" onClick={function(event){toggleDrawer(false); postNewNode(event)}}>Add</Button>
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
