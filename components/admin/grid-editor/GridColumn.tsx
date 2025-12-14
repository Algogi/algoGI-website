"use client";

import React from "react";
import { NodeViewWrapper } from "@tiptap/react";

interface GridColumnProps {
  node: {
    attrs: {
      span: number;
      class?: string;
    };
  };
  children: React.ReactNode;
  selected: boolean;
  updateAttributes: (attrs: { span?: number }) => void;
}

export default function GridColumn({
  node,
  children,
  selected,
  updateAttributes,
}: GridColumnProps) {
  const span = node.attrs.span || 12;

  return (
    <NodeViewWrapper
      className={`grid-column-wrapper relative ${selected ? "ring-2 ring-brand-primary" : ""}`}
    >
      <div
        data-grid-column
        data-span={span}
        className={`col-span-${span} min-h-[50px] p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-dark-surface ${node.attrs.class || ""}`}
        style={{
          gridColumn: `span ${span}`,
        }}
      >
        <div className="absolute top-0 right-0 bg-brand-primary text-white text-xs px-1 rounded-bl">
          {span}/12
        </div>
        {children}
      </div>
    </NodeViewWrapper>
  );
}

