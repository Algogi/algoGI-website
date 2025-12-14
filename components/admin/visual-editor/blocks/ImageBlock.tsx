"use client";

import React, { useState } from "react";
import { ImageBlock as ImageBlockType } from "@/lib/editor/blocks/types";
import ImageGallerySelector from "@/components/admin/image-gallery-selector";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

interface ImageBlockProps {
  block: ImageBlockType;
  isSelected: boolean;
  onUpdate: (updates: Partial<ImageBlockType>) => void;
}

export default function ImageBlock({ block, isSelected, onUpdate }: ImageBlockProps) {
  const [showGallery, setShowGallery] = useState(false);
  const { src, alt, width, height, aspectRatio } = block.data;
  const align = block.style?.align || "center";

  const handleImageSelect = (url: string) => {
    onUpdate({
      data: { ...block.data, src: url },
    });
    setShowGallery(false);
  };

  const handleResize = (e: any, { size }: { size: { width: number; height: number } }) => {
    const newData = { ...block.data, width: size.width };
    if (!aspectRatio && height) {
      newData.height = size.height;
    } else if (aspectRatio && height && width) {
      // Maintain aspect ratio
      const ratio = height / width;
      newData.height = Math.round(size.width * ratio);
    }
    onUpdate({ data: newData });
  };

  if (!src) {
    return (
      <>
        <div
          className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer ${
            isSelected ? "ring-2 ring-brand-primary" : ""
          }`}
          onClick={() => setShowGallery(true)}
        >
          <p className="text-gray-500 dark:text-gray-400">Click to add image</p>
        </div>
        <ImageGallerySelector
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          onSelect={handleImageSelect}
        />
      </>
    );
  }

  const imageStyle: React.CSSProperties = {
    width: width || "auto",
    height: aspectRatio && height ? "auto" : height || "auto",
    maxWidth: "100%",
    display: align === "center" ? "block" : align === "full" ? "block" : "inline-block",
    margin: align === "center" ? "0 auto" : align === "full" ? "0" : undefined,
    float: align === "left" ? "left" : align === "right" ? "right" : undefined,
  };

  const imageElement = (
    <img
      src={src}
      alt={alt || ""}
      style={imageStyle}
      className={`rounded-lg ${isSelected ? "ring-2 ring-brand-primary" : ""}`}
      onClick={() => setShowGallery(true)}
    />
  );

  if (isSelected) {
    const currentWidth = width || 800;
    const currentHeight = height || (aspectRatio && width ? Math.round((width * 9) / 16) : 600);
    
    return (
      <>
        <div className="inline-block" style={{ display: align === "center" ? "block" : align === "full" ? "block" : "inline-block" }}>
          <Resizable
            width={currentWidth}
            height={currentHeight}
            onResize={handleResize}
            lockAspectRatio={aspectRatio}
            minConstraints={[100, 100]}
            maxConstraints={[2000, 2000]}
          >
            <div style={{ width: currentWidth, height: "auto", position: "relative" }}>
              {imageElement}
            </div>
          </Resizable>
        </div>
        <ImageGallerySelector
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          onSelect={handleImageSelect}
        />
      </>
    );
  }

  return imageElement;
}

