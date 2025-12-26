"use client";

import React from "react";
import { ImageGalleryBlockProps, ImageGalleryItem } from "@/lib/types/email";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import ImageGallerySelector from "@/components/admin/image-gallery-selector";

interface ImageGalleryBlockComponentProps {
  block: {
    id: string;
    type: "image-gallery";
    props: ImageGalleryBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: ImageGalleryBlockProps) => void;
  isPreview?: boolean;
}

export default function ImageGalleryBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: ImageGalleryBlockComponentProps) {
  const [showImageSelector, setShowImageSelector] = React.useState<number | null>(null);
  const {
    images = [
      { src: "", alt: "Image 1", caption: "" },
      { src: "", alt: "Image 2", caption: "" },
    ],
    columns = 2,
    spacing = "10px",
    imageWidth = "100%",
    showCaptions = false,
  } = block.props;

  const handleAddImage = () => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        images: [...images, { src: "", alt: `Image ${images.length + 1}`, caption: "" }],
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    if (onUpdate && images.length > 1) {
      onUpdate({
        ...block.props,
        images: images.filter((_, i) => i !== index),
      });
    }
  };

  const handleImageSelect = (url: string) => {
    if (onUpdate && showImageSelector !== null) {
      const newImages = [...images];
      newImages[showImageSelector] = { ...newImages[showImageSelector], src: url };
      onUpdate({
        ...block.props,
        images: newImages,
      });
    }
    setShowImageSelector(null);
  };

  const handleImageChange = (index: number, field: keyof ImageGalleryItem, value: string) => {
    if (onUpdate) {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      onUpdate({
        ...block.props,
        images: newImages,
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    ...block.styles,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: spacing,
  };

  const imageStyle: React.CSSProperties = {
    width: imageWidth,
    height: "auto",
    maxWidth: "100%",
    display: "block",
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <div style={gridStyle}>
          {images.map((image, index) => (
            <div key={index}>
              {image.src ? (
                <>
                  {image.link ? (
                    <a href={image.link}>
                      <img src={image.src} alt={image.alt} style={imageStyle} />
                    </a>
                  ) : (
                    <img src={image.src} alt={image.alt} style={imageStyle} />
                  )}
                  {showCaptions && image.caption && (
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "5px", textAlign: "center" }}>
                      {image.caption}
                    </p>
                  )}
                </>
              ) : (
                <div style={{ ...imageStyle, backgroundColor: "#e0e0e0", minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#999" }}>Image {index + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
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
        style={containerStyle}
      >
        <div style={gridStyle}>
          {images.map((image, index) => (
            <div key={index} className="relative">
              {image.src ? (
                <>
                  {image.link ? (
                    <a href={image.link}>
                      <img src={image.src} alt={image.alt} style={imageStyle} />
                    </a>
                  ) : (
                    <img src={image.src} alt={image.alt} style={imageStyle} />
                  )}
                  {showCaptions && isSelected && onUpdate && (
                    <input
                      type="text"
                      value={image.caption || ""}
                      onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Caption"
                      className="w-full mt-2 text-xs bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-neon-blue focus:outline-none"
                    />
                  )}
                  {showCaptions && !isSelected && image.caption && (
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "5px", textAlign: "center" }}>
                      {image.caption}
                    </p>
                  )}
                </>
              ) : (
                <div
                  style={{ ...imageStyle, backgroundColor: "#e0e0e0", minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageSelector(index);
                  }}
                >
                  <span style={{ color: "#999" }}>Click to add image</span>
                </div>
              )}
              {isSelected && onUpdate && (
                <div className="absolute top-2 right-2 flex gap-1">
                  {!image.src && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageSelector(index);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  {images.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {isSelected && onUpdate && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddImage();
            }}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        )}
      </div>
      {showImageSelector !== null && (
        <ImageGallerySelector
          isOpen={showImageSelector !== null}
          onClose={() => setShowImageSelector(null)}
          onSelect={handleImageSelect}
        />
      )}
    </>
  );
}

