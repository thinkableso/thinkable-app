# Dynamic Layouting Component

This component implements dynamic layouting for React Flow graphs, following the [React Flow Pro example](https://pro.reactflow.dev/examples/dynamic-layouting). It provides automatic layout calculation and smooth animations when nodes are added or removed.

## Features

- **Automatic Layout**: Nodes are automatically positioned using d3-hierarchy tree layout
- **Smooth Animations**: Nodes smoothly transition to their new positions when the graph changes
- **Three Interaction Methods**:
  1. Click a node to add a child node
  2. Click a placeholder node to convert it to a workflow node
  3. Click the '+' button on an edge to insert a node between connected nodes

## Usage

### Basic Example

```tsx
import { DynamicLayoutFlow } from '@/components/dynamic-layouting/DynamicLayoutFlow';
import '@/components/dynamic-layouting/dynamic-layouting.css';

export default function MyComponent() {
  return (
    <div className="h-screen w-full">
      <DynamicLayoutFlow />
    </div>
  );
}
```

### Custom Integration

To integrate into an existing React Flow component:

```tsx
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import useLayout from '@/components/dynamic-layouting/hooks/useLayout';
import nodeTypes from '@/components/dynamic-layouting/nodeTypes';
import edgeTypes from '@/components/dynamic-layouting/edgeTypes';
import '@/components/dynamic-layouting/dynamic-layouting.css';

function MyFlow() {
  // This hook automatically handles layout calculation and animation
  useLayout();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      // ... other props
    />
  );
}

export default function MyFlowWrapper() {
  return (
    <ReactFlowProvider>
      <MyFlow />
    </ReactFlowProvider>
  );
}
```

## Components

### Node Types

- **WorkflowNode**: Main interactive node that can be clicked to add children
- **PlaceholderNode**: Temporary node that can be clicked to convert to a workflow node

### Edge Types

- **WorkflowEdge**: Edge with a clickable '+' button in the middle
- **PlaceholderEdge**: Simple dashed edge for placeholder connections

### Hooks

- **useLayout**: Automatically recalculates and animates node positions when the graph changes
- **useNodeClick**: Handles clicking workflow nodes to add children
- **usePlaceholderClick**: Handles clicking placeholder nodes to convert them
- **useEdgeClick**: Handles clicking edge buttons to insert nodes

## File Structure

```
components/dynamic-layouting/
├── DynamicLayoutFlow.tsx    # Main component wrapper
├── WorkflowNode.tsx         # Workflow node component
├── PlaceholderNode.tsx      # Placeholder node component
├── WorkflowEdge.tsx         # Workflow edge component
├── PlaceholderEdge.tsx      # Placeholder edge component
├── nodeTypes.ts             # Node types mapping
├── edgeTypes.ts             # Edge types mapping
├── utils.ts                 # Utility functions (uuid, randomLabel)
├── dynamic-layouting.css    # Component styles
├── hooks/
│   ├── useLayout.ts         # Layout calculation and animation hook
│   ├── useNodeClick.ts      # Node click handler hook
│   ├── usePlaceholderClick.ts # Placeholder click handler hook
│   └── useEdgeClick.ts      # Edge click handler hook
└── README.md                # This file
```

## Dependencies

- `reactflow`: React Flow library (v11+)
- `d3-hierarchy`: For tree layout calculation
- `d3-timer`: For smooth animation interpolation

## Demo

Visit `/dynamic-layout-demo` to see the component in action.

## Customization

### Adjusting Node Spacing

Edit the `nodeSize` in `hooks/useLayout.ts`:

```tsx
const layout = tree<Node>()
  .nodeSize([200, 150]) // [width, height] spacing
  .separation(() => 1);
```

### Adjusting Animation Duration

Edit the `options` object in `hooks/useLayout.ts`:

```tsx
const options = { duration: 300 }; // milliseconds
```

### Custom Node Labels

Modify the `randomLabel` function in `utils.ts` or pass custom labels in node data.

## Notes

- Nodes are not draggable by default (set `nodesDraggable={false}`)
- Nodes are not user-connectable (handles are hidden and `isConnectable={false}`)
- The layout algorithm requires a tree structure (each node has one parent)
- Placeholder nodes prevent layout jumping by maintaining position during node creation

