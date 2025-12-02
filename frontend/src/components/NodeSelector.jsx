import  {useState} from 'react'
import { Autocomplete, TextField} from '@mui/material';

export default function NodeSelector({baseNodes, formData, setFormData}){
    const [searchQuery, setSearchQuery] = useState("");
    const handleInputChange = (event, newInputValue) => {
        setSearchQuery(newInputValue);
        setFormData((prev) => ({
        ...prev,
        conceptInput: newInputValue,
        }));
    };

    const handleSelectChange = (event, newValue) => {
        const value = newValue || ''; // clear input if user removed selection
        setSearchQuery(value);
        setFormData((prev) => ({
        ...prev,
        conceptInput: value,
        }));
    };

    const filteredOptions = 
        baseNodes.map((n) => n.data.label)
        .filter((label) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Autocomplete
        value = {formData.conceptInput}
        freeSolo
        options={filteredOptions} // list of matching nodes
        inputValue={searchQuery}
        onInputChange={handleInputChange}
        onChange={handleSelectChange}
        renderInput={(params) => (
            <TextField {...params} name = "conceptInput" label="Concept" variant="outlined" fullWidth/>
        )}
        />
    );
}


