'use client'

import { useCallback, useState, useEffect, useRef } from 'react';
import {
  NodeResizer,
  type NodeProps,
  Handle,
  Position,
  useKeyPress,
  useReactFlow,
  useStore,
} from 'reactflow';
import { useTheme } from '@/components/theme-provider';
import Shape from './Shape';
import { type ShapeNodeData } from './types';

const handlePositions = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
];

export function ShapeNode({
  id,
  selected,
  data,
}: NodeProps<ShapeNodeData>) {
  const { type, color, fillColor, borderColor, borderWeight } = data;
  const shiftKeyPressed = useKeyPress('Shift');
  const { resolvedTheme } = useTheme();
  
  // Get node dimensions from the store - React Flow doesn't pass width/height as props
  const nodeRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  
  // Watch for node size changes using ResizeObserver
  useEffect(() => {
    const element = nodeRef.current;
    if (!element) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  // Use color if available, otherwise use fillColor, fallback to default
  const shapeColor = color || fillColor || '#3F8AE2';
  const strokeColor = borderColor || color || fillColor || '#3F8AE2';
  const strokeWidth = borderWeight || 2;

  // Calculate handle border color - similar to panel handles
  // Default border color based on theme (same as panel handles)
  const handleBorderColor = borderColor || (resolvedTheme === 'dark' ? '#2f2f2f' : '#e5e7eb');

  return (
    <div ref={nodeRef} className="w-full h-full relative">
      <NodeResizer
        keepAspectRatio={shiftKeyPressed}
        isVisible={selected}
        handleStyle={{
          width: '12px',
          height: '12px',
          minWidth: '12px',
          minHeight: '12px',
          backgroundColor: resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff', // Same fill as drawing handles - white in light mode
          border: '2px solid #3b82f6', // Blue border only (not fill)
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          boxSizing: 'border-box',
        }}
        lineStyle={{
          stroke: '#3b82f6',
          strokeWidth: 1,
        }}
      />
      <Shape
        type={type}
        width={dimensions.width}
        height={dimensions.height}
        fill={shapeColor}
        strokeWidth={strokeWidth}
        stroke={strokeColor}
        fillOpacity={0.8}
      />
      <input type="text" className="node-label" placeholder={type} />
      {handlePositions.map((position) => (
        <Handle
          key={position}
          id={position}
          className="handle-dot"
          style={{ 
            backgroundColor: shapeColor,
            '--handle-border-color': handleBorderColor,
          } as React.CSSProperties}
          type="source"
          position={position}
        />
      ))}
    </div>
  );
}

