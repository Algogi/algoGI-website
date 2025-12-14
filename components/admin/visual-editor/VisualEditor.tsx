"use client";

import React, { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { EditorContent, Block } from "@/lib/editor/blocks/types";
import { blocksToHTML } from "@/lib/editor/serializer";
import { htmlToBlocks } from "@/lib/editor/parser";
import BlockLibrary from "./BlockLibrary";
import BlockToolbar from "./BlockToolbar";
import BlockRenderer from "./BlockRenderer";
import CanvasDropZone from "./CanvasDropZone";
import { Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisualEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function VisualEditor({ content, onChange }: VisualEditorProps) {
  const [editorContent, setEditorContent] = useState<EditorContent>(() => {
    if (!content || content.trim() === "") {
      return { version: "1.0", blocks: [] };
    }
    try {
      // Try to parse as JSON first (new format)
      const parsed = JSON.parse(content);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed;
      }
    } catch {
      // Not JSON, continue to HTML parsing
    }
    // Fall back to HTML parsing (backward compatibility)
    return htmlToBlocks(content);
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const updateContent = useCallback(
    (newContent: EditorContent) => {
      setEditorContent(newContent);
      // Save as JSON for perfect reconstruction, with HTML as fallback
      const jsonContent = JSON.stringify(newContent);
      onChange(jsonContent);
    },
    [onChange]
  );

  const handleAddBlock = useCallback(
    (blockType: string) => {
      const { createBlock } = require("@/lib/editor/blocks/registry");
      const newBlock = createBlock(blockType as any);
      const newContent: EditorContent = {
        ...editorContent,
        blocks: [...editorContent.blocks, newBlock],
      };
      updateContent(newContent);
      setSelectedBlockId(newBlock.id);
    },
    [editorContent, updateContent]
  );

  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      setEditorContent((prev) => {
        const newContent: EditorContent = {
          ...prev,
          blocks: prev.blocks.map((block) => {
            if (block.id === blockId) {
              // Deep merge for nested objects like data and style
              const mergedBlock = {
                ...block,
                ...updates,
                data: updates.data ? { ...block.data, ...updates.data } : block.data,
                style: updates.style ? { ...block.style, ...updates.style } : block.style,
              } as Block;
              return mergedBlock;
            }
            // Return a new object reference to ensure React detects the change
            return { ...block };
          }),
        };
        const html = blocksToHTML(newContent);
        onChange(html);
        return newContent;
      });
    },
    [onChange]
  );

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const newContent = {
        ...editorContent,
        blocks: editorContent.blocks.filter((block) => block.id !== blockId),
      };
      updateContent(newContent);
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
    },
    [editorContent, updateContent, selectedBlockId]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // If dragging from library, get the block type
    if (active.data.current?.fromLibrary && active.data.current?.blockType) {
      const { createBlock } = require("@/lib/editor/blocks/registry");
      const block = createBlock(active.data.current.blockType);
      setDraggedBlock(block);
    } else {
      // Dragging existing block
      const block = editorContent.blocks.find((b) => b.id === active.id);
      setDraggedBlock(block || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedBlock(null);

    if (!over) return;

    // If dropping from library
    if (active.data.current?.fromLibrary && active.data.current?.blockType) {
      const { createBlock } = require("@/lib/editor/blocks/registry");
      const newBlock = createBlock(active.data.current.blockType);
      
      // Check if dropping into a column
      if (over.data.current?.type === "column") {
        const columnIndex = over.data.current.columnIndex;
        const columnId = over.id.toString();
        const parentBlockId = columnId.split("-column-")[0];
        
        setEditorContent((prev) => {
          const parentBlock = prev.blocks.find((b) => b.id === parentBlockId);
          if (parentBlock && parentBlock.type === "columns") {
            const columnChildren = (parentBlock.data.children || []) as Block[][];
            const newColumnChildren = [...columnChildren];
            if (!newColumnChildren[columnIndex]) {
              newColumnChildren[columnIndex] = [];
            }
            newColumnChildren[columnIndex] = [...newColumnChildren[columnIndex], newBlock];
            
            const updatedBlocks = prev.blocks.map((b) =>
              b.id === parentBlockId
                ? { ...b, data: { ...b.data, children: newColumnChildren } } as Block
                : b
            );
            
            const newContent: EditorContent = {
              ...prev,
              blocks: updatedBlocks,
            };
            const html = blocksToHTML(newContent);
            onChange(html);
            return newContent;
          }
          return prev;
        });
        setSelectedBlockId(newBlock.id);
        return;
      }
      
      if (over.id === "canvas") {
        // Drop at end of canvas
        const newContent = {
          ...editorContent,
          blocks: [...editorContent.blocks, newBlock],
        };
        updateContent(newContent);
        setSelectedBlockId(newBlock.id);
        return;
      } else {
        // Drop before/after another block
        const targetIndex = editorContent.blocks.findIndex((b) => b.id === over.id);
        if (targetIndex !== -1) {
          const newBlocks = [...editorContent.blocks];
          newBlocks.splice(targetIndex, 0, newBlock);
          const newContent: EditorContent = {
            ...editorContent,
            blocks: newBlocks,
          };
          updateContent(newContent);
          setSelectedBlockId(newBlock.id);
          return;
        }
      }
    }

    // Reordering existing blocks
    if (!active.data.current?.fromLibrary && active.id !== over.id && over.id !== "canvas") {
      const oldIndex = editorContent.blocks.findIndex((b) => b.id === active.id);
      const newIndex = editorContent.blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = [...editorContent.blocks];
        const [removed] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, removed);

        const newContent: EditorContent = {
          ...editorContent,
          blocks: newBlocks,
        };
        updateContent(newContent);
      }
    }
  };

  const selectedBlock = editorContent.blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Block Library Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <BlockLibrary onAddBlock={handleAddBlock} />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex items-center gap-2">
            <Button
              type="button"
              variant={showGridOverlay ? "default" : "outline"}
              size="sm"
              onClick={() => setShowGridOverlay(!showGridOverlay)}
              title="Toggle Grid Overlay"
            >
              <Grid3x3 className="w-4 h-4 mr-1" />
              Grid
            </Button>
            {selectedBlock && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDeleteBlock(selectedBlock.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete Block
              </Button>
            )}
          </div>

          {/* Canvas */}
          <CanvasDropZone id="canvas" className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 relative min-h-[600px]">
            <div
              className="p-8"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedBlockId(null);
                }
              }}
            >
            {showGridOverlay && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="grid grid-cols-12 h-full gap-4 px-8">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-l border-dashed border-blue-300 dark:border-blue-600 opacity-30"
                    />
                  ))}
                </div>
              </div>
            )}

            <SortableContext
              items={editorContent.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="relative z-10 space-y-4">
                {editorContent.blocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    isSelected={block.id === selectedBlockId}
                    isDragging={block.id === activeId}
                    onSelect={() => setSelectedBlockId(block.id)}
                    onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                    onDelete={(id) => handleDeleteBlock(id)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {draggedBlock && (
                <div className="opacity-50">
                  <BlockRenderer 
                    block={draggedBlock} 
                    isSelected={false} 
                    isDragging={true}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              )}
            </DragOverlay>
            </div>
          </CanvasDropZone>

          {/* Block Toolbar */}
          {selectedBlock && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <BlockToolbar
                block={selectedBlock}
                onUpdate={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
              />
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}

