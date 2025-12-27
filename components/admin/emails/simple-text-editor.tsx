"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Strikethrough } from "lucide-react";

interface SimpleTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Minimal contentEditable editor with basic formatting buttons
export default function SimpleTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
}: SimpleTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external value into the editor when it changes
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const runCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false);
    handleInput();
  };

  return (
    <div className="border border-neon-blue/20 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 bg-dark-card/80 border-b border-neon-blue/20 px-2 py-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("bold")} title="Bold">
          <Bold className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("italic")} title="Italic">
          <Italic className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("underline")} title="Underline">
          <Underline className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => runCommand("strikeThrough")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[180px] p-3 bg-dark-card text-white text-sm outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

