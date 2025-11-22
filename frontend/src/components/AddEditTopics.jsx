import  {useState, useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import axios from "axios"
import NodeSelector from './NodeSelector';
import EdgesSelector from './EdgesSelector';

export default function AddEditTopics({getGraph, baseNodes, baseEdges}) {
  const [open, setOpen] = useState(false);
  const initialState = {topicInput: "", outgoingConnections : [], incomingConnections :[]}
  const [formData, setFormData] = useState(initialState) //to db
  const [submittable, setSubmittable] = useState(false);
  const [add, setAdd] = useState(true); //boolean flipped?

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
    // setFormData(initialState);
  };

  const deleteNode = async (e) =>{
    e.preventDefault();
    try{
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/DeleteNode`,
        {data: formData},
        {headers:{"Content-Type" : "application/json"}}
      )
      setFormData(initialState);
      getGraph();
    }
    catch(error){
      console.log("Failed to delete: ", error)
    }
  }

  const editNodeOutgoing = async (e) => {
    e.preventDefault();
    try{
      await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/EditNodeOutgoing`,
        formData,
        {headers:{"Content-Type": "application/json"}}
      )
      setFormData(initialState);
      getGraph();
    }
    catch (error){
      console.error("Failed to update: ", error);
    }
  }
  const editNodeIncoming = async (e) => {
    e.preventDefault();
    try{
      await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/EditNodeIncoming`,
        formData,
        {headers:{"Content-Type": "application/json"}}
      )
      setFormData(initialState);
      getGraph();
    }
    catch (error){
      console.error("Failed to update: ", error);
    }
  }

  const addNode = async (e) => {
    e.preventDefault();
    if(formData.outgoingConnections.length === 0 && formData.topicInput.length === 0 && formData.incomingConnections){
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
        getGraph();
    }
    catch(error){
        console.error("Submission failed: ", error);
    }
  }

  useEffect(() => {
      setSubmittable(formData.topicInput?.trim().length > 0);
      const addOrEdit = baseNodes?.some((n)=> n.data.label.trim().toLowerCase() === formData.topicInput.trim().toLowerCase());
      setAdd(!addOrEdit);
  }, [formData.topicInput]);

  const AddEditMenu = (
    <Box sx={{ width: 450 }} role="presentation">
      {/* add top padding for input fields  */}
    <NodeSelector baseNodes = {baseNodes} formData = {formData} setFormData = {setFormData}/>
    <EdgesSelector baseNodes = {baseNodes} formData = {formData} setFormData = {setFormData} add = {add} baseEdges = {baseEdges} outgoing = {true}/>
    <EdgesSelector baseNodes = {baseNodes} formData = {formData} setFormData = {setFormData} add = {add} baseEdges = {baseEdges} outgoing = {false}/>
    {submittable && add && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); addNode(event)}}>Add {formData.topicInput}</Button>}
    {submittable && !add && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); editNodeOutgoing(event)}}>Edit {formData.topicInput}</Button>}
    {submittable && !add && formData.outgoingConnections.length === 0 && formData.incomingConnections.length === 0 && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); deleteNode(event)}}>Delete {formData.topicInput}</Button>}
    </Box>
    //have a section where available nodes/edges pop up, instead of overlapping the other input fields?
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Add / Edit Topic</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {AddEditMenu}
      </Drawer>
    </div>
  );
}
