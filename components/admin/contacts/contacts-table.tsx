"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact, ContactStatus } from "@/lib/types/contact";
import { Eye, Copy, Check, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ContactsTableProps {
  contacts: Contact[];
  loading?: boolean;
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onViewContact: (contact: Contact) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

const statusColors: Record<ContactStatus, string> = {
  verified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  verified_generic: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  verifying: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  bounced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  unsubscribed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  invalid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusLabels: Record<ContactStatus, string> = {
  verified: 'Verified',
  verified_generic: 'Verified (Generic)',
  pending: 'Pending',
  verifying: 'Verifying',
  bounced: 'Bounced',
  unsubscribed: 'Unsubscribed',
  invalid: 'Invalid',
};

export function ContactsTable({
  contacts,
  loading = false,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onViewContact,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSort,
}: ContactsTableProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
      toast.success('Email copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy email');
    }
  };

  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading contacts...</div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">No contacts found</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === contacts.length && contacts.length > 0}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('email')}
            >
              Email <SortIcon column="email" />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('firstName')}
            >
              Name <SortIcon column="firstName" />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('company')}
            >
              Company <SortIcon column="company" />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('status')}
            >
              Status <SortIcon column="status" />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('source')}
            >
              Source <SortIcon column="source" />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('engagementScore')}
            >
              Engagement <SortIcon column="engagementScore" />
            </TableHead>
            <TableHead
              className={onSort ? "cursor-pointer hover:bg-gray-800" : ""}
              onClick={() => onSort && handleSort('createdAt')}
            >
              Created <SortIcon column="createdAt" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewContact(contact)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(contact.id)}
                  onCheckedChange={(checked) =>
                    onSelectRow(contact.id, checked === true)
                  }
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${contact.email}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <a
                  href={`mailto:${contact.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </TableCell>
              <TableCell>
                {contact.firstName || contact.lastName
                  ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                  : '-'}
              </TableCell>
              <TableCell>{contact.company || '-'}</TableCell>
              <TableCell>
                <Badge className={statusColors[contact.status]}>
                  {statusLabels[contact.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {contact.source.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{contact.engagementScore}</span>
                  {contact.engagementScore >= 3 && (
                    <span className="text-green-500">★</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {contact.createdAt
                  ? new Date(contact.createdAt).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(contact.email);
                    }}
                  >
                    {copiedEmail === contact.email ? (
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
                      onViewContact(contact);
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
  );
}

