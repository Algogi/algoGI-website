"use client";

import React from "react";
import { Block } from "@/lib/editor/blocks/types";

interface SpacerBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function SpacerBlock({ block, isSelected, onUpdate }: SpacerBlockProps) {
  const height = block.data.height || 40;

  return (
    <div
      className={`relative ${isSelected ? "ring-2 ring-brand-primary" : ""}`}
      style={{ height: `${height}px` }}
    >
      {isSelected && (
        <div className="absolute inset-0 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">{height}px</span>
        </div>
      )}
    </div>
  );
}

