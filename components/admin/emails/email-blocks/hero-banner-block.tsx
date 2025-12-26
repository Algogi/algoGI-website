"use client";

import React from "react";
import { HeroBannerBlockProps } from "@/lib/types/email";
import MediaSelector from "@/components/admin/media-selector";
import { replacePersonalizationTags } from "@/lib/email/personalization";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface HeroBannerBlockComponentProps {
  block: {
    id: string;
    type: "hero-banner";
    props: HeroBannerBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: HeroBannerBlockProps) => void;
  isPreview?: boolean;
}

export default function HeroBannerBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: HeroBannerBlockComponentProps) {
  const [showImageSelector, setShowImageSelector] = React.useState(false);
  const {
    imageUrl = "",
    heading = "Hero Heading",
    subheading = "",
    ctaText = "Call to Action",
    ctaLink = "#",
    overlayOpacity = 0.4,
    textColor = "#ffffff",
    headingSize = "32px",
    subheadingSize = "18px",
    align = "center",
    height = "400px",
  } = block.props;

  const handleImageSelect = (url: string) => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        imageUrl: url,
      });
    }
    setShowImageSelector(false);
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height,
    backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
    backgroundColor: imageUrl ? "transparent" : "#e0e0e0",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
    padding: "40px 20px",
    textAlign: align,
    ...block.styles,
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
    zIndex: 1,
  };

  const contentStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    color: textColor,
    maxWidth: "600px",
    width: "100%",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: headingSize,
    fontWeight: "bold",
    marginBottom: subheading ? "10px" : "20px",
    color: textColor,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: subheadingSize,
    marginBottom: "20px",
    color: textColor,
    opacity: 0.9,
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#4a3aff",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "16px",
  };

  if (isPreview) {
    const personalizedHeading = replacePersonalizationTags(heading);
    const personalizedSubheading = replacePersonalizationTags(subheading);
    const personalizedCtaText = replacePersonalizationTags(ctaText);
    return (
      <div style={containerStyle}>
        <div style={overlayStyle} />
        <div style={contentStyle}>
          <h1 style={headingStyle}>{personalizedHeading}</h1>
          {subheading && <p style={subheadingStyle}>{personalizedSubheading}</p>}
          <a href={ctaLink} style={buttonStyle}>
            {personalizedCtaText}
          </a>
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
        {imageUrl ? (
          <>
            <div style={overlayStyle} />
            <div style={contentStyle}>
              <h1 style={headingStyle}>{heading}</h1>
              {subheading && <p style={subheadingStyle}>{subheading}</p>}
              <a href={ctaLink} style={buttonStyle}>
                {ctaText}
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400 mb-2">No image selected</p>
            {isSelected && onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageSelector(true);
                }}
              >
                Select Image
              </Button>
            )}
          </div>
        )}
      </div>
      {showImageSelector && (
        <MediaSelector
          value={imageUrl}
          onChange={handleImageSelect}
          folder="images"
          label="Select Hero Image"
        />
      )}
    </>
  );
}

