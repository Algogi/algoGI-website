"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface CanvasDropZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export default function CanvasDropZone({ id, children, className }: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "canvas",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className || ""} ${isOver ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500" : ""}`}
      style={{ minHeight: "100%" }}
    >
      {children}
    </div>
  );
}

