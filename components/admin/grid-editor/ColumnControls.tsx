"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ColumnControlsProps {
  span: number;
  onSpanChange: (span: number) => void;
  onDelete: () => void;
  onAddColumn: () => void;
}

export default function ColumnControls({
  span,
  onSpanChange,
  onDelete,
  onAddColumn,
}: ColumnControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="cursor-move"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">Span:</span>
        <select
          value={span}
          onChange={(e) => onSpanChange(parseInt(e.target.value, 10))}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAddColumn}
        title="Add column"
      >
        <Plus className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDelete}
        title="Delete column"
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

