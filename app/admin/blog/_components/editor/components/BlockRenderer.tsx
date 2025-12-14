"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Block } from "../types";
import { ImageBlock, ButtonBlock, ColumnsBlock, CodeBlock, TextBlock } from "../types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Dynamically import TipTap editor to avoid SSR issues
const TextBlockEditor = dynamic(
  () => import("./TextBlockEditor"),
  { ssr: false }
);

// Dynamically import other block editors
const ImageBlockEditor = dynamic(
  () => import("./ImageBlockEditor"),
  { ssr: false }
);

const ButtonBlockEditor = dynamic(
  () => import("./ButtonBlockEditor"),
  { ssr: false }
);

const ColumnsBlockEditor = dynamic(
  () => import("./ColumnsBlockEditor"),
  { ssr: false }
);

const CodeBlockEditor = dynamic(
  () => import("./CodeBlockEditor"),
  { ssr: false }
);

interface BlockRendererProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onImageUpload?: (file: File) => Promise<{ url: string }>;
  blockIndex?: number;
}

export default function BlockRenderer({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onImageUpload,
  blockIndex,
}: BlockRendererProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getBlockTypeLabel = () => {
    switch (block.type) {
      case "paragraph":
        return "Text";
      case "image":
        return "Image";
      case "button":
        return "Button";
      case "columns":
        return "Columns";
      case "code":
        return "Code";
      default:
        return "Block";
    }
  };

  const getBlockTypeColor = () => {
    switch (block.type) {
      case "paragraph":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "image":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "button":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "columns":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
      case "code":
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const handleTextBlockChange = (content: any) => {
    if (block.type === "paragraph") {
      onUpdate({
        data: {
          ...block.data,
          content,
        },
      });
    }
  };

  const renderBlock = () => {
  switch (block.type) {
    case "paragraph":
      return (
        <TextBlockEditor
          block={block as TextBlock}
          isSelected={isSelected}
          onChange={handleTextBlockChange}
          onFocus={onSelect}
          onImageUpload={onImageUpload}
        />
      );

      case "image":
        return (
          <ImageBlockEditor
            block={block as ImageBlock}
            isSelected={isSelected}
            onUpdate={onUpdate}
            onSelect={onSelect}
            onImageUpload={onImageUpload}
          />
        );

      case "button":
        return (
          <ButtonBlockEditor
            block={block as ButtonBlock}
            isSelected={isSelected}
            onUpdate={onUpdate}
            onSelect={onSelect}
          />
        );

      case "columns":
        return (
          <ColumnsBlockEditor
            block={block as ColumnsBlock}
            isSelected={isSelected}
            onUpdate={onUpdate}
            onSelect={onSelect}
            onImageUpload={onImageUpload}
          />
        );

      case "code":
        return (
          <CodeBlockEditor
            block={block as CodeBlock}
            isSelected={isSelected}
            onUpdate={onUpdate}
            onSelect={onSelect}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative group transition-all border-t border-b py-4 ${
        isSelected
          ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800 border-brand-primary"
          : "border-gray-200 dark:border-gray-700"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block Header with Type Label - Minimal */}
      <div
        className={`flex items-center justify-between mb-3 pb-2 border-b px-2 ${
          isSelected
            ? "border-brand-primary/30"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          {blockIndex && (
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
              #{blockIndex}
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${getBlockTypeColor()}`}
          >
            {getBlockTypeLabel()}
          </span>
        </div>
        {isHovered && !isSelected && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Click to edit
          </span>
        )}
      </div>

      {/* Block Content */}
      <div className="px-2">
        {renderBlock()}
      </div>

      {/* Delete Button - visible on hover or when selected */}
      {(isHovered || isSelected) && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 z-10 shadow-lg opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete block"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

