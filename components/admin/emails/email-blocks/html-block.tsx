"use client";

import React from "react";
import { HtmlBlockProps } from "@/lib/types/email";

interface HtmlBlockComponentProps {
  block: {
    id: string;
    type: "html";
    props: HtmlBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: HtmlBlockProps) => void;
  isPreview?: boolean;
}

export default function HtmlBlock({
  block,
  isSelected,
  onSelect,
  isPreview = false,
}: HtmlBlockComponentProps) {
  const { html = "" } = block.props;

  const style: React.CSSProperties = {
    padding: "10px",
    ...block.styles,
  };

  if (isPreview) {
    return <div style={style} dangerouslySetInnerHTML={{ __html: html }} />;
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
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="text-gray-400 text-sm italic">Custom HTML block - click to edit</div>
      )}
    </div>
  );
}

