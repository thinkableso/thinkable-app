# Resize Persistence Feature

## Overview
Added persistence for panel resize dimensions to maintain panel sizes across page reloads.

## Implementation Details

### Storage
- Resize state is stored in `messages.metadata` JSONB field (no schema changes required)
- For note panels: stores `fontScale` (number)
- For non-note panels: stores `resizeDimensions` (object with `width` and `height`)

### Data Structure
```json
{
  "fontScale": 1.5,  // For note panels
  "resizeDimensions": {  // For non-note panels
    "width": 800,
    "height": 600
  }
}
```

### Behavior
- Resize dimensions are loaded from metadata when panel component mounts
- Resize state is saved to database when resize ends (via `handleResizeEnd`)
- For note panels: fontScale is applied via CSS transform, panel uses fit-content
- For non-note panels: explicit width/height dimensions are restored

## Files Modified
- `components/chat-panel-node.tsx`: Added resize state loading and saving logic

## Date
2026-01-03

