"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Grid3x3,
  Columns,
} from "lucide-react";
import ImageGallerySelector from "./image-gallery-selector";
import { InputDialog } from "@/components/ui/input-dialog";
import { GridRow, GridColumn as GridColumnExtension } from "./extensions/grid-extension";
import { ResizableImage } from "./extensions/resizable-image";
import ImageResizeControls from "./image-resize-controls";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your content...",
}: RichTextEditorProps) {
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showLinkInputDialog, setShowLinkInputDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    node: any;
    pos: number;
  } | null>(null);
  const [showGridOverlay, setShowGridOverlay] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      GridRow,
      GridColumnExtension,
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-primary hover:underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: isMounted ? content : "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
        draggable: "true",
      },
      handleClick: (view, pos, event) => {
        const node = view.state.doc.nodeAt(pos);
        if (node && node.type.name === "resizableImage") {
          setSelectedImage({ node, pos });
        } else {
          // Check if clicking on an image element
          const target = event.target as HTMLElement;
          if (target.tagName === "IMG") {
            const imageNode = view.state.doc.nodeAt(pos);
            if (imageNode && imageNode.type.name === "resizableImage") {
              setSelectedImage({ node: imageNode, pos });
            }
          } else {
            setSelectedImage(null);
          }
        }
        return false;
      },
      handleDOMEvents: {
        drop: (view, event) => {
          const { state, dispatch } = view;
          const { selection } = state;
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (coordinates) {
            const { pos } = coordinates;
            // Allow TipTap to handle the drop
            return false;
          }
          return false;
        },
        dragstart: (view, event) => {
          // Enable dragging for images and content blocks
          return false;
        },
      },
    },
    immediatelyRender: false,
  }, [isMounted]);

  // Update editor content when it changes externally
  useEffect(() => {
    if (editor && isMounted && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor, isMounted]);

  // Track image selection
  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);

      if (node && node.type.name === "resizableImage") {
        setSelectedImage({ node, pos: selection.from });
      } else {
        // Check if selection is inside an image
        const $pos = editor.state.doc.resolve(selection.from);
        const imageNode = $pos.nodeAfter || $pos.nodeBefore;
        if (imageNode && imageNode.type.name === "resizableImage") {
          setSelectedImage({ node: imageNode, pos: selection.from });
        } else {
          setSelectedImage(null);
        }
      }
    };

    editor.on("selectionUpdate", updateSelection);
    editor.on("update", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("update", updateSelection);
    };
  }, [editor]);

  const handleImageSelect = (url: string) => {
    if (editor && url) {
      editor.chain().focus().setResizableImage({ src: url, alt: "", width: 400 }).run();
      setShowImageSelector(false);
    }
  };

  const handleInsertRow = () => {
    if (editor) {
      editor.chain().focus().insertGridRow().run();
    }
  };

  const handleInsertColumn = (span: number = 6) => {
    if (editor) {
      editor.chain().focus().insertGridColumn(span).run();
    }
  };

  const setLink = useCallback(() => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  const unsetLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-dark-surface p-2 h-12" />
        <div className="bg-white dark:bg-dark-card min-h-[400px] p-4">
          <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Grid Controls */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInsertRow}
          title="Insert Grid Row"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleInsertColumn(6)}
          title="Insert Column (6 span)"
        >
          <Columns className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={showGridOverlay ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowGridOverlay(!showGridOverlay)}
          title="Toggle Grid Overlay"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Links and Images */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive("link")) {
              unsetLink();
            } else {
              setShowLinkInputDialog(true);
            }
          }}
          className={editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageSelector(true)}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-dark-card min-h-[400px] max-h-[800px] overflow-y-auto relative">
        {showGridOverlay && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="grid grid-cols-12 h-full gap-4 px-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="border-l border-dashed border-blue-300 dark:border-blue-600 opacity-30"
                />
              ))}
            </div>
          </div>
        )}
        <EditorContent editor={editor} />
        {selectedImage && (
          <div className="absolute top-4 right-4 z-20">
            <ImageResizeControls
              width={selectedImage.node.attrs.width}
              height={selectedImage.node.attrs.height}
              align={selectedImage.node.attrs.align}
              aspectRatio={selectedImage.node.attrs.aspectRatio || false}
              onWidthChange={(width) => {
                if (editor) {
                  editor.chain().focus().setImageWidth(width).run();
                }
              }}
              onHeightChange={(height) => {
                if (editor) {
                  editor.chain().focus().setImageHeight(height).run();
                }
              }}
              onAlignChange={(align) => {
                if (editor) {
                  editor.chain().focus().setImageAlign(align).run();
                }
              }}
              onAspectRatioToggle={() => {
                if (editor && selectedImage) {
                  const current = selectedImage.node.attrs.aspectRatio || false;
                  editor.chain().focus().updateAttributes("resizableImage", {
                    aspectRatio: !current,
                  }).run();
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Image Gallery Selector */}
      <ImageGallerySelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={handleImageSelect}
      />

      {/* Link Input Dialog */}
      <InputDialog
        open={showLinkInputDialog}
        onOpenChange={setShowLinkInputDialog}
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
          }
        }}
      />
    </div>
  );
}
