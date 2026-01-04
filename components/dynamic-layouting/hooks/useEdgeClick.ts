import { EdgeProps, useReactFlow } from 'reactflow';

// Utility functions for generating unique IDs and random labels
import { uuid, randomLabel } from '../utils';

// useEdgeClick: Hook that implements logic for clicking the button on a workflow edge
// On edge click: creates a node in between the two nodes connected by the edge
function useEdgeClick(id: EdgeProps['id']) {
  // React Flow instance methods for manipulating the graph
  const { setEdges, setNodes, getNode, getEdge } = useReactFlow();

  const handleEdgeClick = () => {
    // Retrieve the edge object to get source and target IDs
    const edge = getEdge(id);

    if (!edge) {
      return;
    }

    // Retrieve the target node to get its position
    const targetNode = getNode(edge.target);

    if (!targetNode) {
      return;
    }

    // Generate unique ID for the newly inserted node
    const insertNodeId = uuid();

    // Create the node that will be inserted between source and target
    const insertNode = {
      id: insertNodeId,
      // Place the node at the current position of the target (prevents jumping)
      position: { x: targetNode.position.x, y: targetNode.position.y },
      data: { label: randomLabel() },
      type: 'workflow',
    };

    // Create new connection from source to the inserted node
    const sourceEdge = {
      id: `${edge.source}->${insertNodeId}`,
      source: edge.source,
      target: insertNodeId,
      type: 'workflow',
    };

    // Create new connection from the inserted node to target
    const targetEdge = {
      id: `${insertNodeId}->${edge.target}`,
      source: insertNodeId,
      target: edge.target,
      type: 'workflow',
    };

    // Remove the clicked edge and add the two new edges
    setEdges((edges) =>
      edges.filter((e) => e.id !== id).concat([sourceEdge, targetEdge])
    );

    // Insert the new node between source and target in the nodes array
    setNodes((nodes) => {
      // Find the index of the target node
      const targetNodeIndex = nodes.findIndex(
        (node) => node.id === edge.target
      );

      // Insert the new node before the target node
      return [
        ...nodes.slice(0, targetNodeIndex),
        insertNode,
        ...nodes.slice(targetNodeIndex, nodes.length),
      ];
    });
  };

  return handleEdgeClick;
}

export default useEdgeClick;

