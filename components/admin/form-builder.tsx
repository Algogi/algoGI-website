"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  isSystemField?: boolean; // Mark system fields that cannot be deleted
}

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File Upload" },
];

// System fields that are always required and cannot be deleted
const SYSTEM_FIELDS: FormField[] = [
  {
    id: "name",
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
    isSystemField: true,
  },
  {
    id: "email",
    type: "email",
    label: "Email Address",
    placeholder: "Enter your email address",
    required: true,
    isSystemField: true,
  },
  {
    id: "resume",
    type: "file",
    label: "Resume",
    placeholder: "Upload your resume (PDF only)",
    required: true,
    isSystemField: true,
  },
];

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  // Ensure system fields are always included and merge with custom fields
  const ensureSystemFields = (customFields: FormField[]): FormField[] => {
    // Remove any existing system fields from custom fields to avoid duplicates
    const filteredFields = customFields.filter(
      (field) => !SYSTEM_FIELDS.some((sf) => sf.id === field.id)
    );
    
    // Merge system fields (always first) with custom fields
    return [...SYSTEM_FIELDS, ...filteredFields];
  };

  // Get all fields including system fields
  const allFields = ensureSystemFields(fields);

  // Notify parent of changes, but exclude system fields from the callback
  // since they're always present
  const handleFieldsChange = (newFields: FormField[]) => {
    // Filter out system fields when notifying parent
    const customFields = newFields.filter((field) => !field.isSystemField);
    onChange(customFields);
  };

  const generateId = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const addField = () => {
    const newField: FormField = {
      id: "",
      type: "text",
      label: "",
      placeholder: "",
      required: false,
    };
    setEditingField(newField);
    setEditingIndex(allFields.length);
  };

  const editField = (index: number) => {
    const field = allFields[index];
    // Don't allow editing system fields
    if (field.isSystemField) {
      return;
    }
    setEditingField({ ...field });
    setEditingIndex(index);
  };

  const saveField = () => {
    if (!editingField || editingField.label.trim() === "") {
      alert("Field label is required");
      return;
    }

    // Prevent saving system fields
    if (editingField.isSystemField) {
      return;
    }

    const fieldId = editingField.id || generateId(editingField.label);
    const fieldToSave: FormField = {
      ...editingField,
      id: fieldId,
    };

    const customFields = allFields.filter((f) => !f.isSystemField);
    if (editingIndex !== null && editingIndex < allFields.length) {
      // Update existing (only if it's not a system field)
      const targetField = allFields[editingIndex];
      if (!targetField.isSystemField) {
        const fieldIndex = customFields.findIndex((f) => f.id === targetField.id);
        if (fieldIndex >= 0) {
          customFields[fieldIndex] = fieldToSave;
        }
      }
    } else {
      // Add new
      customFields.push(fieldToSave);
    }

    handleFieldsChange([...SYSTEM_FIELDS, ...customFields]);
    setEditingField(null);
    setEditingIndex(null);
  };

  const deleteField = (index: number) => {
    const field = allFields[index];
    // Prevent deleting system fields
    if (field.isSystemField) {
      return;
    }
    
    const customFields = allFields.filter((f) => !f.isSystemField);
    const fieldToRemove = customFields.find((f) => f.id === field.id);
    if (fieldToRemove) {
      const newCustomFields = customFields.filter((f) => f.id !== field.id);
      handleFieldsChange([...SYSTEM_FIELDS, ...newCustomFields]);
    }
    
    if (editingIndex === index) {
      setEditingField(null);
      setEditingIndex(null);
    }
  };

  const addOption = () => {
    if (!editingField) return;
    const newOptions = [...(editingField.options || []), ""];
    setEditingField({ ...editingField, options: newOptions });
  };

  const updateOption = (optionIndex: number, value: string) => {
    if (!editingField || !editingField.options) return;
    const newOptions = [...editingField.options];
    newOptions[optionIndex] = value;
    setEditingField({ ...editingField, options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    if (!editingField || !editingField.options) return;
    const newOptions = editingField.options.filter((_, i) => i !== optionIndex);
    setEditingField({ ...editingField, options: newOptions });
  };

  return (
    <div className="space-y-4">
      {/* System Fields (Always Required) */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Required Fields (System)
        </div>
        {SYSTEM_FIELDS.map((field, index) => (
          <Card key={field.id} className="p-4 bg-muted/50 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{field.label}</span>
                  <Badge variant="secondary">{field.type}</Badge>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    Required
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    System Field
                  </Badge>
                </div>
                {field.placeholder && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Placeholder: {field.placeholder}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Fields */}
      {allFields.filter((f) => !f.isSystemField).length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Custom Fields
          </div>
          {allFields
            .filter((f) => !f.isSystemField)
            .map((field, index) => {
              // Find the actual index in allFields
              const actualIndex = allFields.findIndex((f) => f.id === field.id);
              return (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="secondary">{field.type}</Badge>
                        {field.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {field.placeholder && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Placeholder: {field.placeholder}
                        </p>
                      )}
                      {field.options && field.options.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Options: {field.options.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editField(actualIndex)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteField(actualIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      )}

      {/* Add/Edit Field Form */}
      {editingField && (
        <Card className="p-4 border-2 border-primary">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {editingIndex !== null && editingIndex < fields.length ? "Edit Field" : "Add Field"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingField(null);
                  setEditingIndex(null);
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Type *</Label>
                <Select
                  value={editingField.type}
                  onValueChange={(value: any) =>
                    setEditingField({ ...editingField, type: value, options: value === "select" ? [] : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={editingField.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    const newId = editingField.id || generateId(newLabel);
                    setEditingField({ ...editingField, label: newLabel, id: newId });
                  }}
                  placeholder="e.g., Full Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Placeholder (Optional)</Label>
              <Input
                value={editingField.placeholder || ""}
                onChange={(e) =>
                  setEditingField({ ...editingField, placeholder: e.target.value })
                }
                placeholder="e.g., Enter your full name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={editingField.required}
                onChange={(e) =>
                  setEditingField({ ...editingField, required: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="required">Required field</Label>
            </div>

            {/* Options for Select type */}
            {editingField.type === "select" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                {(editingField.options || []).map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!editingField.options || editingField.options.length === 0) && (
                  <p className="text-xs text-muted-foreground">
                    Add at least one option for the select field
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setEditingField(null);
                setEditingIndex(null);
              }}>
                Cancel
              </Button>
              <Button onClick={saveField}>Save Field</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Field Button */}
      {!editingField && (
        <Button variant="outline" onClick={addField} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Form Field
        </Button>
      )}
    </div>
  );
}

