import  {useState} from 'react'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import MultipleStopIcon from '@mui/icons-material/MultipleStop';
import ToggleButton from '@mui/material/ToggleButton';

export default function Appearance({appearanceSettings, setAppearanceSettings, refreshNodes, onLayout}) {
    const [open, setOpen] = useState(false);
    const handleChangeAnimated = (e) =>{
        setAppearanceSettings({
            ...appearanceSettings,
            edgeAnimated : !appearanceSettings.edgeAnimated,
        })
        refreshNodes(true);
    }

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const AppearanceMenu = (
            <Box sx={{ width: 450 }} role="presentation">
            <Button id = "DOWN" sx ={{my:1}} onClick={() => {onLayout({direction:'DOWN'})}}> Vertical </Button>
            <Button id = "RIGHT" sx ={{my:1}} onClick={() => {onLayout({direction:'RIGHT'})}}> Horizontal </Button>
            <ToggleButton value = "animate" selected = {appearanceSettings.edgeAnimated} onChange = {handleChangeAnimated}> <MultipleStopIcon/></ToggleButton>
            </Box>
    );

    return (
        <div className = "bottomright">
        <Button onClick={toggleDrawer(true)}>Appearance</Button>
        <Drawer anchor = "right" open={open} onClose={toggleDrawer(false)}>
            {AppearanceMenu}
        </Drawer>
        </div>
    );
}
