"use client";

import React, { useState } from "react";
import { ListBlock as ListBlockType } from "@/lib/editor/blocks/types";

interface ListBlockProps {
  block: ListBlockType;
  isSelected: boolean;
  onUpdate: (updates: Partial<ListBlockType>) => void;
}

export default function ListBlock({ block, isSelected, onUpdate }: ListBlockProps) {
  const { items = [], ordered = false } = block.data;
  const [isEditing, setIsEditing] = useState(false);
  const [localItems, setLocalItems] = useState(items.join("\n"));

  const handleBlur = () => {
    const newItems = localItems.split("\n").filter((item) => item.trim());
    onUpdate({
      data: { ...block.data, items: newItems },
    });
    setIsEditing(false);
  };

  const Tag = ordered ? "ol" : "ul";

  if (isEditing) {
    return (
      <textarea
        value={localItems}
        onChange={(e) => setLocalItems(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setLocalItems(items.join("\n"));
            setIsEditing(false);
          }
        }}
        className={`w-full border-2 border-brand-primary rounded p-2 focus:outline-none resize-none ${
          isSelected ? "ring-2 ring-brand-primary" : ""
        }`}
        rows={items.length || 2}
      />
    );
  }

  return (
    <Tag
      className={`cursor-text ${isSelected ? "ring-2 ring-brand-primary" : ""}`}
      onClick={() => setIsEditing(true)}
    >
      {items.map((item: string, index: number) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
}

