"use client";

import { CodeBlock } from "../types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CodeBlockEditorProps {
  block: CodeBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<CodeBlock>) => void;
  onSelect: () => void;
}

export default function CodeBlockEditor({
  block,
  isSelected,
  onUpdate,
  onSelect,
}: CodeBlockEditorProps) {
  const isInline = block.data.inline || false;
  const code = block.data.code || "";
  const language = block.data.language || "";

  return (
    <div
      className="w-full"
      onClick={onSelect}
    >
      {isInline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
          {code || "inline code"}
        </code>
      ) : (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
          <code className="text-sm font-mono">{code || "// Code block"}</code>
        </pre>
      )}

      {/* Editor - only show when selected */}
      {isSelected && (
        <div className="mt-4 space-y-3 border-t pt-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2">
            <Label htmlFor={`code-content-${block.id}`}>Code</Label>
            <Textarea
              id={`code-content-${block.id}`}
              value={code}
              onChange={(e) =>
                onUpdate({
                  data: {
                    ...block.data,
                    code: e.target.value,
                  },
                })
              }
              placeholder="Enter code..."
              rows={isInline ? 2 : 10}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`code-language-${block.id}`}>Language (optional)</Label>
              <Input
                id={`code-language-${block.id}`}
                value={language}
                onChange={(e) =>
                  onUpdate({
                    data: {
                      ...block.data,
                      language: e.target.value,
                    },
                  })
                }
                placeholder="javascript, python, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`code-inline-${block.id}`}>Type</Label>
              <Select
                value={isInline ? "inline" : "block"}
                onValueChange={(value) =>
                  onUpdate({
                    data: {
                      ...block.data,
                      inline: value === "inline",
                    },
                  })
                }
              >
                <SelectTrigger id={`code-inline-${block.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="block">Code Block</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

