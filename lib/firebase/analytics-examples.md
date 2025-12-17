# Firebase Analytics Usage Examples

## Basic Usage

### Track Custom Events

```typescript
"use client";

import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

// Track a button click
function handleButtonClick() {
  logAnalyticsEvent(AnalyticsEvents.BUTTON_CLICK, {
    button_name: "contact_us",
    button_location: "hero_section",
  });
}

// Track form submission
function handleFormSubmit(formData: any) {
  logAnalyticsEvent(AnalyticsEvents.FORM_SUBMIT, {
    form_name: "contact_form",
    form_location: "contact_page",
  });
}

// Track file download
function handleDownload(fileName: string) {
  logAnalyticsEvent(AnalyticsEvents.FILE_DOWNLOAD, {
    file_name: fileName,
    file_type: "pdf",
  });
}
```

### Set User Properties

```typescript
import { setAnalyticsUserProperties } from "@/lib/firebase/analytics";

// Set user properties (e.g., after login)
setAnalyticsUserProperties({
  user_type: "admin",
  subscription_tier: "premium",
});
```

### Set User ID

```typescript
import { setAnalyticsUserId } from "@/lib/firebase/analytics";

// Set user ID (e.g., after login)
setAnalyticsUserId("user_123");

// Clear user ID (e.g., on logout)
setAnalyticsUserId(null);
```

## Common Use Cases

### Track Service Page Views

```typescript
"use client";

import { useEffect } from "react";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export default function ServicePage({ serviceSlug }: { serviceSlug: string }) {
  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvents.SERVICE_VIEW, {
      service_slug: serviceSlug,
      service_name: "AI Agent Development",
    });
  }, [serviceSlug]);

  return <div>Service content...</div>;
}
```

### Track CTA Clicks

```typescript
"use client";

import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export default function CTAButton() {
  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEvents.CTA_CLICK, {
      cta_text: "Get Started",
      cta_location: "hero",
      cta_destination: "/contact",
    });
    // Navigate or perform action
  };

  return <button onClick={handleClick}>Get Started</button>;
}
```

### Track Job Application Events

```typescript
"use client";

import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export default function JobApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const handleApplicationStart = () => {
    logAnalyticsEvent(AnalyticsEvents.JOB_APPLICATION_START, {
      job_id: jobId,
      job_title: jobTitle,
    });
  };

  const handleApplicationSubmit = () => {
    logAnalyticsEvent(AnalyticsEvents.JOB_APPLICATION_SUBMIT, {
      job_id: jobId,
      job_title: jobTitle,
    });
  };

  return (
    <form onFocus={handleApplicationStart} onSubmit={handleApplicationSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Helper Functions

### Track Link Clicks

```typescript
import { trackLinkClick } from "@/lib/firebase/analytics";

// Internal navigation link
trackLinkClick("/services", "Services", "header", false);

// External link
trackLinkClick("https://example.com", "External Site", "footer", true);
```

### Track CTA Clicks

```typescript
import { trackCTAClick } from "@/lib/firebase/analytics";

trackCTAClick("Get Started", "hero", "/contact");
```

### Track Modal Interactions

```typescript
import { trackModalOpen, trackModalClose } from "@/lib/firebase/analytics";

// When modal opens
trackModalOpen("case_study", "case-study-123");

// When modal closes (with time spent)
const timeSpent = 45; // seconds
trackModalClose("case_study", "case-study-123", timeSpent);
```

### Track Scroll Depth

```typescript
import { trackScrollDepth } from "@/lib/firebase/analytics";

trackScrollDepth(50, "/services"); // 50% scroll depth
```

### Use Scroll Tracking Hook

```typescript
import { useScrollTracking } from "@/lib/hooks/use-scroll-tracking";

