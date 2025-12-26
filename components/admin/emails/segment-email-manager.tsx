"use client";

import React, { useState, useEffect } from "react";
import { Send, Plus, X, Mail, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Segment } from "@/lib/types/segment";

interface SegmentEmailManagerProps {
  segmentId: string;
  segmentName: string;
}

export default function SegmentEmailManager({
  segmentId,
  segmentName,
}: SegmentEmailManagerProps) {
  const [emails, setEmails] = useState<Segment[]>([]);
  const [allEmails, setAllEmails] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [attachDialogOpen, setAttachDialogOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
    fetchAllEmails();
  }, [segmentId]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/admin/contacts/api/segments/${segmentId}/emails`);
      if (!response.ok) throw new Error("Failed to fetch emails");
      const data = await response.json();
      setEmails(data);
    } catch (err: any) {
      toast.error(`Failed to load emails: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmails = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:54',message:'fetchAllEmails: fetching from /admin/campaigns/api',data:{endpoint:'/admin/campaigns/api?pageSize=1000'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const response = await fetch("/admin/campaigns/api?pageSize=1000");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:59',message:'fetchAllEmails: response received',data:{status:response.status,ok:response.ok,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      if (response.ok) {
        const data = await response.json();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:62',message:'fetchAllEmails: received data',data:{hasData:!!data,dataKeys:data?Object.keys(data):[],count:data.data?.length||0,firstId:data.data?.[0]?.id||null,firstName:data.data?.[0]?.name||null,hasSubject:!!data.data?.[0]?.subject},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        const emailsToSet = data.data || [];
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:65',message:'fetchAllEmails: setting allEmails state',data:{count:emailsToSet.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setAllEmails(emailsToSet);
      } else {
        // #region agent log
        const errorText = await response.text().catch(()=>'');
        fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:68',message:'fetchAllEmails: response not ok',data:{status:response.status,statusText:response.statusText,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:71',message:'fetchAllEmails: exception caught',data:{error:err.message||String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.error("Failed to fetch all emails:", err);
    }
  };

  const handleAttach = async () => {
    if (!selectedEmailId) {
      toast.error("Please select an email");
      return;
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:66',message:'handleAttach: sending attach request',data:{segmentId,selectedEmailId,selectedEmailName:allEmails.find(e=>e.id===selectedEmailId)?.name||null,selectedEmailSubject:allEmails.find(e=>e.id===selectedEmailId)?.subject||null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const response = await fetch(`/admin/contacts/api/segments/${segmentId}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailCampaignId: selectedEmailId }),
      });

      if (!response.ok) {
        // #region agent log
        const errorData = await response.json().catch(()=>({}));
        fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:79',message:'handleAttach: attach request failed',data:{status:response.status,error:errorData.error||'unknown',selectedEmailId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw new Error("Failed to attach email");
      }
      toast.success("Email attached to segment");
      fetchEmails();
      setAttachDialogOpen(false);
      setSelectedEmailId("");
    } catch (err: any) {
      toast.error(`Failed to attach email: ${err.message}`);
    }
  };

  const handleDetach = async (emailId: string) => {
    try {
      const response = await fetch(
        `/admin/contacts/api/segments/${segmentId}/emails?emailCampaignId=${emailId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to detach email");
      toast.success("Email detached from segment");
      fetchEmails();
    } catch (err: any) {
      toast.error(`Failed to detach email: ${err.message}`);
    }
  };

  const handleSend = async (emailId: string) => {
    setSending(emailId);
    try {
      const response = await fetch("/admin/emails/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: emailId,
          segmentId: segmentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");
      const data = await response.json();

      toast.success(`Email sent successfully to ${data.sent} recipients`);
      fetchEmails();
    } catch (err: any) {
      toast.error(`Failed to send email: ${err.message}`);
    } finally {
      setSending(null);
    }
  };

  const availableEmails = allEmails.filter(
    (email) => !emails.find((e) => e.id === email.id)
  );
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'segment-email-manager.tsx:128',message:'availableEmails computed',data:{allEmailsCount:allEmails.length,emailsCount:emails.length,availableEmailsCount:availableEmails.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
  }, [allEmails, emails]);
  // #endregion

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      active: { variant: "default", label: "Active" },
      paused: { variant: "secondary", label: "Paused" },
      completed: { variant: "default", label: "Completed" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      sending: { variant: "secondary", label: "Sending" },
      sent: { variant: "default", label: "Sent" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Attached Email Campaigns</CardTitle>
          <Button
            size="sm"
            onClick={() => setAttachDialogOpen(true)}
            className="bg-neon-blue hover:bg-neon-blue/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Attach Email
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-gray-400">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No emails attached to this segment</p>
            <p className="text-sm mt-2">Attach an email campaign to send it to this segment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-3 border border-neon-blue/20 rounded-lg hover:bg-dark-surface transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{email.name}</h4>
                    {getStatusBadge(email.status)}
                  </div>
                  <p className="text-sm text-gray-400">{email.subject}</p>
                  {email.sentAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sent: {new Date(email.sentAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {email.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => handleSend(email.id)}
                      disabled={sending === email.id}
                      className="bg-neon-blue hover:bg-neon-blue/80"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending === email.id ? "Sending..." : "Send"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDetach(email.id)}
                    title="Detach"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={attachDialogOpen} onOpenChange={setAttachDialogOpen}>
        <DialogContent className="bg-dark-card border-neon-blue/20">
          <DialogHeader>
            <DialogTitle className="text-white">Attach Email to Segment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select an email campaign to attach to "{segmentName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedEmailId} onValueChange={setSelectedEmailId}>
              <SelectTrigger className="bg-dark-surface border-neon-blue/20 text-white">
                <SelectValue placeholder="Select an email campaign" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-blue/20">
                {availableEmails.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    {allEmails.length === 0 ? (
                      <div>
                        <p className="mb-2">No email campaigns found</p>
                        <p className="text-xs text-gray-500 mb-3">
                          Create a campaign first to attach it to this segment
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setAttachDialogOpen(false);
                            window.open("/admin/campaigns/new", "_blank");
                          }}
                          className="bg-neon-blue hover:bg-neon-blue/80"
                        >
                          Create Campaign
                        </Button>
                      </div>
                    ) : (
                      "All campaigns are already attached to this segment"
                    )}
                  </div>
                ) : (
                  availableEmails.map((email) => (
                    <SelectItem
                      key={email.id}
                      value={email.id}
                      className="text-white hover:bg-dark-surface"
                    >
                      {email.name} - {email.subject}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAttachDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAttach}
              disabled={!selectedEmailId}
              className="bg-neon-blue hover:bg-neon-blue/80"
            >
              Attach
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

