import { useState, useEffect } from "react";
import { Box, Drawer, Button } from "@mui/material";
import { TextField } from "@mui/material";
import axios from "axios";
import CourseSelector from "./CourseSelector";

export default function AddEditCourses({ getCourses, courses }) {
  const [open, setOpen] = useState(false);
  const initialState = { courseInput: "", courseId: -1, newName: "" };
  const [formData, setFormData] = useState(initialState); //to db
  const [submittable, setSubmittable] = useState(false);
  const [add, setAdd] = useState(true); //boolean flipped?

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
    setFormData(initialState);
  };

  const modifyCourse = async (e, action) => {
    e.preventDefault();
    const requestObject = {
      url: `${import.meta.env.VITE_SERVER_URL}/${action}Course`,
      data: formData,
      headers: { headers: { "Content-Type": "application/json" } },
    };
    try {
      if (action == "Delete") {
        await axios.delete(
          requestObject.url,
          { data: requestObject.data },
          requestObject.headers,
        );
      } else if (action == "Edit") {
        await axios.patch(
          requestObject.url,
          requestObject.data,
          requestObject.headers,
        );
      } else {
        await axios.post(
          requestObject.url,
          requestObject.data,
          requestObject.headers,
        );
      }
      setFormData(initialState);
      getCourses();
    } catch (error) {
      console.error("Failed to ", action);
    }
  };

  useEffect(() => {
    setSubmittable(formData.courseInput?.trim().length > 0);
    const addOrEdit = courses?.some(
      (c) =>
        c.courseName.trim().toLowerCase() ===
        formData.courseInput.trim().toLowerCase(),
    );
    setAdd(!addOrEdit);
  }, [formData.courseInput]);

  const AddEditMenu = (
    <Box sx={{ width: 300 }} role="presentation">
      {/* add top padding for input fields, should be course selector label*/}
      <CourseSelector
        courses={courses}
        formData={formData}
        setFormData={setFormData}
      />
      {submittable && add && (
        <Button
          variant="outlined"
          onClick={function (event) {
            toggleDrawer(false)();
            modifyCourse(event, "Add");
          }}
        >
          Add {formData.courseInput}
        </Button>
      )}
      {submittable && !add && (
        <Button
          variant="outlined"
          onClick={function (event) {
            toggleDrawer(false)();
            modifyCourse(event, "Delete");
          }}
        >
          Delete {formData.courseInput}
        </Button>
      )}

      {submittable && !add && (
        <>
          <TextField
            onChange={function (event) {
              setFormData((prev) => ({
                ...prev,
                newName: event.target.value,
              }));
            }}
            label="New Course Name"
            variant="outlined"
          />
          <Button
            variant="outlined"
            onClick={function (event) {
              toggleDrawer(false)();
              modifyCourse(event, "Edit");
            }}
          >
            Rename {formData.courseInput} to {formData.newName}
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Add / Edit Course</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {AddEditMenu}
      </Drawer>
    </div>
  );
}
