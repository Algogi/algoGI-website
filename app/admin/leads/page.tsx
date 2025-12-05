"use client";

import { useEffect, useState } from "react";
import { Mail, Building, Calendar, Phone, Globe, Trash2, Eye, Download, Copy, Check } from "lucide-react";
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

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  projectDescription: string;
  budgetTimeline: string;
  openToCall: boolean;
  preferredCallTime: string | null;
  submittedAt: string | null;
  ipAddress: string | null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/cms/leads");
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        throw new Error("Failed to fetch leads");
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
      "Project Description",
      "Budget/Timeline",
      "Open to Call",
      "Preferred Call Time",
      "Submitted At",
      "IP Address",
    ];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.company,
      lead.projectDescription,
      lead.budgetTimeline,
      lead.openToCall ? "Yes" : "No",
      lead.preferredCallTime || "N/A",
      lead.submittedAt ? new Date(lead.submittedAt).toLocaleString() : "Unknown",
      lead.ipAddress || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            Leads
          </h1>
          <p className="text-sm text-gray-400">
            View and manage all lead submissions ({leads.length} total)
          </p>
        </div>
        {leads.length > 0 && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              Lead submissions will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
            <CardDescription>Click on a row to view full details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Budget/Timeline</TableHead>
                    <TableHead>Call Available</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:underline"
                        >
                          {lead.email}
                        </a>
                      </TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={lead.projectDescription}>
                          {lead.projectDescription}
                        </p>
                      </TableCell>
                      <TableCell>{lead.budgetTimeline}</TableCell>
                      <TableCell>
                        {lead.openToCall ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.submittedAt
                          ? new Date(lead.submittedAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.email);
                            }}
                          >
                            {copiedEmail === lead.email ? (
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
                              setSelectedLead(lead);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Complete information about this lead submission</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="mt-1 text-sm font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="mt-1 text-sm font-medium">{selectedLead.company}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1 text-sm">
                  <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                    {selectedLead.email}
                  </a>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Description</label>
                <p className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {selectedLead.projectDescription}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget/Timeline</label>
                <p className="mt-1 text-sm font-medium">{selectedLead.budgetTimeline}</p>
              </div>

              {selectedLead.openToCall && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Call Time</label>
                  <p className="mt-1 text-sm">
                    {selectedLead.preferredCallTime || "Not specified"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {selectedLead.submittedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedLead.submittedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedLead.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="mt-1 text-sm text-muted-foreground font-mono text-xs">
                      {selectedLead.ipAddress}
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

