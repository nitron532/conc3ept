import  {useState, useEffect} from 'react'
import {Autocomplete, TextField} from '@mui/material';

/*
incoming needs to query incoming edges from database
search thru BaseEdges to find incoming connections
form data might need two different connection fields since the two components share state with parent 
*/

export default function EdgesSelector({baseNodes, formData, setFormData, add, baseEdges, outgoing}){
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState([]);
        
    useEffect(() => {
        const ids = outgoing
        ? formData.outgoingConnections
        : formData.incomingConnections;

        const labels = ids
        .map((id) => baseNodes.find((n) => n.id === id)?.data.label)
        .filter(Boolean);

        setSelectedLabels(labels);
    }, [formData, baseNodes, outgoing]);

    const handleChange = (event, values) => {
        setSelectedLabels(values);
        if(outgoing){
            setFormData({
            ...formData,
            outgoingConnections: values.map(
                (label) => baseNodes.find((t) => t.data.label === label)?.id
            ),
            });
        }
        else{
            setFormData({
            ...formData,
            incomingConnections: values.map(
                (label) => baseNodes.find((t) => t.data.label === label)?.id
            ),
            });
        }
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
            setFormData({
                ...formData,
                incomingConnections: [],
                outgoingConnections: [],
            });
            setSelectedLabels([]);
        }
        const topicNode = baseNodes.find(
            (n) => n.data.label === formData.topicInput
        );
        if (!topicNode) return;

        const topicId = topicNode.id;
        if (add && outgoing) {
            // EDIT MODE: prefill outgoing edges

            // only edges where this node is the source
            const outgoingEdges = baseEdges.filter(
            (edge) => edge.source === topicId
            );

            // update parent formData with IDs of outgoing nodes
            setFormData((prev) => ({
            ...prev,
            outgoingConnections: outgoingEdges.map((edge) => edge.target),
            }));
        } 
        else if (add && !outgoing){
            const incomingEdges = baseEdges.filter(
                (edge) => edge.target === topicId
            );
            setFormData( (prev)=>({
                ...prev,
                incomingConnections: incomingEdges.map((edge)=>edge.source)
            }));
        }
        // ADD MODE: do not clear selectedLabels, let user select freely
    }, [add, formData.topicInput, baseEdges, baseNodes, setFormData]);
    const outgoingIngoing = outgoing ? "Outgoing Edges" : "Incoming Edges"
    return (
            <Autocomplete
                multiple
                options={options}
                value={selectedLabels}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onChange={handleChange}
                renderInput={(params) => (
                <TextField {...params} name = "connections" label={outgoingIngoing} variant="outlined" fullWidth />
                )}
            />
    );
};
