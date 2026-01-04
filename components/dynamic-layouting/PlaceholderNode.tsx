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
      className="react-flow__node-placeholder"
      title="Next chat panel will be added here"
      style={{
        width: '160px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        border: '1px dashed #bbb',
        color: '#bbb',
        boxShadow: 'none',
        borderRadius: '8px',
      }}
    >
      {/* Display the placeholder label (typically '+') */}
      {data.label}
      {/* Top handle for incoming connections - not user-connectable */}
      <Handle type="target" position={Position.Top} isConnectable={false} />
      {/* Bottom handle for outgoing connections - not user-connectable */}
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
};

export default memo(PlaceholderNode);

