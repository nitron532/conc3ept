import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function EdgesSelector({
  baseNodes,
  formData,
  setFormData,
  add,
  baseEdges,
  outgoing,
}) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);

  useEffect(() => {
    const ids = outgoing
      ? formData.outgoingConnections
      : formData.incomingConnections;

    const labels = ids
      .map((id) => baseNodes.find((n) => n.data.conceptId === id)?.data.label)
      .filter(Boolean);

    setSelectedLabels(labels);
  }, [formData, baseNodes, outgoing]);

  const handleChange = (event, values) => {
    setSelectedLabels(values);
    if (outgoing) {
      setFormData({
        ...formData,
        outgoingConnections: values.map(
          (label) =>
            baseNodes.find((n) => n.data.label === label)?.data.conceptId,
        ),
      });
    } else {
      setFormData({
        ...formData,
        incomingConnections: values.map(
          (label) =>
            baseNodes.find((n) => n.data.label === label)?.data.conceptId,
        ),
      });
    }
  };

  const handleInputChange = (event, value) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (formData.conceptInput) {
      setOptions(
        baseNodes
          .map((n) => n.data.label)
          .filter((label) => label !== formData.conceptInput),
      );
    }
  }, [formData.conceptInput]);

  useEffect(() => {
    if (
      !formData.conceptInput ||
      baseNodes
        .map((n) => n.data.label)
        .filter((label) => label === formData.conceptInput).length == 0
    ) {
      setFormData({
        ...formData,
        incomingConnections: [],
        outgoingConnections: [],
        id: -1,
      });
      setSelectedLabels([]);
    }
    const conceptNode = baseNodes.find(
      (n) => n.data.label === formData.conceptInput,
    );
    if (!conceptNode) return;

    const conceptId = conceptNode.id;
    if (add && outgoing) {
      const outgoingEdges = baseEdges.filter(
        (edge) => edge.source === conceptId,
      );

      setFormData((prev) => ({
        ...prev,
        outgoingConnections: outgoingEdges.map((edge) => parseInt(edge.target)),
      }));
    } else if (add && !outgoing) {
      const incomingEdges = baseEdges.filter(
        (edge) => edge.target === conceptId,
      );
      setFormData((prev) => ({
        ...prev,
        incomingConnections: incomingEdges.map((edge) => parseInt(edge.source)),
      }));
    }
  }, [add, formData.conceptInput, baseEdges, baseNodes, setFormData]);
  const outgoingIngoing = outgoing ? "Outgoing Edges" : "Incoming Edges";
  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedLabels}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          name="connections"
          label={outgoingIngoing}
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
}
