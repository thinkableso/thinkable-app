import { useEffect, useRef } from 'react';
// React Flow imports for graph manipulation and state management
import {
  useReactFlow,
  useStore,
  Node,
  Edge,
} from 'reactflow';
// D3 imports for hierarchical layout calculation
import { stratify, tree } from 'd3-hierarchy';
// D3 timer for smooth animation interpolation
import { timer } from 'd3-timer';

// Initialize the tree layout algorithm
// nodeSize configures spacing between nodes ([width, height])
// separation ensures equal space between all nodes
const layout = tree<Node>()
  .nodeSize([200, 150])
  .separation(() => 1);

// Animation options - duration in milliseconds
const options = { duration: 300 };

// layoutNodes: Calculates positions for nodes using d3-hierarchy
// Converts React Flow nodes and edges into a hierarchical structure,
// runs the layout algorithm, and returns nodes with updated positions
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  // If there are no nodes, return empty array
  if (nodes.length === 0) {
    return [];
  }
  // Convert nodes and edges into a hierarchical object for d3 layout
  // stratify creates a hierarchy from flat data by finding parent-child relationships
  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // Find parent ID by searching through edges for the target node
    // This only works if every node has one connection (tree structure)
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
    nodes
  );

  // Run the layout algorithm with the hierarchy data structure
  const root = layout(hierarchy);

  // Convert the hierarchy back to React Flow nodes
  // The original node is stored as d.data, we extract position from d3
  return root
    .descendants()
    .map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

// Store selector that triggers layout recalculation
// Returns the number of nodes, which changes when nodes are added/removed
const nodeCountSelector = (state: any) => state.nodeLookup?.size || 0;

// useLayout: Hook that automatically recalculates and animates node positions
// Runs whenever the number of nodes changes (node added/removed)
function useLayout() {
  // Ref to track if this is the first layout run (for fitView)
  const initial = useRef(true);

  // Get node count from store - triggers re-layout when it changes
  const nodeCount = useStore(nodeCountSelector);

  // React Flow instance methods for graph manipulation
  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } =
    useReactFlow();

  useEffect(() => {
    // Get current nodes and edges from the graph
    const nodes = getNodes();
    const edges = getEdges();

    // Calculate new positions using the layout algorithm
    const targetNodes = layoutNodes(nodes, edges);

    // If you don't want animation, uncomment the following line:
    // return setNodes(targetNodes);

    // Create transition objects for each node with current and target positions
    // This allows smooth interpolation between positions
    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        // Current position of the node (or target position if node doesn't exist yet)
        from: getNode(node.id)?.position || node.position,
        // Target position calculated by layout algorithm
        to: node.position,
        node,
      };
    });

    // Create a timer to animate nodes to their new positions
    const t = timer((elapsed: number) => {
      // Calculate animation progress (0 to 1)
      const s = elapsed / options.duration;

      // Interpolate each node's position between from and to
      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          ...node,
          position: {
            // Linear interpolation: from.x + (to.x - from.x) * progress
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
        };
      });

      // Update nodes with interpolated positions
      setNodes(currNodes);

      // Final step: when animation duration is reached
      if (elapsed > options.duration) {
        // Move nodes to their exact destination (prevents rounding glitches)
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            ...node,
            position: {
              x: to.x,
              y: to.y,
            },
          };
        });

        setNodes(finalNodes);

        // Stop the animation timer
        t.stop();

        // Fit view to show all nodes (skip on first run to avoid double-fit)
        if (!initial.current) {
          fitView({ duration: 200, padding: 0.2 });
        }
        initial.current = false;
      }
    });

    // Cleanup: stop animation if effect re-runs before animation completes
    return () => {
      t.stop();
    };
  }, [nodeCount, getEdges, getNodes, getNode, setNodes, fitView, setEdges]);
}

export default useLayout;

