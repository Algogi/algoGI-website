"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  setConsent,
  requiresConsent,
  isEURegion,
} from "@/lib/cookies/consent";
import { cn } from "@/lib/utils";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<{
    analytics: boolean;
    marketing: boolean;
  }>({
    analytics: false,
    marketing: false,
  });

  // Check if consent is required and show after 5 seconds
  useEffect(() => {
    if (requiresConsent()) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent({
      analytics: true,
      marketing: true,
    });
    setOpen(false);
    // Analytics will initialize dynamically via consent-changed event
  };

  const handleRejectAll = () => {
    setConsent({
      analytics: false,
      marketing: false,
    });
    setOpen(false);
  };

  const handleClose = () => {
    // For EU regions: treat as reject (GDPR compliance)
    // For non-EU regions: treat as accept (less restrictive)
    const isEU = isEURegion();
    setConsent({
      analytics: !isEU, // Accept for non-EU, reject for EU
      marketing: !isEU,
    });
    setOpen(false);
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSavePreferences = () => {
    const hasAnalytics = preferences.analytics;
    const hasMarketing = preferences.marketing;
    
    setConsent({
      analytics: hasAnalytics,
      marketing: hasMarketing,
    });
    setOpen(false);
    // Analytics will initialize dynamically via consent-changed event
  };

  const handleToggleAnalytics = (checked: boolean) => {
    setPreferences((prev) => ({ ...prev, analytics: checked }));
  };

  const handleToggleMarketing = (checked: boolean) => {
    setPreferences((prev) => ({ ...prev, marketing: checked }));
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full border-t bg-background shadow-lg",
        "animate-in slide-in-from-bottom duration-300",
        "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 relative">
        {/* Close button - positioned in top-right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 sm:right-4 h-6 w-6 rounded-full"
          aria-label="Close cookie banner"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col gap-2 pr-8 sm:pr-10">
          {!showCustomize ? (
            <>
              {/* Main content */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-semibold">Cookie Preferences</h3>
                  <p className="text-xs text-muted-foreground">
                    We use cookies to enhance your experience. You can customize your preferences.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-shrink-0 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="w-full sm:w-auto text-xs h-8"
                  >
                    Reject All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCustomize}
                    className="w-full sm:w-auto text-xs h-8"
                  >
                    Customize
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto text-xs h-8"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Customize view */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Customize Preferences</h3>

                <div className="space-y-2">
                  <div className="p-2 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <Label
                          htmlFor="analytics-consent"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Analytics Cookies
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Help us understand visitor interactions.
                        </p>
                      </div>
                      <Checkbox
                        id="analytics-consent"
                        checked={preferences.analytics}
                        onCheckedChange={handleToggleAnalytics}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <Label
                          htmlFor="marketing-consent"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Marketing Cookies
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          For personalized ads and tracking.
                        </p>
                      </div>
                      <Checkbox
                        id="marketing-consent"
                        checked={preferences.marketing}
                        onCheckedChange={handleToggleMarketing}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:justify-end sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomize(false)}
                    className="w-full sm:w-auto text-xs h-8"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePreferences}
                    className="w-full sm:w-auto text-xs h-8"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

