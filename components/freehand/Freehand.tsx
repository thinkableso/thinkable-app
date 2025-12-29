// Freehand drawing overlay component for React Flow
// Handles pointer events to capture drawing strokes and create freehand nodes
import { useRef, useState, type PointerEvent } from 'react'; // React hooks for state and refs
import { useReactFlow, type Edge, type ReactFlowInstance } from 'reactflow'; // React Flow hooks and types
import { createClient } from '@/lib/supabase/client'; // Supabase client for database operations

import { pathOptions, pointsToPath } from './path'; // Path generation utilities
import type { Points } from './types'; // Points type definition
import type { FreehandNodeType } from './FreehandNode'; // Freehand node type

// Process drawing points from viewport coordinates to flow coordinates
// points: Array of [clientX, clientY, pressure] tuples from pointer events (viewport coordinates)
// screenToFlowPosition: Function to convert viewport coordinates to flow coordinates
// Returns: Node data with position, dimensions, and normalized points
function processPoints(
  points: [number, number, number][],
  screenToFlowPosition: ReactFlowInstance['screenToFlowPosition'],
) {
  // Initialize bounding box to find drawing bounds
  let x1 = Infinity; // Minimum x coordinate
  let y1 = Infinity; // Minimum y coordinate
  let x2 = -Infinity; // Maximum x coordinate
  let y2 = -Infinity; // Maximum y coordinate

  const flowPoints: Points = []; // Array to store converted flow coordinates

  // Convert all points from screen coordinates to flow coordinates
  for (const point of points) {
    const { x, y } = screenToFlowPosition({ x: point[0], y: point[1] }); // Convert screen to flow
    x1 = Math.min(x1, x); // Update min x
    y1 = Math.min(y1, y); // Update min y
    x2 = Math.max(x2, x); // Update max x
    y2 = Math.max(y2, y); // Update max y

    flowPoints.push([x, y, point[2]]); // Store converted point with pressure
  }

  // Adjust bounding box for stroke thickness (half stroke size on each side)
  const thickness = pathOptions.size * 0.5; // Half of stroke size
  x1 -= thickness; // Expand left
  y1 -= thickness; // Expand top
  x2 += thickness; // Expand right
  y2 += thickness; // Expand bottom

  // Normalize points to start at (0, 0) relative to bounding box
  // This makes the drawing position-independent and easier to scale
  for (const flowPoint of flowPoints) {
    flowPoint[0] -= x1; // Offset x to start at 0
    flowPoint[1] -= y1; // Offset y to start at 0
  }
  let width = x2 - x1; // Calculate final width
  let height = y2 - y1; // Calculate final height

  // Ensure minimum size (at least stroke thickness * 2)
  const minSize = pathOptions.size * 2
  if (width < minSize) {
    const centerX = (x1 + x2) / 2
    x1 = centerX - minSize / 2
    x2 = centerX + minSize / 2
    width = minSize
  }
  if (height < minSize) {
    const centerY = (y1 + y2) / 2
    y1 = centerY - minSize / 2
    y2 = centerY + minSize / 2
    height = minSize
  }

  return {
    position: { x: x1, y: y1 }, // Top-left position in flow coordinates
    width, // Drawing width
    height, // Drawing height
    data: { points: flowPoints, initialSize: { width, height } }, // Node data with normalized points
  };
}

