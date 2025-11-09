// MiddleArrowEdge.jsx
import { BaseEdge, getBezierPath } from '@xyflow/react';

export default function MiddleArrowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
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

  // Compute angle in degrees (SVG rotate uses degrees)
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <>
      {/* Main edge path */}
      <BaseEdge id={id} path={edgePath} style={style} />

      {/* Arrow in the middle, rotated along edge direction */}
      <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
        <polygon
          points="0,-4 0,4 16,0"
          fill={style.stroke || '#fff'}
          opacity="0.9"
        />
      </g>
    </>
  );
}
