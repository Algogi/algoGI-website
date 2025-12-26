"use client";

import React from "react";
import { ButtonBlockProps } from "@/lib/types/email";

interface ButtonBlockComponentProps {
  block: {
    id: string;
    type: "button";
    props: ButtonBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: ButtonBlockProps) => void;
  isPreview?: boolean;
}

export default function ButtonBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: ButtonBlockComponentProps) {
  const {
    text = "Button",
    link = "#",
    backgroundColor = "#4a3aff",
    textColor = "#ffffff",
    fontSize = "16px",
    padding = "12px 24px",
    borderRadius = "5px",
    align = "center",
  } = block.props;

  const style: React.CSSProperties = {
    textAlign: align,
    padding: "10px",
    ...block.styles,
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundColor,
    color: textColor,
    fontSize,
    padding,
    borderRadius,
    textDecoration: "none",
    fontWeight: "bold",
    border: "none",
    cursor: isPreview ? "pointer" : "default",
  };

  const buttonElement = isPreview ? (
    <a href={link} style={buttonStyle}>
      {text}
    </a>
  ) : (
    <span style={buttonStyle}>{text}</span>
  );

  if (isPreview) {
    return <div style={style}>{buttonElement}</div>;
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
      {buttonElement}
    </div>
  );
}


