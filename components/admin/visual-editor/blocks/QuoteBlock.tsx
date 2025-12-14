"use client";

import React, { useState } from "react";
import { QuoteBlock as QuoteBlockType } from "@/lib/editor/blocks/types";

interface QuoteBlockProps {
  block: QuoteBlockType;
  isSelected: boolean;
  onUpdate: (updates: Partial<QuoteBlockType>) => void;
}

export default function QuoteBlock({ block, isSelected, onUpdate }: QuoteBlockProps) {
  const { text, author } = block.data;
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text);
  const [localAuthor, setLocalAuthor] = useState(author || "");

  const handleBlur = () => {
    onUpdate({
      data: { ...block.data, text: localText, author: localAuthor },
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2 p-2 border-2 border-brand-primary rounded">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          className="w-full border rounded p-2 focus:outline-none resize-none"
          rows={3}
        />
        <input
          type="text"
          value={localAuthor}
          onChange={(e) => setLocalAuthor(e.target.value)}
          onBlur={handleBlur}
          placeholder="Author (optional)"
          className="w-full border rounded p-2 focus:outline-none"
        />
      </div>
    );
  }

  return (
    <blockquote
      className={`border-l-4 border-brand-primary pl-4 italic my-4 cursor-text ${
        isSelected ? "ring-2 ring-brand-primary" : ""
      }`}
      onClick={() => setIsEditing(true)}
    >
      <p>{text}</p>
      {author && <cite className="block mt-2 text-sm not-italic">- {author}</cite>}
    </blockquote>
  );
}

