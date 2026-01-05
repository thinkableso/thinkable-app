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
  data,
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

  // Get hidden state from edge data
  const isHidden = data?.hidden || false;
  
  // Render the edge with bezier curve and dashed style to match React Flow placeholder appearance
  return (
    <BaseEdge 
      id={id} 
      style={{
        ...style,
        stroke: '#b1b1b7',
        strokeWidth: 1,
        strokeDasharray: '5,5', // Dashed line to match React Flow placeholder style
        opacity: isHidden ? 0 : 1, // Hide edge when placeholder is hidden
        transition: 'opacity 200ms ease-in-out', // Smooth fade transition
      }} 
      path={edgePath} 
      markerEnd={markerEnd} 
    />
  );
}

