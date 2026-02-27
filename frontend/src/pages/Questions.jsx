import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useParams, useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import { useSelectedItemsStore } from '../states/SelectedItemsStore';
import { useQuestionsStore } from '../states/QuestionsStore';
import QuestionInfo from '../components/QuestionInfo';
import axios from 'axios';

export default function NestedLevel() {
    const conceptName = useParams().concept;
    const courseId = useLocation().state?.courseId;
    const conceptId = useLocation().state?.conceptId;
    const setQuestions = useQuestionsStore(state=>state.setQuestions);
    const clearQuestions = useQuestionsStore(state=>state.clearQuestions);
    const questions = useQuestionsStore(state=> state.questions);
    const addQuestion = useSelectedItemsStore(state => state.addItem);
    const removeQuestion = useSelectedItemsStore(state=> state.removeItem);
    const selectedItems = useSelectedItemsStore(state=> state.selectedItems);
    const [currentQuestion, setCurrentQuestion] = useState({});
    
    

    const requestOldRepo = async (courseId) =>{
        try{
            clearQuestions();
            let requestString = `${import.meta.env.VITE_SERVER_URL}/RequestOldRepo?courseId=${courseId}&conceptId=${conceptId}`
            const response = await axios.get(
                requestString
            )
            setQuestions(response.data)
        }
            catch (Error){
            console.log("Couldn't get concept map arguments: ", Error);
        }
    }

    useEffect((()=>{
        requestOldRepo(courseId);
    }),[requestOldRepo]);

  const handleToggle = (q) => () => {
    if (selectedItems.some(item => item.id == q.id)){
        removeQuestion(q);
        setCurrentQuestion({});
    }
    else{
        addQuestion(q);
        setCurrentQuestion(q);
    }
  };

  return (
    <>
    <Box className = "topleft" sx = {{pl:12, pt:4, maxWidth: "50vw"}}>
    <Box
      component="h1"
      sx={{mb: 5,fontSize: '2.5rem'}}>
      {conceptName} Materials
    </Box>
      <Box
        sx={{
        maxHeight: '60vh',   
        overflowY: 'auto',   
        border: '1px solid #ddd',
        borderRadius: 2
        }}>

        <List sx={{ width: '100%', maxWidth: "50vw", bgcolor: 'background.paper' }}>
        {questions.length > 0
        ? questions.map((q) => {
            const labelId = `checkbox-list-label-${q.id}`;
            return (
            <ListItem
                key={q.id}
                secondaryAction={
                <IconButton edge="end" aria-label="questionText">
                    <CommentIcon />
                </IconButton>
                }
                disablePadding
            >
                <ListItemButton role={undefined} onClick={handleToggle(q)} dense>
                <ListItemIcon>
                    <Checkbox
                    edge="start"
                    checked={selectedItems.some(item => item.id == q.id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                    />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`Question ${q.id}`} />
                </ListItemButton>
            </ListItem>
            );
        })
        : <Box sx ={{textAlign: "left", pl: 2}}>Nothing to see here.</Box>}
        </List>
        </Box>
        <BackButton position = {"bottomleft"}/>
    </Box>
    <QuestionInfo currentQuestion={currentQuestion}/>
    
    </>
  );
}