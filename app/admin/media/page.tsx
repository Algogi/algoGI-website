"use client";

import { useEffect, useState } from "react";
import { Upload, Image as ImageIcon, File, X, Check } from "lucide-react";

interface MediaFile {
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedAt?: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      // Fetch all media files (from Cloud Storage and public folder)
      const response = await fetch("/api/cms/media?source=all");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        throw new Error("Failed to fetch media files");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "images");

      const response = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // Add the new file to the list
        setFiles((prev) => [
          {
            name: data.fileName.split("/").pop() || file.name,
            url: data.url,
            type: file.type.startsWith("image/") ? "image" : "file",
          },
          ...prev,
        ]);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleSelectFile = (file: MediaFile) => {
    setSelectedFile(file.url);
    // Copy URL to clipboard
    navigator.clipboard.writeText(file.url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading media library...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Upload and manage your media files
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
          <label className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload File"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded flex items-center justify-between">
          <span>File URL copied to clipboard: {selectedFile}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No media files
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by uploading a new file.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              onClick={() => handleSelectFile(file)}
              className={`relative group cursor-pointer bg-white dark:bg-gray-800 rounded-lg border-2 overflow-hidden transition-all ${
                selectedFile === file.url
                  ? "border-brand-primary ring-2 ring-brand-primary"
                  : "border-gray-200 dark:border-gray-700 hover:border-brand-primary/50"
              }`}
            >
              {file.type === "image" ? (
                <div className="aspect-square relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    {selectedFile === file.url ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <span className="text-white text-sm opacity-0 group-hover:opacity-100">
                        Click to select
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <File className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.name}>
                  {file.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file, index) => (
              <li
                key={index}
                onClick={() => handleSelectFile(file)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedFile === file.url ? "bg-brand-primary/10" : ""
                }`}
              >
                <div className="flex items-center">
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded mr-4 flex items-center justify-center">
                      <File className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {file.url}
                    </p>
                  </div>
                  {selectedFile === file.url && (
                    <Check className="w-5 h-5 text-brand-primary" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

