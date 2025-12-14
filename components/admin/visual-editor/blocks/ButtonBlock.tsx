"use client";

import React, { useState } from "react";
import { Block } from "@/lib/editor/blocks/types";
import { Input } from "@/components/ui/input";

interface ButtonBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function ButtonBlock({ block, isSelected, onUpdate }: ButtonBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { text = "Button", url = "#", variant = "primary" } = block.data;

  const handleTextChange = (newText: string) => {
    onUpdate({
      data: { ...block.data, text: newText },
    });
  };

  const handleUrlChange = (newUrl: string) => {
    onUpdate({
      data: { ...block.data, url: newUrl },
    });
  };

  const variantClasses: Record<string, string> = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
    secondary: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white",
    outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10",
    default: "bg-brand-primary text-white hover:bg-brand-primary/90",
    ghost: "bg-transparent text-brand-primary hover:bg-brand-primary/10",
  };

  const buttonVariant = variant && variantClasses[variant] ? variant : "primary";

  if (isEditing) {
    return (
      <div className="space-y-2 p-2 border-2 border-brand-primary rounded">
        <Input
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Button text"
          className="h-8"
        />
        <Input
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="URL"
          className="h-8"
        />
        <button
          onClick={() => setIsEditing(false)}
          className="text-xs text-gray-500"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-block ${isSelected ? "ring-2 ring-brand-primary ring-offset-2 rounded" : ""}`}>
      <a
        href={url || "#"}
        className={`inline-block px-6 py-2 rounded-md font-medium transition-colors ${variantClasses[buttonVariant]} ${
          isSelected ? "cursor-pointer" : ""
        }`}
        onClick={(e) => {
          if (isSelected) {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          setIsEditing(true);
        }}
      >
        {text || "Button"}
      </a>
    </div>
  );
}

