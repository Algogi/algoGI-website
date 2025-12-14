"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import { JSONContent } from "@tiptap/core";
import { useEffect, useState, useRef } from "react";
import { TextBlock } from "../types";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Code as CodeIcon,
  Code2,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Type,
} from "lucide-react";
import { InputDialog } from "@/components/ui/input-dialog";
import ImageGallerySelector from "@/components/admin/image-gallery-selector";

interface TextBlockEditorProps {
  block: TextBlock;
  isSelected: boolean;
  onChange: (content: JSONContent) => void;
  onFocus?: () => void;
  onImageUpload?: (file: File) => Promise<{ url: string }>;
}

export default function TextBlockEditor({
  block,
  isSelected,
  onChange,
  onFocus,
  onImageUpload,
}: TextBlockEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: false, // We'll handle code blocks separately
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-primary hover:underline",
        },
      }),
      Underline,
      Code,
      CodeBlock,
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
    ],
    content: block.data.content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when block changes externally
  useEffect(() => {
    if (editor && block.data.content) {
      const currentContent = editor.getJSON();
      // Only update if content actually changed
      if (JSON.stringify(currentContent) !== JSON.stringify(block.data.content)) {
        editor.commands.setContent(block.data.content);
      }
    }
  }, [editor, block.data.content]);

  // Focus editor when block is selected
  useEffect(() => {
    if (editor && isSelected) {
      editor.commands.focus();
    }
  }, [editor, isSelected]);

  const handleSetLink = () => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const handleUnsetLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  };

  const handleImageSelect = (url: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
      setShowImageSelector(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setUploading(true);
    try {
      const result = await onImageUpload(file);
      if (editor && result.url) {
        editor.chain().focus().setImage({ src: result.url, alt: "" }).run();
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!editor) {
    return (
      <div className="min-h-[2rem] border border-gray-200 dark:border-gray-700 rounded p-2">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onClick={onFocus}
    >
      {/* Toolbar - only show when selected */}
      {isSelected && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 flex flex-wrap items-center gap-1">
          {/* Typography / Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive("paragraph") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Paragraph"
          >
            <Type className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor.isActive("heading", { level: 4 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Heading 4"
          >
            <Heading4 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Bold (Cmd+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Italic (Cmd+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Code */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Inline Code"
          >
            <CodeIcon className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Links */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editor.isActive("link")) {
                handleUnsetLink();
              } else {
                setShowLinkDialog(true);
              }
            }}
            className={editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Images */}
          {onImageUpload ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload Image"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageSelector(true)}
            title="Insert Image from Gallery"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      <InputDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        title="Add Link"
        description="Enter the URL for the link"
        label="URL"
        placeholder="https://example.com"
        type="url"
        confirmText="Add Link"
        cancelText="Cancel"
        onConfirm={(url) => {
          if (editor && url) {
            editor.chain().focus().setLink({ href: url }).run();
            setShowLinkDialog(false);
          }
        }}
      />

      {/* Image Gallery Selector */}
      <ImageGallerySelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
