"use client";

import { useState, useEffect } from "react";
import { FileText, Code, Upload, X, ExternalLink, Check } from "lucide-react";

interface FileItem {
  name: string;
  url: string;
  type: string;
  identifier?: string;
}

interface FileSelectorProps {
  value?: string;
  onChange: (identifier: string, fileType: "pdf" | "json") => void;
  label?: string;
  acceptType?: "pdf" | "json" | "all";
}

export default function FileSelector({
  value,
  onChange,
  label = "Select Download File",
  acceptType = "all",
}: FileSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      fetchFiles();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (value) {
      // Find the file by identifier
      const file = files.find((f) => f.identifier === value);
      if (file) {
        setSelectedFile(file);
      }
    }
  }, [value, files]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cms/files?source=all&folder=downloads");
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
      formData.append("folder", "downloads");

      const response = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const fileName = data.fileName.split("/").pop() || file.name;
        const identifier = fileName.replace(/\.(pdf|json)$/, "");
        const fileType = fileName.endsWith(".pdf") ? "pdf" : "json";

        const newFile = {
          name: fileName,
          url: data.url,
          type: fileType,
          identifier,
        };
        setFiles((prev) => [newFile, ...prev]);
        handleSelectFile(newFile);
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

  const handleSelectFile = (file: FileItem) => {
    setSelectedFile(file);
    if (file.identifier && (file.type === "pdf" || file.type === "json")) {
      onChange(file.identifier, file.type as "pdf" | "json");
    }
    setIsModalOpen(false);
  };

  const filteredFiles = files.filter((file) => {
    if (acceptType === "all") return true;
    return file.type === acceptType;
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {selectedFile ? (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex-shrink-0">
            {selectedFile.type === "pdf" ? (
              <FileText className="w-8 h-8 text-red-500" />
            ) : (
              <Code className="w-8 h-8 text-yellow-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {selectedFile.name}
            </p>
            {selectedFile.identifier && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Identifier: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{selectedFile.identifier}</code>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-brand-primary hover:underline"
            >
              Change
            </button>
            <a
              href={selectedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                setSelectedFile(null);
                onChange("", "pdf");
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            {label}
          </button>
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload New
            <input
              type="file"
              accept={acceptType === "all" ? ".pdf,.json" : `.${acceptType}`}
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* File Library Modal */}
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
                    File Library
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
                      accept={acceptType === "all" ? ".pdf,.json" : `.${acceptType}`}
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
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No files
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload a file to get started.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredFiles.map((file, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectFile(file)}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            selectedFile?.identifier === file.identifier
                              ? "bg-brand-primary/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {file.type === "pdf" ? (
                                <FileText className="w-8 h-8 text-red-500" />
                              ) : (
                                <Code className="w-8 h-8 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {file.name}
                              </p>
                              {file.identifier && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  Identifier: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{file.identifier}</code>
                                </p>
                              )}
                            </div>
                            {selectedFile?.identifier === file.identifier && (
                              <Check className="w-5 h-5 text-brand-primary" />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
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

