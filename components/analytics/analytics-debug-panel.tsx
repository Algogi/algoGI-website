"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Trash2, Maximize2, Minimize2 } from "lucide-react";
// AnalyticsEvents import not needed for debug panel

interface AnalyticsEvent {
  id: string;
  timestamp: number;
  eventName: string;
  params: Record<string, any>;
}

export default function AnalyticsDebugPanel() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check if we're in dev mode
    const isDev = process.env.NODE_ENV === "development" || 
                  window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1";
    setIsDevMode(isDev);

    // Listen for custom analytics events
    const eventListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.eventName) {
        const newEvent: AnalyticsEvent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          eventName: customEvent.detail.eventName,
          params: customEvent.detail.params || {},
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
      }
    };

    window.addEventListener("analytics:event", eventListener);

    return () => {
      window.removeEventListener("analytics:event", eventListener);
    };
  }, []);

  // Auto-open in dev mode
  useEffect(() => {
    if (isDevMode) {
      setIsOpen(true);
    }
  }, [isDevMode]);

  if (!isDevMode) {
    return null;
  }

  const clearEvents = () => {
    setEvents([]);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getEventColor = (eventName: string) => {
    if (eventName.includes("_submit") || eventName.includes("_click")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
    if (eventName.includes("_view")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }
    if (eventName.includes("_error")) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 z-[9999] ${
            isMinimized ? "w-80" : "w-[600px]"
          }`}
        >
          <div className="bg-dark-card border border-brand-primary/30 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-brand-primary/10 border-b border-brand-primary/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-primary" />
                <h3 className="font-semibold text-white">Analytics Debug</h3>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                  {events.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-brand-primary/20 rounded transition-colors"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={clearEvents}
                  className="p-1.5 hover:bg-brand-primary/20 rounded transition-colors"
                  aria-label="Clear events"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-brand-primary/20 rounded transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="h-[400px] overflow-y-auto bg-dark-bg">
                {events.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No analytics events yet</p>
                    <p className="text-sm mt-2">Interact with the site to see events</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {events.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`border rounded-lg p-3 ${getEventColor(event.eventName)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold mb-1">
                              {event.eventName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTimestamp(event.timestamp)}
                            </div>
                          </div>
                        </div>
                        {Object.keys(event.params).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-current/20">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(event.params, null, 2)}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

