"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ContactInput, ContactSource } from "@/lib/types/contact";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (summary: ImportSummary) => void;
}

interface ImportSummary {
  added: number;
  skipped: number;
  errors: number;
  total?: number;
  errorDetails?: string[];
}

export function ImportModal({ open, onOpenChange, onImportComplete }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<ContactSource>('csv-import');
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ContactInput[]>([]);
  const [totalContacts, setTotalContacts] = useState<number>(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|json)$/i)) {
      toast.error('Please select a CSV or JSON file');
      return;
    }

    setFile(selectedFile);
    setSummary(null);

    // Parse and preview
    try {
      const text = await selectedFile.text();
      const parsed = parseFile(text, selectedFile.name);
      setTotalContacts(parsed.length);
      setPreview(parsed.slice(0, 5)); // Show first 5 rows
    } catch (error: any) {
      toast.error(`Failed to parse file: ${error.message}`);
      setFile(null);
      setTotalContacts(0);
    }
  };

  const parseFile = (content: string, filename: string): ContactInput[] => {
    if (filename.endsWith('.csv')) {
      return parseCSV(content);
    } else if (filename.endsWith('.json')) {
      return parseJSON(content);
    }
    throw new Error('Unsupported file format');
  };

  /**
   * Parse CSV line handling quoted fields that may contain commas
   * Handles: "field, with comma", "field with ""escaped quotes""", regular fields
   */
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote inside quoted field
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    values.push(current.trim());

    return values;
  };

  const parseCSV = (content: string): ContactInput[] => {
    // Handle different line endings
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n').filter((line) => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const emailIndex = headers.findIndex((h) => h === 'email' || h === 'e-mail');
    
    if (emailIndex === -1) {
      throw new Error('CSV must have an "email" column');
    }

    const contacts: ContactInput[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map((v) => v.replace(/^"|"$/g, '').trim());
      const email = values[emailIndex];
      
      if (!email) continue;

      const contact: ContactInput = {
        email,
        source: 'csv-import',
        status: 'pending',
      };

      // Map other columns if they exist
      const firstNameIndex = headers.findIndex((h) => h === 'firstname' || h === 'first_name' || h === 'first name');
      const lastNameIndex = headers.findIndex((h) => h === 'lastname' || h === 'last_name' || h === 'last name');
      const companyIndex = headers.findIndex((h) => h === 'company' || h === 'company name');

      if (firstNameIndex !== -1 && values[firstNameIndex]) {
        contact.firstName = values[firstNameIndex];
      }
      if (lastNameIndex !== -1 && values[lastNameIndex]) {
        contact.lastName = values[lastNameIndex];
      }
      if (companyIndex !== -1 && values[companyIndex]) {
        contact.company = values[companyIndex];
      }

      contacts.push(contact);
    }

    return contacts;
  };

  const parseJSON = (content: string): ContactInput[] => {
    try {
      const data = JSON.parse(content);
      const array = Array.isArray(data) ? data : [data];

      return array.map((item: any) => {
        if (!item.email) {
          throw new Error('JSON items must have an "email" field');
        }

        return {
          email: item.email,
          firstName: item.firstName || item.first_name,
          lastName: item.lastName || item.last_name,
          company: item.company,
          source: 'csv-import',
          status: 'pending' as const,
        };
      });
    } catch (error: any) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setSummary(null);

    try {
      const text = await file.text();
      const contacts = parseFile(text, file.name);

      // For large imports, show progress
      const totalContacts = contacts.length;
      const BATCH_SIZE = 10000;
      const totalBatches = Math.ceil(totalContacts / BATCH_SIZE);

      if (totalBatches > 1) {
        toast.info(`Processing ${totalContacts} contacts in ${totalBatches} batch(es)...`);
      }

      // Send all contacts - API will handle batching
      const response = await fetch('/admin/contacts/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts,
          source,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result = await response.json();
      setSummary(result.summary);
      
      if (result.summary.errors > 0) {
        toast.warning(
          `Imported ${result.summary.added} of ${result.summary.total} contacts. ${result.summary.skipped} skipped, ${result.summary.errors} errors`
        );
      } else {
        toast.success(
          `Successfully imported ${result.summary.added} of ${result.summary.total} contacts${result.summary.skipped > 0 ? ` (${result.summary.skipped} skipped)` : ''}`
        );
      }

      if (onImportComplete) {
        onImportComplete(result.summary);
      }

      // Reset after a delay
      setTimeout(() => {
        setFile(null);
        setPreview([]);
        setTotalContacts(0);
        setSummary(null);
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setPreview([]);
      setTotalContacts(0);
      setSummary(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to import contacts. CSV must have an &quot;email&quot; column.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-primary" />
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setTotalContacts(0);
                    setSummary(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop a file here, or click to browse
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        handleFileSelect(selectedFile);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Source Selection */}
          {file && (
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ContactSource)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="csv-import">CSV Import</option>
                <option value="manual">Manual Import</option>
                <option value="api">API Import</option>
              </select>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Preview ({preview.length} of {totalContacts} contacts)
              </label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {preview.map((contact, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{contact.email}</span>
                      {contact.firstName && (
                        <span className="text-muted-foreground ml-2">
                          - {contact.firstName} {contact.lastName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Import Summary */}
          {summary && (
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                {summary.errors === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                Import Complete
              </div>
              <div className="text-sm space-y-1">
                {summary.total && (
                  <div>Total: {summary.total}</div>
                )}
                <div>Added: {summary.added}</div>
                <div>Skipped: {summary.skipped}</div>
                {summary.errors > 0 && (
                  <div className="text-red-500">Errors: {summary.errors}</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importing || preview.length === 0}
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Contacts'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

