import CourseCard from "../components/CourseCard"
import axios from 'axios'
import {useState, useEffect, useCallback} from 'react'
import AddEditCourses from "../components/AddEditCourses";
import { useCourseNodesStore } from "../states/CourseNodesStore";
import { useCourseEdgesStore } from "../states/CourseEdgesStore";
import { useCoursesStore } from "../states/CoursesStore";


export default function Home(){
// add header that says "welcome, username"
    const clearNodes = useCourseNodesStore(state => state.clear)
    const clearEdges = useCourseEdgesStore(state => state.clear)
    const setCourses = useCoursesStore(state => state.setCourses)
    const courses = useCoursesStore(state => state.courseList)
    const [renderReady, setRenderReady] = useState(false)

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
        clearNodes();
        clearEdges();
        if(courses.length === 0){
            getCourses();
        }
        setRenderReady(true);
    }, []);

    function RenderCourseList(){
        if(renderReady){
            return(
                <>
                    {courses.map((course)=><CourseCard key = {course[1]} courseName = {course[0]} courseId = {course[1]}/>)}
                    <div className = "bottomleft"> <AddEditCourses getCourses ={getCourses} courses = {courses}/> </div>
                </>
            );
        }
    }
    
    return(
        <>
            <RenderCourseList/>
        </>
    )

}