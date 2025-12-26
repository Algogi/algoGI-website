"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, X } from "lucide-react";

interface EmailSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (scheduledAt: string) => void;
  currentScheduledAt?: string;
}

export default function EmailScheduler({
  open,
  onOpenChange,
  onSchedule,
  currentScheduledAt,
}: EmailSchedulerProps) {
  const [date, setDate] = useState(
    currentScheduledAt
      ? new Date(currentScheduledAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const handleSchedule = () => {
    const scheduledDate = new Date(date);
    if (scheduledDate <= new Date()) {
      alert("Scheduled time must be in the future");
      return;
    }
    onSchedule(scheduledDate.toISOString());
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (currentScheduledAt) {
      // Cancel scheduled email
      onSchedule("");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-card border-neon-blue/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            {currentScheduledAt ? "Reschedule Email" : "Schedule Email"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="datetime" className="text-white">
              Date & Time
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-dark-surface border-neon-blue/20 text-white mt-1"
            />
          </div>
          {currentScheduledAt && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                Currently scheduled for: {new Date(currentScheduledAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          {currentScheduledAt && (
            <Button variant="outline" onClick={handleCancel} className="text-red-400">
              Cancel Schedule
            </Button>
          )}
          <Button onClick={handleSchedule} className="bg-neon-blue hover:bg-neon-blue/80">
            {currentScheduledAt ? "Reschedule" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


