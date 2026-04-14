import CourseCard from "../components/courses/CourseCard";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import AddEditCourses from "../components/courses/AddEditCourses";
import { useCourseNodesStore } from "../states/CourseNodesStore";
import { useCourseEdgesStore } from "../states/CourseEdgesStore";
import { useCoursesStore } from "../states/CoursesStore";
import { Grid } from "@mui/material";

export default function Home() {
  // add header that says "welcome, username"
  const clearNodes = useCourseNodesStore((state) => state.clear);
  const clearEdges = useCourseEdgesStore((state) => state.clear);
  const setCourses = useCoursesStore((state) => state.setCourses);
  const courses = useCoursesStore((state) => state.courseList);
  const [renderReady, setRenderReady] = useState(false);

  const getCourses = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/GetCourses`,
      );
      setCourses(response.data);
    } catch (Error) {
      console.log("Failed to retrieve courses: ", Error);
      setTimeout(() => getCourses(), 2000);
    }
  }, []);
  useEffect(() => {
    if (courses.length === 0) {
      getCourses();
    }
    setRenderReady(true);
  }, []);

  function RenderCourseList() {
    if (renderReady) {
      return (
        <Grid container spacing={2}>
          {courses.map((course) => (
            <Grid key={course.courseId} size={4}>
              <CourseCard
                courseName={course.courseName}
                courseId={course.courseId}
              />
            </Grid>
          ))}
          <div className="bottomleft">
            {" "}
            <AddEditCourses getCourses={getCourses} courses={courses} />{" "}
          </div>
        </Grid>
      );
    }
  }

  return (
    <>
      <RenderCourseList />
    </>
  );
}
