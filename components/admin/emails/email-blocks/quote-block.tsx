"use client";

import React from "react";
import { QuoteBlockProps } from "@/lib/types/email";
import MediaSelector from "@/components/admin/media-selector";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface QuoteBlockComponentProps {
  block: {
    id: string;
    type: "quote";
    props: QuoteBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: QuoteBlockProps) => void;
  isPreview?: boolean;
}

export default function QuoteBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: QuoteBlockComponentProps) {
  const [showAvatarSelector, setShowAvatarSelector] = React.useState(false);
  const {
    quote = "This is a testimonial quote from a satisfied customer.",
    author = "John Doe",
    authorTitle = "Customer",
    avatarUrl = "",
    backgroundColor = "#f5f5f5",
    textColor = "#333333",
    borderColor = "#4a3aff",
    align = "left",
  } = block.props;

  const handleAvatarSelect = (url: string) => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        avatarUrl: url,
      });
    }
    setShowAvatarSelector(false);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    padding: "30px",
    borderLeft: `4px solid ${borderColor}`,
    margin: "20px 0",
    ...block.styles,
  };

  const quoteStyle: React.CSSProperties = {
    fontSize: "18px",
    fontStyle: "italic",
    color: textColor,
    marginBottom: "15px",
    lineHeight: "1.6",
  };

  const authorStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
    color: textColor,
    marginBottom: authorTitle ? "5px" : "0",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "14px",
    color: textColor,
    opacity: 0.7,
  };

  const avatarStyle: React.CSSProperties = {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "15px",
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {avatarUrl && <img src={avatarUrl} alt={author} style={avatarStyle} />}
          <div style={{ flex: 1 }}>
            <p style={quoteStyle}>&ldquo;{quote}&rdquo;</p>
            <div style={{ textAlign: align }}>
              <div style={authorStyle}>{author}</div>
              {authorTitle && <div style={titleStyle}>{authorTitle}</div>}
            </div>
          </div>
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
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={author} style={avatarStyle} />
          ) : (
            isSelected && (
              <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-gray-200 dark:bg-gray-700 mr-4">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )
          )}
          <div style={{ flex: 1 }}>
            <p style={quoteStyle}>&ldquo;{quote}&rdquo;</p>
            <div style={{ textAlign: align }}>
              <div style={authorStyle}>{author}</div>
              {authorTitle && <div style={titleStyle}>{authorTitle}</div>}
            </div>
            {isSelected && !avatarUrl && onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAvatarSelector(true);
                }}
                className="mt-2"
              >
                Add Avatar
              </Button>
            )}
          </div>
        </div>
      </div>
      {showAvatarSelector && (
        <MediaSelector
          value={avatarUrl}
          onChange={handleAvatarSelect}
          folder="images"
          label="Select Avatar"
        />
      )}
    </>
  );
}

