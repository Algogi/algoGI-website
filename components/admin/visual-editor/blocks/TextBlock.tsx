"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Block } from "@/lib/editor/blocks/types";

interface TextBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function TextBlock({ block, isSelected, onUpdate }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(block.data.text || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Only update if block ID matches (prevents cross-block updates)
    setLocalText(block.data.text || "");
  }, [block.id, block.data.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Don't select all text - just place cursor at end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    // Only update if text actually changed
    if (localText !== block.data.text) {
      onUpdate({
        data: { ...block.data, text: localText },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && block.type === "paragraph") {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setLocalText(block.data.text || "");
      setIsEditing(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow normal paste behavior
    e.stopPropagation();
  };

  const Tag = block.type === "heading" ? `h${block.data.level || 1}` : "p";
  const align = block.style?.align || "left";

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={(e) => {
          // Prevent selecting all text on focus
          const length = e.target.value.length;
          e.target.setSelectionRange(length, length);
        }}
        className={`w-full border-2 border-brand-primary rounded p-2 focus:outline-none resize-none ${
          block.type === "heading" ? "text-2xl font-bold" : ""
        }`}
        style={{ textAlign: align }}
        rows={block.type === "heading" ? 1 : 3}
      />
    );
  }

  return (
    <Tag
      className={`cursor-text ${isSelected ? "ring-2 ring-brand-primary" : ""}`}
      style={{ textAlign: align }}
      onClick={() => setIsEditing(true)}
      dangerouslySetInnerHTML={{ __html: localText.replace(/\n/g, "<br />") }}
    />
  );
}

