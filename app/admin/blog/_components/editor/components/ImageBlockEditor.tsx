"use client";

import { useState, useRef } from "react";
import { ImageBlock } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import ImageGallerySelector from "@/components/admin/image-gallery-selector";

interface ImageBlockEditorProps {
  block: ImageBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<ImageBlock>) => void;
  onSelect: () => void;
  onImageUpload?: (file: File) => Promise<{ url: string }>;
}

export default function ImageBlockEditor({
  block,
  isSelected,
  onUpdate,
  onSelect,
  onImageUpload,
}: ImageBlockEditorProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!onImageUpload) {
      setError("Image upload handler not provided");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await onImageUpload(file);
      onUpdate({
        data: {
          ...block.data,
          src: result.url,
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGallerySelect = (url: string) => {
    onUpdate({
      data: {
        ...block.data,
        src: url,
      },
    });
    setShowGallery(false);
  };

  const handleRemove = () => {
    onUpdate({
      data: {
        ...block.data,
        src: "",
        alt: "",
        caption: "",
      },
    });
  };

  return (
    <div
      className="w-full"
      onClick={onSelect}
    >
      {block.data.src ? (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={block.data.src}
              alt={block.data.alt || "Image"}
              className="max-w-full h-auto rounded"
              style={{
                maxHeight: "400px",
                width: block.data.width ? `${block.data.width}px` : "auto",
                height: block.data.height ? `${block.data.height}px` : "auto",
              }}
            />
            {isSelected && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Image Details - only show when selected */}
          {isSelected && (
            <div className="space-y-3 border-t pt-3">
              <div className="space-y-2">
                <Label htmlFor={`image-alt-${block.id}`}>Alt Text</Label>
                <Input
                  id={`image-alt-${block.id}`}
                  value={block.data.alt || ""}
                  onChange={(e) =>
                    onUpdate({
                      data: {
                        ...block.data,
                        alt: e.target.value,
                      },
                    })
                  }
                  placeholder="Describe the image for accessibility"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`image-caption-${block.id}`}>Caption (optional)</Label>
                <Textarea
                  id={`image-caption-${block.id}`}
                  value={block.data.caption || ""}
                  onChange={(e) =>
                    onUpdate({
                      data: {
                        ...block.data,
                        caption: e.target.value,
                      },
                    })
                  }
                  placeholder="Image caption"
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`image-width-${block.id}`}>Width (px)</Label>
                  <Input
                    id={`image-width-${block.id}`}
                    type="number"
                    value={block.data.width || ""}
                    onChange={(e) =>
                      onUpdate({
                        data: {
                          ...block.data,
                          width: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="Auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`image-height-${block.id}`}>Height (px)</Label>
                  <Input
                    id={`image-height-${block.id}`}
                    type="number"
                    value={block.data.height || ""}
                    onChange={(e) =>
                      onUpdate({
                        data: {
                          ...block.data,
                          height: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="Auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upload Options */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Uploading image...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload an image or select from gallery
                  </p>
                  <div className="flex gap-2 justify-center">
                    {onImageUpload && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGallery(true);
                      }}
                    >
                      Select from Gallery
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Image Gallery Selector */}
      <ImageGallerySelector
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleGallerySelect}
      />
    </div>
  );
}

