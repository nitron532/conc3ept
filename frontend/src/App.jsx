import './components/SideMenu.jsx'
import './App.css'
import SideMenu from './components/SideMenu.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UserMenu from './components/UserMenu.jsx'
import { useMediaQuery } from '@mui/material';
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom';
import LessonPlan from './pages/LessonPlan.jsx'
import CoursePage from './pages/CoursePage.jsx'
import NestedLevel from './pages/NestedLevel.jsx';
import Login from './pages/Login.jsx'
import Questions from './pages/Questions.jsx';
import { useState } from 'react';


function App() {
  
  const [login, setLogin] = useState(false) //global state thing 
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
  });
  return (
      <ThemeProvider theme = {theme}>
        {/* menu contents depend on login state */}
        <SideMenu></SideMenu>
        <UserMenu></UserMenu>
        {/* home page describing project, login to actual service */}
        <Routes>
          <Route path="/" element = {<Login/>}/>
          <Route path = "/home" element = {<Home/>}></Route>
          <Route path = "/:course" element = {<CoursePage/>}></Route>
          <Route path = "/:course/:concept" element = {<NestedLevel lessonPlanStatus={false}/>}></Route>
          <Route path = "/:course/lessonplan" element = {<LessonPlan/>}></Route>
          <Route path = "/:course/lessonplan/:concept" element = {<NestedLevel lessonPlanStatus={true}/>}></Route>
          <Route path = "/:course/:concept/lessonplan" element = {<NestedLevel lessonPlanStatus={true}/>}></Route>
          <Route path = "/:course/:concept/:level" element = {<Questions/>}></Route>
        </Routes>
      </ThemeProvider>
  )
}

export default App
