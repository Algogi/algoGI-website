"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RecipientType } from "@/lib/types/email";

interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
}

interface Segment {
  id: string;
  name: string;
  description?: string;
}

interface RecipientSelectorProps {
  recipientType: RecipientType;
  recipientIds?: string[];
  recipientEmails?: string[];
  onChange: (type: RecipientType, ids?: string[], emails?: string[]) => void;
}

export default function RecipientSelector({
  recipientType,
  recipientIds = [],
  recipientEmails = [],
  onChange,
}: RecipientSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (recipientType === "contacts" || recipientType === "segments") {
      fetchData();
    }
  }, [recipientType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (recipientType === "contacts") {
        const response = await fetch("/admin/contacts/api?pageSize=1000");
        if (response.ok) {
          const data = await response.json();
          setContacts(data.data || []);
        }
      } else if (recipientType === "segments") {
        const response = await fetch("/admin/contacts/api/segments");
        if (response.ok) {
          const data = await response.json();
          setSegments(data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactToggle = (contactId: string) => {
    const newIds = recipientIds.includes(contactId)
      ? recipientIds.filter((id) => id !== contactId)
      : [...recipientIds, contactId];
    onChange(recipientType, newIds, recipientEmails);
  };

  const handleSegmentToggle = (segmentId: string) => {
    const newIds = recipientIds.includes(segmentId)
      ? recipientIds.filter((id) => id !== segmentId)
      : [...recipientIds, segmentId];
    onChange(recipientType, newIds, recipientEmails);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.status === "verified" &&
    c.email &&
      (search === "" ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredSegments = segments.filter(
    (s) =>
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (recipientType === "manual") {
    return (
      <div>
        <Label className="text-white">Recipient Emails</Label>
        <textarea
          value={recipientEmails.join("\n")}
          onChange={(e) =>
            onChange(
              recipientType,
              recipientIds,
              e.target.value
                .split("\n")
                .map((email) => email.trim())
                .filter((email) => email)
            )
          }
          rows={5}
          className="w-full mt-1 px-3 py-2 bg-dark-card border border-neon-blue/20 rounded-md text-white"
          placeholder="email1@example.com&#10;email2@example.com"
        />
        <p className="text-xs text-gray-400 mt-1">Enter one email address per line</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-dark-card border-neon-blue/20 text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : recipientType === "contacts" ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No contacts found</div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-2 p-2 hover:bg-dark-surface rounded"
              >
                <Checkbox
                  checked={recipientIds.includes(contact.id)}
                  onCheckedChange={() => handleContactToggle(contact.id)}
                />
                <div className="flex-1">
                  <div className="text-sm text-white">
                    {contact.firstName || contact.lastName
                      ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                      : contact.email}
                  </div>
                  <div className="text-xs text-gray-400">{contact.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No segments found</div>
          ) : (
            filteredSegments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center gap-2 p-2 hover:bg-dark-surface rounded"
              >
                <Checkbox
                  checked={recipientIds.includes(segment.id)}
                  onCheckedChange={() => handleSegmentToggle(segment.id)}
                />
                <div className="flex-1">
                  <div className="text-sm text-white">{segment.name}</div>
                  {segment.description && (
                    <div className="text-xs text-gray-400">{segment.description}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {recipientIds.length > 0 && (
        <div className="mt-4 p-3 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
          <p className="text-sm text-neon-blue">
            {recipientIds.length} {recipientType === "contacts" ? "contact(s)" : "segment(s)"} selected
          </p>
        </div>
      )}
    </div>
  );
}

