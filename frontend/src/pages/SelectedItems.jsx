import { useEffect, useState } from 'react';
import {Box, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import DeleteAlert from '../components/DeleteAlert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import axios from "axios"
import BloomPyramid from '../components/BloomPyramid.jsx';
import { useSelectedItemsStore } from '../states/SelectedItemsStore';
import BackButton from '../components/BackButton.jsx';

export default function SelectedItems() {
  const selectedItems = useSelectedItemsStore(state=> state.selectedItems)
  const removeSelectedItem = useSelectedItemsStore(state=> state.removeItem);
  const [bloomsState, setBloomsState] = useState([
        {label: "Create", value: 0},
        {label: "Evaluate", value: 0},
        {label: "Analyze", value: 0},
        {label: "Apply", value: 0},
        {label: "Understand", value: 0},
        {label: "Remember", value: 0},
    ]);
  const [selectedItemLevel, setSelectedItemLevel] = useState(-1);
  const [selectedSelected, setSelectedSelected] = useState([]);
  const navigate = useNavigate();
  const clearSelectedItems = useSelectedItemsStore(state=> state.clear)

  useEffect(()=>{
    let newState = [
        {label: "Create", value: 0},
        {label: "Evaluate", value: 0},
        {label: "Analyze", value: 0},
        {label: "Apply", value: 0},
        {label: "Understand", value: 0},
        {label: "Remember", value: 0},
    ]
    for(let i = 0; i < selectedItems.length; i++){
        if (selectedItems[i].hasOwnProperty("data") && selectedItems[i].data.hasOwnProperty("conceptLevel")){
            newState[bloomsState.length - selectedItems[i].data.conceptLevel-1].value++;
        }
        setBloomsState(newState);
    }
  },[selectedItems])

  useEffect(() => {
    if(selectedItems.length == 0){
        navigate(-1);
    }
  },[])

  if (selectedItems.length === 0) return null;

  const courseId = selectedItems[0].courseId;

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
    clearSelectedItems();
    navigate(-1);
  }

  const handleClickPlan = () =>{
        navigate(`lessonplan`, {
            state: {courseId:courseId}  , //passing by copy
      });
  }

  const handleToggle = (item) =>{
    if(selectedSelected.some(i => i.id == item.id)){
        setSelectedSelected(
            selectedSelected.filter(i =>
                i.id !== item.id
            )
        );
        setSelectedItemLevel(-1);
    }
    else{
        setSelectedSelected([...selectedSelected, item])

        if(item.hasOwnProperty("data") && item.data.hasOwnProperty("conceptLevel")){
            setSelectedItemLevel(item.data.conceptLevel);
        }
        else{
            setSelectedItemLevel(-1);
        }
    }
  }

  const handleRemove = () =>{
    for(let i = 0; i < selectedSelected.length; i++){
        removeSelectedItem(selectedSelected[i]);
    }
    setSelectedSelected([]);
    if(selectedItems.length === 0){
        navigate(-1);
    }
  }



  return (
    <>
        <BackButton position = {"bottomleft"}></BackButton>
        <Box sx ={{display: 'flex'}} component = "h2">
            Selected Materials
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4, width: '100%' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                sx={{
                maxHeight: '60vh',   
                overflowY: 'auto',   
                border: '1px solid #ddd',
                borderRadius: 2
                }}>

                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {selectedItems.length > 0
                    ? selectedItems.map((item) => {
                        const labelId = `checkbox-list-label-${item.id}`;
                        const displayText = item.hasOwnProperty("type") && item.type == "question"?
                         `${item.data.conceptName} Question ${item.id}`:
                         item.label;
                        return (
                        <ListItem
                            key={item.id}
                            secondaryAction={
                            <IconButton edge="end" aria-label="questionText">
                                <CommentIcon />
                            </IconButton>
                            }
                            disablePadding
                        >
                            {/* onClick={handleToggle(item)} */}
                            <ListItemButton role={undefined} onClick={() => handleToggle(item)} dense> 
                            <ListItemIcon>
                                <Checkbox
                                edge="start"
                                checked={selectedSelected.some(i => i.id == item.id)}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={displayText} />
                            </ListItemButton>
                        </ListItem>
                        );
                    })
                    : <Box sx ={{textAlign: "left", pl: 2}}>Nothing to see here.</Box>}
                </List>
            </Box>

            <Box>
                {/* add top padding for input fields  */}

                    <Button onClick = {clearAll}>Reset Selections</Button>
                    {selectedSelected.length > 0 && <Button onClick = {handleRemove}>Remove Selected from List</Button>}
                    {/* if there are selected <Button onClick = {handleClickPlan} >Create Lesson Plan</Button> */}
                    <DeleteAlert deleteSelectedNodes={deleteSelectedNodes}/>
            </Box>
        </Box>
        
            <Box sx={{ flex: 1 }}>
                    <BloomPyramid data = {bloomsState} title = {"Lesson Plan's Distribution of Bloom's Cognitive Processes"}
                    subtitle = {"subtitle kaef"} highlightLevel={selectedItemLevel}
                    ></BloomPyramid>
            </Box>
        </Box>
    </>
  );
}
