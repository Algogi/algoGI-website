"use client";

import { useEffect, useState } from "react";
import { Upload, Download, FileText, Mail, Copy, Check, Calendar, Building, User, Globe } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DownloadRecord {
  id: string;
  email: string;
  name: string;
  company: string;
  fileIdentifier: string;
  fileType: string;
  caseStudyTitle: string;
  downloadedAt: string | null;
  downloadMethod: string;
  ipAddress: string | null;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDownload, setSelectedDownload] = useState<DownloadRecord | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await fetch("/api/cms/downloads");
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
      } else {
        throw new Error("Failed to fetch downloads");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Company",
      "Case Study Title",
      "File Identifier",
      "File Type",
      "Download Method",
      "Downloaded At",
      "IP Address",
    ];
    const rows = downloads.map((download) => [
      download.name,
      download.email,
      download.company,
      download.caseStudyTitle,
      download.fileIdentifier,
      download.fileType,
      download.downloadMethod === "email_attachment" ? "Email Attachment" : "Email Link",
      download.downloadedAt ? new Date(download.downloadedAt).toLocaleString() : "Unknown",
      download.ipAddress || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `downloads-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "downloads");

      const response = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert(`File uploaded successfully: ${data.fileName}`);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white">
            Downloads
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage download files and view analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <label className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
            <input
              type="file"
              accept=".pdf,.json"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-dark-card shadow rounded-lg p-6 mb-6 border border-neon-blue/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white">
              Download Files
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage downloadable files (PDFs and JSON templates) for portfolio items
            </p>
          </div>
          <Link
            href="/admin/files"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            File Library
          </Link>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Files should be named as: <code className="bg-dark-surface px-2 py-1 rounded text-gray-300">{"{identifier}.{pdf|json}"}</code>
          <br />
          Example: <code className="bg-dark-surface px-2 py-1 rounded text-gray-300">customer-data-sync-automation.json</code>
        </p>
        <label className="inline-flex items-center px-4 py-2 border border-neon-blue/30 rounded-md shadow-sm text-sm font-medium text-white bg-dark-surface hover:bg-dark-surface/80 cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            accept=".pdf,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Download Records */}
      <Card>
        <CardHeader>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <CardTitle>Download Records</CardTitle>
              <CardDescription>
                View all file downloads and user details ({downloads.length} total)
              </CardDescription>
            </div>
            {downloads.length > 0 && (
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <Button onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Download className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No downloads yet</h3>
              <p className="text-sm text-gray-400 text-center">
                Download records will appear here when users download files.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-neon-blue/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-neon-blue/20">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Company</TableHead>
                    <TableHead className="text-gray-400">Case Study</TableHead>
                    <TableHead className="text-gray-400">File</TableHead>
                    <TableHead className="text-gray-400">Method</TableHead>
                    <TableHead className="text-gray-400">Downloaded</TableHead>
                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads.map((download) => (
                    <TableRow
                      key={download.id}
                      className="cursor-pointer hover:bg-dark-surface/50 border-neon-blue/20"
                      onClick={() => setSelectedDownload(download)}
                    >
                      <TableCell className="font-medium text-white">{download.name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${download.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-neon-blue hover:underline"
                        >
                          {download.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-300">{download.company}</TableCell>
                      <TableCell className="max-w-xs text-gray-300">
                        <p className="truncate" title={download.caseStudyTitle}>
                          {download.caseStudyTitle}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {download.fileIdentifier}.{download.fileType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            download.downloadMethod === "email_attachment"
                              ? "bg-blue-900 text-blue-200"
                              : ""
                          }
                        >
                          {download.downloadMethod === "email_attachment"
                            ? "Attachment"
                            : "Link"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {download.downloadedAt
                          ? new Date(download.downloadedAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(download.email);
                            }}
                          >
                            {copiedEmail === download.email ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDownload(download);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Detail Dialog */}
      <Dialog open={!!selectedDownload} onOpenChange={(open) => !open && setSelectedDownload(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download Details</DialogTitle>
            <DialogDescription>Complete information about this download</DialogDescription>
          </DialogHeader>
          {selectedDownload && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Name
                  </label>
                  <p className="mt-1 text-sm font-medium text-white">{selectedDownload.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Company
                  </label>
                  <p className="mt-1 text-sm font-medium text-white">{selectedDownload.company}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </label>
                <p className="mt-1 text-sm">
                  <a href={`mailto:${selectedDownload.email}`} className="text-neon-blue hover:underline">
                    {selectedDownload.email}
                  </a>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">Case Study Title</label>
                <p className="mt-1 text-sm font-medium text-white">{selectedDownload.caseStudyTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">File Identifier</label>
                  <p className="mt-1 text-sm font-mono bg-dark-surface p-2 rounded-md text-gray-300">
                    {selectedDownload.fileIdentifier}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">File Type</label>
                  <p className="mt-1">
                    <Badge variant="secondary">
                      {selectedDownload.fileType.toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">Download Method</label>
                <p className="mt-1">
                  <Badge
                    variant="secondary"
                    className={
                      selectedDownload.downloadMethod === "email_attachment"
                        ? "bg-blue-900 text-blue-200"
                        : ""
                    }
                  >
                    {selectedDownload.downloadMethod === "email_attachment"
                      ? "Email Attachment"
                      : "Email Link"}
                  </Badge>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neon-blue/20">
                {selectedDownload.downloadedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Downloaded At
                    </label>
                    <p className="mt-1 text-sm text-white">
                      {new Date(selectedDownload.downloadedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedDownload.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-400 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      IP Address
                    </label>
                    <p className="mt-1 text-sm text-gray-400 font-mono text-xs">
                      {selectedDownload.ipAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

