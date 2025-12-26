"use client";

import React from "react";
import { DividerBlockProps } from "@/lib/types/email";

interface DividerBlockComponentProps {
  block: {
    id: string;
    type: "divider";
    props: DividerBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: DividerBlockProps) => void;
  isPreview?: boolean;
}

export default function DividerBlock({
  block,
  isSelected,
  onSelect,
  isPreview = false,
}: DividerBlockComponentProps) {
  const {
    color = "#eeeeee",
    thickness = "1px",
    style: borderStyle = "solid",
    padding = "20px",
  } = block.props;

  const containerStyle: React.CSSProperties = {
    padding,
    ...block.styles,
  };

  const renderDivider = () => {
    if (borderStyle === "festive-dots") {
      return (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <span style={{ color, fontSize: "20px", letterSpacing: "10px" }}>•••</span>
        </div>
      );
    }
    if (borderStyle === "festive-snowflakes") {
      return (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <span style={{ color, fontSize: "20px", letterSpacing: "15px" }}>❄ ❄ ❄</span>
        </div>
      );
    }
    if (borderStyle === "festive-stars") {
      return (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <span style={{ color, fontSize: "20px", letterSpacing: "15px" }}>✦ ✦ ✦</span>
        </div>
      );
    }
    return <hr style={{ border: "none", borderTop: `${thickness} ${borderStyle} ${color}`, margin: 0, width: "100%" }} />;
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        {renderDivider()}
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
      {renderDivider()}
    </div>
  );
}

