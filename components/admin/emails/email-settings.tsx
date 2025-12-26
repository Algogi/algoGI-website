"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailCampaign, RecipientType } from "@/lib/types/email";
import RecipientSelector from "./recipient-selector";
import PersonalizedTextInput from "./personalized-text-input";

interface EmailSettingsProps {
  campaign: Partial<EmailCampaign>;
  onChange: (updates: Partial<EmailCampaign>) => void;
}

export default function EmailSettings({ campaign, onChange }: EmailSettingsProps) {
  return (
    <div className="space-y-6 p-4">
      <div>
        <Label htmlFor="name" className="text-white">Campaign Name</Label>
        <Input
          id="name"
          value={campaign.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="My Email Campaign"
          className="bg-dark-surface border-neon-blue/20 text-white mt-1"
        />
      </div>

      <div>
        <PersonalizedTextInput
          label="Subject Line"
          value={campaign.subject || ""}
          onChange={(value) => onChange({ subject: value })}
          placeholder="Email subject"
          className="bg-dark-surface border-neon-blue/20 text-white mt-1"
        />
      </div>

      <div>
        <Label htmlFor="fromEmail" className="text-white">From Email</Label>
        <Input
          id="fromEmail"
          type="email"
          value={campaign.fromEmail || ""}
          onChange={(e) => onChange({ fromEmail: e.target.value })}
          placeholder="sender@example.com"
          className="bg-dark-surface border-neon-blue/20 text-white mt-1"
        />
      </div>

      <div>
        <Label htmlFor="replyTo" className="text-white">Reply-To Email (optional)</Label>
        <Input
          id="replyTo"
          type="email"
          value={campaign.replyTo || ""}
          onChange={(e) => onChange({ replyTo: e.target.value })}
          placeholder="reply@example.com"
          className="bg-dark-surface border-neon-blue/20 text-white mt-1"
        />
      </div>

      <div>
        <Label htmlFor="recipientType" className="text-white">Recipient Type</Label>
        <select
          id="recipientType"
          value={campaign.recipientType || "manual"}
          onChange={(e) => onChange({ recipientType: e.target.value as RecipientType })}
          className="w-full mt-1 px-3 py-2 bg-dark-surface border border-neon-blue/20 rounded-md text-white"
        >
          <option value="manual">Manual List</option>
          <option value="contacts">Contacts</option>
          <option value="segments">Segments</option>
        </select>
      </div>

      <div>
        <RecipientSelector
          recipientType={campaign.recipientType || "manual"}
          recipientIds={campaign.recipientIds}
          recipientEmails={campaign.recipientEmails}
          onChange={(type, ids, emails) =>
            onChange({
              recipientType: type,
              recipientIds: ids,
              recipientEmails: emails,
            })
          }
        />
      </div>
    </div>
  );
}

