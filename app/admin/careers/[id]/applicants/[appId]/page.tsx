"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Mail, FileText, Save, Send } from "lucide-react";
import PDFViewer from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StatusHistoryEntry {
  status: string;
  timestamp: string | null;
  modifiedBy: string;
  notes?: string;
}

interface Applicant {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  applicantData: Record<string, any>;
  status: string;
  resumeUrl: string | null;
  coverLetter: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string | null;
  updatedAt: string | null;
  updatedBy: string;
}

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "phone-interview", label: "Phone Interview" },
  { value: "technical-interview", label: "Technical Interview" },
  { value: "final-interview", label: "Final Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const appId = params.appId as string;
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  useEffect(() => {
    fetchApplicant();
  }, [appId]);

  useEffect(() => {
    if (applicant) {
      setNewStatus(applicant.status);
    }
  }, [applicant]);

  const fetchApplicant = async () => {
    try {
      const response = await fetch(`/api/cms/careers/${jobId}/applicants/${appId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push(`/admin/careers/${jobId}/applicants`);
          return;
        }
        throw new Error("Failed to fetch applicant");
      }
      const data = await response.json();
      setApplicant(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!applicant) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/cms/careers/${jobId}/applicants/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      // Refresh applicant data
      await fetchApplicant();
      setStatusNotes("");
      toast.success("Status updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      applied: { variant: "secondary", label: "Applied" },
      screening: { variant: "default", label: "Screening" },
      "phone-interview": { variant: "default", label: "Phone Interview" },
      "technical-interview": { variant: "default", label: "Technical Interview" },
      "final-interview": { variant: "default", label: "Final Interview" },
      offer: { variant: "outline", label: "Offer" },
      rejected: { variant: "destructive", label: "Rejected" },
      hired: { variant: "default", label: "Hired" },
    };
    const config = statusConfig[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const downloadResume = async () => {
    if (!applicant?.resumeUrl) return;

    try {
      // Generate signed URL for resume
      const response = await fetch(`/api/download-file?path=${encodeURIComponent(applicant.resumeUrl)}`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, "_blank");
      } else {
        throw new Error("Failed to generate download link");
      }
    } catch (err: any) {
      toast.error("Error downloading resume: " + err.message);
    }
  };

  // Get signed URL for resume viewing
  const [resumeViewUrl, setResumeViewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (applicant?.resumeUrl) {
      fetch(`/api/download-file?path=${encodeURIComponent(applicant.resumeUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setResumeViewUrl(data.url);
          }
        })
        .catch((err) => {
          console.error("Error fetching resume URL:", err);
        });
    }
  }, [applicant?.resumeUrl]);

  const handleSendEmail = async () => {
    if (!applicant || !emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch(`/api/cms/careers/${jobId}/applicants/${appId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: applicant.email,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success("Email sent successfully!");
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (err: any) {
      toast.error("Error sending email: " + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error || "Applicant not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/admin/careers/${jobId}/applicants`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applicants
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-white">
          Applicant: {applicant.name}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {applicant.jobTitle}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{applicant.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">
                    <a href={`mailto:${applicant.email}`} className="text-primary hover:underline">
                      {applicant.email}
                    </a>
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Status</Label>
                <div className="mt-1">{getStatusBadge(applicant.status)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Application Data */}
          <Card>
            <CardHeader>
              <CardTitle>Application Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(applicant.applicantData).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <p className="mt-1 whitespace-pre-wrap bg-muted p-3 rounded-md">
                    {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {applicant.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {applicant.coverLetter}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Resume */}
          {applicant.resumeUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume</CardTitle>
                  <Button onClick={downloadResume} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  {resumeViewUrl ? (
                    <PDFViewer 
                      url={resumeViewUrl}
                      height="800px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[800px] bg-muted rounded-lg">
                      <div className="text-muted-foreground">Loading resume...</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Timeline of status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicant.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {index < applicant.statusHistory.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{entry.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.timestamp
                              ? new Date(entry.timestamp).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Modified by: {entry.modifiedBy}
                        </p>
                        {entry.notes && (
                          <p className="text-sm mt-2 bg-muted p-2 rounded">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Status Update */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change applicant status and add notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={saving || newStatus === applicant.status}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Email to Applicant</DialogTitle>
                    <DialogDescription>
                      Send an email to {applicant.email}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-to">To</Label>
                      <Input
                        id="email-to"
                        value={applicant.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject *</Label>
                      <Input
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-body">Message *</Label>
                      <Textarea
                        id="email-body"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Your message..."
                        rows={10}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailDialogOpen(false);
                        setEmailSubject("");
                        setEmailBody("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSendEmail} disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      {sendingEmail ? "Sending..." : "Send Email"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

