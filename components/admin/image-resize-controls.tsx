"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlignLeft, AlignRight, AlignCenter, Maximize2, Lock, Unlock } from "lucide-react";

interface ImageResizeControlsProps {
  width: number | null;
  height: number | null;
  align: string | null;
  aspectRatio: boolean;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onAlignChange: (align: "left" | "right" | "center" | "full-width") => void;
  onAspectRatioToggle: () => void;
}

export default function ImageResizeControls({
  width,
  height,
  align,
  aspectRatio,
  onWidthChange,
  onHeightChange,
  onAlignChange,
  onAspectRatioToggle,
}: ImageResizeControlsProps) {
  const [localWidth, setLocalWidth] = useState(width?.toString() || "");
  const [localHeight, setLocalHeight] = useState(height?.toString() || "");

  useEffect(() => {
    setLocalWidth(width?.toString() || "");
    setLocalHeight(height?.toString() || "");
  }, [width, height]);

  const handleWidthChange = (value: string) => {
    setLocalWidth(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onWidthChange(numValue);
      if (aspectRatio && height) {
        // Maintain aspect ratio
        const ratio = height / (width || 1);
        onHeightChange(Math.round(numValue * ratio));
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setLocalHeight(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onHeightChange(numValue);
      if (aspectRatio && width) {
        // Maintain aspect ratio
        const ratio = width / (height || 1);
        onWidthChange(Math.round(numValue * ratio));
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Image Controls</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAspectRatioToggle}
          title={aspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          {aspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="image-width" className="text-xs">
            Width (px)
          </Label>
          <Input
            id="image-width"
            type="number"
            value={localWidth}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="h-8 text-sm"
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="image-height" className="text-xs">
            Height (px)
          </Label>
          <Input
            id="image-height"
            type="number"
            value={localHeight}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="h-8 text-sm"
            min="1"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Alignment</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={align === "left" ? "default" : "outline"}
            size="sm"
            onClick={() => onAlignChange("left")}
            title="Float left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={align === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => onAlignChange("center")}
            title="Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={align === "right" ? "default" : "outline"}
            size="sm"
            onClick={() => onAlignChange("right")}
            title="Float right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={align === "full-width" ? "default" : "outline"}
            size="sm"
            onClick={() => onAlignChange("full-width")}
            title="Full width"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

