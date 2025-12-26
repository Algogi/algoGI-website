"use client";

import React from "react";
import { SpacerBlockProps } from "@/lib/types/email";

interface SpacerBlockComponentProps {
  block: {
    id: string;
    type: "spacer";
    props: SpacerBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: SpacerBlockProps) => void;
  isPreview?: boolean;
}

export default function SpacerBlock({
  block,
  isSelected,
  onSelect,
  isPreview = false,
}: SpacerBlockComponentProps) {
  const { height = "20px" } = block.props;

  const style: React.CSSProperties = {
    height,
    width: "100%",
    backgroundColor: isSelected ? "rgba(74, 58, 255, 0.1)" : "transparent",
    border: isSelected ? "2px dashed #4a3aff" : "2px dashed transparent",
    position: "relative",
    ...block.styles,
  };

  if (isPreview) {
    return <div style={{ height, width: "100%" }} />;
  }

  return (
    <div
      onClick={onSelect}
      className={`transition-colors cursor-pointer ${
        isSelected ? "bg-neon-blue/10" : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      style={style}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-neon-blue">
          Spacer: {height}
        </div>
      )}
    </div>
  );
}

