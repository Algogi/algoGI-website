"use client";

import React from "react";
import { ColumnsBlockProps, EmailBlock } from "@/lib/types/email";
import BlockRenderer from "../block-renderer";

interface ColumnsBlockComponentProps {
  block: {
    id: string;
    type: "columns";
    props: ColumnsBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: ColumnsBlockProps) => void;
  isPreview?: boolean;
  nestedBlocks?: EmailBlock[];
  onNestedBlockSelect?: (blockId: string | null) => void;
  selectedNestedBlockId?: string | null;
}

export default function ColumnsBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
  nestedBlocks = [],
  onNestedBlockSelect,
  selectedNestedBlockId,
}: ColumnsBlockComponentProps) {
  const {
    columns = 2,
    columnGap = "20px",
    backgroundColor,
    padding = "20px",
  } = block.props;

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    padding,
    ...block.styles,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: columnGap,
  };

  const columnStyle: React.CSSProperties = {
    minHeight: "50px",
  };

  // Columns block - simplified implementation
  // Note: Nested block support will be added in a future update
  if (isPreview) {
    return (
      <div style={containerStyle}>
        <div style={gridStyle}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} style={columnStyle}>
              <div style={{ padding: "20px", backgroundColor: "#f0f0f0", textAlign: "center", color: "#999", minHeight: "100px", borderRadius: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>Column {index + 1}</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>Content placeholder</div>
              </div>
            </div>
          ))}
        </div>
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
      <div style={gridStyle}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} style={columnStyle}>
            <div
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-center"
              style={{ minHeight: "100px", backgroundColor: isSelected ? "rgba(74, 58, 255, 0.05)" : "transparent" }}
            >
              <div className="text-gray-400 text-sm font-medium mb-1">Column {index + 1}</div>
              <div className="text-gray-500 text-xs">
                {isSelected ? "Nested block support coming soon" : "Drop blocks here (coming soon)"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

