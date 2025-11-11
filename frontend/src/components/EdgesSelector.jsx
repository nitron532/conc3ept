import  {useState, useEffect} from 'react'
import {Autocomplete, TextField} from '@mui/material';

export default function EdgesSelector({baseNodes, formData, setFormData, add, baseEdges}){
    const [inputValue, setInputValue] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [options, setOptions] = useState([]);

    const handleChange = (event, values) => {
        setSelectedLabels(values);
        setFormData({
        ...formData,
        connections: values.map(
            (label) => baseNodes.find((t) => t.data.label === label)?.id
        ),
        });
    };

    const handleInputChange = (event, value) => {
        setInputValue(value);
    };

    useEffect(() => {
        if(formData.topicInput){
            setOptions(baseNodes.map((n) => n.data.label).filter((label) => label !== formData.topicInput));
        }
    }, [formData.topicInput]);

    useEffect(() => {
    if (!formData.topicInput){
        setSelectedLabels([]);
    }
    if (add) {
        // EDIT MODE: prefill outgoing edges
        const topicNode = baseNodes.find(
        (n) => n.data.label === formData.topicInput
        );
        if (!topicNode) return;

        const topicId = topicNode.id;

        // only edges where this node is the source
        const outgoingEdges = baseEdges.filter(
        (edge) => edge.source === topicId
        );

        // map connected nodes to labels for display
        const connectedLabels = outgoingEdges
        .map((edge) => {
            const targetNode = baseNodes.find((n) => n.id === edge.target);
            return targetNode?.data.label;
        })
        .filter(Boolean);

        setSelectedLabels(connectedLabels);

        // update parent formData with IDs of outgoing nodes
        setFormData((prev) => ({
        ...prev,
        connections: outgoingEdges.map((edge) => edge.target),
        }));
    } 
    // ADD MODE: do not clear selectedLabels, let user select freely
    }, [add, formData.topicInput, baseEdges, baseNodes, setFormData]);

    return (
            <Autocomplete
                multiple
                options={options}
                value={selectedLabels}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onChange={handleChange}
                renderInput={(params) => (
                <TextField {...params} name = "connections" label="Edges" variant="outlined" fullWidth />
                )}
            />
    );
};
