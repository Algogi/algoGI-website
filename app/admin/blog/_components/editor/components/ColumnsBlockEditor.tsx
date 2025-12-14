"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ColumnsBlock } from "../types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import * as blockOps from "../state/blockOperations";
import BlockMenu from "./BlockMenu";

// Dynamically import BlockRenderer to avoid SSR issues
const BlockRenderer = dynamic(
  () => import("./BlockRenderer"),
  { ssr: false }
);

interface ColumnsBlockEditorProps {
  block: ColumnsBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<ColumnsBlock>) => void;
  onSelect: () => void;
  onImageUpload?: (file: File) => Promise<{ url: string }>;
  onBlockUpdate?: (blockId: string, updates: Partial<import("../types").Block>) => void;
  onBlockDelete?: (blockId: string) => void;
}

export default function ColumnsBlockEditor({
  block,
  isSelected,
  onUpdate,
  onSelect,
  onImageUpload,
  onBlockUpdate,
  onBlockDelete,
}: ColumnsBlockEditorProps) {
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null);

  const handleColumnCountChange = (newCount: string) => {
    const count = parseInt(newCount) as 2 | 3 | 4;
    const currentColumns = [...block.data.columns];
    
    // Adjust columns array
    while (currentColumns.length < count) {
      currentColumns.push([]);
    }
    while (currentColumns.length > count) {
      currentColumns.pop();
    }

    onUpdate({
      data: {
        ...block.data,
        columnCount: count,
        columns: currentColumns,
      },
    });
  };

  const handleAddBlockToColumn = (columnIndex: number, newBlock: import("../types").Block) => {
    const newColumns = [...block.data.columns];
    if (!newColumns[columnIndex]) {
      newColumns[columnIndex] = [];
    }
    newColumns[columnIndex] = [...newColumns[columnIndex], newBlock];
    onUpdate({
      data: {
        ...block.data,
        columns: newColumns,
      },
    });
    setShowAddMenu(null);
  };

  const handleRemoveBlockFromColumn = (columnIndex: number, blockId: string) => {
    const newColumns = [...block.data.columns];
    if (newColumns[columnIndex]) {
      newColumns[columnIndex] = newColumns[columnIndex].filter((b) => b.id !== blockId);
    }
    onUpdate({
      data: {
        ...block.data,
        columns: newColumns,
      },
    });
  };

  const handleUpdateBlockInColumn = (columnIndex: number, blockId: string, updates: Partial<import("../types").Block>) => {
    const newColumns = [...block.data.columns];
    if (newColumns[columnIndex]) {
      newColumns[columnIndex] = newColumns[columnIndex].map((b) =>
        b.id === blockId ? { ...b, ...updates, data: updates.data ? { ...b.data, ...updates.data } : b.data } : b
      );
    }
    onUpdate({
      data: {
        ...block.data,
        columns: newColumns,
      },
    });
  };

  const columnCount = block.data.columnCount || 2;
  const gap = block.data.gap || 16;

  return (
    <div
      className="w-full"
      onClick={onSelect}
    >
      {/* Controls - only show when selected */}
      {isSelected && (
        <div className="mb-4 space-y-3 border-b pb-3" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`columns-count-${block.id}`}>Column Count</Label>
              <Select
                value={columnCount.toString()}
                onValueChange={handleColumnCountChange}
              >
                <SelectTrigger id={`columns-count-${block.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`columns-gap-${block.id}`}>Gap (px)</Label>
              <Input
                id={`columns-gap-${block.id}`}
                type="number"
                value={gap}
                onChange={(e) =>
                  onUpdate({
                    data: {
                      ...block.data,
                      gap: parseInt(e.target.value) || 16,
                    },
                  })
                }
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Columns Grid - Responsive: stack on mobile */}
      <div
        className="grid grid-cols-1"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {block.data.columns.map((columnBlocks, columnIndex) => (
          <div
            key={columnIndex}
            className={`border-2 border-dashed rounded p-4 min-h-[200px] ${
              selectedColumnIndex === columnIndex && isSelected
                ? "border-brand-primary bg-brand-primary/5"
                : "border-gray-300 dark:border-gray-600"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedColumnIndex(columnIndex);
            }}
          >
            {/* Column Header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Column {columnIndex + 1}
              </span>
              {isSelected && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddMenu(showAddMenu === columnIndex ? null : columnIndex);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Add Block Menu */}
            {showAddMenu === columnIndex && isSelected && (
              <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                <BlockMenu
                  onAddBlock={(newBlock) => handleAddBlockToColumn(columnIndex, newBlock)}
                />
              </div>
            )}

            {/* Column Blocks */}
            <div className="space-y-3">
              {columnBlocks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>No blocks in this column</p>
                  <p className="text-xs mt-1">Click + to add a block</p>
                </div>
              ) : (
                columnBlocks.map((nestedBlock) => (
                  <BlockRenderer
                    key={nestedBlock.id}
                    block={nestedBlock}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={(updates) =>
                      handleUpdateBlockInColumn(columnIndex, nestedBlock.id, updates)
                    }
                    onDelete={() => handleRemoveBlockFromColumn(columnIndex, nestedBlock.id)}
                    onImageUpload={onImageUpload}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Note */}
      {isSelected && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
          Columns will stack vertically on mobile devices
        </div>
      )}
    </div>
  );
}

