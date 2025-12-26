"use client";

import React from "react";
import { LinkBlockProps } from "@/lib/types/email";

interface LinkBlockComponentProps {
  block: {
    id: string;
    type: "link";
    props: LinkBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: LinkBlockProps) => void;
  isPreview?: boolean;
}

export default function LinkBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: LinkBlockComponentProps) {
  const {
    text = "Link",
    url = "#",
    color = "#4a3aff",
    fontSize = "16px",
    underline = true,
    align = "left",
    padding = "10px",
  } = block.props;

  const style: React.CSSProperties = {
    textAlign: align,
    padding,
    ...block.styles,
  };

  const linkStyle: React.CSSProperties = {
    color,
    fontSize,
    textDecoration: underline ? "underline" : "none",
  };

  const linkElement = isPreview ? (
    <a href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
      {text}
    </a>
  ) : (
    <span style={linkStyle}>{text}</span>
  );

  if (isPreview) {
    return <div style={style}>{linkElement}</div>;
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
      {linkElement}
    </div>
  );
}

