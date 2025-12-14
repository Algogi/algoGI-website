/**
 * Pure functions for block operations (add, remove, reorder, duplicate, edit)
 */

import { Block, EditorContent, ColumnsBlock } from "../types";
import { JSONContent } from "@tiptap/core";

/**
 * Generate a unique block ID
 */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new paragraph block
 */
export function createParagraphBlock(): Block {
  return {
    id: generateBlockId(),
    type: "paragraph",
    data: {
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
        ],
      },
    },
  };
}

/**
 * Create a new heading block (backward compatibility)
 * Now creates a paragraph block with heading content
 */
export function createHeadingBlock(level: 1 | 2 | 3 | 4 = 1): Block {
  return {
    id: generateBlockId(),
    type: "paragraph",
    data: {
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level },
            content: [],
          },
        ],
      },
    },
  };
}

/**
 * Create a new image block
 */
export function createImageBlock(src: string = "", alt: string = ""): Block {
  return {
    id: generateBlockId(),
    type: "image",
    data: {
      src,
      alt,
    },
  };
}

/**
 * Create a new button block
 */
export function createButtonBlock(text: string = "Click me", url: string = "#"): Block {
  return {
    id: generateBlockId(),
    type: "button",
    data: {
      text,
      url,
      variant: "primary",
    },
  };
}

/**
 * Create a new columns block
 */
export function createColumnsBlock(columnCount: 2 | 3 | 4 = 2): Block {
  const columns: Block[][] = [];
  for (let i = 0; i < columnCount; i++) {
    columns.push([]);
  }
  return {
    id: generateBlockId(),
    type: "columns",
    data: {
      columnCount,
      gap: 16,
      columns,
    },
  };
}

/**
 * Create a new code block
 */
export function createCodeBlock(code: string = "", language?: string, inline: boolean = false): Block {
  return {
    id: generateBlockId(),
    type: "code",
    data: {
      code,
      language,
      inline,
    },
  };
}

/**
 * Add a block to the editor content
 */
export function addBlock(content: EditorContent, block: Block, index?: number): EditorContent {
  const newBlocks = [...content.blocks];
  if (index !== undefined && index >= 0 && index <= newBlocks.length) {
    newBlocks.splice(index, 0, block);
  } else {
    newBlocks.push(block);
  }
  return {
    ...content,
    blocks: newBlocks,
  };
}

/**
 * Remove a block by ID
 */
export function removeBlock(content: EditorContent, blockId: string): EditorContent {
  return {
    ...content,
    blocks: content.blocks.filter((block) => block.id !== blockId),
  };
}

/**
 * Update a block by ID
 */
export function updateBlock(content: EditorContent, blockId: string, updates: Partial<Block>): EditorContent {
  return {
    ...content,
    blocks: content.blocks.map((block) => {
      if (block.id === blockId) {
        return {
          ...block,
          ...updates,
          data: updates.data ? { ...block.data, ...updates.data } : block.data,
        };
      }
      return block;
    }),
  };
}

/**
 * Reorder blocks (move block from oldIndex to newIndex)
 */
export function reorderBlocks(content: EditorContent, oldIndex: number, newIndex: number): EditorContent {
  const newBlocks = [...content.blocks];
  const [removed] = newBlocks.splice(oldIndex, 1);
  newBlocks.splice(newIndex, 0, removed);
  return {
    ...content,
    blocks: newBlocks,
  };
}

/**
 * Duplicate a block
 */
export function duplicateBlock(content: EditorContent, blockId: string): EditorContent {
  const block = content.blocks.find((b) => b.id === blockId);
  if (!block) return content;

  const duplicated: Block = {
    ...block,
    id: generateBlockId(),
  };

  // Deep clone columns data if it's a columns block
  if (block.type === "columns") {
    const columnsBlock = block as ColumnsBlock;
    duplicated.data = {
      ...columnsBlock.data,
      columns: columnsBlock.data.columns.map((col) =>
        col.map((nestedBlock) => ({
          ...nestedBlock,
          id: generateBlockId(),
        }))
      ),
    };
  }

  const blockIndex = content.blocks.findIndex((b) => b.id === blockId);
  return addBlock(content, duplicated, blockIndex + 1);
}

/**
 * Add a block to a specific column in a columns block
 */
export function addBlockToColumn(
  content: EditorContent,
  columnsBlockId: string,
  columnIndex: number,
  block: Block
): EditorContent {
  return {
    ...content,
    blocks: content.blocks.map((b) => {
      if (b.id === columnsBlockId && b.type === "columns") {
        const columnsBlock = b as ColumnsBlock;
        const newColumns = [...columnsBlock.data.columns];
        if (newColumns[columnIndex]) {
          newColumns[columnIndex] = [...newColumns[columnIndex], block];
        } else {
          newColumns[columnIndex] = [block];
        }
        return {
          ...columnsBlock,
          data: {
            ...columnsBlock.data,
            columns: newColumns,
          },
        };
      }
      return b;
    }),
  };
}

/**
 * Remove a block from a specific column in a columns block
 */
export function removeBlockFromColumn(
  content: EditorContent,
  columnsBlockId: string,
  columnIndex: number,
  blockId: string
): EditorContent {
  return {
    ...content,
    blocks: content.blocks.map((b) => {
      if (b.id === columnsBlockId && b.type === "columns") {
        const columnsBlock = b as ColumnsBlock;
        const newColumns = [...columnsBlock.data.columns];
        if (newColumns[columnIndex]) {
          newColumns[columnIndex] = newColumns[columnIndex].filter((nested) => nested.id !== blockId);
        }
        return {
          ...columnsBlock,
          data: {
            ...columnsBlock.data,
            columns: newColumns,
          },
        };
      }
      return b;
    }),
  };
}

/**
 * Update column count in a columns block (ensures invariant: columnCount === columns.length)
 */
export function updateColumnCount(
  content: EditorContent,
  columnsBlockId: string,
  newCount: 2 | 3 | 4
): EditorContent {
  return {
    ...content,
    blocks: content.blocks.map((b) => {
      if (b.id === columnsBlockId && b.type === "columns") {
        const columnsBlock = b as ColumnsBlock;
        const currentColumns = [...columnsBlock.data.columns];

        // Adjust columns array to match new count
        while (currentColumns.length < newCount) {
          currentColumns.push([]);
        }
        while (currentColumns.length > newCount) {
          currentColumns.pop();
        }

        return {
          ...columnsBlock,
          data: {
            ...columnsBlock.data,
            columnCount: newCount,
            columns: currentColumns,
          },
        };
      }
      return b;
    }),
  };
}

