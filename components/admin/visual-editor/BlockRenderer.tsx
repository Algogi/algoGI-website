"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "@/lib/editor/blocks/types";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import ColumnsBlock from "./blocks/ColumnsBlock";
import ButtonBlock from "./blocks/ButtonBlock";
import SpacerBlock from "./blocks/SpacerBlock";
import DividerBlock from "./blocks/DividerBlock";
import ListBlock from "./blocks/ListBlock";
import QuoteBlock from "./blocks/QuoteBlock";

interface BlockRendererProps {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete?: (id: string) => void;
}

export default function BlockRenderer({
  block,
  isSelected,
  isDragging,
  onSelect,
  onUpdate,
  onDelete,
}: BlockRendererProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({
      id: block.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const renderBlock = () => {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return <TextBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      case "image":
        return <ImageBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      case "columns":
        return (
          <ColumnsBlock
            block={block}
            isSelected={isSelected}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        );
      case "button":
        return <ButtonBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      case "spacer":
        return <SpacerBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      case "divider":
        return <DividerBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      case "list":
        return <ListBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      case "quote":
        return <QuoteBlock block={block} isSelected={isSelected} onUpdate={onUpdate} />;
      default:
        return <div>Unknown block type: {(block as any).type}</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? "ring-2 ring-brand-primary ring-offset-2" : ""} ${
        isSortableDragging ? "opacity-50" : ""
      }`}
      onClick={(e) => {
        // Don't select if clicking on drag handle
        if ((e.target as HTMLElement).closest('.drag-handle')) {
          return;
        }
        onSelect();
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className="drag-handle absolute -left-8 top-0 h-full w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>
      {renderBlock()}
    </div>
  );
}

