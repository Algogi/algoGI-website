"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

interface SEOAnalysis {
  title: {
    score: number;
    length: number;
    optimal: boolean;
    hasKeyword: boolean;
    recommendations: string[];
  };
  metaDescription: {
    score: number;
    length: number;
    optimal: boolean;
    hasKeyword: boolean;
    hasCTA: boolean;
    recommendations: string[];
  };
  headings: {
    score: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasH1: boolean;
    properHierarchy: boolean;
    keywordUsage: boolean;
    recommendations: string[];
  };
  images: {
    score: number;
    totalImages: number;
    imagesWithAlt: number;
    altTextCoverage: number;
    recommendations: string[];
  };
  content: {
    score: number;
    wordCount: number;
    keywordDensity: number;
    readabilityScore: number;
    recommendations: string[];
  };
  links: {
    score: number;
    internalLinks: number;
    externalLinks: number;
    linkRatio: number;
    recommendations: string[];
  };
  schema: {
    score: number;
    hasSchema: boolean;
    recommendations: string[];
  };
  url: {
    score: number;
    length: number;
    hasKeyword: boolean;
    readable: boolean;
    recommendations: string[];
  };
  overall: {
    score: number;
    rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
    recommendations: string[];
  };
}

interface SEOReportProps {
  analysis: SEOAnalysis;
}

export default function SEOReport({ analysis }: SEOReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-500";
      case "Good":
        return "bg-blue-500";
      case "Needs Improvement":
        return "bg-yellow-500";
      case "Poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall SEO Score</CardTitle>
              <CardDescription>Comprehensive SEO analysis results</CardDescription>
            </div>
            <Badge className={`${getRatingColor(analysis.overall.rating)} text-white text-lg px-4 py-2`}>
              {analysis.overall.score} - {analysis.overall.rating}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Title</span>
              <span className={getScoreColor(analysis.title.score)}>
                {analysis.title.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Meta Description</span>
              <span className={getScoreColor(analysis.metaDescription.score)}>
                {analysis.metaDescription.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Content</span>
              <span className={getScoreColor(analysis.content.score)}>
                {analysis.content.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Images</span>
              <span className={getScoreColor(analysis.images.score)}>
                {analysis.images.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Links</span>
              <span className={getScoreColor(analysis.links.score)}>
                {analysis.links.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Schema</span>
              <span className={getScoreColor(analysis.schema.score)}>
                {analysis.schema.score}/100
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <Badge className={`${getScoreBadgeColor(analysis.title.score)} text-white`}>
                {analysis.title.score}/100
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>Length:</span>
                <span>{analysis.title.length} chars</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Optimal:</span>
                {analysis.title.optimal ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Has Keyword:</span>
                {analysis.title.hasKeyword ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {analysis.title.recommendations.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs font-semibold mb-1">Recommendations:</div>
                <ul className="text-xs space-y-1">
                  {analysis.title.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meta Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meta Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <Badge className={`${getScoreBadgeColor(analysis.metaDescription.score)} text-white`}>
                {analysis.metaDescription.score}/100
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>Length:</span>
                <span>{analysis.metaDescription.length} chars</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Optimal:</span>
                {analysis.metaDescription.optimal ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Has Keyword:</span>
                {analysis.metaDescription.hasKeyword ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Has CTA:</span>
                {analysis.metaDescription.hasCTA ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {analysis.metaDescription.recommendations.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs font-semibold mb-1">Recommendations:</div>
                <ul className="text-xs space-y-1">
                  {analysis.metaDescription.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <Badge className={`${getScoreBadgeColor(analysis.content.score)} text-white`}>
                {analysis.content.score}/100
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>Word Count:</span>
                <span>{analysis.content.wordCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Keyword Density:</span>
                <span>{analysis.content.keywordDensity}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Readability:</span>
                <span>{analysis.content.readabilityScore}/100</span>
              </div>
            </div>
            {analysis.content.recommendations.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs font-semibold mb-1">Recommendations:</div>
                <ul className="text-xs space-y-1">
                  {analysis.content.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <Badge className={`${getScoreBadgeColor(analysis.images.score)} text-white`}>
                {analysis.images.score}/100
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>Total Images:</span>
                <span>{analysis.images.totalImages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>With Alt Text:</span>
                <span>{analysis.images.imagesWithAlt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coverage:</span>
                <span>{analysis.images.altTextCoverage}%</span>
              </div>
            </div>
            {analysis.images.recommendations.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs font-semibold mb-1">Recommendations:</div>
                <ul className="text-xs space-y-1">
                  {analysis.images.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Recommendations */}
      {analysis.overall.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Recommendations</CardTitle>
            <CardDescription>Priority improvements to boost your SEO score</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.overall.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

