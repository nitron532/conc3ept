import { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import { Box } from '@mui/material';

export default function QuestionPreview({questionText, clearQuestion}) {
  const handleClose = () => {
    clearQuestion();
  };
  console.log(questionText)
  // const open = Boolean(questionText);
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
