import  {useState} from 'react'
import { Autocomplete, TextField} from '@mui/material';

export default function CourseSelector({courses, formData, setFormData}){
    const [searchQuery, setSearchQuery] = useState("");
    const handleInputChange = (event, newInputValue) => {
        setSearchQuery(newInputValue);
        setFormData((prev) => ({
        ...prev,
        courseInput: newInputValue,
        }));
    };

    const handleSelectChange = (event, newValue) => {
        const value = newValue || ''; // clear input if user removed selection
        setSearchQuery(value);
        setFormData((prev) => ({
        ...prev,
        topicInput: value,
        }));
    };

    const filteredOptions = 
        courses.map((c) => c[0])
        .filter((label) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Autocomplete
        value = {formData.courseInput}
        freeSolo
        options={filteredOptions} // list of matching courses
        inputValue={searchQuery}
        onInputChange={handleInputChange}
        onChange={handleSelectChange}
        renderInput={(params) => (
            <TextField {...params} name = "courseInput" label="Course" variant="outlined" fullWidth/>
        )}
        />
    );
}


