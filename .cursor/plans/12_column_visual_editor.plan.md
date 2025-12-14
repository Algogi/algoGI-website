# 12-Column Free-Form Visual Editor with Image Resizing

## Overview
Transform the TipTap blog editor into a full-featured visual page builder with a 12-column grid system, image resizing, drag-and-drop positioning, and visual editing capabilities.

## Implementation Plan

### 1. Install Required Dependencies
**File**: `package.json`

- Install `@tiptap/extension-drag-handle` for drag functionality
- Install `react-resizable` or use native resize for image resizing
- Consider `@tiptap/extension-columns` or create custom grid extension
- Install `react-dnd` or `@dnd-kit/core` for advanced drag-and-drop (optional)

### 2. Create Custom 12-Column Grid Extension
**File**: `components/admin/extensions/grid-extension.tsx` (new)

- Create a TipTap extension for 12-column grid layout
- Support for:
  - Row nodes (container for columns)
  - Column nodes (1-12 column spans)
  - Responsive column widths
  - Gap/spacing between columns
- Store grid structure in HTML as data attributes or custom elements

### 3. Create Resizable Image Extension
**File**: `components/admin/extensions/resizable-image.tsx` (new)

- Extend `@tiptap/extension-image` with:
  - Width/height attributes
  - Resize handles (corners and edges)
  - Min/max size constraints
  - Aspect ratio locking (optional)
  - Float left/right/center positioning
- Add visual resize handles when image is selected
- Store dimensions in image attributes

### 4. Create Grid Row/Column Components
**File**: `components/admin/grid-editor/` (new directory)

- `GridRow.tsx` - Container for columns
- `GridColumn.tsx` - Individual column (1-12 span)
- `ColumnControls.tsx` - UI for adding/removing columns, adjusting spans
- Visual indicators for column boundaries
- Drag handles for reordering columns

### 5. Update Rich Text Editor with Grid System
**File**: `components/admin/rich-text-editor.tsx`

- Add grid extension to editor configuration
- Add resizable image extension
- Add toolbar buttons for:
  - Insert Row (creates new 12-column row)
  - Insert Column (adds column to current row)
  - Grid Settings (column span, gap, etc.)
- Add image alignment buttons (float left/right/center)
- Add image resize controls in toolbar when image is selected

### 6. Create Visual Grid Editor UI
**File**: `components/admin/grid-editor/grid-editor-ui.tsx` (new)

- Visual representation of 12-column grid
- Column span indicators (e.g., "6/12", "4/12")
- Drag-and-drop zones for content blocks
- Visual feedback for drop zones
- Grid overlay toggle (show/hide grid lines)

### 7. Implement Image Resizing UI
**File**: `components/admin/image-resize-controls.tsx` (new)

- Resize handles component
- Width/height input fields
- Aspect ratio toggle
- Alignment buttons (left/right/center)
- Preview of image dimensions

### 8. Add Drag and Drop Functionality
**File**: `components/admin/rich-text-editor.tsx`

- Enable drag-and-drop for:
  - Images (reposition within content)
  - Text blocks (move between columns)
  - Columns (reorder within row)
- Visual feedback during drag
- Drop zone highlighting

### 9. Update CSS for Grid System
**File**: `app/globals.css`

- Add 12-column grid CSS classes
- Grid row/column styling
- Column gap utilities
- Responsive breakpoints for grid
- Image float styles (left/right/center)
- Resize handle styles
- Dark mode variants

### 10. Update Frontend Blog Post Rendering
**File**: `app/blog/[slug]/page.tsx`

- Parse and render grid structure from HTML
- Apply 12-column grid CSS classes
- Render resized images with correct dimensions
- Apply float positioning for images
- Ensure responsive behavior

### 11. Create Grid Layout Helper Functions
**File**: `lib/editor/grid-utils.ts` (new)

- Functions to:
  - Calculate column spans
  - Validate grid structure
  - Convert grid data to HTML
  - Parse HTML to grid structure
  - Generate responsive classes

## Technical Details

### Grid Structure in HTML
```html
<div data-grid-row>
  <div data-grid-column data-span="6">
    <p>Content in 6-column span</p>
  </div>
  <div data-grid-column data-span="6">
    <img src="..." data-width="400" data-align="left" />
  </div>
</div>
```

### Image Attributes
- `data-width` - Image width in pixels
- `data-height` - Image height in pixels (optional, for aspect ratio)
- `data-align` - "left" | "right" | "center" | "full-width"
- `data-aspect-ratio` - Lock aspect ratio (true/false)

### Grid Column Spans
- Each column can span 1-12 columns
- Total span of all columns in a row = 12
- Responsive: Can have different spans per breakpoint (optional)

## Dependencies to Install

```json
{
  "@tiptap/extension-drag-handle": "^2.0.0",
  "react-resizable": "^3.0.5",
  "@types/react-resizable": "^3.0.2"
}
```

## User Experience Flow

1. **Adding Content**:
   - Click "Add Row" to create a new 12-column row
   - Click "Add Column" to add a column to the row
   - Adjust column span using column controls
   - Add text/images to columns

2. **Positioning Images**:
   - Select image to show resize handles
   - Drag corners/edges to resize
   - Use alignment buttons (left/right/center)
   - Drag image to reposition within column

3. **Grid Management**:
   - Visual grid overlay shows column boundaries
   - Drag columns to reorder
   - Adjust column spans visually
   - Delete columns/rows

## Migration Considerations

- Existing blog posts without grid structure should render in a single full-width column
- Images without resize attributes use default sizing
- Backward compatibility with markdown/HTML content

## Testing Checklist

- [ ] Create new blog post with grid layout
- [ ] Add images and resize them
- [ ] Position images left/right/center
- [ ] Drag and drop images to reposition
- [ ] Create multi-column layouts
- [ ] Verify responsive behavior
- [ ] Test with existing blog posts (backward compatibility)
- [ ] Verify dark mode styling
- [ ] Test save/reload functionality

