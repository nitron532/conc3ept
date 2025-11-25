import CourseCard from "../components/CourseCard"
import axios from 'axios'
import {useState, useEffect, useCallback} from 'react'
import AddEditCourses from "../components/AddEditCourses";

export default function Home(){
// add header that says "welcome, username"
    const [courses, setCourses] = useState([]);
    const getCourses = useCallback(async () =>{
        try{
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/GetCourses`
        )
        setCourses(response.data.courses)
        }
        catch (Error){
        console.log("Failed to retrieve courses: ", Error);
        setTimeout(() => getCourses(), 2000);
        }
    },[]);
    useEffect(()=>{
        getCourses();
    }, [getCourses]);
    
    return(
        <>
            {courses.map((course)=><CourseCard key = {course[1]} courseName = {course[0]}/>)}
           <div className = "bottomleft"> <AddEditCourses getCourses ={getCourses} courses = {courses}/> </div>
        </>
    )

}