"use client";

import React, { useState } from "react";
import { ImageBlockProps } from "@/lib/types/email";
import ImageGallerySelector from "@/components/admin/image-gallery-selector";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageBlockComponentProps {
  block: {
    id: string;
    type: "image";
    props: ImageBlockProps;
    styles?: Record<string, string>;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: ImageBlockProps) => void;
  isPreview?: boolean;
}

export default function ImageBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: ImageBlockComponentProps) {
  const [showGallery, setShowGallery] = useState(false);
  const {
    src = "",
    alt = "",
    link,
    width = "100%",
    height,
    align = "center",
    padding = "10px",
  } = block.props;

  const handleImageSelect = (url: string) => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        src: url,
      });
    }
    setShowGallery(false);
  };

  const style: React.CSSProperties = {
    textAlign: align,
    padding,
    ...block.styles,
  };

  const imgStyle: React.CSSProperties = {
    width,
    height: height || "auto",
    maxWidth: "100%",
    display: "block",
    margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0",
  };

  const imageElement = (
    <img
      src={src || "https://via.placeholder.com/600x300?text=Image"}
      alt={alt}
      style={imgStyle}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x300?text=Image";
      }}
    />
  );

  const content = link && !isPreview ? (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {imageElement}
    </a>
  ) : (
    imageElement
  );

  if (isPreview) {
    return <div style={style}>{content}</div>;
  }

  return (
    <>
      <div
        onClick={onSelect}
        className={`border-2 transition-colors ${
          isSelected
            ? "border-neon-blue bg-neon-blue/10"
            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        }`}
        style={style}
      >
        {src ? (
          content
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400 mb-2">No image selected</p>
            {isSelected && onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGallery(true);
                }}
              >
                Select Image
              </Button>
            )}
          </div>
        )}
      </div>
      {showGallery && (
        <ImageGallerySelector
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          onSelect={handleImageSelect}
        />
      )}
    </>
  );
}

