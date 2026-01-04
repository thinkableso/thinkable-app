import { memo } from 'react';
// React Flow imports for node components and positioning
import { Handle, Position, NodeProps } from 'reactflow';

// Hook for handling node click events - adds child nodes
import useNodeClickHandler from './hooks/useNodeClick';

// WorkflowNode: Main node type that can be clicked to add child nodes
// This is the primary interactive node in the dynamic layout system
const WorkflowNode = ({ id, data }: NodeProps) => {
  // onClick handler adds a new child node when this node is clicked
  const onClick = useNodeClickHandler(id);

  return (
    <div onClick={onClick} title="click to add a child node">
      {/* Display the node label (emoji + text) */}
      {data.label}
      {/* Top handle for incoming connections - not user-connectable */}
      <Handle type="target" position={Position.Top} isConnectable={false} />
      {/* Bottom handle for outgoing connections - not user-connectable */}
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
};

export default memo(WorkflowNode);

