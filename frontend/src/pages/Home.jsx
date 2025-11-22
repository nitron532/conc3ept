import CourseCard from "../components/CourseCard"
import axios from 'axios'

//loop thru user courses and display here, for now have some mock courses


export default function Home(){
// add header that says "welcome, username"
    return(
        <>
           <CourseCard/> 
           <CourseCard/> 
           <CourseCard/> 
           <CourseCard/> 
        </>
    )

}