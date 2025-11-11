import  {useState} from 'react'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios"

export default function AddEditTopics({getGraph}) {
  const [open, setOpen] = useState(false);
  const initialState = {topicInput: "", connections : []}
  const [formData, setFormData] = useState(initialState) //to db
  const [courseNodes, setCourseNodes] = useState([]) //from db

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

  const patchNode = async (e) => {
    e.preventDefault();
    try{
      await axios.patch(
        `${import.meta.env.VITE_SERVER}/EditTopic`,
        formData,
        {headers:{"Content-Type": "application/json"}}
      )
    }
    catch (error){
      console.error("Failed to update: ", error);
    }
  }

  const postNewNode = async (e) => {
    e.preventDefault();
    if(formData.connections.length === 0 && formData.topicInput.length === 0){
      //add warning saying it cant be empty?
      return
    }
    try{
        await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/AddTopic`,
            formData,
            {headers:{"Content-Type": "application/json"}}
        )
        setFormData(initialState);
        getGraph();
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

  const submittable = formData.topicInput.trim().length > 0;

  const AddMenu = (
    <Box sx={{ width: 450 }} role="presentation">
    <TextField name = "topicInput" sx ={{t:3}} fullWidth id="topicInput" label="Topic" variant="outlined" onChange = {handleChange}/>
    <FormControl fullWidth>
    <InputLabel>Edges</InputLabel>
      {/* component that search and bring up a menu of close words */}
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
    {submittable &&
     <Button variant="outlined" onClick={function(event){toggleDrawer(false)(); postNewNode(event)}}>Add</Button>
    }
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Add / Edit Topic</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {AddMenu}
      </Drawer>
    </div>
  );
}
