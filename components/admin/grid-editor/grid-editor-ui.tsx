"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface GridEditorUIProps {
  showOverlay: boolean;
  onToggleOverlay: () => void;
}

export default function GridEditorUI({
  showOverlay,
  onToggleOverlay,
}: GridEditorUIProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
      <Button
        type="button"
        variant={showOverlay ? "default" : "outline"}
        size="sm"
        onClick={onToggleOverlay}
        title="Toggle Grid Overlay"
      >
        {showOverlay ? (
          <>
            <EyeOff className="w-4 h-4 mr-1" />
            Hide Grid
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-1" />
            Show Grid
          </>
        )}
      </Button>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        12-Column Grid System
      </span>
    </div>
  );
}

