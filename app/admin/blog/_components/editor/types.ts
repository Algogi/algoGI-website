/**
 * Type definitions for the block-based blog editor
 */

import { JSONContent } from "@tiptap/core";

export type BlockType =
  | "paragraph"
  | "image"
  | "button"
  | "columns"
  | "code";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: "paragraph";
  data: {
    content: JSONContent; // TipTap JSON format for rich text (can contain headings)
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  data: {
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  data: {
    text: string;
    url: string;
    variant?: "primary" | "secondary";
  };
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  data: {
    columnCount: 2 | 3 | 4;
    gap?: number;
    columns: Block[][]; // Array of arrays - blocks per column
  };
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  data: {
    code: string;
    language?: string;
    inline?: boolean; // true for inline code, false for code block
  };
}

export type Block = TextBlock | ImageBlock | ButtonBlock | ColumnsBlock | CodeBlock;

export interface EditorContent {
  version: "1.0";
  blocks: Block[];
}

