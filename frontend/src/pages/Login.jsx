import './Home.jsx'
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';
export default function Login(){

    return(

        <Button component = {RouterLink} to ="Home">
            Login
        </Button>

    )

}