export default function MyPage() {
  useScrollTracking(); // Automatically tracks scroll depth and time on page
  return <div>Page content</div>;
}
```

## Available Event Types

All predefined events are available in `AnalyticsEvents`:

### Page Views & Content
- `PAGE_VIEW` - Automatic page view tracking (handled by FirebaseAnalyticsProvider)
- `SERVICE_VIEW` - Service page views
- `BLOG_VIEW` - Blog post views
- `JOB_VIEW` - Job listing views
- `CASE_STUDY_VIEW` - Case study views (when modal opens)
- `PORTFOLIO_VIEW` - Portfolio item views

### Forms
- `FORM_SUBMIT` - Generic form submissions
- `CONTACT_FORM_SUBMIT` - Contact form submissions
- `LEAD_FORM_SUBMIT` - Lead capture form submissions
- `NEWSLETTER_SUBSCRIBE` - Newsletter subscriptions
- `JOB_APPLICATION_START` - Job application started (first field interaction)
- `JOB_APPLICATION_SUBMIT` - Job application submitted
- `DOWNLOAD_FORM_SUBMIT` - Download form submissions

### Downloads
- `FILE_DOWNLOAD` - Generic file downloads
- `CASE_STUDY_DOWNLOAD` - Case study downloads
- `DOWNLOAD_START` - Download form modal opened
- `DOWNLOAD_COMPLETE` - Download successfully initiated

### CTAs & Buttons
- `BUTTON_CLICK` - Generic button clicks
- `CTA_CLICK` - Primary CTA button clicks
- `FLOATING_CTA_CLICK` - Floating CTA clicks
- `CONTACT_BUTTON_CLICK` - Contact button clicks
- `FLOATING_CTA_VIEW` - Floating CTA becomes visible

### Navigation
- `LINK_CLICK` - Generic link clicks
- `NAVIGATION_CLICK` - Header navigation link clicks
- `FOOTER_LINK_CLICK` - Footer link clicks
- `EXTERNAL_LINK_CLICK` - External link clicks (social, email, phone)

### Modals
- `MODAL_OPEN` - When any modal opens
- `MODAL_CLOSE` - When modal closes
- `MODAL_DOWNLOAD_CLICK` - Download button in case study modal

### Engagement
- `SCROLL_DEPTH` - User scroll depth milestones (25%, 50%, 75%, 100%)
- `TIME_ON_PAGE` - Time spent on page (for key pages)
- `THEME_TOGGLE` - Theme switch (light/dark)

### Chat Widget
- `CHAT_WIDGET_OPEN` - When chat widget is opened
- `CHAT_WIDGET_MESSAGE_SENT` - When user sends a message

## Event Parameter Standards

All events follow consistent parameter naming conventions:

- Use `snake_case` for parameter names
- Include `page_path` for context (automatically added by helpers)
- Include relevant IDs (job_id, service_slug, etc.)
- Include `status` for success/error tracking ("success" or "error")
- Include `error_message` when status is "error"

### Example Event Parameters

```typescript
// Form submission
{
  form_location: "contact_page",
  has_company: true,
  open_to_call: false,
  status: "success",
  page_path: "/contact"
}

// Service view
{
  service_slug: "ai-agent-development",
  service_name: "AI Agent Development",
  page_path: "/services/ai-agent-development"
}

// CTA click
{
  cta_text: "Get Started",
  cta_location: "hero",
  cta_destination: "/contact",
  page_path: "/"
}

// Modal interaction
{
  modal_type: "case_study",
  modal_content_id: "case-study-123",
  time_spent: 45, // seconds
  page_path: "/case-studies"
}
```

## Custom Events

You can also track custom events with any name:

```typescript
import { logAnalyticsEvent } from "@/lib/firebase/analytics";

logAnalyticsEvent("custom_event_name", {
  custom_param_1: "value1",
  custom_param_2: "value2",
  page_path: window.location.pathname,
});
```

## Implementation Examples

### Form Submission Tracking

```typescript
// In form submit handler
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await logAnalyticsEvent(AnalyticsEvents.LEAD_FORM_SUBMIT, {
        form_location: "contact_page",
        has_company: !!formData.company,
        open_to_call: formData.openToCall || false,
        status: "success",
        page_path: window.location.pathname,
      });
    }
  } catch (error) {
    await logAnalyticsEvent(AnalyticsEvents.LEAD_FORM_SUBMIT, {
      form_location: "contact_page",
      status: "error",
      error_message: error instanceof Error ? error.message : "Unknown error",
      page_path: window.location.pathname,
    });
  }
};
```

### Modal Tracking

```typescript
import { useState, useEffect, useRef } from "react";
import { trackModalOpen, trackModalClose } from "@/lib/firebase/analytics";

export default function MyModal({ isOpen, onClose, contentId }: Props) {
  const openTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
      trackModalOpen("my_modal", contentId);
    }
  }, [isOpen, contentId]);

  const handleClose = () => {
    if (openTimeRef.current) {
      const timeSpent = Math.floor((Date.now() - openTimeRef.current) / 1000);
      trackModalClose("my_modal", contentId, timeSpent);
      openTimeRef.current = null;
    }
    onClose();
  };

  return <div>Modal content</div>;
}
```

### Scroll Depth Tracking

```typescript
// Using the hook (recommended)
import { useScrollTracking } from "@/lib/hooks/use-scroll-tracking";

export default function MyPage() {
  useScrollTracking(); // Automatically tracks 25%, 50%, 75%, 100% milestones
  return <div>Page content</div>;
}

// Manual tracking
import { trackScrollDepth } from "@/lib/firebase/analytics";

useEffect(() => {
  const handleScroll = () => {
    const scrollPercentage = calculateScrollPercentage();
    if (scrollPercentage >= 50 && !tracked50) {
      trackScrollDepth(50, window.location.pathname);
      setTracked50(true);
    }
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

