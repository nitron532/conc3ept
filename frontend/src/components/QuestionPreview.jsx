import { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import { Box } from '@mui/material';
import { useQuestionStore } from '../states/QuestionStore';

export default function QuestionPreview() {
  const questionText = useQuestionStore(state=>state.question).questionText
  const clearQuestion = useQuestionStore(state=> state.clearQuestion);
  const handleClose = () => {
    clearQuestion();
  };
  return (
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={open}
        onClick={handleClose}
      >
        <Box        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          p: 4,
          borderRadius: 2,
        }}>{questionText}</Box>
      </Backdrop>
  );
}
