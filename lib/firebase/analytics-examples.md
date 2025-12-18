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

## Available Event Types

All predefined events are available in `AnalyticsEvents`:

- `PAGE_VIEW` - Automatic page view tracking (handled by FirebaseAnalyticsProvider)
- `BUTTON_CLICK` - Button clicks
- `FORM_SUBMIT` - Form submissions
- `LINK_CLICK` - Link clicks
- `CONTACT_FORM_SUBMIT` - Contact form submissions
- `LEAD_FORM_START` - Lead form started (user begins filling out form)
- `LEAD_FORM_SUBMIT` - Lead form submissions
- `NEWSLETTER_SUBSCRIBE` - Newsletter subscriptions
- `JOB_APPLICATION_START` - Job application started
- `JOB_APPLICATION_SUBMIT` - Job application submitted
- `JOB_VIEW` - Job listing viewed
- `FILE_DOWNLOAD` - File downloads
- `CASE_STUDY_DOWNLOAD` - Case study downloads
- `SERVICE_VIEW` - Service page views
- `BLOG_VIEW` - Blog post views
- `PORTFOLIO_VIEW` - Portfolio item views
- `CTA_CLICK` - CTA button clicks
- `FLOATING_CTA_CLICK` - Floating CTA clicks

## Custom Events

You can also track custom events with any name:

```typescript
import { logAnalyticsEvent } from "@/lib/firebase/analytics";

logAnalyticsEvent("custom_event_name", {
  custom_param_1: "value1",
  custom_param_2: "value2",
});
```

