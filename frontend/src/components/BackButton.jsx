import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BackButton({position}){
    let navigate = useNavigate();
    return(
        <div className = {position}><Button onClick={() => navigate(-1)}>Back</Button></div>
    )
}