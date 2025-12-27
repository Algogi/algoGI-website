"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  GripVertical,
  Type,
  Image,
  MousePointerClick,
  Minus,
  Space,
  Code,
  Link,
  Layout,
  Sparkles,
  Quote,
  List,
  BarChart3,
  ImageIcon,
  Square,
  Users,
  Mail,
  Columns as ColumnsIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { EmailBlockType } from "@/lib/types/email";

interface BlockPaletteProps {
  onAddBlock?: (blockType: EmailBlockType) => void;
}

interface BlockDefinition {
  type: EmailBlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: string;
}

const blockDefinitions: BlockDefinition[] = [
  // Hero & Headers
  {
    type: "hero-banner",
    label: "Hero Banner",
    icon: <Layout className="w-4 h-4" />,
    description: "Image + H1 + CTA button",
    category: "Hero & Headers",
  },
  {
    type: "gradient-header",
    label: "Gradient Header",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Text overlay on gradient",
    category: "Hero & Headers",
  },
  // Text & Content
  {
    type: "text",
    label: "Text",
    icon: <Type className="w-4 h-4" />,
    description: "Add formatted text content",
    category: "Text & Content",
  },
  {
    type: "quote",
    label: "Quote Block",
    icon: <Quote className="w-4 h-4" />,
    description: "Testimonial with avatar",
    category: "Text & Content",
  },
  {
    type: "feature-list",
    label: "Feature List",
    icon: <List className="w-4 h-4" />,
    description: "Icon bullets",
    category: "Text & Content",
  },
  {
    type: "stats-row",
    label: "Stats Row",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "3-6 KPI numbers",
    category: "Text & Content",
  },
  {
    type: "divider",
    label: "Divider",
    icon: <Minus className="w-4 h-4" />,
    description: "Line, dots, festive patterns",
    category: "Text & Content",
  },
  // Images & Media
  {
    type: "image",
    label: "Single Image",
    icon: <Image className="w-4 h-4" />,
    description: "With caption/link",
    category: "Images & Media",
  },
  {
    type: "image-gallery",
    label: "Image Gallery",
    icon: <ImageIcon className="w-4 h-4" />,
    description: "1/2/3/4 columns",
    category: "Images & Media",
  },
  // CTA & Conversion
  {
    type: "button",
    label: "Button",
    icon: <MousePointerClick className="w-4 h-4" />,
    description: "Add a call-to-action button",
    category: "CTA & Conversion",
  },
  {
    type: "primary-button",
    label: "Primary Button",
    icon: <Square className="w-4 h-4" />,
    description: "Gradient, glow, full-width",
    category: "CTA & Conversion",
  },
  {
    type: "secondary-button",
    label: "Secondary Button",
    icon: <Square className="w-4 h-4" />,
    description: "Outline, subtle",
    category: "CTA & Conversion",
  },
  {
    type: "button-group",
    label: "Button Group",
    icon: <Square className="w-4 h-4" />,
    description: "2-3 buttons side-by-side",
    category: "CTA & Conversion",
  },
  // Social & Trust
  {
    type: "social-links",
    label: "Social Links",
    icon: <Users className="w-4 h-4" />,
    description: "Icon grid",
    category: "Social & Trust",
  },
  {
    type: "footer",
    label: "Footer",
    icon: <Mail className="w-4 h-4" />,
    description: "Unsubscribe, address, links",
    category: "Social & Trust",
  },
  // Utility
  {
    type: "spacer",
    label: "Spacer",
    icon: <Space className="w-4 h-4" />,
    description: "Vertical padding",
    category: "Utility",
  },
  {
    type: "columns",
    label: "Columns",
    icon: <ColumnsIcon className="w-4 h-4" />,
    description: "1/2/3/4 column layout",
    category: "Utility",
  },
  {
    type: "link",
    label: "Link",
    icon: <Link className="w-4 h-4" />,
    description: "Add a text link",
    category: "Utility",
  },
  {
    type: "html",
    label: "Raw HTML",
    icon: <Code className="w-4 h-4" />,
    description: "Advanced users",
    category: "Utility",
  },
];

function DraggableBlockItem({ block }: { block: BlockDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${block.type}`,
    data: {
      blockType: block.type,
      fromLibrary: true,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-card cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <div className="text-gray-600 dark:text-gray-400">{block.icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{block.label}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{block.description}</div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, blocks }: { category: string; blocks: BlockDefinition[] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <span>{category}</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="space-y-1 pl-2">
          {blocks.map((block) => (
            <DraggableBlockItem key={block.type} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  const categories = Array.from(new Set(blockDefinitions.map((b) => b.category)));

  return (
    <div className="h-full overflow-y-auto bg-dark-surface border-r border-neon-blue/20">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Email Blocks</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              blocks={blockDefinitions.filter((b) => b.category === category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

