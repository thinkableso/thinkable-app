import { useCallback } from 'react';
// React Flow imports for node manipulation and graph traversal
import { NodeProps, useReactFlow, getOutgoers } from 'reactflow';

// Utility functions for generating unique IDs and random labels
import { uuid, randomLabel } from '../utils';

// useNodeClick: Hook that implements logic for clicking a workflow node
// On workflow node click: creates a new child node of the clicked node
export function useNodeClick(id: NodeProps['id']) {
  // React Flow instance methods for manipulating the graph
  const { setEdges, setNodes, getNodes, getEdges, getNode } = useReactFlow();

  const onClick = useCallback(() => {
    // Retrieve the parent node object for positioning the new child node
    const parentNode = getNode(id);

    if (!parentNode) {
      return;
    }

    // Generate unique ID for the child node
    const childNodeId = uuid();

    // Generate unique ID for the placeholder (added to the new child node)
    const childPlaceholderId = uuid();

    // Create the child node with initial position
    // Positioned 150px below parent (spacing can be adjusted in useLayout hook)
    const childNode = {
      id: childNodeId,
      position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
      type: 'workflow',
      data: { label: randomLabel() },
    };

    // Create a placeholder for the new child node
    // All workflow nodes without children get a placeholder
    const childPlaceholderNode = {
      id: childPlaceholderId,
      // Positioned 150px below the child node
      position: { x: childNode.position.x, y: childNode.position.y + 150 },
      type: 'placeholder',
      data: { label: '+' },
    };

    // Create connection from parent to child
    const childEdge = {
      id: `${parentNode.id}=>${childNodeId}`,
      source: parentNode.id,
      target: childNodeId,
      type: 'workflow',
    };

    // Create connection from child to placeholder
    const childPlaceholderEdge = {
      id: `${childNodeId}=>${childPlaceholderId}`,
      source: childNodeId,
      target: childPlaceholderId,
      type: 'placeholder',
    };

    // Find and remove any existing placeholder children of the clicked node
    // Since it will now have a real child, placeholders are no longer needed
    const existingPlaceholders = getOutgoers(parentNode, getNodes(), getEdges())
      .filter((node) => node.type === 'placeholder')
      .map((node) => node.id);

    // Add new nodes (child and placeholder), filter out existing placeholders
    setNodes((nodes) =>
      nodes
        .filter((node) => !existingPlaceholders.includes(node.id))
        .concat([childNode, childPlaceholderNode])
    );

    // Add new edges (node -> child, child -> placeholder), filter out placeholder edges
    setEdges((edges) =>
      edges
        .filter((edge) => !existingPlaceholders.includes(edge.target))
        .concat([childEdge, childPlaceholderEdge])
    );
  }, [getEdges, getNode, getNodes, id, setEdges, setNodes]);

  return onClick;
}

export default useNodeClick;

