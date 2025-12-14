"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MediaSelector from "./media-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, X, Eye } from "lucide-react";

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

interface SEOEditorProps {
  seo: SEOData;
  onChange: (seo: SEOData) => void;
  title?: string;
  excerpt?: string;
  featuredImage?: string | null;
  slug?: string;
  seoScore?: number | null;
}

export default function SEOEditor({
  seo,
  onChange,
  title = "",
  excerpt = "",
  featuredImage = null,
  slug = "",
  seoScore = null,
}: SEOEditorProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const getCharCountColor = (length: number, optimalMin: number, optimalMax: number, max: number) => {
    if (length >= optimalMin && length <= optimalMax) return "text-green-600 dark:text-green-400";
    if (length > 0 && length < optimalMin) return "text-yellow-600 dark:text-yellow-400";
    if (length > optimalMax && length <= max) return "text-yellow-600 dark:text-yellow-400";
    if (length > max) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const updateSEO = (updates: Partial<SEOData>) => {
    onChange({ ...seo, ...updates });
  };

  const handleUseTitle = () => {
    const truncated = title.length > 60 ? title.substring(0, 57) + "..." : title;
    updateSEO({ metaTitle: truncated });
  };

  const handleUseExcerpt = () => {
    const truncated = excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt;
    updateSEO({ metaDescription: truncated });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seo.metaKeywords?.includes(keywordInput.trim())) {
      updateSEO({
        metaKeywords: [...(seo.metaKeywords || []), keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    updateSEO({
      metaKeywords: seo.metaKeywords?.filter((k) => k !== keyword) || [],
    });
  };

  const metaTitleLength = seo.metaTitle?.length || 0;
  const metaDescriptionLength = seo.metaDescription?.length || 0;

  // Preview values with fallbacks
  const previewTitle = seo.metaTitle || title || "Page Title";
  const previewDescription = seo.metaDescription || excerpt || "Page description";
  const previewUrl = slug ? `https://algogi.com/blog/${slug}` : "https://algogi.com/blog/...";
  const previewOgImage = seo.ogImage || featuredImage || "";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>SEO Settings</CardTitle>
            {seoScore !== null && seoScore !== undefined && (
              <Badge
                className={
                  seoScore >= 90
                    ? "bg-green-500"
                    : seoScore >= 70
                    ? "bg-blue-500"
                    : seoScore >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              >
                Score: {seoScore}
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
        <CardDescription>
          Configure SEO metadata, Open Graph, and Twitter card properties for better search engine visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic SEO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Basic SEO</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <span
                className={`text-xs ${getCharCountColor(metaTitleLength, 50, 60, 70)}`}
              >
                {metaTitleLength}/60 (optimal: 50-60)
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                id="metaTitle"
                value={seo.metaTitle || ""}
                onChange={(e) => updateSEO({ metaTitle: e.target.value })}
                placeholder="SEO title (leave empty to use page title)"
                maxLength={70}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseTitle}
                disabled={!title}
                title="Use page title"
              >
                <Copy className="w-4 h-4 mr-1" />
                Use Title
              </Button>
              {seo.metaTitle && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSEO({ metaTitle: "" })}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              The title that appears in search results. If empty, the page title will be used.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <span
                className={`text-xs ${getCharCountColor(metaDescriptionLength, 150, 160, 320)}`}
              >
                {metaDescriptionLength}/160 (optimal: 150-160)
              </span>
            </div>
            <div className="flex gap-2">
              <Textarea
                id="metaDescription"
                value={seo.metaDescription || ""}
                onChange={(e) => updateSEO({ metaDescription: e.target.value })}
                placeholder="SEO description (leave empty to use excerpt)"
                rows={3}
                maxLength={320}
                className="flex-1"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseExcerpt}
                  disabled={!excerpt}
                  title="Use excerpt"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Use Excerpt
                </Button>
                {seo.metaDescription && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSEO({ metaDescription: "" })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The description that appears in search results. If empty, the excerpt will be used.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focusKeyword">Focus Keyword</Label>
            <Input
              id="focusKeyword"
              value={seo.focusKeyword || ""}
              onChange={(e) => updateSEO({ focusKeyword: e.target.value })}
              placeholder="Primary keyword for SEO analysis"
            />
            <p className="text-xs text-muted-foreground">
              The main keyword you want to rank for. Used for SEO analysis.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Meta Keywords</Label>
            {seo.metaKeywords && seo.metaKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {seo.metaKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-sm py-1 px-3">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="Add a keyword"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Additional keywords for SEO (comma-separated or press Enter).
            </p>
          </div>
        </div>

        <Separator />

        {/* Open Graph */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Open Graph (Social Sharing)</h3>

          <div className="space-y-2">
            <Label htmlFor="ogTitle">OG Title</Label>
            <Input
              id="ogTitle"
              value={seo.ogTitle || ""}
              onChange={(e) => updateSEO({ ogTitle: e.target.value })}
              placeholder="Leave empty to use meta title or page title"
            />
            <p className="text-xs text-muted-foreground">
              Title for social media sharing. Falls back to meta title or page title if empty.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogDescription">OG Description</Label>
            <Textarea
              id="ogDescription"
              value={seo.ogDescription || ""}
              onChange={(e) => updateSEO({ ogDescription: e.target.value })}
              placeholder="Leave empty to use meta description or excerpt"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Description for social media sharing. Falls back to meta description or excerpt if empty.
            </p>
          </div>

          <div className="space-y-2">
            <MediaSelector
              label="OG Image"
              value={seo.ogImage || undefined}
              onChange={(url) => updateSEO({ ogImage: url || undefined })}
              folder="images"
              accept="image/*"
            />
            <p className="text-xs text-muted-foreground">
              Image for social media sharing. Falls back to featured image if empty.
            </p>
          </div>
        </div>

        <Separator />

        {/* Twitter Card */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Twitter Card</h3>

          <div className="space-y-2">
            <Label htmlFor="twitterTitle">Twitter Title</Label>
            <Input
              id="twitterTitle"
              value={seo.twitterTitle || ""}
              onChange={(e) => updateSEO({ twitterTitle: e.target.value })}
              placeholder="Leave empty to use OG title or meta title"
            />
            <p className="text-xs text-muted-foreground">
              Title for Twitter cards. Falls back to OG title or meta title if empty.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterDescription">Twitter Description</Label>
            <Textarea
              id="twitterDescription"
              value={seo.twitterDescription || ""}
              onChange={(e) => updateSEO({ twitterDescription: e.target.value })}
              placeholder="Leave empty to use OG description or meta description"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Description for Twitter cards. Falls back to OG description or meta description if empty.
            </p>
          </div>

          <div className="space-y-2">
            <MediaSelector
              label="Twitter Image"
              value={seo.twitterImage || undefined}
              onChange={(url) => updateSEO({ twitterImage: url || undefined })}
              folder="images"
              accept="image/*"
            />
            <p className="text-xs text-muted-foreground">
              Image for Twitter cards. Falls back to OG image or featured image if empty.
            </p>
          </div>
        </div>

        <Separator />

        {/* Advanced */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Advanced</h3>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input
              id="canonicalUrl"
              value={seo.canonicalUrl || ""}
              onChange={(e) => updateSEO({ canonicalUrl: e.target.value })}
              placeholder="Leave empty to use default URL"
            />
            <p className="text-xs text-muted-foreground">
              Override the canonical URL. Leave empty to use the default blog post URL.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="robotsIndex"
              checked={seo.robotsIndex !== false}
              onCheckedChange={(checked) => updateSEO({ robotsIndex: checked as boolean })}
            />
            <Label htmlFor="robotsIndex" className="cursor-pointer">
              Allow search engines to index this page
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="robotsFollow"
              checked={seo.robotsFollow !== false}
              onCheckedChange={(checked) => updateSEO({ robotsFollow: checked as boolean })}
            />
            <Label htmlFor="robotsFollow" className="cursor-pointer">
              Allow search engines to follow links on this page
            </Label>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Search Result Preview</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                <div className="space-y-2">
                  <div className="text-blue-600 dark:text-blue-400 text-sm">
                    {previewUrl}
                  </div>
                  <div className="text-xl text-blue-700 dark:text-blue-300 hover:underline cursor-pointer">
                    {previewTitle}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {previewDescription}
                  </div>
                </div>
              </div>

              {previewOgImage && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Social Media Preview</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    <img
                      src={previewOgImage}
                      alt="OG Preview"
                      className="w-full h-auto"
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                    <div className="p-4 space-y-2">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {previewTitle}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {previewDescription}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

