import Box from '@mui/material/Box';
import BackButton from '../components/BackButton';

export default function QuestionInfo({currentQuestion}){

    function CheckAndRender({currentQuestion}){
        if(Object.keys(currentQuestion).length !== 0){
            let bloomLevel = -1;
            switch (currentQuestion.data.conceptLevel){
                case 0:
                    bloomLevel = "Remember";
                    break;
                case 1:
                    bloomLevel = "Understand";
                    break;
                case 2:
                    bloomLevel = "Apply";
                    break;
                case 3:
                    bloomLevel = "Analyze";
                    break;
                case 4:
                    bloomLevel = "Evaluate";
                    break;
                case 5:
                    bloomLevel = "Create";
                    break;
                default: break;
            }
            return(
                <Box className = "topright" sx = {{pr:12, pt:6, maxWidth: "45vw"}}>
                    <Box component="h2" sx={{mb: 5}}>
                    Question {currentQuestion.id}
                    </Box>
                        <Box sx={{maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 2}}>
                            <Box sx = {{font_weight: "normal", mx:2}} component = "p">{currentQuestion.data.questionText}</Box>
                        </Box>
                        <Box sx={{maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 2, mt:5}}>
                            <Box sx = {{font_weight: "normal", mx:2}} component = "p">Bloom's Revised Taxonomy Level: {bloomLevel}</Box>
                        </Box>
                        <Box sx={{maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 2, mt:5}}>
                            <Box sx = {{font_weight: "normal", mx:2}} component = "p">Answer: from latex, or should support multiple choice somehow</Box>
                        </Box>
        
                    <BackButton position = {"bottomleft"}/>
                </Box>
            );
        }
    }

    return(
        <CheckAndRender currentQuestion={currentQuestion}/>
    )
}