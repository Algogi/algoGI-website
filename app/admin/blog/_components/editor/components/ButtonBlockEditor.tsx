"use client";

import { ButtonBlock } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ButtonBlockEditorProps {
  block: ButtonBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<ButtonBlock>) => void;
  onSelect: () => void;
}

export default function ButtonBlockEditor({
  block,
  isSelected,
  onUpdate,
  onSelect,
}: ButtonBlockEditorProps) {
  const variantClasses = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
  };

  return (
    <div
      className="w-full"
      onClick={onSelect}
    >
      {/* Preview */}
      <div className="mb-4">
        <a
          href={block.data.url || "#"}
          className={`inline-block px-6 py-2 rounded-md font-medium transition-colors ${
            variantClasses[block.data.variant || "primary"]
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {block.data.text || "Button"}
        </a>
      </div>

      {/* Editor - only show when selected */}
      {isSelected && (
        <div className="space-y-3 border-t pt-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2">
            <Label htmlFor={`button-text-${block.id}`}>Button Text</Label>
            <Input
              id={`button-text-${block.id}`}
              value={block.data.text || ""}
              onChange={(e) =>
                onUpdate({
                  data: {
                    ...block.data,
                    text: e.target.value,
                  },
                })
              }
              placeholder="Click me"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`button-url-${block.id}`}>URL</Label>
            <Input
              id={`button-url-${block.id}`}
              type="url"
              value={block.data.url || ""}
              onChange={(e) =>
                onUpdate({
                  data: {
                    ...block.data,
                    url: e.target.value,
                  },
                })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`button-variant-${block.id}`}>Style</Label>
            <Select
              value={block.data.variant || "primary"}
              onValueChange={(value: "primary" | "secondary") =>
                onUpdate({
                  data: {
                    ...block.data,
                    variant: value,
                  },
                })
              }
            >
              <SelectTrigger id={`button-variant-${block.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

