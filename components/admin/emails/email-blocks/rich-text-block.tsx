"use client";

import React from "react";
import { RichTextBlockProps } from "@/lib/types/email";
import RichTextEditor from "@/components/admin/rich-text-editor";

interface RichTextBlockComponentProps {
  block: {
    id: string;
    type: "rich-text";
    props: RichTextBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: RichTextBlockProps) => void;
  isPreview?: boolean;
}

export default function RichTextBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: RichTextBlockComponentProps) {
  const {
    content = "",
    columns = 1,
    fontSize = "16px",
    fontFamily = "Arial, sans-serif",
    color = "#333333",
    lineHeight = "1.6",
  } = block.props;

  const containerStyle: React.CSSProperties = {
    fontSize,
    fontFamily,
    color,
    lineHeight,
    ...block.styles,
  };

  const handleContentChange = (newContent: string) => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        content: newContent,
      });
    }
  };

  if (isPreview) {
    const columnClass = columns === 1 ? "" : columns === 2 ? "grid grid-cols-2 gap-4" : "grid grid-cols-3 gap-4";
    return (
      <div style={containerStyle} className={columnClass}>
        <div dangerouslySetInnerHTML={{ __html: content || "<p>Rich text content</p>" }} />
      </div>
    );
  }

  // Always show editor when block is selected and we have onUpdate
  if (isSelected && onUpdate) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border-2 border-neon-blue bg-neon-blue/10 transition-colors`}
        style={containerStyle}
      >
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your content..."
        />
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`border-2 transition-colors ${
        isSelected
          ? "border-neon-blue bg-neon-blue/10"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      style={containerStyle}
    >
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="text-gray-400 text-sm italic p-4">Click to edit rich text content</div>
      )}
    </div>
  );
}

