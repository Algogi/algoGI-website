"use client";

import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PersonalizationTagButton from "./personalization-tag-button";

interface PersonalizedTextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  type?: "input" | "textarea";
  rows?: number;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}

export default function PersonalizedTextInput({
  value,
  onChange,
  label,
  type = "input",
  rows = 5,
  placeholder,
  className,
  ...props
}: PersonalizedTextInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleInsertTag = (tag: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = value.slice(0, start) + tag + value.slice(end);
    
    onChange(newValue);
    
    // Set cursor position after inserted tag
    setTimeout(() => {
      input.focus();
      const newCursorPos = start + tag.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const InputComponent = type === "textarea" ? Textarea : Input;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white">{label}</label>
          <PersonalizationTagButton onInsert={handleInsertTag} />
        </div>
      )}
      {!label && (
        <div className="flex justify-end">
          <PersonalizationTagButton onInsert={handleInsertTag} />
        </div>
      )}
      <InputComponent
        ref={inputRef as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={type === "textarea" ? rows : undefined}
        {...props}
      />
    </div>
  );
}

