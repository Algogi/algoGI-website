"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEditorState } from "./editor/state/useEditorState";
import * as blockOps from "./editor/state/blockOperations";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Dynamically import components to avoid SSR issues with TipTap
const BlockRenderer = dynamic(
  () => import("./editor/components/BlockRenderer"),
  { ssr: false }
);

const BlockMenu = dynamic(
  () => import("./editor/components/BlockMenu"),
  { ssr: false }
);

const SortableBlock = dynamic(
  () => import("./editor/components/SortableBlock"),
  { ssr: false }
);

interface BlogEditorProps {
  value: string; // JSON string (EditorContent)
  onChange: (value: string) => void; // JSON string
  onImageUpload?: (file: File) => Promise<{ url: string }>;
}

export default function BlogEditor({ value, onChange, onImageUpload }: BlogEditorProps) {
  const { content, addBlock, removeBlock, updateBlock, reorderBlocks } = useEditorState({
    initialContent: value,
    onChange,
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<import("./editor/types").Block | null>(null);

  // Default image upload handler if not provided
  const defaultImageUpload = async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "images");
    const response = await fetch("/api/cms/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }
    return { url: data.url };
  };

  const imageUploadHandler = onImageUpload || defaultImageUpload;

  const handleAddBlock = (block: import("./editor/types").Block) => {
    addBlock(block);
    setSelectedBlockId(block.id);
  };

  const handleBlockSelect = (blockId: string) => {
    setSelectedBlockId(blockId);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<import("./editor/types").Block>) => {
    updateBlock(blockId, updates);
  };

  const handleBlockDelete = (blockId: string) => {
    removeBlock(blockId);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const block = content.blocks.find((b) => b.id === active.id);
    setDraggedBlock(block || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedBlock(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = content.blocks.findIndex((b) => b.id === active.id);
    const newIndex = content.blocks.findIndex((b) => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderBlocks(oldIndex, newIndex);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 flex items-center gap-2 mb-4">
        <BlockMenu onAddBlock={(block) => addBlock(block)} />
        {selectedBlockId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleBlockDelete(selectedBlockId)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Block
          </Button>
        )}
      </div>

      {/* Editor Canvas */}
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white dark:bg-gray-800 min-h-[600px] py-6 px-6">
          {content.blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="mb-4">No blocks yet. Click &quot;Add Block&quot; to get started.</p>
              <BlockMenu onAddBlock={handleAddBlock} />
            </div>
          ) : (
            <SortableContext
              items={content.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {content.blocks.map((block, index) => (
                  <div key={block.id} className="group relative">
                    <SortableBlock
                      block={block}
                      isSelected={block.id === selectedBlockId}
                      onSelect={() => handleBlockSelect(block.id)}
                      onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                      onDelete={() => handleBlockDelete(block.id)}
                      onImageUpload={imageUploadHandler}
                    >
                      <BlockRenderer
                        block={block}
                        isSelected={block.id === selectedBlockId}
                        onSelect={() => handleBlockSelect(block.id)}
                        onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                        onDelete={() => handleBlockDelete(block.id)}
                        onImageUpload={imageUploadHandler}
                        blockIndex={index + 1}
                      />
                    </SortableBlock>
                  </div>
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedBlock ? (
            <div className="opacity-50 rotate-2">
              <BlockRenderer
                block={draggedBlock}
                isSelected={false}
                onSelect={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
                onImageUpload={imageUploadHandler}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

