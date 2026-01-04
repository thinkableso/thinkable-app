import { NodeProps, useReactFlow } from 'reactflow';

// Utility functions for generating unique IDs and random labels
import { uuid, randomLabel } from '../utils';

// usePlaceholderClick: Hook that implements logic for clicking a placeholder node
// On placeholder node click: converts the placeholder and connecting edge into a workflow node
export function usePlaceholderClick(id: NodeProps['id']) {
  // React Flow instance methods for manipulating the graph
  const { getNode, setNodes, setEdges } = useReactFlow();

  const onClick = () => {
    // Retrieve the placeholder node object
    const parentNode = getNode(id);

    if (!parentNode) {
      return;
    }

    // Generate unique ID for the new placeholder node (child of the converted node)
    const childPlaceholderId = uuid();

    // Create a placeholder node that will be added as a child of the clicked node
    const childPlaceholderNode = {
      id: childPlaceholderId,
      // Placeholder is initially placed at the clicked node's position
      // Layout function will animate it to its new position
      position: { x: parentNode.position.x, y: parentNode.position.y },
      type: 'placeholder',
      data: { label: '+' },
    };

    // Create connection from the converted node to the new placeholder
    const childPlaceholderEdge = {
      id: `${parentNode.id}=>${childPlaceholderId}`,
      source: parentNode.id,
      target: childPlaceholderId,
      type: 'placeholder',
    };

    // Update nodes: convert clicked placeholder to workflow node and add new placeholder
    setNodes((nodes) =>
      nodes
        .map((node) => {
          // Convert the clicked placeholder node to a workflow node
          if (node.id === id) {
            return {
              ...node,
              type: 'workflow',
              data: { label: randomLabel() },
            };
          }
          return node;
        })
        // Add the new placeholder node as a child
        .concat([childPlaceholderNode])
    );

    // Update edges: convert connecting edge to workflow edge and add new placeholder edge
    setEdges((edges) =>
      edges
        .map((edge) => {
          // Convert the edge connecting to the clicked node from placeholder to workflow
          if (edge.target === id) {
            return {
              ...edge,
              type: 'workflow',
            };
          }
          return edge;
        })
        // Add the new placeholder edge
        .concat([childPlaceholderEdge])
    );
  };

  return onClick;
}

export default usePlaceholderClick;

