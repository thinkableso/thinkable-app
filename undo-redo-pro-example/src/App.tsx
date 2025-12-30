// This example shows how to implement a simple undo and redo functionality for a React Flow graph.
import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Panel,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  useReactFlow,
  NodeOrigin,
  Node,
  Edge,
  ProOptions,
  OnConnect,
  SelectionDragHandler,
  OnNodesDelete,
  OnEdgesDelete,
  OnNodeDrag,
} from '@xyflow/react';

import useUndoRedo from './useUndoRedo';

import '@xyflow/react/dist/style.css';

const nodeLabels: string[] = [
  'Wire',
  'your',
  'ideas',
  'with',
  'React',
  'Flow',
  '!',
];

const proOptions: ProOptions = { account: 'paid-pro', hideAttribution: true };
const defaultNodes: Node[] = [];
const defaultEdges: Edge[] = [];

const nodeOrigin: NodeOrigin = [0.5, 0.5];

function ReactFlowPro() {
  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo();
  const [nodes, , onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const { screenToFlowPosition, addNodes } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (connection) => {
      // 👇 make adding edges undoable
      takeSnapshot();
      setEdges((edges) => addEdge(connection, edges));
    },
    [setEdges, takeSnapshot]
  );

  const onPaneClick = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      // 👇 make adding nodes undoable
      takeSnapshot();
      const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      const label = nodeLabels.shift();
      addNodes([
        {
          id: `${new Date().getTime()}`,
          data: { label },
          position,
        },
      ]);
      nodeLabels.push(`${label}`);
    },
    [takeSnapshot, addNodes, screenToFlowPosition]
  );

  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    // 👇 make dragging a selection undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete: OnNodesDelete = useCallback(() => {
    // 👇 make deleting nodes undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    // 👇 make deleting edges undoable
    takeSnapshot();
  }, [takeSnapshot]);

  return (
    <ReactFlow
      defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      proOptions={proOptions}
      onConnect={onConnect}
      onNodeDragStart={onNodeDragStart}
      onSelectionDragStart={onSelectionDragStart}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      onPaneClick={onPaneClick}
      nodeOrigin={nodeOrigin}
      selectNodesOnDrag={false}
    >
      <Background />
      <Controls />
      <Panel position="top-left">
        <div>
          <button
            className="xy-theme__button"
            disabled={canUndo}
            onClick={undo}
          >
            <span>↺ </span> Undo
          </button>
          <button
            className="xy-theme__button"
            disabled={canRedo}
            onClick={redo}
          >
            <span>⟳ </span> Redo
          </button>
        </div>
      </Panel>
      {!nodes.length && <h2>Click anywhere on the pane to add nodes</h2>}
    </ReactFlow>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReactFlowWrapper(props: any) {
  return (
    <ReactFlowProvider>
      <ReactFlowPro {...props} />
    </ReactFlowProvider>
  );
}

export default ReactFlowWrapper;
