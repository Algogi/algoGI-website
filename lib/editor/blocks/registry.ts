/**
 * Block registry - defines available blocks and their configurations
 */

import { BlockType, Block } from "./types";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: "text" | "media" | "layout" | "components";
  defaultData: Record<string, any>;
  defaultStyle?: Record<string, any>;
  create: () => Block;
}

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  heading: {
    type: "heading",
    label: "Heading",
    icon: "H",
    category: "text",
    defaultData: { level: 1, text: "Heading" },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "heading",
      data: { level: 1, text: "Heading" },
    }),
  },
  paragraph: {
    type: "paragraph",
    label: "Paragraph",
    icon: "P",
    category: "text",
    defaultData: { text: "Start typing..." },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "paragraph",
      data: { text: "Start typing..." },
    }),
  },
  image: {
    type: "image",
    label: "Image",
    icon: "🖼️",
    category: "media",
    defaultData: { src: "", alt: "", width: 800, aspectRatio: true },
    defaultStyle: { align: "center" },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "image",
      data: { src: "", alt: "", width: 800, aspectRatio: true },
      style: { align: "center" },
    }),
  },
  columns: {
    type: "columns",
    label: "Columns",
    icon: "📐",
    category: "layout",
    defaultData: { columns: 2, gap: 16, children: [[], []] },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "columns",
      data: { columns: 2, gap: 16, children: [[], []] as any },
    }),
  },
  button: {
    type: "button",
    label: "Button",
    icon: "🔘",
    category: "components",
    defaultData: { text: "Click me", url: "#", variant: "primary" },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "button",
      data: { text: "Click me", url: "#", variant: "primary" },
    }),
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    icon: "↕️",
    category: "layout",
    defaultData: { height: 40 },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "spacer",
      data: { height: 40 },
    }),
  },
  divider: {
    type: "divider",
    label: "Divider",
    icon: "➖",
    category: "layout",
    defaultData: { style: "solid", color: "#e5e7eb" },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "divider",
      data: { style: "solid", color: "#e5e7eb" },
    }),
  },
  list: {
    type: "list",
    label: "List",
    icon: "•",
    category: "text",
    defaultData: { items: ["Item 1", "Item 2"], ordered: false },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "list",
      data: { items: ["Item 1", "Item 2"], ordered: false },
    }),
  },
  quote: {
    type: "quote",
    label: "Quote",
    icon: "❝",
    category: "text",
    defaultData: { text: "Quote text", author: "" },
    create: () => ({
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "quote",
      data: { text: "Quote text", author: "" },
    }),
  },
};

export function getBlockDefinition(type: BlockType): BlockDefinition {
  return blockRegistry[type];
}

export function createBlock(type: BlockType): Block {
  return blockRegistry[type].create();
}

export function getBlocksByCategory(category: BlockDefinition["category"]): BlockDefinition[] {
  return Object.values(blockRegistry).filter((def) => def.category === category);
}

