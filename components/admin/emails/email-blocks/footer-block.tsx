"use client";

import React from "react";
import { FooterBlockProps } from "@/lib/types/email";

interface FooterBlockComponentProps {
  block: {
    id: string;
    type: "footer";
    props: FooterBlockProps;
    styles?: Record<string, string>;
    commonStyles?: any;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: FooterBlockProps) => void;
  isPreview?: boolean;
}

export default function FooterBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: FooterBlockComponentProps) {
  const {
    companyName = "AlgoGI",
    address = "",
    phone = "",
    email = "contact@algogi.com",
    unsubscribeText = "Unsubscribe",
    unsubscribeUrl = "#",
    socialLinks = [],
    copyrightText = "© 2024 AlgoGI. All rights reserved.",
    backgroundColor = "#f5f5f5",
    textColor = "#666666",
    fontSize = "12px",
  } = block.props;

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    padding: "30px 20px",
    textAlign: "center",
    fontSize,
    color: textColor,
    ...block.styles,
  };

  const linkStyle: React.CSSProperties = {
    color: textColor,
    textDecoration: "underline",
    margin: "0 5px",
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        {companyName && <div style={{ fontWeight: "bold", marginBottom: "10px" }}>{companyName}</div>}
        {address && <div style={{ marginBottom: "5px" }}>{address}</div>}
        {phone && <div style={{ marginBottom: "5px" }}>{phone}</div>}
        {email && (
          <div style={{ marginBottom: "10px" }}>
            <a href={`mailto:${email}`} style={linkStyle}>
              {email}
            </a>
          </div>
        )}
        {socialLinks.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} style={{ ...linkStyle, margin: "0 5px" }} target="_blank" rel="noopener noreferrer">
                {link.platform}
              </a>
            ))}
          </div>
        )}
        {unsubscribeText && (
          <div style={{ marginTop: "15px", marginBottom: "10px" }}>
            <a href={unsubscribeUrl} style={linkStyle}>
              {unsubscribeText}
            </a>
          </div>
        )}
        {copyrightText && <div style={{ marginTop: "10px", fontSize: "11px", opacity: 0.8 }}>{copyrightText}</div>}
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
      {companyName && <div style={{ fontWeight: "bold", marginBottom: "10px" }}>{companyName}</div>}
      {address && <div style={{ marginBottom: "5px" }}>{address}</div>}
      {phone && <div style={{ marginBottom: "5px" }}>{phone}</div>}
      {email && (
        <div style={{ marginBottom: "10px" }}>
          <a href={`mailto:${email}`} style={linkStyle}>
            {email}
          </a>
        </div>
      )}
      {socialLinks.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          {socialLinks.map((link, index) => (
            <a key={index} href={link.url} style={{ ...linkStyle, margin: "0 5px" }} target="_blank" rel="noopener noreferrer">
              {link.platform}
            </a>
          ))}
        </div>
      )}
      {copyrightText && <div style={{ marginTop: "10px", fontSize: "11px", opacity: 0.8 }}>{copyrightText}</div>}
    </div>
  );
}

