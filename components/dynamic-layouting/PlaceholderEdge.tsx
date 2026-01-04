import { getBezierPath, EdgeProps, BaseEdge } from 'reactflow';

// PlaceholderEdge: Simple edge type for placeholder connections
// No special functionality - purely visual connection between nodes
export default function PlaceholderEdge({
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
  // Calculate bezier path for the edge (center point not needed for placeholder)
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Render the edge with bezier curve
  return (
    <BaseEdge id={id} style={style} path={edgePath} markerEnd={markerEnd} />
  );
}

