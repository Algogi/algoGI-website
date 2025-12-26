"use client";

import React from "react";
import { SocialLinksBlockProps, SocialLink } from "@/lib/types/email";
import { Button } from "@/components/ui/button";
import { Plus, X, Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from "lucide-react";

interface SocialLinksBlockComponentProps {
  block: {
    id: string;
    type: "social-links";
    props: SocialLinksBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: SocialLinksBlockProps) => void;
  isPreview?: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  github: <Github className="w-5 h-5" />,
};

export default function SocialLinksBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: SocialLinksBlockComponentProps) {
  const {
    links = [
      { platform: "facebook" as const, url: "https://facebook.com" },
      { platform: "twitter" as const, url: "https://twitter.com" },
    ],
    iconSize = "24px",
    iconColor = "#4a3aff",
    spacing = "15px",
    align = "center",
    layout = "horizontal",
  } = block.props;

  const handleAddLink = () => {
    if (onUpdate) {
      onUpdate({
        ...block.props,
        links: [...links, { platform: "facebook", url: "https://facebook.com" }],
      });
    }
  };

  const handleRemoveLink = (index: number) => {
    if (onUpdate && links.length > 1) {
      onUpdate({
        ...block.props,
        links: links.filter((_, i) => i !== index),
      });
    }
  };

  const handleLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    if (onUpdate) {
      const newLinks = [...links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      onUpdate({
        ...block.props,
        links: newLinks,
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    textAlign: align,
    padding: "20px",
    ...block.styles,
  };

  const listStyle: React.CSSProperties = {
    display: layout === "grid" ? "grid" : "flex",
    gridTemplateColumns: layout === "grid" ? "repeat(auto-fit, minmax(40px, 1fr))" : "none",
    gap: spacing,
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
    flexWrap: "wrap",
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const iconStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    color: iconColor,
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <ul style={listStyle}>
          {links.map((link, index) => (
            <li key={index}>
              <a href={link.url} style={iconStyle} target="_blank" rel="noopener noreferrer">
                {link.iconUrl ? (
                  <img src={link.iconUrl} alt={link.label || link.platform} style={iconStyle} />
                ) : (
                  platformIcons[link.platform] || <span>{link.platform}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`border-2 transition-colors ${
        isSelected
          ? "border-neon-blue bg-neon-blue/10"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      style={containerStyle}
    >
      <ul style={listStyle}>
        {links.map((link, index) => (
          <li key={index} className="relative">
            {link.iconUrl ? (
              <img src={link.iconUrl} alt={link.label || link.platform} style={iconStyle} />
            ) : (
              <div style={iconStyle}>{platformIcons[link.platform] || <span>{link.platform}</span>}</div>
            )}
            {isSelected && onUpdate && (
              <div className="absolute -top-2 -right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLink(index);
                  }}
                  className="h-4 w-4 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {isSelected && onUpdate && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddLink();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>
      )}
    </div>
  );
}

