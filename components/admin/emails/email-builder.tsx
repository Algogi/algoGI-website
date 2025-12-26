"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EmailBlock, EmailBlockType } from "@/lib/types/email";
import BlockPalette from "./block-palette";
import BlockRenderer from "./block-renderer";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailBuilderProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  onBlockSelect?: (blockId: string | null) => void;
  selectedBlockId?: string | null;
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className={`flex items-start gap-2 ${
          isSelected ? "ring-2 ring-neon-blue" : ""
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-neon-blue"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div 
          className="flex-1" 
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <BlockRenderer block={block} isSelected={isSelected} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function CanvasDropZone({ blocks, selectedBlockId, onBlockSelect, onDelete }: {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
  onBlockSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] p-4 bg-white dark:bg-dark-card border-2 border-dashed rounded-lg ${
        isOver ? "border-neon-blue bg-neon-blue/5" : "border-gray-300 dark:border-gray-700"
      }`}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">Drag blocks here to build your email</p>
            <p className="text-sm">Or click on a block in the palette to add it</p>
          </div>
        </div>
      ) : (
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onBlockSelect(block.id)}
                onDelete={() => onDelete(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

export default function EmailBuilder({
  blocks,
  onChange,
  onBlockSelect,
  selectedBlockId = null,
}: EmailBuilderProps) {
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<EmailBlock | null>(null);

  // Only render DndContext on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const createBlock = useCallback((type: EmailBlockType): EmailBlock => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultProps: Record<EmailBlockType, Record<string, any>> = {
      text: { text: "New text block" },
      image: { src: "", alt: "Image" },
      button: { text: "Button", link: "#" },
      divider: { color: "#eeeeee", thickness: "1px", style: "solid" },
      spacer: { height: "20px" },
      link: { text: "Link", url: "#" },
      html: { html: "" },
      "hero-banner": {
        imageUrl: "",
        heading: "Hero Heading",
        subheading: "",
        ctaText: "Call to Action",
        ctaLink: "#",
        overlayOpacity: 0.4,
        textColor: "#ffffff",
        headingSize: "32px",
        subheadingSize: "18px",
        align: "center",
        height: "400px",
      },
      "gradient-header": {
        text: "Gradient Header",
        gradientColors: ["#4a3aff", "#7c3aed"],
        fontSize: "32px",
        fontWeight: "bold",
        align: "center",
        padding: "40px 20px",
      },
      "rich-text": {
        content: "<p>Rich text content</p>",
        columns: 1,
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        color: "#333333",
        lineHeight: "1.6",
      },
      quote: {
        quote: "This is a testimonial quote from a satisfied customer.",
        author: "John Doe",
        authorTitle: "Customer",
        avatarUrl: "",
        backgroundColor: "#f5f5f5",
        textColor: "#333333",
        borderColor: "#4a3aff",
        align: "left",
      },
      "feature-list": {
        items: [{ text: "Feature item 1" }, { text: "Feature item 2" }],
        iconSize: "20px",
        iconColor: "#4a3aff",
        textColor: "#333333",
        fontSize: "16px",
        spacing: "15px",
      },
      "stats-row": {
        stats: [
          { value: "100+", label: "Customers" },
          { value: "50+", label: "Projects" },
          { value: "99%", label: "Satisfaction" },
        ],
        valueColor: "#4a3aff",
        labelColor: "#666666",
        valueSize: "32px",
        labelSize: "14px",
        backgroundColor: "#f5f5f5",
        columns: 3,
      },
      "image-gallery": {
        images: [
          { src: "", alt: "Image 1", caption: "" },
          { src: "", alt: "Image 2", caption: "" },
        ],
        columns: 2,
        spacing: "10px",
        imageWidth: "100%",
        showCaptions: false,
      },
      "primary-button": {
        text: "Button",
        link: "#",
        backgroundColor: "#4a3aff",
        textColor: "#ffffff",
        fontSize: "16px",
        padding: "12px 24px",
        borderRadius: "5px",
        glow: false,
        fullWidth: false,
        align: "center",
      },
      "secondary-button": {
        text: "Button",
        link: "#",
        borderColor: "#4a3aff",
        textColor: "#4a3aff",
        fontSize: "16px",
        padding: "12px 24px",
        borderRadius: "5px",
        align: "center",
      },
      "button-group": {
        buttons: [
          { text: "Button 1", link: "#", variant: "primary" },
          { text: "Button 2", link: "#", variant: "secondary" },
        ],
        spacing: "10px",
        align: "center",
      },
      "social-links": {
        links: [
          { platform: "facebook", url: "https://facebook.com" },
          { platform: "twitter", url: "https://twitter.com" },
        ],
        iconSize: "24px",
        iconColor: "#4a3aff",
        spacing: "15px",
        align: "center",
        layout: "horizontal",
      },
      footer: {
        companyName: "AlgoGI",
        address: "",
        phone: "",
        email: "contact@algogi.com",
        unsubscribeText: "Unsubscribe",
        unsubscribeUrl: "#",
        socialLinks: [],
        copyrightText: "© 2024 AlgoGI. All rights reserved.",
        backgroundColor: "#f5f5f5",
        textColor: "#666666",
        fontSize: "12px",
      },
      columns: {
        columns: 2,
        columnGap: "20px",
        backgroundColor: "",
        padding: "20px",
        nestedBlocks: [],
      },
    };

    return {
      id,
      type,
      props: defaultProps[type] || {},
    };
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    if (event.active.data.current?.fromLibrary) {
      const blockType = event.active.data.current.blockType as EmailBlockType;
      const newBlock = createBlock(blockType);
      setDraggedBlock(newBlock);
    } else {
      const block = blocks.find((b) => b.id === event.active.id);
      setDraggedBlock(block || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedBlock(null);

    if (!over) return;

    // If dropping from library
    if (active.data.current?.fromLibrary && active.data.current?.blockType) {
      const newBlock = createBlock(active.data.current.blockType as EmailBlockType);
      
      if (over.id === "canvas") {
        onChange([...blocks, newBlock]);
        onBlockSelect?.(newBlock.id);
      } else {
        // Insert at specific position
        const overIndex = blocks.findIndex((b) => b.id === over.id);
        if (overIndex >= 0) {
          const newBlocks = [...blocks];
          newBlocks.splice(overIndex, 0, newBlock);
          onChange(newBlocks);
          onBlockSelect?.(newBlock.id);
        } else {
          onChange([...blocks, newBlock]);
          onBlockSelect?.(newBlock.id);
        }
      }
      return;
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = [...blocks];
        const [removed] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, removed);
        onChange(newBlocks);
      }
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    onChange(blocks.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      onBlockSelect?.(null);
    }
  };

  // Render placeholder during SSR to avoid hydration mismatch
  // BlockPalette uses useDraggable which requires DndContext, so we render a simple placeholder
  if (!mounted) {
    return (
      <div className="flex h-full">
        {/* Block Palette Placeholder */}
        <div className="w-64 flex-shrink-0 bg-dark-surface border-r border-neon-blue/20">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Email Blocks</h3>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="min-h-[400px] p-4 bg-white dark:bg-dark-card border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Drag blocks here to build your email</p>
                  <p className="text-sm">Or click on a block in the palette to add it</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div key={block.id} className="relative">
                    <BlockRenderer block={block} isSelected={selectedBlockId === block.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full">
        {/* Block Palette */}
        <div className="w-64 flex-shrink-0">
          <BlockPalette />
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4">
          <CanvasDropZone
            blocks={blocks}
            selectedBlockId={selectedBlockId || null}
            onBlockSelect={onBlockSelect || (() => {})}
            onDelete={handleDeleteBlock}
          />
        </div>
      </div>

      <DragOverlay>
        {draggedBlock ? (
          <div className="opacity-50">
            <BlockRenderer block={draggedBlock} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

