import { useCallback } from 'react';
// React Flow imports for node manipulation
import { Node, useReactFlow, getOutgoers } from 'reactflow';

// useAddChildNode: Hook that adds a child node to a parent node
// Used when "Add Child" is selected from node right-click menu
// Position is calculated based on actual panel height to prevent placeholders from appearing behind large panels
export function useAddChildNode() {
  // React Flow instance methods for manipulating the graph
  const { setEdges, setNodes, getNodes, getEdges, getNode, getViewport } = useReactFlow();

  // Helper function to get actual node height (from node.height or by measuring DOM)
  const getNodeHeight = useCallback((node: Node): number => {
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

  const addChildNode = useCallback((parentNodeId: string) => {
    // Retrieve the parent node object
    const parentNode = getNode(parentNodeId);

    if (!parentNode) {
      return;
    }

    // Get actual height of the parent node
    const parentHeight = getNodeHeight(parentNode);
    const spacing = 50; // Spacing between panel and placeholder

    // Generate unique ID for the placeholder (will be shown where child will be added)
    const placeholderId = `placeholder-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create placeholder node that shows where the child will be added
    // Positioned below the parent node using actual height + spacing
    const placeholderNode: Node = {
      id: placeholderId,
      // Position placeholder below parent using actual height + spacing
      position: { 
        x: parentNode.position.x, 
        y: parentNode.position.y + parentHeight + spacing
      },
      type: 'placeholder',
      data: { label: '+' },
    };

    // Create connection from parent to placeholder
    const placeholderEdge = {
      id: `${parentNodeId}=>${placeholderId}`,
      source: parentNodeId,
      target: placeholderId,
      type: 'placeholder',
    };

    // Find and remove any existing placeholder children of the parent node
    // Since we're adding a new placeholder, remove old ones
    const existingPlaceholders = getOutgoers(parentNode, getNodes(), getEdges())
      .filter((node) => node.type === 'placeholder')
      .map((node) => node.id);

    // Add placeholder node, filter out existing placeholders
    setNodes((nodes) =>
      nodes
        .filter((node) => !existingPlaceholders.includes(node.id))
        .concat([placeholderNode])
    );

    // Add placeholder edge, filter out existing placeholder edges
    setEdges((edges) =>
      edges
        .filter((edge) => !existingPlaceholders.includes(edge.target))
        .concat([placeholderEdge])
    );
  }, [getEdges, getNode, getNodes, setEdges, setNodes, getNodeHeight]);

  return addChildNode;
}

export default useAddChildNode;

