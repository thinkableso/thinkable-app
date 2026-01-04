import { useCallback } from 'react';
import { EdgeProps, useReactFlow } from 'reactflow';

// useInsertNodeBetween: Hook that inserts a node between two connected nodes
// Used when "Insert Node" is selected from edge click menu
// Position is calculated based on actual panel heights to place placeholder between panels correctly
export function useInsertNodeBetween() {
  // React Flow instance methods for manipulating the graph
  const { setEdges, setNodes, getNode, getEdge, getViewport } = useReactFlow();

  // Helper function to get actual node height (from node.height or by measuring DOM)
  const getNodeHeight = useCallback((node: any): number => {
    // First try to get height from node properties (React Flow v12+)
    if (node.height && typeof node.height === 'number') {
      return node.height;
    }

    // Fallback: measure actual DOM element height
    const reactFlowElement = document.querySelector('.react-flow');
    if (reactFlowElement) {
      const nodeElement = reactFlowElement.querySelector(`[data-id="${node.id}"]`) as HTMLElement;
      if (nodeElement) {
        const viewport = getViewport();
        // Measure actual height and account for zoom
        const actualHeight = nodeElement.getBoundingClientRect().height / viewport.zoom;
        return actualHeight;
      }
    }

    // Default fallback height if measurement fails
    return 400;
  }, [getViewport]);

  const insertNodeBetween = useCallback((edgeId: string) => {
    // Retrieve the edge object to get source and target IDs
    const edge = getEdge(edgeId);

    if (!edge) {
      return;
    }

    // Retrieve source and target nodes
    const sourceNode = getNode(edge.source);
    const targetNode = getNode(edge.target);

    if (!sourceNode || !targetNode) {
      return;
    }

    // Get actual heights of both nodes
    const sourceHeight = getNodeHeight(sourceNode);
    const targetHeight = getNodeHeight(targetNode);
    const spacing = 50; // Spacing between panels

    // Calculate position between source and target nodes
    // Place placeholder below source node (source position + source height + spacing)
    // This ensures it appears between the panels, not behind them
    const placeholderY = sourceNode.position.y + sourceHeight + spacing;

    // Generate unique ID for the placeholder (will be shown where node will be inserted)
    const placeholderId = `placeholder-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create placeholder node that shows where the node will be inserted
    const placeholderNode = {
      id: placeholderId,
      // Position placeholder between source and target using actual heights
      position: { 
        x: sourceNode.position.x, 
        y: placeholderY 
      },
      type: 'placeholder',
      data: { label: '+' },
    };

    // Create connection from source to placeholder
    const sourcePlaceholderEdge = {
      id: `${edge.source}->${placeholderId}`,
      source: edge.source,
      target: placeholderId,
      type: 'placeholder',
    };

    // Create connection from placeholder to target
    const targetPlaceholderEdge = {
      id: `${placeholderId}->${edge.target}`,
      source: placeholderId,
      target: edge.target,
      type: 'placeholder',
    };

    // Remove the clicked edge and add placeholder edges
    setEdges((edges) =>
      edges
        .filter((e) => e.id !== edgeId)
        .concat([sourcePlaceholderEdge, targetPlaceholderEdge])
    );

    // Insert the placeholder node between source and target in the nodes array
    setNodes((nodes) => {
      // Find the index of the target node
      const targetNodeIndex = nodes.findIndex(
        (node) => node.id === edge.target
      );

      // Insert the placeholder node before the target node
      return [
        ...nodes.slice(0, targetNodeIndex),
        placeholderNode,
        ...nodes.slice(targetNodeIndex, nodes.length),
      ];
    });
  }, [getEdge, getNode, setEdges, setNodes, getNodeHeight]);

  return insertNodeBetween;
}

export default useInsertNodeBetween;

