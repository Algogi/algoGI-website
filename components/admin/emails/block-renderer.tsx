"use client";

import React from "react";
import { EmailBlock } from "@/lib/types/email";
import TextBlock from "./email-blocks/text-block";
import ImageBlock from "./email-blocks/image-block";
import ButtonBlock from "./email-blocks/button-block";
import DividerBlock from "./email-blocks/divider-block";
import SpacerBlock from "./email-blocks/spacer-block";
import LinkBlock from "./email-blocks/link-block";
import HtmlBlock from "./email-blocks/html-block";
import HeroBannerBlock from "./email-blocks/hero-banner-block";
import GradientHeaderBlock from "./email-blocks/gradient-header-block";
import RichTextBlock from "./email-blocks/rich-text-block";
import QuoteBlock from "./email-blocks/quote-block";
import FeatureListBlock from "./email-blocks/feature-list-block";
import StatsRowBlock from "./email-blocks/stats-row-block";
import ImageGalleryBlock from "./email-blocks/image-gallery-block";
import PrimaryButtonBlock from "./email-blocks/primary-button-block";
import SecondaryButtonBlock from "./email-blocks/secondary-button-block";
import ButtonGroupBlock from "./email-blocks/button-group-block";
import SocialLinksBlock from "./email-blocks/social-links-block";
import FooterBlock from "./email-blocks/footer-block";
import ColumnsBlock from "./email-blocks/columns-block";

interface BlockRendererProps {
  block: EmailBlock;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: Record<string, any>) => void;
  isPreview?: boolean;
}

export default function BlockRenderer({
  block,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false,
}: BlockRendererProps) {
  const commonProps = {
    block: block as any,
    isSelected,
    onSelect,
    onUpdate: onUpdate as any,
    isPreview,
  };

  switch (block.type) {
    case "text":
      return <TextBlock {...commonProps} />;
    case "image":
      return <ImageBlock {...commonProps} />;
    case "button":
      return <ButtonBlock {...commonProps} />;
    case "divider":
      return <DividerBlock {...commonProps} />;
    case "spacer":
      return <SpacerBlock {...commonProps} />;
    case "link":
      return <LinkBlock {...commonProps} />;
    case "html":
      return <HtmlBlock {...commonProps} />;
    case "hero-banner":
      return <HeroBannerBlock {...commonProps} />;
    case "gradient-header":
      return <GradientHeaderBlock {...commonProps} />;
    case "rich-text":
      return <RichTextBlock {...commonProps} />;
    case "quote":
      return <QuoteBlock {...commonProps} />;
    case "feature-list":
      return <FeatureListBlock {...commonProps} />;
    case "stats-row":
      return <StatsRowBlock {...commonProps} />;
    case "image-gallery":
      return <ImageGalleryBlock {...commonProps} />;
    case "primary-button":
      return <PrimaryButtonBlock {...commonProps} />;
    case "secondary-button":
      return <SecondaryButtonBlock {...commonProps} />;
    case "button-group":
      return <ButtonGroupBlock {...commonProps} />;
    case "social-links":
      return <SocialLinksBlock {...commonProps} />;
    case "footer":
      return <FooterBlock {...commonProps} />;
    case "columns":
      return <ColumnsBlock {...commonProps} />;
    default:
      return <div className="p-4 text-gray-400">Unknown block type: {block.type}</div>;
  }
}

