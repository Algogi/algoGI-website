/**
 * Block type definitions for the visual page builder
 */

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "columns"
  | "button"
  | "spacer"
  | "divider"
  | "list"
  | "quote";

export interface BlockStyle {
  width?: number;
  height?: number;
  align?: "left" | "center" | "right" | "full";
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  backgroundColor?: string;
  textColor?: string;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  style?: BlockStyle;
  columnSpan?: number; // For column blocks (1-12)
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  data: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
  };
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  data: {
    text: string;
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
    aspectRatio?: boolean;
  };
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  data: {
    columns: number; // 2, 3, or 4 columns
    gap?: number;
    children: Block[][]; // Array of arrays - blocks within each column
  };
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  data: {
    text: string;
    url: string;
    variant?: "primary" | "secondary" | "outline";
  };
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  data: {
    height: number;
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  data: {
    style?: "solid" | "dashed" | "dotted";
    color?: string;
  };
}

export interface ListBlock extends BaseBlock {
  type: "list";
  data: {
    items: string[];
    ordered: boolean;
  };
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  data: {
    text: string;
    author?: string;
  };
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | ColumnsBlock
  | ButtonBlock
  | SpacerBlock
  | DividerBlock
  | ListBlock
  | QuoteBlock;

export interface EditorContent {
  version: string;
  blocks: Block[];
}

