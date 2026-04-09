// MiddleArrowEdge.jsx
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from "@xyflow/react";
import { useState } from "react";
import { TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
export default function MiddleArrowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = { cursor: "pointer" },
  data,
}) {
  // Create a smooth curved path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // --- Compute midpoint and direction ---
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Find the tangent vector between source and target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const [edit, setEdit] = useState(false);
  const [hoverClear, setHoverClear] = useState(false);
  const [labelState, setLabelState] = useState(data.label);

  // Compute angle in degrees (SVG rotate uses degrees)
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  const editEdgeLabel = async (newLabel) => {
    let formData = { newLabel: newLabel, id: id };
    try {
      await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/EditEdgeLabel`,
        formData,
        { headers: { "Content-Type": "application/json" } },
      );
      setLabelState(newLabel);
    } catch (error) {
      console.log(`Failed to update edge ${id}.`);
    }
  };

  const handleLabelClick = () => {
    setEdit(!edit);
    console.log("clicked");
  };
  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEdit(false);
      await editEdgeLabel(event.target.value);
    }
  };

  const handleInputChange = (event) => {
    event.preventDefault();
    setLabelState(event.target.value);
  };

  return (
    <>
      {/* Main edge path */}
      <BaseEdge id={id} path={edgePath} style={style} />
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={40}
        fill="none"
        onClick={handleLabelClick}
        style={{ cursor: "pointer" }}
        className="nodrag nopan"
      />
      {/* Arrow in the middle, rotated along edge direction */}
      <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
        <polygon
          points="0,-4 0,4 16,0"
          fill={style.stroke || "#fff"}
          opacity="0.9"
        />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -100%) translate(${midX}px, ${midY}px)`,
            pointerEvents: "all",
          }}
          className="edge-label-renderer__custom-edge nodrag nopan"
        >
          <a style={{ cursor: "pointer" }} onClick={handleLabelClick}>
            {labelState}
          </a>
          {edit && (
            <div
              className="nodrag nopan"
              style={{
                position: "absolute",
                top: "50%",
                left: "100%",
                transform: "translateY(-45%)",
                marginLeft: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                zIndex: 1000,
                pointerEvents: "all",
              }}
            >
              <TextField
                style={{ minWidth: "10em" }}
                value={labelState}
                variant="outlined"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <ClearIcon
                onMouseEnter={() => setHoverClear(true)}
                onMouseLeave={() => setHoverClear(false)}
                onClick={handleLabelClick}
                className="nodrag nopan"
                style={{
                  zIndex: 1000,
                  whiteSpace: "nowrap",
                  pointerEvents: "all",
                  marginTop: "0.85em",
                  cursor: "pointer",
                  color: hoverClear ? "#f44336" : "inherit",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  transform: hoverClear
                    ? "translateY(-45%) scale(1.2)"
                    : "translateY(-45%)",
                }}
              />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
