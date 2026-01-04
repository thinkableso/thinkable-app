import { useEffect, useCallback, useRef } from 'react';
// React Flow imports for graph manipulation
import { Node, Edge, useReactFlow } from 'reactflow';

// usePlaceholderManager: Hook that manages placeholder nodes showing where next chat panel will be added
// Shows placeholder below last added panel OR below selected panel
// Position is calculated based on actual panel height to prevent placeholders from appearing behind large panels
// Placeholders are draggable and maintain their relative position to the target panel
export function usePlaceholderManager(
  nodes: Node[],
  edges: Edge[],
  conversationId?: string
) {
  // React Flow instance methods for manipulating the graph
  const { setNodes, setEdges, getNodes, getEdges, getViewport } = useReactFlow();
  
  // Store relative offsets for each placeholder (preserved across target node changes)
  // Format: { placeholderId: { offsetX: number, offsetY: number, targetWidth: number, targetHeight: number, sourceHandle: string } }
  // The offset is relative to the handle the placeholder edge connects to, not the node's top-left corner
  const placeholderOffsetsRef = useRef<Map<string, { offsetX: number; offsetY: number; targetWidth: number; targetHeight: number; sourceHandle: string }>>(new Map());
  
  // Track previous placeholder positions to detect when they're dragged (not just repositioned)
  const previousPlaceholderPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  // Helper function to get actual node width (from node.width or by measuring DOM)
  const getNodeWidth = useCallback((node: Node): number => {
    // First try to get width from node properties (React Flow v12+)
    if (node.width && typeof node.width === 'number') {
      return node.width;
    }

    // Fallback: measure actual DOM element width
    const reactFlowElement = document.querySelector('.react-flow');
    if (reactFlowElement) {
      const nodeElement = reactFlowElement.querySelector(`[data-id="${node.id}"]`) as HTMLElement;
      if (nodeElement) {
        const viewport = getViewport();
        // Measure actual width and account for zoom
        const actualWidth = nodeElement.getBoundingClientRect().width / viewport.zoom;
        return actualWidth;
      }
    }

    // Default fallback width if measurement fails
    return 400;
  }, [getViewport]);

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

  // Helper function to get handle position based on handle ID and node dimensions
  const getHandlePosition = useCallback((node: Node, handleId: string): { x: number; y: number } => {
    const width = getNodeWidth(node);
    const height = getNodeHeight(node);
    const pos = node.position;

    // Calculate handle positions based on handle ID
    // Handles are positioned at the center of their respective edges
    switch (handleId) {
      case 'left':
        return { x: pos.x, y: pos.y + height / 2 };
      case 'right':
        return { x: pos.x + width, y: pos.y + height / 2 };
      case 'top':
        return { x: pos.x + width / 2, y: pos.y };
      case 'bottom':
        return { x: pos.x + width / 2, y: pos.y + height };
      default:
        // Default to bottom handle if handle ID is not recognized
        return { x: pos.x + width / 2, y: pos.y + height };
    }
  }, [getNodeWidth, getNodeHeight]);

  // Update placeholders based on current state
  const updatePlaceholders = useCallback(() => {
    // Get current nodes and edges
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    // Filter out existing placeholders
    const workflowNodes = currentNodes.filter((n) => n.type !== 'placeholder');
    const placeholderNodes = currentNodes.filter((n) => n.type === 'placeholder');
    const placeholderEdges = currentEdges.filter((e) => e.type === 'placeholder');

    // Find selected nodes
    const selectedNodes = workflowNodes.filter((n) => n.selected);

    // Determine where to show placeholder
    let targetNode: Node | null = null;

    if (selectedNodes.length > 0) {
      // If there are selected nodes, show placeholder below the first selected node
      targetNode = selectedNodes[0];
    } else if (workflowNodes.length > 0) {
      // Otherwise, show placeholder below the last added node (highest Y position)
      // In linear mode, this would be the bottom-most node
      targetNode = workflowNodes.reduce((last, current) => {
        // Compare by Y position (higher Y = lower on screen)
        return current.position.y > last.position.y ? current : last;
      });
    }

    // Remove all existing placeholders
    const nodesWithoutPlaceholders = currentNodes.filter(
      (n) => n.type !== 'placeholder'
    );
    const edgesWithoutPlaceholders = currentEdges.filter(
      (e) => e.type !== 'placeholder'
    );

    // If we have a target node, add or update placeholder
    // Use a single placeholder ID that's not tied to a specific target node
    if (targetNode) {
      const placeholderId = 'placeholder-main'; // Single placeholder for all panels
      
      // Check if placeholder already exists
      const existingPlaceholder = placeholderNodes.find((n) => n.id === placeholderId);
      const storedOffset = placeholderOffsetsRef.current.get(placeholderId);
      
      // Find the existing placeholder edge to determine which handle it connects to
      const existingPlaceholderEdge = placeholderEdges.find((e) => e.target === placeholderId);
      // Default to bottom handle if edge doesn't specify or doesn't exist
      const sourceHandle = existingPlaceholderEdge?.sourceHandle || storedOffset?.sourceHandle || 'bottom';
      
      let placeholderPosition: { x: number; y: number };
      
      if (storedOffset) {
        // Get handle position on current target node (using stored handle ID)
        const handlePos = getHandlePosition(targetNode, storedOffset.sourceHandle);
        
        // Apply stored offset relative to the handle position
        placeholderPosition = {
          x: handlePos.x + storedOffset.offsetX,
          y: handlePos.y + storedOffset.offsetY,
        };
      } else {
        // New placeholder or no stored offset - position below target node using bottom handle
        const handlePos = getHandlePosition(targetNode, 'bottom');
        const spacing = 50; // Default spacing between panel and placeholder
        placeholderPosition = {
          x: handlePos.x,
          y: handlePos.y + spacing,
        };
        
        // Store initial offset relative to handle position with target dimensions
        const targetWidth = getNodeWidth(targetNode);
        const targetHeight = getNodeHeight(targetNode);
        placeholderOffsetsRef.current.set(placeholderId, {
          offsetX: 0, // Relative to handle X position
          offsetY: spacing, // Relative to handle Y position
          targetWidth: targetWidth,
          targetHeight: targetHeight,
          sourceHandle: 'bottom', // Default to bottom handle
        });
      }

      const placeholderNode: Node = {
        id: placeholderId,
        position: placeholderPosition,
        type: 'placeholder',
        data: { 
          label: '+',
          targetNodeId: targetNode.id, // Store current target node ID for reference
        },
        draggable: true, // Always make placeholder draggable (regardless of lock or view mode)
      };

      const placeholderEdge: Edge = {
        id: `${targetNode.id}=>${placeholderId}`,
        source: targetNode.id,
        sourceHandle: storedOffset?.sourceHandle || 'bottom', // Use stored handle or default to bottom
        target: placeholderId,
        type: 'placeholder',
      };

      setNodes([...nodesWithoutPlaceholders, placeholderNode]);
      setEdges([...edgesWithoutPlaceholders, placeholderEdge]);
    } else {
      // No target node, remove all placeholders
      setNodes(nodesWithoutPlaceholders);
      setEdges(edgesWithoutPlaceholders);
    }
  }, [getEdges, getNodes, setEdges, setNodes, getNodeHeight, getNodeWidth, getHandlePosition]);

  // Track placeholder positions and update offsets when they're dragged (not just repositioned)
  // This detects when the user manually drags a placeholder vs when it's repositioned due to selection change
  useEffect(() => {
    if (!conversationId) return;

    const currentNodes = getNodes();
    const placeholderNodes = currentNodes.filter((n) => n.type === 'placeholder');

    // Update offsets only if placeholder was actually dragged by user
    placeholderNodes.forEach((placeholder) => {
      const targetNodeId = placeholder.data?.targetNodeId;
      if (!targetNodeId) return;

      const targetNode = currentNodes.find((n) => n.id === targetNodeId);
      if (!targetNode) return;

      const previousPosition = previousPlaceholderPositionsRef.current.get(placeholder.id);
      const currentPosition = placeholder.position;
      const storedOffset = placeholderOffsetsRef.current.get(placeholder.id);
      
      // Calculate what the position should be based on stored offset (if it exists)
      // Position is relative to the handle, not the node's top-left corner
      const expectedPosition = storedOffset ? (() => {
        const handlePos = getHandlePosition(targetNode, storedOffset.sourceHandle);
        return {
          x: handlePos.x + storedOffset.offsetX,
          y: handlePos.y + storedOffset.offsetY,
        };
      })() : null;

      // Check if placeholder was dragged by user:
      // 1. Position changed significantly (more than 5px)
      // 2. Current position differs from expected position (if we have a stored offset)
      const positionChanged = previousPosition && (
        Math.abs(currentPosition.x - previousPosition.x) > 5 ||
        Math.abs(currentPosition.y - previousPosition.y) > 5
      );
      
      const differsFromExpected = expectedPosition && (
        Math.abs(currentPosition.x - expectedPosition.x) > 5 ||
        Math.abs(currentPosition.y - expectedPosition.y) > 5
      );

      // Only update offset if it was dragged by user (not programmatically repositioned)
      // When dragged, calculate offset relative to the handle the edge connects to
      if (positionChanged && (!expectedPosition || differsFromExpected)) {
        // Find the placeholder edge to determine which handle it connects to
        const currentEdges = getEdges();
        const placeholderEdge = currentEdges.find((e) => e.target === placeholder.id && e.source === targetNode.id);
        const sourceHandle = placeholderEdge?.sourceHandle || 'bottom'; // Default to bottom handle
        
        // Get handle position on target node
        const handlePos = getHandlePosition(targetNode, sourceHandle);
        
        // Calculate relative offset from handle position (not node top-left corner)
        const offsetX = placeholder.position.x - handlePos.x;
        const offsetY = placeholder.position.y - handlePos.y;
        
        // Get current target node dimensions
        const targetWidth = getNodeWidth(targetNode);
        const targetHeight = getNodeHeight(targetNode);

        // Store the offset relative to handle position with target dimensions
        placeholderOffsetsRef.current.set(placeholder.id, {
          offsetX,
          offsetY,
          targetWidth,
          targetHeight,
          sourceHandle, // Store which handle this offset is relative to
        });
      }

      // Update previous position for next comparison
      previousPlaceholderPositionsRef.current.set(placeholder.id, {
        x: placeholder.position.x,
        y: placeholder.position.y,
      });
    });
  }, [nodes, conversationId, getNodes, getNodeWidth, getNodeHeight, getEdges, getHandlePosition]);

  // Update placeholders when nodes or selection changes
  // Use a longer delay to ensure DOM is fully rendered and heights can be measured
  useEffect(() => {
    if (!conversationId) return;

    // Delay to ensure DOM is fully rendered so we can measure actual panel heights
    const timeoutId = setTimeout(() => {
      updatePlaceholders();
    }, 200); // Increased delay to allow DOM to render and heights to be measured

    return () => clearTimeout(timeoutId);
  }, [nodes, conversationId, updatePlaceholders]);

  return { updatePlaceholders };
}

export default usePlaceholderManager;

