import './components/SideMenu.jsx'
import './App.css'
import SideMenu from './components/SideMenu.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UserMenu from './components/UserMenu.jsx'
import { useMediaQuery } from '@mui/material';
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConceptMap from './pages/ConceptMap.jsx'
import Login from './pages/Login.jsx'
import React, { useState } from 'react';


function App() {
  
  const [login, setLogin] = useState(false)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
  });
  return (
    <BrowserRouter>
      <ThemeProvider theme = {theme}>
        {/* menu contents depend on login state */}
        <SideMenu></SideMenu>
        <UserMenu></UserMenu>
        {/* home page describing project, login to actual service */}
        <Routes>
          <Route path="/" element = {<Login/>}/>
          <Route path = "/home" element = {<Home/>}></Route>
          {/* user home page */}
          <Route path = "/conceptmap" element = {<ConceptMap/>}></Route>
          {/* user concept map */}
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
