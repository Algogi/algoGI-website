"use client";

import React from "react";
import { TextBlockProps } from "@/lib/types/email";
import { replacePersonalizationTags } from "@/lib/email/personalization";

interface TextBlockComponentProps {
  block: {
    id: string;
    type: "text";
    props: TextBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: TextBlockProps) => void;
  isPreview?: boolean;
}

export default function TextBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: TextBlockComponentProps) {
  const {
    text = "",
    fontSize = "16px",
    fontFamily = "Arial, sans-serif",
    color = "#333333",
    backgroundColor,
    align = "left",
    padding = "10px",
    lineHeight = "1.6",
  } = block.props;

  const style: React.CSSProperties = {
    fontSize,
    fontFamily,
    color,
    backgroundColor,
    textAlign: align,
    padding,
    lineHeight,
    ...block.styles,
  };

  if (isPreview) {
    const personalizedText = replacePersonalizationTags(text);
    return (
      <div style={style} dangerouslySetInnerHTML={{ __html: personalizedText.replace(/\n/g, "<br>") }} />
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
      style={style}
    >
      <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, "<br>") || "Click to edit text" }} />
    </div>
  );
}
