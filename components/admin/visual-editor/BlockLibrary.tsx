"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { blockRegistry, getBlocksByCategory } from "@/lib/editor/blocks/registry";
import { GripVertical } from "lucide-react";

interface BlockLibraryProps {
  onAddBlock: (blockType: string) => void;
}

function DraggableBlockItem({ type, label, icon }: { type: string; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${type}`,
    data: {
      blockType: type,
      fromLibrary: true,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent click from propagating
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
      </div>
    </div>
  );
}

export default function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const textBlocks = getBlocksByCategory("text");
  const mediaBlocks = getBlocksByCategory("media");
  const layoutBlocks = getBlocksByCategory("layout");
  const componentBlocks = getBlocksByCategory("components");

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Block Library</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Text
          </h4>
          <div className="space-y-2">
            {textBlocks.map((def) => (
              <DraggableBlockItem
                key={def.type}
                type={def.type}
                label={def.label}
                icon={def.icon}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Media
          </h4>
          <div className="space-y-2">
            {mediaBlocks.map((def) => (
              <DraggableBlockItem
                key={def.type}
                type={def.type}
                label={def.label}
                icon={def.icon}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Layout
          </h4>
          <div className="space-y-2">
            {layoutBlocks.map((def) => (
              <DraggableBlockItem
                key={def.type}
                type={def.type}
                label={def.label}
                icon={def.icon}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Components
          </h4>
          <div className="space-y-2">
            {componentBlocks.map((def) => (
              <DraggableBlockItem
                key={def.type}
                type={def.type}
                label={def.label}
                icon={def.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

