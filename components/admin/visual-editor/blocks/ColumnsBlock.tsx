"use client";

import React, { useCallback } from "react";
import { Block } from "@/lib/editor/blocks/types";
import { useDroppable } from "@dnd-kit/core";
import { createBlock } from "@/lib/editor/blocks/registry";
import BlockRenderer from "../BlockRenderer";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnsBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete?: (id: string) => void;
}

export default function ColumnsBlock({ block, isSelected, onUpdate, onDelete }: ColumnsBlockProps) {
  const { columns = 2, children = [] } = block.data;
  const gap = block.data.gap || 16;

  // Ensure children array has the right length
  const columnChildren = React.useMemo(() => {
    const cols: Block[][] = [];
    for (let i = 0; i < columns; i++) {
      cols[i] = (children[i] || []) as Block[];
    }
    return cols;
  }, [columns, children]);

  const handleAddBlockToColumn = useCallback(
    (columnIndex: number, blockType: string = "paragraph") => {
      const newBlock = createBlock(blockType as any);
      const newColumnChildren = [...columnChildren];
      newColumnChildren[columnIndex] = [...(newColumnChildren[columnIndex] || []), newBlock];
      onUpdate({
        data: { ...block.data, children: newColumnChildren },
      });
    },
    [block.data, columnChildren, onUpdate]
  );

  const handleUpdateNestedBlock = useCallback(
    (columnIndex: number, blockId: string, updates: Partial<Block>) => {
      const newColumnChildren = [...columnChildren];
      newColumnChildren[columnIndex] = newColumnChildren[columnIndex].map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      );
      onUpdate({
        data: { ...block.data, children: newColumnChildren },
      });
    },
    [block.data, columnChildren, onUpdate]
  );

  const handleDeleteNestedBlock = useCallback(
    (columnIndex: number, blockId: string) => {
      const newColumnChildren = [...columnChildren];
      newColumnChildren[columnIndex] = newColumnChildren[columnIndex].filter((b) => b.id !== blockId);
      onUpdate({
        data: { ...block.data, children: newColumnChildren },
      });
    },
    [block.data, columnChildren, onUpdate]
  );

  return (
    <div
      className={`grid gap-4 my-4 ${isSelected ? "ring-2 ring-brand-primary" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <ColumnDropZone
          key={index}
          columnIndex={index}
          columnId={`${block.id}-column-${index}`}
          isSelected={isSelected}
        >
          <div className="min-h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Column {index + 1}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleAddBlockToColumn(index, "paragraph")}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Block
              </Button>
            </div>
            <div className="space-y-2">
              {columnChildren[index]?.map((childBlock) => (
                <BlockRenderer
                  key={childBlock.id}
                  block={childBlock}
                  isSelected={false}
                  isDragging={false}
                  onSelect={() => {}}
                  onUpdate={(updates) => handleUpdateNestedBlock(index, childBlock.id, updates)}
                />
              ))}
              {(!columnChildren[index] || columnChildren[index].length === 0) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                  Drop blocks here or click "Add Block"
                </p>
              )}
            </div>
          </div>
        </ColumnDropZone>
      ))}
    </div>
  );
}

function ColumnDropZone({
  columnId,
  columnIndex,
  children,
  isSelected,
}: {
  columnId: string;
  columnIndex: number;
  children: React.ReactNode;
  isSelected: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: {
      type: "column",
      columnIndex,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500" : ""} ${
        isSelected ? "ring-2 ring-brand-primary" : ""
      }`}
    >
      {children}
    </div>
  );
}

