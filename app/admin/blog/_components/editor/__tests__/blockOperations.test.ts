/**
 * Unit tests for block operations
 */

import {
  createParagraphBlock,
  createHeadingBlock,
  createImageBlock,
  createButtonBlock,
  createColumnsBlock,
  createCodeBlock,
  addBlock,
  removeBlock,
  updateBlock,
  reorderBlocks,
  duplicateBlock,
  updateColumnCount,
} from "../state/blockOperations";
import { EditorContent } from "../types";

describe("blockOperations", () => {
  describe("createBlock functions", () => {
    it("should create a paragraph block with correct structure", () => {
      const block = createParagraphBlock();
      expect(block.type).toBe("paragraph");
      expect(block.id).toBeDefined();
      expect(block.data.content).toBeDefined();
    });

    it("should create a heading block with specified level", () => {
      const block = createHeadingBlock(2);
      expect(block.type).toBe("heading");
      expect(block.data.level).toBe(2);
    });

    it("should create an image block with default values", () => {
      const block = createImageBlock();
      expect(block.type).toBe("image");
      expect(block.data.src).toBe("");
      expect(block.data.alt).toBe("");
    });

    it("should create a button block with default values", () => {
      const block = createButtonBlock();
      expect(block.type).toBe("button");
      expect(block.data.text).toBe("Click me");
      expect(block.data.url).toBe("#");
    });

    it("should create a columns block with specified count", () => {
      const block = createColumnsBlock(3);
      expect(block.type).toBe("columns");
      expect(block.data.columnCount).toBe(3);
      expect(block.data.columns.length).toBe(3);
    });
  });

  describe("addBlock", () => {
    it("should add a block to empty content", () => {
      const content: EditorContent = { version: "1.0", blocks: [] };
      const block = createParagraphBlock();
      const result = addBlock(content, block);
      expect(result.blocks.length).toBe(1);
      expect(result.blocks[0].id).toBe(block.id);
    });

    it("should add a block at specific index", () => {
      const content: EditorContent = {
        version: "1.0",
        blocks: [createParagraphBlock(), createParagraphBlock()],
      };
      const block = createHeadingBlock(1);
      const result = addBlock(content, block, 1);
      expect(result.blocks.length).toBe(3);
      expect(result.blocks[1].id).toBe(block.id);
    });
  });

  describe("removeBlock", () => {
    it("should remove a block by ID", () => {
      const block1 = createParagraphBlock();
      const block2 = createParagraphBlock();
      const content: EditorContent = {
        version: "1.0",
        blocks: [block1, block2],
      };
      const result = removeBlock(content, block1.id);
      expect(result.blocks.length).toBe(1);
      expect(result.blocks[0].id).toBe(block2.id);
    });
  });

  describe("updateBlock", () => {
    it("should update block data", () => {
      const block = createButtonBlock();
      const content: EditorContent = { version: "1.0", blocks: [block] };
      const result = updateBlock(content, block.id, {
        data: { text: "New Text", url: block.data.url, variant: block.data.variant },
      });
      expect(result.blocks[0].data.text).toBe("New Text");
    });
  });

  describe("reorderBlocks", () => {
    it("should reorder blocks correctly", () => {
      const block1 = createParagraphBlock();
      const block2 = createHeadingBlock(1);
      const content: EditorContent = {
        version: "1.0",
        blocks: [block1, block2],
      };
      const result = reorderBlocks(content, 0, 1);
      expect(result.blocks[0].id).toBe(block2.id);
      expect(result.blocks[1].id).toBe(block1.id);
    });
  });

  describe("duplicateBlock", () => {
    it("should create a duplicate with new ID", () => {
      const block = createParagraphBlock();
      const content: EditorContent = { version: "1.0", blocks: [block] };
      const result = duplicateBlock(content, block.id);
      expect(result.blocks.length).toBe(2);
      expect(result.blocks[0].id).toBe(block.id);
      expect(result.blocks[1].id).not.toBe(block.id);
      expect(result.blocks[1].type).toBe(block.type);
    });
  });

  describe("updateColumnCount", () => {
    it("should maintain column invariant: columnCount === columns.length", () => {
      const block = createColumnsBlock(2);
      const content: EditorContent = { version: "1.0", blocks: [block] };
      
      // Update to 3 columns
      const result3 = updateColumnCount(content, block.id, 3);
      expect(result3.blocks[0].data.columnCount).toBe(3);
      expect(result3.blocks[0].data.columns.length).toBe(3);
      
      // Update to 4 columns
      const result4 = updateColumnCount(result3, block.id, 4);
      expect(result4.blocks[0].data.columnCount).toBe(4);
      expect(result4.blocks[0].data.columns.length).toBe(4);
      
      // Update back to 2 columns
      const result2 = updateColumnCount(result4, block.id, 2);
      expect(result2.blocks[0].data.columnCount).toBe(2);
      expect(result2.blocks[0].data.columns.length).toBe(2);
    });

    it("should preserve existing column content when expanding", () => {
      const block = createColumnsBlock(2);
      // Add a block to first column
      block.data.columns[0] = [createParagraphBlock()];
      const content: EditorContent = { version: "1.0", blocks: [block] };
      
      const result = updateColumnCount(content, block.id, 3);
      expect(result.blocks[0].data.columns[0].length).toBe(1);
      expect(result.blocks[0].data.columns[1].length).toBe(0);
      expect(result.blocks[0].data.columns[2].length).toBe(0);
    });
  });
});

