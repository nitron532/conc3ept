import  {useState} from 'react'
import { Autocomplete, TextField} from '@mui/material';

export default function NodeSelector({baseNodes, formData, setFormData}){
    const [searchQuery, setSearchQuery] = useState("");
    const handleInputChange = (event, newInputValue, reason) => {
        if (reason === 'reset') return;
        setSearchQuery(newInputValue);
        setFormData((prev)=>({
            ...prev,
            conceptInput: newInputValue,
        }))
    };

    const handleSelectChange = (event, newValue) => {
        const label = newValue?.data.label || ''; // clear input if user removed selection
        const id = newValue?.data.conceptId || -1;
        setSearchQuery(label);
        setFormData((prev) => ({
        ...prev,
        conceptInput: label,
        id: id
        }));
    };

    const filteredOptions = 
        baseNodes
        .filter((node) =>
        node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Autocomplete
        value = {formData.conceptInput}
        freeSolo
        options={filteredOptions} // list of matching nodes
        getOptionLabel={(node)=> node.data?.label || ''}
        inputValue={searchQuery}
        onInputChange={handleInputChange}
        onChange={handleSelectChange}
        renderInput={(params) => (
            <TextField {...params} name = "conceptInput" label="Concept" variant="outlined" fullWidth/>
        )}
        sx={{mt:1}}
        />
    );
}


