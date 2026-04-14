import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function CourseSelector({ courses, formData, setFormData }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (event, newInputValue) => {
    if (!newInputValue) {
      return;
    }
    setSearchQuery(newInputValue);
    setFormData((prev) => ({
      courseInput: newInputValue,
      courseId: -1,
      newName: "",
    }));
  };

  const handleSelectChange = (event, newValue) => {
    const name = newValue?.courseName || ""; // clear input if user removed selection
    const id = newValue?.courseId || -1;
    setSearchQuery(name);
    setFormData((prev) => ({
      ...prev,
      courseInput: name,
      courseId: id,
    }));
  };

  const filteredOptions = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Autocomplete
      value={formData.courseInput}
      freeSolo
      options={filteredOptions} // list of matching courses
      getOptionLabel={(course) => course.courseName || ""}
      inputValue={searchQuery}
      onInputChange={handleInputChange}
      onChange={handleSelectChange}
      renderInput={(params) => (
        <TextField
          {...params}
          name="courseInput"
          label="Course"
          variant="outlined"
          fullWidth
        />
      )}
      sx={{ mt: 1 }}
    />
  );
}
