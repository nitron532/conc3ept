import './components/SideMenu.jsx'
import './App.css'
import SideMenu from './components/SideMenu.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UserMenu from './components/UserMenu.jsx'
import { useMediaQuery } from '@mui/material';
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConceptMap from './pages/ConceptMap.jsx'
function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
  });
  return (
    <BrowserRouter>
      <ThemeProvider theme = {theme}>
        <SideMenu></SideMenu>
        <UserMenu></UserMenu>
        <Routes>
          <Route path = "/home" element = {<Home/>}></Route>
          <Route path = "/conceptmap" element = {<ConceptMap/>}></Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
