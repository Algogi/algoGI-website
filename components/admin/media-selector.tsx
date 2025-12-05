"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Upload, X, ExternalLink } from "lucide-react";

interface MediaFile {
  name: string;
  url: string;
  type: string;
}

interface MediaSelectorProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}

export default function MediaSelector({
  value,
  onChange,
  folder = "images",
  accept = "image/*",
  label = "Select Image",
}: MediaSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(value || null);

  useEffect(() => {
    if (isModalOpen) {
      fetchMediaFiles();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (value) {
      setSelectedFile(value);
    }
  }, [value]);

  const fetchMediaFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cms/media?source=all&folder=${folder}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
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
      formData.append("folder", folder);

      const response = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const newFile = {
          name: data.fileName.split("/").pop() || file.name,
          url: data.url,
          type: file.type.startsWith("image/") ? "image" : "file",
        };
        setFiles((prev) => [newFile, ...prev]);
        handleSelectFile(newFile.url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSelectFile = (url: string) => {
    setSelectedFile(url);
    onChange(url);
    setIsModalOpen(false);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {selectedFile ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <img
              src={selectedFile}
              alt="Selected"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-brand-primary hover:underline"
            >
              Change
            </button>
            <a
              href={selectedFile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {label}
          </button>
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload New
            <input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Media Library Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Media Library
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload New File"}
                    <input
                      type="file"
                      accept={accept}
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No media files
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload a file to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectFile(file.url)}
                        className={`relative group cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-lg border-2 overflow-hidden transition-all ${
                          selectedFile === file.url
                            ? "border-brand-primary ring-2 ring-brand-primary"
                            : "border-gray-200 dark:border-gray-600 hover:border-brand-primary/50"
                        }`}
                      >
                        <div className="aspect-square relative">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                              Select
                            </span>
                          </div>
                        </div>
                        <div className="p-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

