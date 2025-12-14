/**
 * React hook for managing editor state
 */

import { useState, useCallback, useEffect } from "react";
import { EditorContent } from "../types";
import * as blockOps from "./blockOperations";

interface UseEditorStateOptions {
  initialContent?: string; // JSON string
  onChange?: (content: string) => void; // JSON string
}

export function useEditorState({ initialContent, onChange }: UseEditorStateOptions = {}) {
  const [content, setContent] = useState<EditorContent>(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          return parsed;
        }
      } catch {
        // Invalid JSON, return empty
      }
    }
    return { version: "1.0", blocks: [] };
  });

  // Update content when initialContent changes externally
  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          setContent(parsed);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [initialContent]);

  // Notify parent of changes
  const updateContent = useCallback(
    (newContent: EditorContent) => {
      setContent(newContent);
      if (onChange) {
        onChange(JSON.stringify(newContent));
      }
    },
    [onChange]
  );

  const addBlock = useCallback(
    (block: ReturnType<typeof blockOps.createParagraphBlock>, index?: number) => {
      const newContent = blockOps.addBlock(content, block, index);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const removeBlock = useCallback(
    (blockId: string) => {
      const newContent = blockOps.removeBlock(content, blockId);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<import("../types").Block>) => {
      const newContent = blockOps.updateBlock(content, blockId, updates);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const reorderBlocks = useCallback(
    (oldIndex: number, newIndex: number) => {
      const newContent = blockOps.reorderBlocks(content, oldIndex, newIndex);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const duplicateBlock = useCallback(
    (blockId: string) => {
      const newContent = blockOps.duplicateBlock(content, blockId);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const addBlockToColumn = useCallback(
    (columnsBlockId: string, columnIndex: number, block: import("../types").Block) => {
      const newContent = blockOps.addBlockToColumn(content, columnsBlockId, columnIndex, block);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const removeBlockFromColumn = useCallback(
    (columnsBlockId: string, columnIndex: number, blockId: string) => {
      const newContent = blockOps.removeBlockFromColumn(content, columnsBlockId, columnIndex, blockId);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  const updateColumnCount = useCallback(
    (columnsBlockId: string, newCount: 2 | 3 | 4) => {
      const newContent = blockOps.updateColumnCount(content, columnsBlockId, newCount);
      updateContent(newContent);
    },
    [content, updateContent]
  );

  return {
    content,
    addBlock,
    removeBlock,
    updateBlock,
    reorderBlocks,
    duplicateBlock,
    addBlockToColumn,
    removeBlockFromColumn,
    updateColumnCount,
  };
}

