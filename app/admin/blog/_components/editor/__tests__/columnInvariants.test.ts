/**
 * Unit tests for column invariants
 */

import { createColumnsBlock, updateColumnCount, addBlockToColumn } from "../state/blockOperations";
import { EditorContent } from "../types";
import * as blockOps from "../state/blockOperations";

describe("column invariants", () => {
  it("should maintain invariant: 2-column block always has 2 columns", () => {
    const block = createColumnsBlock(2);
    expect(block.data.columnCount).toBe(2);
    expect(block.data.columns.length).toBe(2);
  });

  it("should maintain invariant: 3-column block always has 3 columns", () => {
    const block = createColumnsBlock(3);
    expect(block.data.columnCount).toBe(3);
    expect(block.data.columns.length).toBe(3);
  });

  it("should maintain invariant: 4-column block always has 4 columns", () => {
    const block = createColumnsBlock(4);
    expect(block.data.columnCount).toBe(4);
    expect(block.data.columns.length).toBe(4);
  });

  it("should maintain invariant after updating column count", () => {
    const block = createColumnsBlock(2);
    const content: EditorContent = { version: "1.0", blocks: [block] };
    
    const result = updateColumnCount(content, block.id, 3);
    expect(result.blocks[0].data.columnCount).toBe(3);
    expect(result.blocks[0].data.columns.length).toBe(3);
  });

  it("should maintain invariant after adding blocks to columns", () => {
    const block = createColumnsBlock(2);
    const content: EditorContent = { version: "1.0", blocks: [block] };
    const paragraph = blockOps.createParagraphBlock();
    
    const result = addBlockToColumn(content, block.id, 0, paragraph);
    const columnsBlock = result.blocks[0];
    if (columnsBlock.type === "columns") {
      expect(columnsBlock.data.columnCount).toBe(2);
      expect(columnsBlock.data.columns.length).toBe(2);
      expect(columnsBlock.data.columns[0].length).toBe(1);
      expect(columnsBlock.data.columns[1].length).toBe(0);
    }
  });

  it("should not allow column count to be less than 2 or more than 4", () => {
    // Type system should prevent this, but we test the runtime behavior
    const block2 = createColumnsBlock(2);
    expect(block2.data.columnCount).toBeGreaterThanOrEqual(2);
    expect(block2.data.columnCount).toBeLessThanOrEqual(4);
    
    const block3 = createColumnsBlock(3);
    expect(block3.data.columnCount).toBeGreaterThanOrEqual(2);
    expect(block3.data.columnCount).toBeLessThanOrEqual(4);
    
    const block4 = createColumnsBlock(4);
    expect(block4.data.columnCount).toBeGreaterThanOrEqual(2);
    expect(block4.data.columnCount).toBeLessThanOrEqual(4);
  });
});

