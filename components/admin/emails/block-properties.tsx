"use client";

import React from "react";
import { EmailBlock } from "@/lib/types/email";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import MediaSelector from "@/components/admin/media-selector";
import PersonalizedTextInput from "./personalized-text-input";
import SimpleTextEditor from "./simple-text-editor";

interface BlockPropertiesProps {
  block: EmailBlock | null;
  onUpdate: (block: EmailBlock) => void;
  onClose: () => void;
}

export default function BlockProperties({ block, onUpdate, onClose }: BlockPropertiesProps) {
  if (!block) {
    return (
      <div className="w-80 p-4 bg-dark-surface border-l border-neon-blue/20">
        <div className="text-center text-gray-400 py-8">
          <p>Select a block to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    onUpdate({
      ...block,
      props: {
        ...block.props,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 p-4 bg-dark-surface border-l border-neon-blue/20 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Block Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {block.type === "text" && (
          <>
            <div className="space-y-1">
              <Label className="text-white">Text Content</Label>
              <SimpleTextEditor
                value={block.props.text || ""}
                onChange={(html) => handlePropChange("text", html)}
                placeholder="Write your email text..."
              />
            </div>
            <div>
              <Label className="text-white">Font Size</Label>
              <Input
                value={block.props.fontSize || "16px"}
                onChange={(e) => handlePropChange("fontSize", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Text Color</Label>
              <Input
                type="color"
                value={block.props.color || "#333333"}
                onChange={(e) => handlePropChange("color", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Alignment</Label>
              <select
                value={block.props.align || "left"}
                onChange={(e) => handlePropChange("align", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </>
        )}

        {block.type === "image" && (
          <>
            <div>
              <Label className="text-white">Image</Label>
              <MediaSelector
                value={block.props.src || ""}
                onChange={(url) => handlePropChange("src", url)}
                folder="images"
                label="Select Image"
              />
            </div>
            <div>
              <Label className="text-white">Alt Text</Label>
              <Input
                value={block.props.alt || ""}
                onChange={(e) => handlePropChange("alt", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Link URL (optional)</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handlePropChange("link", e.target.value)}
                placeholder="https://example.com"
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Width</Label>
              <Input
                value={block.props.width || "100%"}
                onChange={(e) => handlePropChange("width", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Alignment</Label>
              <select
                value={block.props.align || "center"}
                onChange={(e) => handlePropChange("align", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {block.type === "button" && (
          <>
            <div>
              <Label className="text-white">Button Text</Label>
              <Input
                value={block.props.text || ""}
                onChange={(e) => handlePropChange("text", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Link URL</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handlePropChange("link", e.target.value)}
                placeholder="https://example.com"
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || "#4a3aff"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Text Color</Label>
              <Input
                type="color"
                value={block.props.textColor || "#ffffff"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Alignment</Label>
              <select
                value={block.props.align || "center"}
                onChange={(e) => handlePropChange("align", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {block.type === "divider" && (
          <>
            <div>
              <Label className="text-white">Color</Label>
              <Input
                type="color"
                value={block.props.color || "#eeeeee"}
                onChange={(e) => handlePropChange("color", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Thickness</Label>
              <Input
                value={block.props.thickness || "1px"}
                onChange={(e) => handlePropChange("thickness", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Style</Label>
              <select
                value={block.props.style || "solid"}
                onChange={(e) => handlePropChange("style", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}

        {block.type === "spacer" && (
          <div>
            <Label className="text-white">Height</Label>
            <Input
              value={block.props.height || "20px"}
              onChange={(e) => handlePropChange("height", e.target.value)}
              className="bg-dark-card border-neon-blue/20 text-white mt-1"
            />
          </div>
        )}

        {block.type === "link" && (
          <>
            <div>
              <Label className="text-white">Link Text</Label>
              <Input
                value={block.props.text || ""}
                onChange={(e) => handlePropChange("text", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">URL</Label>
              <Input
                value={block.props.url || ""}
                onChange={(e) => handlePropChange("url", e.target.value)}
                placeholder="https://example.com"
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Color</Label>
              <Input
                type="color"
                value={block.props.color || "#4a3aff"}
                onChange={(e) => handlePropChange("color", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Font Size</Label>
              <Input
                value={block.props.fontSize || "16px"}
                onChange={(e) => handlePropChange("fontSize", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Underline</Label>
              <select
                value={block.props.underline !== false ? "true" : "false"}
                onChange={(e) => handlePropChange("underline", e.target.value === "true")}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <Label className="text-white">Alignment</Label>
              <select
                value={block.props.align || "left"}
                onChange={(e) => handlePropChange("align", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {block.type === "html" && (
          <div>
            <Label className="text-white">HTML Code</Label>
            <Textarea
              value={block.props.html || ""}
              onChange={(e) => handlePropChange("html", e.target.value)}
              rows={10}
              className="bg-dark-card border-neon-blue/20 text-white mt-1 font-mono text-sm"
            />
          </div>
        )}

        {/* Hero & Headers */}
        {block.type === "hero-banner" && (
          <>
            <div>
              <Label className="text-white">Image</Label>
              <MediaSelector
                value={block.props.imageUrl || ""}
                onChange={(url) => handlePropChange("imageUrl", url)}
                folder="images"
                label="Select Hero Image"
              />
            </div>
            <div>
              <PersonalizedTextInput
                label="Heading"
                value={block.props.heading || ""}
                onChange={(value) => handlePropChange("heading", value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <PersonalizedTextInput
                label="Subheading"
                value={block.props.subheading || ""}
                onChange={(value) => handlePropChange("subheading", value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <PersonalizedTextInput
                label="CTA Text"
                value={block.props.ctaText || ""}
                onChange={(value) => handlePropChange("ctaText", value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">CTA Link</Label>
              <Input
                value={block.props.ctaLink || ""}
                onChange={(e) => handlePropChange("ctaLink", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Overlay Opacity (0-1)</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={block.props.overlayOpacity || 0.4}
                onChange={(e) => handlePropChange("overlayOpacity", parseFloat(e.target.value))}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Text Color</Label>
              <Input
                type="color"
                value={block.props.textColor || "#ffffff"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Height</Label>
              <Input
                value={block.props.height || "400px"}
                onChange={(e) => handlePropChange("height", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
          </>
        )}

        {block.type === "gradient-header" && (
          <>
            <div>
              <PersonalizedTextInput
                label="Text"
                value={block.props.text || ""}
                onChange={(value) => handlePropChange("text", value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Gradient Colors (comma-separated)</Label>
              <Input
                value={Array.isArray(block.props.gradientColors) ? block.props.gradientColors.join(", ") : "#4a3aff, #7c3aed"}
                onChange={(e) => handlePropChange("gradientColors", e.target.value.split(",").map(c => c.trim()))}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
                placeholder="#4a3aff, #7c3aed"
              />
            </div>
            <div>
              <Label className="text-white">Font Size</Label>
              <Input
                value={block.props.fontSize || "32px"}
                onChange={(e) => handlePropChange("fontSize", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Alignment</Label>
              <select
                value={block.props.align || "center"}
                onChange={(e) => handlePropChange("align", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {block.type === "quote" && (
          <>
            <div>
              <PersonalizedTextInput
                label="Quote"
                value={block.props.quote || ""}
                onChange={(value) => handlePropChange("quote", value)}
                type="textarea"
                rows={3}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Author</Label>
              <Input
                value={block.props.author || ""}
                onChange={(e) => handlePropChange("author", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Author Title</Label>
              <Input
                value={block.props.authorTitle || ""}
                onChange={(e) => handlePropChange("authorTitle", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Avatar</Label>
              <MediaSelector
                value={block.props.avatarUrl || ""}
                onChange={(url) => handlePropChange("avatarUrl", url)}
                folder="images"
                label="Select Avatar"
              />
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || "#f5f5f5"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Border Color</Label>
              <Input
                type="color"
                value={block.props.borderColor || "#4a3aff"}
                onChange={(e) => handlePropChange("borderColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
          </>
        )}

        {block.type === "feature-list" && (
          <>
            <div className="border-t border-neon-blue/20 pt-4 mt-4">
              <Label className="text-white font-semibold mb-3 block">Feature Items</Label>
              {Array.isArray(block.props.items) && block.props.items.map((item: any, index: number) => (
                <div key={index} className="mb-4 p-3 bg-dark-card rounded-lg border border-neon-blue/10">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">Item {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newItems = [...(block.props.items || [])];
                        newItems.splice(index, 1);
                        handlePropChange("items", newItems);
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-white text-xs">Text</Label>
                      <Input
                        value={item.text || ""}
                        onChange={(e) => {
                          const newItems = [...(block.props.items || [])];
                          newItems[index] = { ...newItems[index], text: e.target.value };
                          handlePropChange("items", newItems);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="Feature text"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Icon URL (optional)</Label>
                      <Input
                        value={item.icon || ""}
                        onChange={(e) => {
                          const newItems = [...(block.props.items || [])];
                          newItems[index] = { ...newItems[index], icon: e.target.value };
                          handlePropChange("items", newItems);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="https://example.com/icon.png"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Link URL (optional)</Label>
                      <Input
                        value={item.link || ""}
                        onChange={(e) => {
                          const newItems = [...(block.props.items || [])];
                          newItems[index] = { ...newItems[index], link: e.target.value };
                          handlePropChange("items", newItems);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [...(block.props.items || []), { text: "New feature item" }];
                  handlePropChange("items", newItems);
                }}
                className="w-full mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="border-t border-neon-blue/20 pt-4 mt-4">
              <Label className="text-white font-semibold mb-3 block">Styling</Label>
              <div>
                <Label className="text-white">Icon Size</Label>
                <Input
                  value={block.props.iconSize || "20px"}
                  onChange={(e) => handlePropChange("iconSize", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 text-white mt-1"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Icon Color</Label>
                <Input
                  type="color"
                  value={block.props.iconColor || "#4a3aff"}
                  onChange={(e) => handlePropChange("iconColor", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 mt-1 h-10"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Text Color</Label>
                <Input
                  type="color"
                  value={block.props.textColor || "#333333"}
                  onChange={(e) => handlePropChange("textColor", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 mt-1 h-10"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Font Size</Label>
                <Input
                  value={block.props.fontSize || "16px"}
                  onChange={(e) => handlePropChange("fontSize", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 text-white mt-1"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Spacing</Label>
                <Input
                  value={block.props.spacing || "15px"}
                  onChange={(e) => handlePropChange("spacing", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 text-white mt-1"
                />
              </div>
            </div>
          </>
        )}

        {block.type === "stats-row" && (
          <>
            <div>
              <Label className="text-white">Columns</Label>
              <select
                value={block.props.columns || 3}
                onChange={(e) => handlePropChange("columns", parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>
            <div>
              <Label className="text-white">Value Color</Label>
              <Input
                type="color"
                value={block.props.valueColor || "#4a3aff"}
                onChange={(e) => handlePropChange("valueColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Label Color</Label>
              <Input
                type="color"
                value={block.props.labelColor || "#666666"}
                onChange={(e) => handlePropChange("labelColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || "#f5f5f5"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
          </>
        )}

        {block.type === "image-gallery" && (
          <>
            <div className="border-t border-neon-blue/20 pt-4 mt-4">
              <Label className="text-white font-semibold mb-3 block">Gallery Images</Label>
              {Array.isArray(block.props.images) && block.props.images.map((image: any, index: number) => (
                <div key={index} className="mb-4 p-3 bg-dark-card rounded-lg border border-neon-blue/10">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">Image {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newImages = [...(block.props.images || [])];
                        if (newImages.length > 1) {
                          newImages.splice(index, 1);
                          handlePropChange("images", newImages);
                        }
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-500"
                      disabled={!Array.isArray(block.props.images) || block.props.images.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-white text-xs">Image URL</Label>
                      <MediaSelector
                        value={image.src || ""}
                        onChange={(url) => {
                          const newImages = [...(block.props.images || [])];
                          newImages[index] = { ...newImages[index], src: url };
                          handlePropChange("images", newImages);
                        }}
                        folder="images"
                        label="Select Image"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Alt Text</Label>
                      <Input
                        value={image.alt || ""}
                        onChange={(e) => {
                          const newImages = [...(block.props.images || [])];
                          newImages[index] = { ...newImages[index], alt: e.target.value };
                          handlePropChange("images", newImages);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="Image description"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Link URL (optional)</Label>
                      <Input
                        value={image.link || ""}
                        onChange={(e) => {
                          const newImages = [...(block.props.images || [])];
                          newImages[index] = { ...newImages[index], link: e.target.value };
                          handlePropChange("images", newImages);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                    {block.props.showCaptions && (
                      <div>
                        <Label className="text-white text-xs">Caption</Label>
                        <Input
                          value={image.caption || ""}
                          onChange={(e) => {
                            const newImages = [...(block.props.images || [])];
                            newImages[index] = { ...newImages[index], caption: e.target.value };
                            handlePropChange("images", newImages);
                          }}
                          className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                          placeholder="Image caption"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newImages = [...(block.props.images || []), { src: "", alt: `Image ${(block.props.images?.length || 0) + 1}`, caption: "" }];
                  handlePropChange("images", newImages);
                }}
                className="w-full mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>
            <div className="border-t border-neon-blue/20 pt-4 mt-4">
              <Label className="text-white font-semibold mb-3 block">Layout Settings</Label>
              <div>
                <Label className="text-white">Columns</Label>
                <select
                  value={block.props.columns || 2}
                  onChange={(e) => handlePropChange("columns", parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div className="mt-3">
                <Label className="text-white">Spacing</Label>
                <Input
                  value={block.props.spacing || "10px"}
                  onChange={(e) => handlePropChange("spacing", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 text-white mt-1"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Show Captions</Label>
                <select
                  value={block.props.showCaptions ? "true" : "false"}
                  onChange={(e) => handlePropChange("showCaptions", e.target.value === "true")}
                  className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </>
        )}

        {block.type === "primary-button" && (
          <>
            <div>
              <Label className="text-white">Button Text</Label>
              <Input
                value={block.props.text || ""}
                onChange={(e) => handlePropChange("text", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Link URL</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handlePropChange("link", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || "#4a3aff"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Text Color</Label>
              <Input
                type="color"
                value={block.props.textColor || "#ffffff"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Glow Effect</Label>
              <select
                value={block.props.glow ? "true" : "false"}
                onChange={(e) => handlePropChange("glow", e.target.value === "true")}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <Label className="text-white">Full Width</Label>
              <select
                value={block.props.fullWidth ? "true" : "false"}
                onChange={(e) => handlePropChange("fullWidth", e.target.value === "true")}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </>
        )}

        {block.type === "secondary-button" && (
          <>
            <div>
              <Label className="text-white">Button Text</Label>
              <Input
                value={block.props.text || ""}
                onChange={(e) => handlePropChange("text", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Link URL</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handlePropChange("link", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Border Color</Label>
              <Input
                type="color"
                value={block.props.borderColor || "#4a3aff"}
                onChange={(e) => handlePropChange("borderColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Text Color</Label>
              <Input
                type="color"
                value={block.props.textColor || "#4a3aff"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
          </>
        )}

        {block.type === "button-group" && (
          <>
            <div>
              <Label className="text-white">Spacing</Label>
              <Input
                value={block.props.spacing || "10px"}
                onChange={(e) => handlePropChange("spacing", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Alignment</Label>
              <select
                value={block.props.align || "center"}
                onChange={(e) => handlePropChange("align", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {block.type === "social-links" && (
          <>
            <div className="border-t border-neon-blue/20 pt-4 mt-4">
              <Label className="text-white font-semibold mb-3 block">Social Links</Label>
              {Array.isArray(block.props.links) && block.props.links.map((link: any, index: number) => (
                <div key={index} className="mb-4 p-3 bg-dark-card rounded-lg border border-neon-blue/10">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">Link {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newLinks = [...(block.props.links || [])];
                        if (newLinks.length > 1) {
                          newLinks.splice(index, 1);
                          handlePropChange("links", newLinks);
                        }
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-500"
                      disabled={!Array.isArray(block.props.links) || block.props.links.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-white text-xs">Platform</Label>
                      <select
                        value={link.platform || "facebook"}
                        onChange={(e) => {
                          const newLinks = [...(block.props.links || [])];
                          newLinks[index] = { ...newLinks[index], platform: e.target.value };
                          handlePropChange("links", newLinks);
                        }}
                        className="w-full mt-1 px-3 py-2 bg-dark-surface border border-neon-blue/20 rounded-md text-white text-sm"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                        <option value="github">GitHub</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-white text-xs">URL</Label>
                      <Input
                        value={link.url || ""}
                        onChange={(e) => {
                          const newLinks = [...(block.props.links || [])];
                          newLinks[index] = { ...newLinks[index], url: e.target.value };
                          handlePropChange("links", newLinks);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                    {link.platform === "custom" && (
                      <div>
                        <Label className="text-white text-xs">Custom Icon URL</Label>
                        <Input
                          value={link.iconUrl || ""}
                          onChange={(e) => {
                            const newLinks = [...(block.props.links || [])];
                            newLinks[index] = { ...newLinks[index], iconUrl: e.target.value };
                            handlePropChange("links", newLinks);
                          }}
                          className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                          placeholder="https://example.com/icon.png"
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-white text-xs">Label (optional)</Label>
                      <Input
                        value={link.label || ""}
                        onChange={(e) => {
                          const newLinks = [...(block.props.links || [])];
                          newLinks[index] = { ...newLinks[index], label: e.target.value };
                          handlePropChange("links", newLinks);
                        }}
                        className="bg-dark-surface border-neon-blue/20 text-white mt-1 text-sm"
                        placeholder="Link label"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLinks = [...(block.props.links || []), { platform: "facebook", url: "https://facebook.com" }];
                  handlePropChange("links", newLinks);
                }}
                className="w-full mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
            <div className="border-t border-neon-blue/20 pt-4 mt-4">
              <Label className="text-white font-semibold mb-3 block">Styling</Label>
              <div>
                <Label className="text-white">Icon Size</Label>
                <Input
                  value={block.props.iconSize || "24px"}
                  onChange={(e) => handlePropChange("iconSize", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 text-white mt-1"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Icon Color</Label>
                <Input
                  type="color"
                  value={block.props.iconColor || "#4a3aff"}
                  onChange={(e) => handlePropChange("iconColor", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 mt-1 h-10"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Spacing</Label>
                <Input
                  value={block.props.spacing || "15px"}
                  onChange={(e) => handlePropChange("spacing", e.target.value)}
                  className="bg-dark-card border-neon-blue/20 text-white mt-1"
                />
              </div>
              <div className="mt-3">
                <Label className="text-white">Alignment</Label>
                <select
                  value={block.props.align || "center"}
                  onChange={(e) => handlePropChange("align", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="mt-3">
                <Label className="text-white">Layout</Label>
                <select
                  value={block.props.layout || "horizontal"}
                  onChange={(e) => handlePropChange("layout", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
            </div>
          </>
        )}

        {block.type === "footer" && (
          <>
            <div>
              <Label className="text-white">Company Name</Label>
              <Input
                value={block.props.companyName || ""}
                onChange={(e) => handlePropChange("companyName", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Address</Label>
              <Textarea
                value={block.props.address || ""}
                onChange={(e) => handlePropChange("address", e.target.value)}
                rows={2}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Phone</Label>
              <Input
                value={block.props.phone || ""}
                onChange={(e) => handlePropChange("phone", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={block.props.email || ""}
                onChange={(e) => handlePropChange("email", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Unsubscribe URL</Label>
              <Input
                value={block.props.unsubscribeUrl || ""}
                onChange={(e) => handlePropChange("unsubscribeUrl", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || "#f5f5f5"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-white">Text Color</Label>
              <Input
                type="color"
                value={block.props.textColor || "#666666"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
          </>
        )}

        {block.type === "columns" && (
          <>
            <div>
              <Label className="text-white">Number of Columns</Label>
              <select
                value={block.props.columns || 2}
                onChange={(e) => handlePropChange("columns", parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div>
              <Label className="text-white">Column Gap</Label>
              <Input
                value={block.props.columnGap || "20px"}
                onChange={(e) => handlePropChange("columnGap", e.target.value)}
                className="bg-dark-card border-neon-blue/20 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || ""}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="bg-dark-card border-neon-blue/20 mt-1 h-10"
              />
            </div>
          </>
        )}

        {block.type === "divider" && (
          <>
            <div>
              <Label className="text-white">Style</Label>
              <select
                value={block.props.style || "solid"}
                onChange={(e) => handlePropChange("style", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="festive-dots">Festive Dots</option>
                <option value="festive-snowflakes">Festive Snowflakes</option>
                <option value="festive-stars">Festive Stars</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

