//Experimental Edge Avoidance using https://www.npmjs.com/package/avoid-nodes-edge.

import { useState, useCallback } from "react";
import { EdgeLabelRenderer, useReactFlow } from "@xyflow/react";
import { AvoidNodesEdge } from "avoid-nodes-edge/edge";
import { useAvoidNodesPath } from "avoid-nodes-edge";
import { TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

export default function AvoidEdge(props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props;

  const { updateEdge } = useReactFlow();
  const [edit, setEdit] = useState(false);
  const [hoverClear, setHoverClear] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "");

  const [, labelX, labelY] = useAvoidNodesPath({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const saveLabel = useCallback(
    async (newLabel) => {
      updateEdge(id, (edge) => ({
        ...edge,
        data: { ...edge.data, label: newLabel },
      }));
      try {
        await axios.patch(
          `${import.meta.env.VITE_SERVER_URL}/EditEdgeLabel`,
          { newLabel, id },
          { headers: { "Content-Type": "application/json" } },
        );
      } catch {
        console.log(`Failed to update edge ${id}.`);
      }
    },
    [id, updateEdge],
  );

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEdit(false);
      await saveLabel(draftLabel);
    }
    if (e.key === "Escape") {
      setEdit(false);
      setDraftLabel(data?.label ?? "");
    }
  };

  return (
    <>
      <AvoidNodesEdge {...props} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          {!edit ? (
            // Invisible hit area sitting exactly over the package's own label
            <div
              onClick={() => {
                setDraftLabel(data?.label ?? "");
                setEdit(true);
              }}
              style={{
                width: "80px",
                height: "24px",
                cursor: "pointer",
                background: "transparent",
              }}
            />
          ) : (
            <div
              className="nodrag nopan"
              style={{
                position: "absolute",
                top: "50%",
                left: "100%",
                transform: "translateY(-45%)",
                marginLeft: "50px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                zIndex: 1000,
                pointerEvents: "all",
              }}
            >
              <TextField
                autoFocus
                style={{ minWidth: "10em" }}
                value={draftLabel}
                variant="outlined"
                size="small"
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <ClearIcon
                onMouseEnter={() => setHoverClear(true)}
                onMouseLeave={() => setHoverClear(false)}
                onClick={() => {
                  setEdit(false);
                  setDraftLabel(data?.label ?? "");
                }}
                className="nodrag nopan"
                style={{
                  cursor: "pointer",
                  color: hoverClear ? "#f44336" : "inherit",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  transform: hoverClear ? "scale(1.2)" : "scale(1)",
                }}
              />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
