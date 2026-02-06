import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import ListSubheader from '@mui/material/ListSubheader';
import { useCoursesStore } from '../states/CoursesStore';
import { Link as RouterLink } from 'react-router-dom';

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const courses = useCoursesStore(state => state.courseList);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {['Home', 'Settings'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton component = {RouterLink} to = {`${text}`}>
              <ListItemIcon>
                {index % 2 === 0 ? <HomeIcon /> : <SettingsIcon />} 
                {/* switch case for menu options? */}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {courses.map((courseObject,index)=>{
          //simulate clicking the course card button (pass courseId from the object, set node&edge stores to correct course by requesting backend,
          // then route to coursepage )
        })}
      </List>
    </Box>
  );

  return (
    <div className = "topleft" style = {{zIndex:1}}>
      <Button onClick={toggleDrawer(true)}>Menu</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
