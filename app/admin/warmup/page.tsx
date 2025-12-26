"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type WarmupSummary = {
  id: string;
  name: string;
  active: boolean;
  subject: string;
  fromEmail: string;
  contactEmails: number;
  contactIds: number;
  unmatchedEmails: string[];
  updatedAt?: string | null;
  lastRunAt?: string | null;
  lastRunSent?: number;
  lastRunFailed?: number;
  lastRunTotal?: number;
  totalSent?: number;
  totalFailed?: number;
  runCount?: number;
};

type WarmupDetail = {
  id?: string;
  name: string;
  active: boolean;
  subject: string;
  body: string;
  fromEmail: string;
  contactEmails: string[];
  contactIds?: string[];
  unmatchedEmails?: string[];
  updatedAt?: any;
  stats?: any;
  nextRunAt?: string | null;
  cronCadenceMinutes?: number | null;
};

function parseEmails(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[\n,]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function formatTimestamp(value: any): string {
  if (!value) return "—";
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleString();
  }
  if (value?.toDate) return value.toDate().toLocaleString();
  if (value?._seconds) return new Date(value._seconds * 1000).toLocaleString();
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
}

export default function WarmupSettingsPage() {
  const [warmups, setWarmups] = useState<WarmupSummary[]>([]);
  const [selected, setSelected] = useState<WarmupDetail | null>(null);
  const [contactText, setContactText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);

  const loadList = async () => {
    const res = await fetch("/admin/warmup/api/list", { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setWarmups(data.items || []);
  };

  const loadDetail = async (id: string) => {
    const res = await fetch(`/admin/warmup/api/${id}`);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setSelected({
      id,
      name: data.name || id,
      active: !!data.active,
      subject: data.subject || "",
      body: data.body || "",
      fromEmail: data.fromEmail || "",
      contactEmails: data.contactEmails || [],
      contactIds: data.contactIds || [],
      unmatchedEmails: data.unmatchedEmails || [],
      updatedAt: data.updatedAt,
      stats: data.stats || null,
      nextRunAt: data.stats?.nextRunAt || null,
      cronCadenceMinutes: data.stats?.assumedCronCadenceMinutes || null,
    });
    setContactText((data.contactEmails || []).join("\n"));
    setUnmatched(data.unmatchedEmails || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadList();
      } catch (err: any) {
        setError(err.message || "Failed to load warmups");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleNew = () => {
    setSelected({
      name: "",
      active: true,
      subject: "",
      body: "",
      fromEmail: "",
      contactEmails: [],
    });
    setContactText("");
    setUnmatched([]);
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        name: selected.name,
        active: selected.active,
        subject: selected.subject,
        body: selected.body,
        fromEmail: selected.fromEmail,
        contactEmails: parseEmails(contactText),
      };
      const res = await fetch(
        selected.id ? `/admin/warmup/api/${selected.id}` : "/admin/warmup/api/create",
        {
          method: selected.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage(
        `Saved. Verified: ${data.verified ?? "-"}, Invalid: ${data.invalid ?? "-"}, Total: ${data.total ?? "-"}`
      );
      setUnmatched(data.unmatchedEmails || []);
      await loadList();
      if (selected.id || data.id) {
        await loadDetail(selected.id || data.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/admin/warmup/api/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadList();
      if (selected?.id === id) {
        await loadDetail(id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle");
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading warmups…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Warmup Campaigns</h1>
          <p className="text-sm text-gray-500">
            Manage multiple warmup campaigns to protect domain reputation.
          </p>
        </div>
        <Button onClick={handleNew}>New warmup</Button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {warmups.length === 0 && <div className="text-sm text-muted-foreground">No warmups yet.</div>}
          {warmups.map((w) => (
            <div
              key={w.id}
              className={`p-3 border rounded cursor-pointer ${selected?.id === w.id ? "border-indigo-500" : "border-gray-700"}`}
              onClick={() => loadDetail(w.id).catch((err) => setError(err.message || "Failed to load"))}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white truncate">{w.name}</div>
                <Badge variant={w.active ? "default" : "secondary"}>{w.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate">{w.subject}</div>
              <div className="text-xs text-muted-foreground">
                Verified {w.contactIds}/{w.contactEmails} • Total sent {w.totalSent ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Updated {formatTimestamp(w.updatedAt)}</div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(w.id, !w.active);
                  }}
                >
                  {w.active ? "Pause" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="text-sm text-muted-foreground">Select a warmup or create a new one.</div>
          ) : (
            <div className="space-y-4 bg-white/50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    placeholder="Warmup name"
                  />
                </div>
                <label className="flex items-center gap-3 mt-6">
                  <input
                    type="checkbox"
                    checked={selected.active}
                    onChange={(e) => setSelected({ ...selected, active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Enable warmup</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={selected.subject}
                  onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="Warm-up email subject"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">From email</label>
                <input
                  type="email"
                  value={selected.fromEmail}
                  onChange={(e) => setSelected({ ...selected, fromEmail: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="newsletters@algogi.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Body (HTML allowed)</label>
                <textarea
                  value={selected.body}
                  onChange={(e) => setSelected({ ...selected, body: e.target.value })}
                  rows={10}
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono"
                  placeholder="<h1>Hello</h1><p>Warmup message...</p>"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Contacts (emails, comma or newline separated)</label>
                <textarea
                  value={contactText}
                  onChange={(e) => setContactText(e.target.value)}
                  rows={6}
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono"
                  placeholder="user1@example.com\nuser2@example.com"
                />
                <p className="text-xs text-gray-500">
                  We’ll resolve these to verified contacts. If empty, warmup uses top engaged contacts automatically.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save warmup"}
                </Button>
                {message && <span className="text-sm text-green-600">{message}</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>

              {unmatched.length > 0 && (
                <div className="rounded border border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200 px-3 py-2 text-sm">
                  Unmatched emails (not verified/invalid): {unmatched.join(", ")}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                {selected.updatedAt && <div>Last updated: {formatTimestamp(selected.updatedAt)}</div>}
                {selected.stats?.lastRunAt && (
                  <div>
                    Last run: {formatTimestamp(selected.stats.lastRunAt)} — sent {selected.stats.lastRunSent || 0}/
                    {selected.stats.lastRunTotal || 0}
                  </div>
                )}
                {selected.stats?.totalSent !== undefined && (
                  <div>Total sent: {selected.stats.totalSent || 0}</div>
                )}
                {(selected.nextRunAt || selected.cronCadenceMinutes) && (
                  <div>
                    Next run (cron): {selected.nextRunAt ? formatTimestamp(selected.nextRunAt) : "—"}
                    {selected.cronCadenceMinutes
                      ? ` • cadence ~${selected.cronCadenceMinutes} min`
                      : ""}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

