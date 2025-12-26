"use client";

import React from "react";
import { PrimaryButtonBlockProps } from "@/lib/types/email";

interface PrimaryButtonBlockComponentProps {
  block: {
    id: string;
    type: "primary-button";
    props: PrimaryButtonBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: PrimaryButtonBlockProps) => void;
  isPreview?: boolean;
}

export default function PrimaryButtonBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: PrimaryButtonBlockComponentProps) {
  const {
    text = "Button",
    link = "#",
    backgroundColor = "#4a3aff",
    textColor = "#ffffff",
    fontSize = "16px",
    padding = "12px 24px",
    borderRadius = "5px",
    glow = false,
    fullWidth = false,
    align = "center",
  } = block.props;

  const containerStyle: React.CSSProperties = {
    textAlign: align,
    padding: "10px",
    ...block.styles,
  };

  const buttonStyle: React.CSSProperties = {
    display: fullWidth ? "block" : "inline-block",
    width: fullWidth ? "100%" : "auto",
    backgroundColor,
    color: textColor,
    fontSize,
    padding,
    borderRadius,
    textDecoration: "none",
    fontWeight: "bold",
    border: "none",
    cursor: isPreview ? "pointer" : "default",
    boxShadow: glow ? `0 4px 15px ${backgroundColor}40` : "none",
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

