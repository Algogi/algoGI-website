"use client";

import { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;
  height?: string;
}

export default function PDFViewer({ url, height = "800px" }: PDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for print and save
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return false;
      }
      // Prevent F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners to the iframe's content window if accessible
    const tryDisableIframeActions = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          iframeWindow.addEventListener("beforeprint", (e) => {
            e.preventDefault();
            return false;
          });
          iframeWindow.addEventListener("keydown", handleKeyDown);
        }
      } catch (err) {
        // Cross-origin restrictions may prevent this
      }
    };

    // Add listeners to parent window
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    // Try to disable iframe actions after load
    iframe.addEventListener("load", tryDisableIframeActions);
    tryDisableIframeActions();

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      iframe.removeEventListener("load", tryDisableIframeActions);
    };
  }, []);

  return (
    <div className="relative w-full border rounded-lg overflow-hidden bg-muted">
      <iframe
        ref={iframeRef}
        src={`${url}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-fit`}
        className="w-full border-0 pointer-events-auto"
        style={{ 
          height, 
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none"
        }}
        title="Job Description PDF"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

