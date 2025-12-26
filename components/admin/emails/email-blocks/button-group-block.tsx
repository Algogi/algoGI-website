"use client";

import React from "react";
import { ButtonGroupBlockProps, ButtonGroupButton } from "@/lib/types/email";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface ButtonGroupBlockComponentProps {
  block: {
    id: string;
    type: "button-group";
    props: ButtonGroupBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: ButtonGroupBlockProps) => void;
  isPreview?: boolean;
}

export default function ButtonGroupBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: ButtonGroupBlockComponentProps) {
  const {
    buttons = [
      { text: "Button 1", link: "#", variant: "primary" },
      { text: "Button 2", link: "#", variant: "secondary" },
    ],
    spacing = "10px",
    align = "center",
  } = block.props;

  const handleAddButton = () => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        buttons: [...buttons, { text: `Button ${buttons.length + 1}`, link: "#", variant: "primary" }],
      });
    }
  };

  const handleRemoveButton = (index: number) => {
    if (onUpdate && buttons.length > 1) {
      onUpdate({
        ...block.props,
        buttons: buttons.filter((_, i) => i !== index),
      });
    }
  };

  const handleButtonChange = (index: number, field: keyof ButtonGroupButton, value: string) => {
    if (onUpdate) {
      const newButtons = [...buttons];
      newButtons[index] = { ...newButtons[index], [field]: value };
      onUpdate({
        ...block.props,
        buttons: newButtons,
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    textAlign: align,
    padding: "10px",
    ...block.styles,
  };

  const groupStyle: React.CSSProperties = {
    display: "inline-flex",
    gap: spacing,
    flexWrap: "wrap",
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
  };

  const getButtonStyle = (variant: "primary" | "secondary" = "primary"): React.CSSProperties => {
    if (variant === "primary") {
      return {
        display: "inline-block",
        backgroundColor: "#4a3aff",
        color: "#ffffff",
        fontSize: "16px",
        padding: "12px 24px",
        borderRadius: "5px",
        textDecoration: "none",
        fontWeight: "bold",
        border: "none",
        cursor: isPreview ? "pointer" : "default",
      };
    } else {
      return {
        display: "inline-block",
        backgroundColor: "transparent",
        color: "#4a3aff",
        fontSize: "16px",
        padding: "12px 24px",
        borderRadius: "5px",
        textDecoration: "none",
        fontWeight: "bold",
        border: "2px solid #4a3aff",
        cursor: isPreview ? "pointer" : "default",
      };
    }
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <div style={groupStyle}>
          {buttons.map((button, index) => (
            <a key={index} href={button.link} style={getButtonStyle(button.variant)}>
              {button.text}
            </a>
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
      <div style={groupStyle}>
        {buttons.map((button, index) => (
          <div key={index} className="relative inline-block">
            {isSelected && onUpdate ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) => handleButtonChange(index, "text", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-neon-blue focus:outline-none"
                  style={{ ...getButtonStyle(button.variant), minWidth: "100px" }}
                />
                {buttons.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveButton(index);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <span style={getButtonStyle(button.variant)}>{button.text}</span>
            )}
          </div>
        ))}
      </div>
      {isSelected && onUpdate && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddButton();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Button
          </Button>
        </div>
      )}
    </div>
  );
}

