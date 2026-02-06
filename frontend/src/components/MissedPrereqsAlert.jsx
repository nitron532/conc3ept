import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function MissedPrereqsAlert({message}) {
  const [show, setShow] = useState(false);
  let navigate = useNavigate()
  useEffect(()=>{
    if(message !== "initialState" && message !== ""){
        setShow(true);
    }
  },[message])
  return (
    <>
      <Dialog
        open={show}
        onClose={() =>{setShow(false)}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Missing these prerequisite topics from this lesson plan:"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShow(false)}}>Okay</Button>
          <Button onClick={() => navigate(-1)}>Back</Button>
          {/* go back option with navigate(-1)*/}
        </DialogActions>
      </Dialog>
    </>
  );
}
