"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MediaSelector from "./media-selector";
import FileSelector from "./file-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface PortfolioFormData {
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    primary: string;
    primaryLabel: string;
    secondary: string;
    secondaryLabel: string;
  };
  techStack: string[];
  isTemplate: boolean;
  demoUrl: string;
  downloadFile: {
    type: "pdf" | "json";
    identifier: string;
  };
  heroImage?: string;
  heroImageSource?: "upload" | "existing";
}

interface PortfolioFormProps {
  initialData?: PortfolioFormData & { id?: string };
  isEdit?: boolean;
}

export default function PortfolioForm({ initialData, isEdit }: PortfolioFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techInput, setTechInput] = useState("");
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    client: "",
    challenge: "",
    solution: "",
    results: [""],
    metrics: {
      primary: "",
      primaryLabel: "",
      secondary: "",
      secondaryLabel: "",
    },
    techStack: [],
    isTemplate: false,
    demoUrl: "",
    downloadFile: {
      type: "pdf",
      identifier: "",
    },
    heroImage: undefined,
    heroImageSource: "existing",
    ...initialData,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit && initialData?.id
        ? `/api/cms/portfolio/${initialData.id}`
        : "/api/cms/portfolio";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/portfolio");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addResult = () => {
    setFormData((prev) => ({
      ...prev,
      results: [...prev.results, ""],
    }));
  };

  const removeResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
    }));
  };

  const updateResult = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.map((r, i) => (i === index ? value : r)),
    }));
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the title and client information for this portfolio item.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title *
              </Label>
              <Input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter portfolio item title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">
                Client
              </Label>
              <Input
                id="client"
                type="text"
                value={formData.client}
                onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                placeholder="Client name (optional)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Describe the challenge, solution, and results of this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenge">
              Challenge *
            </Label>
            <Textarea
              id="challenge"
              required
              rows={4}
              value={formData.challenge}
              onChange={(e) => setFormData((prev) => ({ ...prev, challenge: e.target.value }))}
              placeholder="Describe the challenge or problem that was solved..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">
              Solution *
            </Label>
            <Textarea
              id="solution"
              required
              rows={5}
              value={formData.solution}
              onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
              placeholder="Explain the solution or approach taken..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Add key results or outcomes achieved in this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.results.map((result, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                required
                value={result}
                onChange={(e) => updateResult(index, e.target.value)}
                className="flex-1"
                placeholder={`Result ${index + 1}`}
              />
              {formData.results.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeResult(index)}
                  className="text-destructive hover:text-destructive"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addResult}
            className="w-full sm:w-auto"
          >
            + Add Result
          </Button>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>Highlight the primary and secondary metrics achieved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-metric-value">
                Primary Metric Value *
              </Label>
              <Input
                id="primary-metric-value"
                type="text"
                required
                value={formData.metrics.primary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metrics: { ...prev.metrics, primary: e.target.value },
                  }))
                }
                placeholder="e.g., 50%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary-metric-label">
                Primary Metric Label *
              </Label>
              <Input
                id="primary-metric-label"
                type="text"
                required
                value={formData.metrics.primaryLabel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metrics: { ...prev.metrics, primaryLabel: e.target.value },
                  }))
                }
                placeholder="e.g., Cost Reduction"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-metric-value">
                Secondary Metric Value *
              </Label>
              <Input
                id="secondary-metric-value"
                type="text"
                required
                value={formData.metrics.secondary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metrics: { ...prev.metrics, secondary: e.target.value },
                  }))
                }
                placeholder="e.g., 2x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-metric-label">
                Secondary Metric Label *
              </Label>
              <Input
                id="secondary-metric-label"
                type="text"
                required
                value={formData.metrics.secondaryLabel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metrics: { ...prev.metrics, secondaryLabel: e.target.value },
                  }))
                }
                placeholder="e.g., Efficiency Increase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack & Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack & Configuration</CardTitle>
          <CardDescription>Add technologies used and configure the project type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tech Stack</Label>
            {formData.techStack.filter(t => t.trim() !== "").length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.techStack.filter(t => t.trim() !== "").map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
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
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Add a technology"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTech}
              >
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Type *</Label>
            <RadioGroup
              value={formData.isTemplate ? "template" : "case-study"}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  isTemplate: value === "template",
                  downloadFile: { ...prev.downloadFile, type: value === "template" ? "json" : "pdf" },
                }));
              }}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="case-study" id="case-study" />
                <Label htmlFor="case-study" className="font-normal cursor-pointer">Case Study</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template" id="template" />
                <Label htmlFor="template" className="font-normal cursor-pointer">Automation Template</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Case studies use PDF files, automation templates use JSON files.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Media & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Media & Links</CardTitle>
          <CardDescription>Add demo URL, download file, and hero image for this portfolio item.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-url">Demo URL</Label>
            <Input
              id="demo-url"
              type="url"
              value={formData.demoUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
              placeholder="https://example.com or #"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <FileSelector
              label="Download File"
              value={formData.downloadFile.identifier}
              onChange={(identifier, fileType) =>
                setFormData((prev) => ({
                  ...prev,
                  downloadFile: {
                    type: fileType,
                    identifier,
                  },
                }))
              }
              acceptType={formData.isTemplate ? "json" : "pdf"}
            />
            <p className="text-xs text-muted-foreground">
              {formData.isTemplate 
                ? "Automation templates require JSON files. Select a JSON file from the library or upload a new one."
                : "Case studies require PDF files. Select a PDF file from the library or upload a new one."}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <MediaSelector
              label="Hero Image"
              value={formData.heroImage}
              onChange={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  heroImage: url || undefined,
                  heroImageSource: url ? "upload" : undefined,
                }))
              }
              folder="images"
              accept="image/*"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/portfolio")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

