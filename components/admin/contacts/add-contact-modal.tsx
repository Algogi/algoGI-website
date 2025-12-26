"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { ContactInput, ContactSource, ContactStatus } from "@/lib/types/contact";

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactAdded?: () => void;
}

export function AddContactModal({ open, onOpenChange, onContactAdded }: AddContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactInput>({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    status: "pending",
    source: "manual",
    segments: [],
    engagementScore: 0,
    metadata: {},
  });
  const [segmentsInput, setSegmentsInput] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);

    try {
      // Parse segments from comma-separated input
      const segments = segmentsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Prepare contact data
      const contactData: ContactInput = {
        email: formData.email.trim(),
        firstName: formData.firstName?.trim() || undefined,
        lastName: formData.lastName?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        status: formData.status || "pending",
        source: formData.source || "manual",
        segments: segments.length > 0 ? segments : undefined,
        engagementScore: formData.engagementScore || 0,
        metadata: phone.trim()
          ? {
              ...formData.metadata,
              phone: phone.trim(),
            }
          : formData.metadata,
      };

      const response = await fetch("/admin/contacts/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create contact");
      }

      const createdContact = await response.json();

      toast.success(
        `Contact "${createdContact.email}" created successfully`
      );

      // Reset form
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        company: "",
        status: "pending",
        source: "manual",
        segments: [],
        engagementScore: 0,
        metadata: {},
      });
      setSegmentsInput("");
      setPhone("");
      setErrors({});

      // Close modal and refresh
      onOpenChange(false);
      if (onContactAdded) {
        onContactAdded();
      }
    } catch (error: any) {
      toast.error(`Failed to create contact: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        company: "",
        status: "pending",
        source: "manual",
        segments: [],
        engagementScore: 0,
        metadata: {},
      });
      setSegmentsInput("");
      setPhone("");
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a new contact manually. All fields except email are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email - Required */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName || ""}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName || ""}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Inc."
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as ContactStatus })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select
              value={formData.source}
              onValueChange={(value) =>
                setFormData({ ...formData, source: value as ContactSource })
              }
            >
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="csv-import">CSV Import</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="christmas-quiz">Christmas Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Segments */}
          <div className="space-y-2">
            <Label htmlFor="segments">Segments</Label>
            <Input
              id="segments"
              type="text"
              placeholder="segment1, segment2, segment3"
              value={segmentsInput}
              onChange={(e) => setSegmentsInput(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Enter segment names separated by commas
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Contact
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

