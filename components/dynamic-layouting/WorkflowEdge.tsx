import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from 'reactflow';

// Hook for handling edge click events - adds nodes between connected nodes
import useEdgeClick from './hooks/useEdgeClick';

// WorkflowEdge: Edge type with a clickable button in the middle
// Clicking the button adds a node between the source and target nodes
export default function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  // onClick handler adds a node between the nodes connected by this edge
  const onClick = useEdgeClick(id);

  // Calculate bezier path and center point for the edge
  // Used to position the '+' button at the edge center
  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Base edge rendering with bezier curve */}
      <BaseEdge id={id} style={style} path={edgePath} markerEnd={markerEnd} />
      {/* EdgeLabelRenderer allows positioning elements along the edge */}
      <EdgeLabelRenderer>
        {/* Clickable button positioned at the center of the edge */}
        <button
          style={{
            // Transform to center the button at the edge midpoint
            transform: `translate(${edgeCenterX}px, ${edgeCenterY}px) translate(-50%, -50%)`,
          }}
          onClick={onClick}
          className="edge-button nodrag nopan"
        >
          +
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

