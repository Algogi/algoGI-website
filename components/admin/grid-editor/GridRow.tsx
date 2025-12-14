"use client";

import React from "react";
import { NodeViewWrapper } from "@tiptap/react";

interface GridRowProps {
  node: {
    attrs: {
      class?: string;
    };
  };
  children: React.ReactNode;
}

export default function GridRow({ node, children }: GridRowProps) {
  return (
    <NodeViewWrapper className="grid-row-wrapper">
      <div
        data-grid-row
        className={`grid grid-cols-12 gap-4 ${node.attrs.class || ""} p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg my-4`}
      >
        {children}
      </div>
    </NodeViewWrapper>
  );
}

