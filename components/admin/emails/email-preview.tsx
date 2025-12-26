"use client";

import React, { useState } from "react";
import { EmailBlock } from "@/lib/types/email";
import BlockRenderer from "./block-renderer";
import { Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPreviewProps {
  blocks: EmailBlock[];
  subject?: string;
  onSendTest?: (email: string) => void;
}

export default function EmailPreview({ blocks, subject, onSendTest }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState("");

  const containerStyle: React.CSSProperties =
    viewMode === "desktop"
      ? {
          width: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          minHeight: "400px",
        }
      : {
          width: "320px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          minHeight: "400px",
        };

  return (
    <div className="p-4 bg-dark-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg overflow-auto" style={{ maxHeight: "600px" }}>
        <div style={containerStyle} className="shadow-lg">
          {subject && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Subject:</div>
              <div className="font-semibold text-gray-900">{subject}</div>
            </div>
          )}
          <div className="p-4">
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No content to preview
              </div>
            ) : (
              blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} isPreview={true} />
              ))
            )}
          </div>
        </div>
      </div>

      {onSendTest && (
        <div className="mt-4 p-4 bg-dark-card rounded-lg">
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 px-3 py-2 bg-dark-surface border border-neon-blue/20 rounded-md text-white"
            />
            <Button
              onClick={() => {
                if (testEmail) {
                  onSendTest(testEmail);
                  setTestEmail("");
                }
              }}
              disabled={!testEmail}
              className="bg-neon-blue hover:bg-neon-blue/80"
            >
              Send Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

