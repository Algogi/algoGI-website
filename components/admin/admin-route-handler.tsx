"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import SiteHeader from "@/components/navigation/site-header";
import SiteFooter from "@/components/footer/site-footer";

export default function AdminRouteHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const chatWidgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdminRoute) {
      // Add chat widget script
      const script = document.createElement("script");
      script.src = "https://widgets.leadconnectorhq.com/loader.js";
      script.setAttribute("data-resources-url", "https://widgets.leadconnectorhq.com/chat-widget/loader.js");
      script.setAttribute("data-widget-id", "676ce3851f70dc6c76fac974");
      document.head.appendChild(script);

      // Create the chat-widget custom element
      if (chatWidgetRef.current) {
        const chatWidget = document.createElement("chat-widget");
        chatWidget.setAttribute("location-id", "7r4X3VfnxjkGfMNGWgAq");
        chatWidget.setAttribute("heading", "How can we help you today?");
        chatWidget.setAttribute("use-email-field", "true");
        chatWidget.setAttribute("agency-name", "Algogi Technologies");
        chatWidget.setAttribute("agency-website", "algogi.com");
        chatWidget.setAttribute("chat-type", "liveChat");
        chatWidget.setAttribute(
          "live-chat-user-inactive-msg",
          "Looks like no one is available. Please leave your contact details. We will get back to you shortly."
        );
        chatWidget.setAttribute(
          "live-chat-feedback-note",
          "Thank you, for taking your time."
        );
        chatWidget.setAttribute("show-consent-checkbox", "true");
        chatWidgetRef.current.appendChild(chatWidget);
      }

      return () => {
        // Cleanup: remove script on unmount
        const existingScript = document.querySelector('script[data-widget-id="676ce3851f70dc6c76fac974"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [isAdminRoute]);

  // Don't render site header/footer/CTA for admin routes
  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      {/* Chat Widget - Only on non-admin pages */}
      <div ref={chatWidgetRef} />
    </>
  );
}