// Freehand component - overlay that captures drawing strokes
// Creates freehand nodes when user draws on the canvas
export function Freehand({ conversationId }: { conversationId?: string }) {
  // Get React Flow instance functions for coordinate conversion and node management
  const { screenToFlowPosition, getViewport, setNodes } = useReactFlow<
    FreehandNodeType,
    Edge
  >();

  const pointRef = useRef<Points>([]); // Ref to store current drawing points (for move handler) - stores page coordinates
  const [points, setPoints] = useState<Points>([]); // State for current drawing points (for rendering) - stores container-relative coordinates for preview

  // Handle pointer down - start a new drawing stroke
  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId); // Capture pointer for this element
    
    // Get React Flow container for coordinate conversion
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement
    if (!reactFlowElement) return
    
    const reactFlowRect = reactFlowElement.getBoundingClientRect()
    
    // Store viewport coordinates for final node creation (screenToFlowPosition expects clientX/clientY)
    const viewportPoints = [
      [e.clientX, e.clientY, e.pressure], // Viewport coordinates for screenToFlowPosition
    ] satisfies Points;
    pointRef.current = viewportPoints; // Store viewport coordinates for final conversion
    
    // Convert to container-relative coordinates for preview display
    const containerX = e.clientX - reactFlowRect.left // Container-relative X
    const containerY = e.clientY - reactFlowRect.top // Container-relative Y
    const previewPoints = [
      [containerX, containerY, e.pressure], // Container-relative coordinates for preview
    ] satisfies Points;
    setPoints(previewPoints); // Update state for preview rendering
  }

  // Handle pointer move - add points to current stroke while drawing
  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) return; // Only process if left mouse button is pressed
    const viewportPoints = pointRef.current; // Get current viewport coordinates from ref
    if (viewportPoints.length === 0) return // Don't add points if stroke hasn't started
    
    // Get React Flow container for coordinate conversion
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement
    if (!reactFlowElement) return
    
    const reactFlowRect = reactFlowElement.getBoundingClientRect()
    
    // Store viewport coordinates for final node creation (screenToFlowPosition expects clientX/clientY)
    const nextViewportPoints = [
      ...viewportPoints, // Include existing viewport coordinates
      [e.clientX, e.clientY, e.pressure], // Add new point with pressure (viewport coordinates)
    ] satisfies Points;
    pointRef.current = nextViewportPoints; // Store viewport coordinates for final conversion
    
    // Convert to container-relative coordinates for preview display
    const containerX = e.clientX - reactFlowRect.left // Container-relative X
    const containerY = e.clientY - reactFlowRect.top // Container-relative Y
    const currentPreviewPoints = points // Get current preview points from state
    const nextPreviewPoints = [
      ...currentPreviewPoints, // Include existing preview points
      [containerX, containerY, e.pressure], // Add new point with pressure (container-relative coordinates)
    ] satisfies Points;
    setPoints(nextPreviewPoints); // Update state for preview rendering
  }

  // Handle pointer up - finish stroke and create freehand node
  function handlePointerUp(e: PointerEvent) {
    (e.target as HTMLDivElement).releasePointerCapture(e.pointerId); // Release pointer capture

    // Get points from ref (not state, as state might be stale)
    const finalPoints = pointRef.current
    if (finalPoints.length === 0) {
      // No points collected, clear and return
      setPoints([])
      pointRef.current = []
      return
    }

    // Process points to get node data
    const nodeData = processPoints(finalPoints, screenToFlowPosition)
    
    // Debug: Log node creation
    console.log('🎨 Creating freehand node:', {
      id: crypto.randomUUID(),
      pointCount: finalPoints.length,
      nodeData: {
        position: nodeData.position,
        width: nodeData.width,
        height: nodeData.height,
        pointsCount: nodeData.data.points.length,
      }
    })

    // Create new freehand node from collected points
    // Note: reactflow v11 requires width/height in style, not as direct properties
    // v12+ (@xyflow/react) uses direct properties but we're on v11
    const newNode: FreehandNodeType = {
      id: crypto.randomUUID(), // Generate unique node ID
      type: 'freehand', // Set node type
      position: nodeData.position, // Node position in flow coordinates
      width: nodeData.width, // Node width (for v12+ compatibility)
      height: nodeData.height, // Node height (for v12+ compatibility)
      style: { // Style object for v11 - required for node dimensions
        width: nodeData.width,
        height: nodeData.height,
      },
      data: nodeData.data, // Node data (points and initialSize)
      resizable: true, // Enable resizing for this node
      selectable: true, // Enable selection
      draggable: true, // Enable dragging
    };
    
    console.log('🎨 Created freehand node:', {
      id: newNode.id,
      position: newNode.position,
      width: newNode.width,
      height: newNode.height,
      pointsCount: newNode.data.points.length,
      initialSize: newNode.data.initialSize,
    })

    setNodes((nodes) => {
      const updatedNodes = [...nodes, newNode]
      console.log('🎨 Added freehand node, total nodes:', updatedNodes.length)
      return updatedNodes
    }); // Add new node to React Flow
    
    // Save freehand node to database if conversationId is available
    if (conversationId) {
      const saveNodeToDatabase = async () => {
        try {
          const supabase = createClient() // Create Supabase client
          const { data: { user } } = await supabase.auth.getUser() // Get current user
          if (!user) {
            console.warn('🎨 Cannot save freehand node: user not authenticated')
            return
          }

          // Save node to canvas_nodes table
          const { error } = await supabase
            .from('canvas_nodes')
            .insert({
              id: newNode.id, // Use same ID as React Flow node
              conversation_id: conversationId, // Board/conversation ID
              user_id: user.id, // User ID
              node_type: 'freehand', // Node type
              position_x: newNode.position.x, // X position in flow coordinates
              position_y: newNode.position.y, // Y position in flow coordinates
              width: newNode.width, // Node width
              height: newNode.height, // Node height
              data: newNode.data, // Node data (points array, initialSize, etc.)
            })

          if (error) {
            console.error('🎨 Error saving freehand node to database:', error)
          } else {
            console.log('🎨 ✅ Saved freehand node to database:', newNode.id)
          }
        } catch (error) {
          console.error('🎨 Error saving freehand node:', error)
        }
      }
      
      // Save asynchronously (don't block UI)
      saveNodeToDatabase()
    }
    
    setPoints([]); // Clear points for next stroke
    pointRef.current = []; // Clear ref for next stroke
  }

  return (
    <div
      className="freehand-overlay" // CSS class for overlay styling
      onPointerDown={handlePointerDown} // Start drawing on pointer down
      onPointerMove={points.length > 0 ? handlePointerMove : undefined} // Continue drawing on move (only if started)
      onPointerUp={handlePointerUp} // Finish drawing on pointer up
    >
      {/* SVG overlay for previewing current stroke */}
      <svg>
        {points.length > 0 && (
          <path 
            d={pointsToPath(points, getViewport().zoom)} 
            className="freehand-path"
          />
        )}
      </svg>
    </div>
  );
}

