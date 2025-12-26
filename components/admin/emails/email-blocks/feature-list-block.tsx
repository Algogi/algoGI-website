"use client";

import React from "react";
import { FeatureListBlockProps, FeatureListItem } from "@/lib/types/email";
import { Button } from "@/components/ui/button";
import { Plus, X, Check } from "lucide-react";

interface FeatureListBlockComponentProps {
  block: {
    id: string;
    type: "feature-list";
    props: FeatureListBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: FeatureListBlockProps) => void;
  isPreview?: boolean;
}

export default function FeatureListBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: FeatureListBlockComponentProps) {
  const {
    items = [{ text: "Feature item 1" }, { text: "Feature item 2" }],
    iconSize = "20px",
    iconColor = "#4a3aff",
    textColor = "#333333",
    fontSize = "16px",
    spacing = "15px",
  } = block.props;

  const handleAddItem = () => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        items: [...items, { text: "New feature item" }],
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        items: items.filter((_, i) => i !== index),
      });
    }
  };

  const handleItemChange = (index: number, field: keyof FeatureListItem, value: string) => {
    if (onUpdate) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      onUpdate({
        ...block.props,
        items: newItems,
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    ...block.styles,
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: spacing,
    color: textColor,
    fontSize,
  };

  const iconStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    color: iconColor,
    marginRight: "10px",
    flexShrink: 0,
    marginTop: "2px",
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        {items.map((item, index) => (
          <div key={index} style={itemStyle}>
            {item.icon ? (
              <img src={item.icon} alt="" style={iconStyle} />
            ) : (
              <Check style={iconStyle} />
            )}
            <span>{item.text}</span>
          </div>
        ))}
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
      {items.map((item, index) => (
        <div key={index} style={itemStyle}>
          {item.icon ? (
            <img src={item.icon} alt="" style={iconStyle} />
          ) : (
            <Check className="w-5 h-5" style={{ color: iconColor, marginRight: "10px", flexShrink: 0, marginTop: "2px" }} />
          )}
          {isSelected && onUpdate ? (
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleItemChange(index, "text", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-neon-blue focus:outline-none"
              style={{ color: textColor, fontSize }}
            />
          ) : (
            <span>{item.text}</span>
          )}
          {isSelected && onUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem(index);
              }}
              className="ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      {isSelected && onUpdate && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAddItem();
          }}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      )}
    </div>
  );
}

