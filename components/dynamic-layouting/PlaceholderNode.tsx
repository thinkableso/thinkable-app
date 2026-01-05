import { memo } from 'react';
// React Flow imports for node components and positioning
import { Handle, Position, NodeProps } from 'reactflow';

// PlaceholderNode: Visual indicator showing where the next chat panel will be added
// This is a visual-only component - placeholders are managed by usePlaceholderManager
// They show below the last added panel or below the selected panel
// Styled to match React Flow placeholder appearance: dashed border, simple "+" label
const PlaceholderNode = ({ id, data }: NodeProps) => {
  return (
    <div 
      className="react-flow__node-placeholder transition-opacity duration-200 ease-in-out"
      title="Next chat panel will be added here"
      style={{
        width: '160px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: '1px dashed #b1b1b7',
        color: '#b1b1b7',
        boxShadow: 'none',
        borderRadius: '8px',
        opacity: data?.hidden ? 0 : 1, // Fade out when hidden
        cursor: 'grab',
      }}
    >
      {/* Display the placeholder label (typically '+') */}
      {data.label}
      {/* Top handle - target (can receive connections) */}
      <Handle type="target" position={Position.Top} id="top" isConnectable={false} />
      {/* Top handle - source (can send connections) */}
      <Handle type="source" position={Position.Top} id="top" isConnectable={false} />
      {/* Bottom handle - target (can receive connections) */}
      <Handle type="target" position={Position.Bottom} id="bottom" isConnectable={false} />
      {/* Bottom handle - source (can send connections) */}
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={false} />
      {/* Left handle - target (can receive connections) */}
      <Handle type="target" position={Position.Left} id="left" isConnectable={false} />
      {/* Left handle - source (can send connections) */}
      <Handle type="source" position={Position.Left} id="left" isConnectable={false} />
      {/* Right handle - target (can receive connections) */}
      <Handle type="target" position={Position.Right} id="right" isConnectable={false} />
      {/* Right handle - source (can send connections) */}
      <Handle type="source" position={Position.Right} id="right" isConnectable={false} />
    </div>
  );
};

export default memo(PlaceholderNode);

