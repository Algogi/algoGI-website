"use client";

import React from "react";
import { SecondaryButtonBlockProps } from "@/lib/types/email";

interface SecondaryButtonBlockComponentProps {
  block: {
    id: string;
    type: "secondary-button";
    props: SecondaryButtonBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: SecondaryButtonBlockProps) => void;
  isPreview?: boolean;
}

export default function SecondaryButtonBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: SecondaryButtonBlockComponentProps) {
  const {
    text = "Button",
    link = "#",
    borderColor = "#4a3aff",
    textColor = "#4a3aff",
    fontSize = "16px",
    padding = "12px 24px",
    borderRadius = "5px",
    align = "center",
  } = block.props;

  const containerStyle: React.CSSProperties = {
    textAlign: align,
    padding: "10px",
    ...block.styles,
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: "transparent",
    color: textColor,
    fontSize,
    padding,
    borderRadius,
    textDecoration: "none",
    fontWeight: "bold",
    border: `2px solid ${borderColor}`,
    cursor: isPreview ? "pointer" : "default",
    transition: "all 0.3s ease",
  };

  const buttonElement = isPreview ? (
    <a href={link} style={buttonStyle}>
      {text}
    </a>
  ) : (
    <span style={buttonStyle}>{text}</span>
  );

  if (isPreview) {
    return <div style={containerStyle}>{buttonElement}</div>;
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
      {buttonElement}
    </div>
  );
}

