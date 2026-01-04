// Import custom edge components
import PlaceholderEdge from './PlaceholderEdge';
import WorkflowEdge from './WorkflowEdge';

// Export edge types mapping for React Flow
// Two different edge types: workflow (main edges with buttons) and placeholder (temporary edges)
export const edgeTypes = {
  placeholder: PlaceholderEdge,
  workflow: WorkflowEdge,
};

export default edgeTypes;

