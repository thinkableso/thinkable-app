import { NodeTypes } from 'reactflow';

// Import custom node components
import PlaceholderNode from './PlaceholderNode';
import WorkflowNode from './WorkflowNode';

// Export node types mapping for React Flow
// Two different node types: workflow (main nodes) and placeholder (temporary nodes)
export const nodeTypes: NodeTypes = {
  placeholder: PlaceholderNode,
  workflow: WorkflowNode,
};

export default nodeTypes;

