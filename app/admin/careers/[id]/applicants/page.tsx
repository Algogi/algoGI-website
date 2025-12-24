"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Eye, Mail, LayoutGrid, Table2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import KanbanBoard from "@/components/admin/kanban-board";

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  resumeUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Job {
  id: string;
  title: string;
}

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobRes, applicantsRes] = await Promise.all([
        fetch(`/api/cms/careers/${jobId}`),
        fetch(`/api/cms/careers/${jobId}/applicants`),
      ]);

      if (!jobRes.ok || !applicantsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const jobData = await jobRes.json();
      const applicantsData = await applicantsRes.json();

      setJob(jobData);
      setApplicants(applicantsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Status",
      "Applied Date",
      "Last Updated",
    ];
    const rows = filteredApplicants.map((app) => [
      app.name,
      app.email,
      app.status,
      app.createdAt ? new Date(app.createdAt).toLocaleString() : "N/A",
      app.updatedAt ? new Date(app.updatedAt).toLocaleString() : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `applicants-${job?.title || "job"}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredApplicants.map((app) => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/cms/careers/${jobId}/applicants/${id}`, { method: "DELETE" })
      );

      const results = await Promise.allSettled(deletePromises);
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.error(`Failed to delete ${failed} applicant(s)`);
      } else {
        toast.success(`Deleted ${selectedIds.size} applicant(s) successfully`);
      }

      fetchData();
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error("Error deleting applicants: " + err.message);
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

  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error || "Job not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/careers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-white">
          Applicants: {job.title}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Manage applications for this job posting ({applicants.length} total)
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="phone-interview">Phone Interview</SelectItem>
                <SelectItem value="technical-interview">Technical Interview</SelectItem>
                <SelectItem value="final-interview">Final Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
              >
                <Table2 className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </Button>
            </div>
            {viewMode === "table" && selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.size})
              </Button>
            )}
            {applicants.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {filteredApplicants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
            <p className="text-sm text-muted-foreground text-center">
              {applicants.length === 0
                ? "No applications have been submitted for this job yet."
                : "No applicants match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>All Applicants ({filteredApplicants.length})</CardTitle>
            <CardDescription>Click on a row to view full details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filteredApplicants.length && filteredApplicants.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow
                      key={applicant.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/careers/${jobId}/applicants/${applicant.id}`)}
                    >
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.has(applicant.id)}
                          onCheckedChange={(checked) =>
                            handleRowSelect(applicant.id, checked === true)
                          }
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${applicant.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{applicant.name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${applicant.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:underline"
                        >
                          {applicant.email}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                      <TableCell>
                        {applicant.createdAt
                          ? new Date(applicant.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/careers/${jobId}/applicants/${applicant.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <KanbanBoard
          applicants={filteredApplicants}
          jobId={jobId}
          onApplicantClick={(id) => router.push(`/admin/careers/${jobId}/applicants/${id}`)}
          onStatusUpdate={async (id, newStatus) => {
            const response = await fetch(`/api/cms/careers/${jobId}/applicants/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            });
            
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || "Failed to update status");
            }
            
            // Refresh data after successful update
            await fetchData();
          }}
        />
      )}

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Applicants"
        description={`Are you sure you want to delete ${selectedIds.size} applicant(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </div>
  );
}

