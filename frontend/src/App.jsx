import "./App.css";
import SideMenu from "./components/menus/SideMenu.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserMenu from "./components/menus/UserMenu.jsx";
import { useMediaQuery } from "@mui/material";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import LessonPlan from "./pages/LessonPlan.jsx";
import CoursePage from "./pages/CoursePage.jsx";
import Questions from "./pages/Questions.jsx";
import Login from "./pages/Login.jsx";
import SelectedItems from "./pages/SelectedItems.jsx";
import { green, purple, yellow } from "@mui/material/colors";
import { useState } from "react";

function App() {
  const [login, setLogin] = useState(false); //global state thing

  const theme = createTheme({
    colorSchemes: {
      dark: true,
    },
    typography: {
      button: { textTransform: "none" },
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
    },
  });
  return (
    <ThemeProvider theme={theme}>
      {/* menu contents depend on login state */}
      <SideMenu></SideMenu>
      <UserMenu></UserMenu>
      {/* home page describing project, login to actual service */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />}></Route>
        <Route path="/:course" element={<CoursePage />}></Route>
        <Route path="/:course/:concept" element={<Questions />}></Route>
        <Route path="/:course/lessonplan" element={<LessonPlan />}></Route>
        <Route
          path="/:course/lessonplan/:concept"
          element={<Questions />}
        ></Route>
        <Route
          path="/:course/:concept/lessonplan"
          element={<Questions />}
        ></Route>
        <Route
          path="/:course/selecteditems"
          element={<SelectedItems />}
        ></Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
