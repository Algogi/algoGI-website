"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactsTable } from "@/components/admin/contacts/contacts-table";
import { ImportModal } from "@/components/admin/contacts/import-modal";
import { AddContactModal } from "@/components/admin/contacts/add-contact-modal";
import { Contact, ContactStats } from "@/lib/types/contact";
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  CheckSquare,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [verifyingContacts, setVerifyingContacts] = useState(false);
  const [verificationJob, setVerificationJob] = useState<{
    jobId: string;
    total: number;
    processed: number;
    status: string;
    currentEmail: string | null;
    progressPercentage: number;
  } | null>(null);
  const [verifyingSingle, setVerifyingSingle] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page when search changes
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [page, search, statusFilter, sourceFilter, sortBy, sortOrder]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "50",
        sortBy,
        sortOrder,
      });
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (sourceFilter) params.append("source", sourceFilter);

      const response = await fetch(`/admin/contacts/api?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();

      setContacts(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load contacts");
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/admin/contacts/api", {
        method: "PUT",
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(contacts.map((c) => c.id)));
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

  const startProgressPolling = (jobId: string) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/admin/contacts/api/verify/${jobId}`);
        if (!response.ok) {
          clearInterval(interval);
          setPollingInterval(null);
          return;
        }

        const progress = await response.json();
        
        setVerificationJob({
          jobId: progress.jobId,
          total: progress.total,
          processed: progress.processed,
          status: progress.status,
          currentEmail: progress.currentEmail,
          progressPercentage: progress.progressPercentage,
        });

        // Stop polling if completed or failed
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          setVerifyingContacts(false);
          // Refresh contacts and stats when complete
          fetchContacts();
          fetchStats();
          // Clear job after a delay
          setTimeout(() => {
            setVerificationJob(null);
          }, 5000);
          
          if (progress.status === 'completed' && progress.results) {
            toast.success(
              `Verification complete: ${progress.results.valid} valid, ${progress.results.invalid} invalid`
            );
          } else if (progress.status === 'failed') {
            toast.error(`Verification failed: ${progress.error || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);

    // Clean up after 10 minutes (safety timeout)
    setTimeout(() => {
      clearInterval(interval);
      setPollingInterval(null);
    }, 10 * 60 * 1000);
  };

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return;

    try {
      const selectedContacts = contacts.filter((c) => selectedIds.has(c.id));
      const emails = selectedContacts.map((c) => c.email);

      setVerifyingContacts(true);

      // Start verification (now runs in background)
      const verifyResponse = await fetch('/admin/contacts/api/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Verification failed to start');
      }

      const verifyResult = await verifyResponse.json();

      if (verifyResult.jobId) {
        // Store job for progress tracking
        setVerificationJob({
          jobId: verifyResult.jobId,
          total: verifyResult.total || emails.length,
          processed: 0,
          status: 'pending',
          currentEmail: null,
          progressPercentage: 0,
        });

        // Start polling for progress
        startProgressPolling(verifyResult.jobId);
      }

      toast.success(
        `Verification started for ${verifyResult.total || emails.length} contact(s). You will receive an email report when complete.`
      );

      // Refresh contacts after a short delay to show 'verifying' status
      setTimeout(() => {
        fetchContacts();
      }, 1000);
    } catch (err: any) {
      toast.error(`Verification failed: ${err.message}`);
      setVerifyingContacts(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      // TODO: Implement bulk delete API
      toast.success(`Deleted ${selectedIds.size} contact(s)`);
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
      fetchContacts();
    } catch (err: any) {
      toast.error("Error deleting contacts: " + err.message);
    }
  };

  const handleExport = () => {
    const headers = [
      "Email",
      "First Name",
      "Last Name",
      "Company",
      "Status",
      "Source",
      "Engagement Score",
      "Segments",
      "Created At",
    ];
    const rows = contacts.map((contact) => [
      contact.email,
      contact.firstName || "",
      contact.lastName || "",
      contact.company || "",
      contact.status,
      contact.source,
      contact.engagementScore.toString(),
      contact.segments.join(", "),
      contact.createdAt ? new Date(contact.createdAt).toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `contacts-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Contacts exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Verified
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.verified}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.verifiedPercentage.toFixed(1)}% verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Bounce Rate
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.bounceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.bounced} bounced
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Ready to Send
              </CardTitle>
              <Mail className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.readyToSend}
              </div>
              <p className="text-xs text-gray-400 mt-1">Verified & active</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contacts ({total})</CardTitle>
              <CardDescription>
                Manage your contact database and send campaigns
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBulkVerify}
                    disabled={verifyingContacts}
                  >
                    {verifyingContacts ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify ({selectedIds.size})
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const selectedContacts = contacts.filter((c) => selectedIds.has(c.id));
                      const verifiedContacts = selectedContacts.filter((c) => c.status === 'verified');
                      
                      if (verifiedContacts.length === 0) {
                        toast.warning('No verified contacts selected for SMTP re-verification');
                        return;
                      }

                      try {
                        setVerifyingContacts(true);
                        const emails = verifiedContacts.map((c) => c.email);

                        const verifyResponse = await fetch('/admin/contacts/api/verify-smtp', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ emails }),
                        });

                        if (!verifyResponse.ok) {
                          const errorData = await verifyResponse.json();
                          throw new Error(errorData.error || 'SMTP re-verification failed to start');
                        }

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.jobId) {
                          setVerificationJob({
                            jobId: verifyResult.jobId,
                            total: verifyResult.total || emails.length,
                            processed: 0,
                            status: 'pending',
                            currentEmail: null,
                            progressPercentage: 0,
                          });

                          startProgressPolling(verifyResult.jobId);
                        }

                        toast.success(
                          `SMTP re-verification started for ${verifyResult.total || emails.length} verified contact(s). You will receive an email report when complete.`
                        );

                        setTimeout(() => {
                          fetchContacts();
                        }, 1000);
                      } catch (err: any) {
                        toast.error(`SMTP re-verification failed: ${err.message}`);
                        setVerifyingContacts(false);
                      }
                    }}
                    disabled={verifyingContacts || contacts.filter((c) => selectedIds.has(c.id) && c.status === 'verified').length === 0}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Re-verify SMTP ({contacts.filter((c) => selectedIds.has(c.id) && c.status === 'verified').length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    disabled={verifyingContacts}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedIds.size})
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => setImportModalOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        {verificationJob && (
          <div className="px-6 py-3 border-b bg-muted/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Verifying {verificationJob.processed} / {verificationJob.total} contacts
                </span>
                <span>{verificationJob.progressPercentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${verificationJob.progressPercentage}%`,
                  }}
                />
              </div>
              {verificationJob.currentEmail && (
                <div className="text-xs text-muted-foreground truncate">
                  Processing: {verificationJob.currentEmail}
                </div>
              )}
            </div>
          </div>
        )}
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email, name, or company..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setAddContactModalOpen(true)}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter || "all"} onValueChange={(value) => setSourceFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="christmas-quiz">Christmas Quiz</SelectItem>
                <SelectItem value="csv-import">CSV Import</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Contacts Table */}
          <ContactsTable
            contacts={contacts}
            loading={loading}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleRowSelect}
            onViewContact={setSelectedContact}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Complete information about this contact
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {selectedContact.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge>{selectedContact.status}</Badge>
                  </div>
                </div>
              </div>
              {(selectedContact.firstName ||
                selectedContact.lastName ||
                selectedContact.company) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedContact.firstName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        First Name
                      </label>
                      <p className="mt-1 text-sm">{selectedContact.firstName}</p>
                    </div>
                  )}
                  {selectedContact.lastName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Name
                      </label>
                      <p className="mt-1 text-sm">{selectedContact.lastName}</p>
                    </div>
                  )}
                  {selectedContact.company && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Company
                      </label>
                      <p className="mt-1 text-sm">{selectedContact.company}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Source
                  </label>
                  <p className="mt-1 text-sm">{selectedContact.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Engagement Score
                  </label>
                  <p className="mt-1 text-sm">{selectedContact.engagementScore}</p>
                </div>
              </div>
              {selectedContact.segments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Segments
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedContact.segments.map((segment) => (
                      <Badge key={segment} variant="outline">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="mt-1 text-sm">
                    {selectedContact.createdAt
                      ? new Date(selectedContact.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {selectedContact.lastSent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Sent
                    </label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedContact.lastSent).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t space-y-2">
                {selectedContact.status !== 'verified' && (
                  <Button
                    onClick={async () => {
                      try {
                        setVerifyingSingle(true);
                        const verifyResponse = await fetch('/admin/contacts/api/verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: selectedContact.email }),
                        });

                        if (!verifyResponse.ok) throw new Error('Verification failed');
                        const result = await verifyResponse.json();

                        if (result.valid) {
                          const updateResponse = await fetch('/admin/contacts/api/update-status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              contactIds: [selectedContact.id],
                              status: 'verified',
                            }),
                          });

                          if (updateResponse.ok) {
                            toast.success('Contact verified successfully');
                            fetchContacts();
                            fetchStats();
                            setSelectedContact(null);
                          } else {
                            throw new Error('Status update failed');
                          }
                        } else {
                          toast.error(`Verification failed: ${result.reason || 'Invalid email'}`);
                        }
                      } catch (err: any) {
                        toast.error(`Error: ${err.message}`);
                      } finally {
                        setVerifyingSingle(false);
                      }
                    }}
                    className="w-full"
                    disabled={verifyingSingle}
                  >
                    {verifyingSingle ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Email
                      </>
                    )}
                  </Button>
                )}
                {selectedContact.status === 'verified' && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setVerifyingSingle(true);
                        const verifyResponse = await fetch('/admin/contacts/api/verify-smtp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: selectedContact.email,
                            contactId: selectedContact.id,
                          }),
                        });

                        if (!verifyResponse.ok) {
                          const errorData = await verifyResponse.json();
                          throw new Error(errorData.error || 'SMTP re-verification failed');
                        }

                        const result = await verifyResponse.json();
                        
                        if (result.valid) {
                          toast.success('SMTP re-verification successful - contact remains verified');
                        } else {
                          toast.warning(`SMTP re-verification failed: ${result.reason || 'Mailbox does not exist'}. Contact status updated to invalid.`);
                        }
                        
                        fetchContacts();
                        fetchStats();
                        setSelectedContact(null);
                      } catch (err: any) {
                        toast.error(`Error: ${err.message}`);
                      } finally {
                        setVerifyingSingle(false);
                      }
                    }}
                    className="w-full"
                    disabled={verifyingSingle}
                  >
                    {verifyingSingle ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Re-verifying with SMTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Re-verify with SMTP
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportComplete={() => {
          fetchContacts();
          fetchStats();
        }}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        open={addContactModalOpen}
        onOpenChange={setAddContactModalOpen}
        onContactAdded={() => {
          fetchContacts();
          fetchStats();
        }}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Contacts"
        description={`Are you sure you want to delete ${selectedIds.size} contact(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </div>
  );
}

