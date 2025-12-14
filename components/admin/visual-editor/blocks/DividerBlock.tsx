"use client";

import React from "react";
import { Block } from "@/lib/editor/blocks/types";

interface DividerBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function DividerBlock({ block, isSelected, onUpdate }: DividerBlockProps) {
  const { style = "solid", color = "#e5e7eb" } = block.data;

  return (
    <hr
      className={`my-4 ${isSelected ? "ring-2 ring-brand-primary" : ""}`}
      style={{
        borderStyle: style,
        borderColor: color,
        borderWidth: "1px 0 0 0",
      }}
    />
  );
}

