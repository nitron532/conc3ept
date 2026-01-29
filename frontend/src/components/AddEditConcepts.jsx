import  {useState, useEffect} from 'react'
import {Box, Drawer, Button} from '@mui/material';
import axios from "axios"
import NodeSelector from './NodeSelector';
import EdgesSelector from './EdgesSelector';

export default function AddEditConcepts({getConceptMapArguments, baseNodes, baseEdges, courseId}) {
  const [open, setOpen] = useState(false);
  const initialState = {conceptInput: "", outgoingConnections : [], incomingConnections :[], courseId: courseId}
  const [formData, setFormData] = useState(initialState) //to db
  const [submittable, setSubmittable] = useState(false);
  const [add, setAdd] = useState(true); //boolean flipped?

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
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
      getConceptMapArguments(courseId);
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
      getConceptMapArguments(courseId);
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
      // getConceptMapArguments(courseId);
    }
    catch (error){
      console.error("Failed to update: ", error);
    }
  }

  const addNode = async (e) => {
    e.preventDefault();
    if(formData.outgoingConnections.length === 0 && formData.conceptInput.length === 0 && formData.incomingConnections){
      //add warning saying it cant be empty?
      return
    }
    try{
        formData.conceptInput = formData.conceptInput.trim();
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

  useEffect(() => {
      setSubmittable(formData.conceptInput?.trim().length > 0);
      const addOrEdit = baseNodes?.some((n)=> n.data.label.trim().toLowerCase() === formData.conceptInput.trim().toLowerCase());
      setAdd(!addOrEdit);
  }, [formData.conceptInput]);

  const AddEditMenu = (
    <Box sx={{ width: 300 }} role="presentation">
      {/* add top padding for input fields  */}
    <NodeSelector baseNodes = {baseNodes} formData = {formData} setFormData = {setFormData}/>
    <EdgesSelector baseNodes = {baseNodes} formData = {formData} setFormData = {setFormData} add = {add} baseEdges = {baseEdges} outgoing = {true}/>
    <EdgesSelector baseNodes = {baseNodes} formData = {formData} setFormData = {setFormData} add = {add} baseEdges = {baseEdges} outgoing = {false}/>
    {submittable && add && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); addNode(event)}}>Add {formData.conceptInput}</Button>}
    {/* make it so that i dont call two functions if not needed? */}
    {submittable && !add && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); editNodeOutgoing(event); editNodeIncoming(event);}}>Edit {formData.conceptInput}</Button>}
    {submittable && !add && formData.outgoingConnections.length === 0 && formData.incomingConnections.length === 0 && <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); deleteNode(event)}}>Delete {formData.conceptInput}</Button>}
    </Box>
    //have a section where available nodes/edges pop up, instead of overlapping the other input fields?
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Add / Edit Concept</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {AddEditMenu}
      </Drawer>
    </div>
  );
}
