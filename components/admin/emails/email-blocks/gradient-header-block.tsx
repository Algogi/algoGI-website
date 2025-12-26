"use client";

import React from "react";
import { GradientHeaderBlockProps } from "@/lib/types/email";

interface GradientHeaderBlockComponentProps {
  block: {
    id: string;
    type: "gradient-header";
    props: GradientHeaderBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: GradientHeaderBlockProps) => void;
  isPreview?: boolean;
}

export default function GradientHeaderBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: GradientHeaderBlockComponentProps) {
  const {
    text = "Gradient Header",
    gradientColors = ["#4a3aff", "#7c3aed"],
    fontSize = "32px",
    fontWeight = "bold",
    align = "center",
    padding = "40px 20px",
  } = block.props;

  const gradientString = gradientColors.join(", ");
  const gradientStyle = `linear-gradient(135deg, ${gradientString})`;

  const containerStyle: React.CSSProperties = {
    background: gradientStyle,
    padding,
    textAlign: align,
    ...block.styles,
  };

  const textStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    color: "#ffffff",
    margin: 0,
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <h2 style={textStyle}>{text}</h2>
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
      <h2 style={textStyle}>{text}</h2>
    </div>
  );
}


