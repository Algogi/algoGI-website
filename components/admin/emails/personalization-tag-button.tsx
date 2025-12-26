"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PersonalizationTagButtonProps {
  onInsert: (tag: string) => void;
  className?: string;
}

const availableTags = [
  { tag: "{{first_name}}", label: "First Name", description: "Contact's first name" },
  { tag: "{{last_name}}", label: "Last Name", description: "Contact's last name" },
  { tag: "{{full_name}}", label: "Full Name", description: "First + Last name" },
  { tag: "{{email}}", label: "Email", description: "Contact's email address" },
  { tag: "{{company}}", label: "Company", description: "Contact's company name" },
  { tag: "{{first_name|fallback:there}}", label: "First Name (with fallback)", description: "First name or 'there' if empty" },
];

export default function PersonalizationTagButton({ onInsert, className }: PersonalizationTagButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (tag: string) => {
    onInsert(tag);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <User className="w-4 h-4 mr-2" />
          Insert Tag
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {availableTags.map((item) => (
          <DropdownMenuItem
            key={item.tag}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(item.tag);
            }}
            className="flex flex-col items-start p-2 cursor-pointer"
          >
            <div className="font-medium text-sm">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1 font-mono">{item.tag}</div>
            <div className="text-xs text-gray-400 mt-1">{item.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

