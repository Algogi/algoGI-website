"use client";

import React from "react";
import { Block } from "@/lib/editor/blocks/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlignLeft, AlignCenter, AlignRight, Maximize2 } from "lucide-react";

interface BlockToolbarProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

export default function BlockToolbar({ block, onUpdate }: BlockToolbarProps) {
  const handleStyleUpdate = (styleUpdates: Partial<Block["style"]>) => {
    onUpdate({
      style: {
        ...block.style,
        ...styleUpdates,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
        </h4>
      </div>

      {/* Alignment Controls */}
      {["image", "heading", "paragraph"].includes(block.type) && (
        <div>
          <Label className="text-xs mb-2 block">Alignment</Label>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={block.style?.align === "left" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleUpdate({ align: "left" })}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={block.style?.align === "center" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleUpdate({ align: "center" })}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={block.style?.align === "right" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleUpdate({ align: "right" })}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={block.style?.align === "full" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleUpdate({ align: "full" })}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Block-specific controls */}
      {block.type === "image" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="image-width" className="text-xs">
              Width (px)
            </Label>
            <Input
              id="image-width"
              type="number"
              value={block.data.width || 800}
              onChange={(e) =>
                onUpdate({
                  data: { ...block.data, width: parseInt(e.target.value) || 800 },
                })
              }
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="image-height" className="text-xs">
              Height (px)
            </Label>
            <Input
              id="image-height"
              type="number"
              value={block.data.height || ""}
              onChange={(e) =>
                onUpdate({
                  data: {
                    ...block.data,
                    height: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {block.type === "spacer" && (
        <div>
          <Label htmlFor="spacer-height" className="text-xs">
            Height (px)
          </Label>
          <Input
            id="spacer-height"
            type="number"
            value={block.data.height || 40}
            onChange={(e) =>
              onUpdate({
                data: { ...block.data, height: parseInt(e.target.value) || 40 },
              })
            }
            className="h-8 text-sm"
          />
        </div>
      )}

      {block.type === "columns" && (
        <div>
          <Label htmlFor="columns-count" className="text-xs">
            Number of Columns
          </Label>
          <Input
            id="columns-count"
            type="number"
            min="2"
            max="4"
            value={block.data.columns || 2}
            onChange={(e) =>
              onUpdate({
                data: { ...block.data, columns: parseInt(e.target.value) || 2 },
              })
            }
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
}

