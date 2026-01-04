'use client';

// React Flow components and types
import ReactFlow, {
  Background,
  Edge,
  Node,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
// Import dynamic layouting styles
import './dynamic-layouting.css';

// Custom hooks and types
import useLayout from './hooks/useLayout';
import nodeTypes from './nodeTypes';
import edgeTypes from './edgeTypes';

// Initial setup: one workflow node and a placeholder node
// Placeholder nodes can be turned into workflow nodes by clicking
const defaultNodes: Node[] = [
  {
    id: '1',
    data: { label: '🌮 Taco' },
    position: { x: 0, y: 0 },
    type: 'workflow',
  },
  {
    id: '2',
    data: { label: '+' },
    position: { x: 0, y: 150 },
    type: 'placeholder',
  },
];

// Initial setup: connect the workflow node to the placeholder node with a placeholder edge
const defaultEdges: Edge[] = [
  {
    id: '1=>2',
    source: '1',
    target: '2',
    type: 'placeholder',
  },
];

// Fit view options for initial viewport adjustment
const fitViewOptions = {
  padding: 0.1,
};

// DynamicLayoutFlowInner: Main component that renders the React Flow graph
// This hook call ensures that the layout is re-calculated every time the graph changes
function DynamicLayoutFlowInner() {
  // useLayout hook automatically recalculates and animates node positions
  useLayout();

  return (
    <>
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={fitViewOptions}
        minZoom={0.2}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        // Setting deleteKeyCode to null prevents node deletion
        // If you want to enable deletion, ensure you only have one root node
        deleteKeyCode={null}
      >
        <Background />
      </ReactFlow>
    </>
  );
}

// DynamicLayoutFlow: Wrapper component that provides ReactFlowProvider context
// ReactFlowProvider is required for useReactFlow hook to work
export function DynamicLayoutFlow() {
  return (
    <ReactFlowProvider>
      <DynamicLayoutFlowInner />
    </ReactFlowProvider>
  );
}

export default DynamicLayoutFlow;

