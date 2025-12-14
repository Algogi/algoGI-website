"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Type, Image, MousePointerClick, Columns, Code } from "lucide-react";
import * as blockOps from "../state/blockOperations";
import { Block } from "../types";

interface BlockMenuProps {
  onAddBlock: (block: Block) => void;
}

export default function BlockMenu({ onAddBlock }: BlockMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Text</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createParagraphBlock())}
        >
          <Type className="w-4 h-4 mr-2" />
          Text Block
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Media & Layout</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createImageBlock())}
        >
          <Image className="w-4 h-4 mr-2" />
          Image
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createButtonBlock())}
        >
          <MousePointerClick className="w-4 h-4 mr-2" />
          Button / CTA
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createColumnsBlock(2))}
        >
          <Columns className="w-4 h-4 mr-2" />
          Columns (2)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createColumnsBlock(3))}
        >
          <Columns className="w-4 h-4 mr-2" />
          Columns (3)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createColumnsBlock(4))}
        >
          <Columns className="w-4 h-4 mr-2" />
          Columns (4)
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Code</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onAddBlock(blockOps.createCodeBlock())}
        >
          <Code className="w-4 h-4 mr-2" />
          Code Block
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

