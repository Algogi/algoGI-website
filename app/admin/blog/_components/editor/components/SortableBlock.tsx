"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "../types";
import { GripVertical } from "lucide-react";
import { useState } from "react";

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onImageUpload?: (file: File) => Promise<{ url: string }>;
  children: React.ReactNode;
}

export default function SortableBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onImageUpload,
  children,
}: SortableBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle - Top Center - Always reserves space */}
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center justify-center cursor-grab active:cursor-grabbing py-1.5 mb-2 rounded transition-all ${
          isSelected || isHovered
            ? "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-100"
            : "opacity-0"
        }`}
        title="Drag to reorder"
        onClick={(e) => {
          // Prevent block selection when clicking drag handle
          e.stopPropagation();
        }}
      >
        <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 rotate-90" />
      </div>
      {children}
    </div>
  );
}

