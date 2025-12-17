"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  TrendingUp,
  MousePointerClick,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EventsOverTimeChart,
  EventDistributionChart,
  TopPagesChart,
  TrackingMethodChart,
} from "@/components/analytics/analytics-charts";

interface AnalyticsEvent {
  id: string;
  eventName: string;
  params: Record<string, any>;
  pagePath: string;
  timestamp: string | null;
  trackingResults?: {
    firebaseAnalytics: boolean;
    gtag: boolean;
    firestore: boolean;
  };
}

interface VerificationStatus {
  firebaseAnalytics: { available: boolean; message: string };
  gtag: { available: boolean; message: string };
  firestore: { available: boolean; message: string };
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [isListening, setIsListening] = useState(false);

  // Fetch verification status
  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const response = await fetch("/api/analytics/verify");
        const data = await response.json();
        setVerification(data.verification);
      } catch (error) {
        console.error("Error fetching verification:", error);
      }
    };
    fetchVerification();
    const interval = setInterval(fetchVerification, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: "1000",
      });

      if (eventFilter !== "all") {
        params.append("eventName", eventFilter);
      }
      if (pageFilter !== "all") {
        params.append("pagePath", pageFilter);
      }

      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [dateRange, eventFilter, pageFilter]);

  // Listen for real-time events
  useEffect(() => {
    const eventListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.eventName) {
        // Add to events list if it matches filters
        const newEvent: AnalyticsEvent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          eventName: customEvent.detail.eventName,
          params: customEvent.detail.params || {},
          pagePath: customEvent.detail.params?.page_path || "",
          timestamp: new Date().toISOString(),
          trackingResults: customEvent.detail.trackingResults,
        };

        // Check if event matches current filters
        const matchesEventFilter = eventFilter === "all" || newEvent.eventName === eventFilter;
        const matchesPageFilter = pageFilter === "all" || newEvent.pagePath === pageFilter;

        if (matchesEventFilter && matchesPageFilter) {
          setEvents((prev) => [newEvent, ...prev].slice(0, 1000));
        }
      }
    };

    window.addEventListener("analytics:event", eventListener);
    setIsListening(true);

    return () => {
      window.removeEventListener("analytics:event", eventListener);
      setIsListening(false);
    };
  }, [eventFilter, pageFilter]);

  // Process data for charts
  const chartData = useMemo(() => {
    // Events over time
    const timeData: Record<string, number> = {};
    events.forEach((event) => {
      if (event.timestamp) {
        const date = new Date(event.timestamp);
        const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        timeData[key] = (timeData[key] || 0) + 1;
      }
    });
    const eventsOverTime = Object.entries(timeData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });

    // Event distribution
    const eventCounts: Record<string, number> = {};
    events.forEach((event) => {
      eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
    });
    const eventDistribution = Object.entries(eventCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Top pages
    const pageCounts: Record<string, number> = {};
    events.forEach((event) => {
      const page = event.pagePath || "unknown";
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Tracking methods
    const methodCounts = {
      firebaseAnalytics: 0,
      gtag: 0,
      firestore: 0,
    };
    events.forEach((event) => {
      if (event.trackingResults) {
        if (event.trackingResults.firebaseAnalytics) methodCounts.firebaseAnalytics++;
        if (event.trackingResults.gtag) methodCounts.gtag++;
        if (event.trackingResults.firestore) methodCounts.firestore++;
      }
    });
    const trackingMethods = [
      { name: "Firebase Analytics", firebaseAnalytics: methodCounts.firebaseAnalytics, gtag: 0, firestore: 0 },
      { name: "Google Analytics (gtag)", firebaseAnalytics: 0, gtag: methodCounts.gtag, firestore: 0 },
      { name: "Firestore", firebaseAnalytics: 0, gtag: 0, firestore: methodCounts.firestore },
    ];

    return { eventsOverTime, eventDistribution, topPages, trackingMethods };
  }, [events]);

  // Get unique event names and page paths for filters
  const uniqueEventNames = useMemo(() => {
    const names = new Set<string>();
    events.forEach((event) => names.add(event.eventName));
    return Array.from(names).sort();
  }, [events]);

  const uniquePagePaths = useMemo(() => {
    const paths = new Set<string>();
    events.forEach((event) => {
      if (event.pagePath) paths.add(event.pagePath);
    });
    return Array.from(paths).sort();
  }, [events]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const eventsToday = events.filter((e) => {
      if (!e.timestamp) return false;
      const eventDate = new Date(e.timestamp);
      return eventDate >= today;
    }).length;

    const eventsThisWeek = events.filter((e) => {
      if (!e.timestamp) return false;
      const eventDate = new Date(e.timestamp);
      return eventDate >= weekAgo;
    }).length;

    const uniqueEventTypes = new Set(events.map((e) => e.eventName)).size;

    return {
      total: events.length,
      unique: uniqueEventTypes,
      today: eventsToday,
      thisWeek: eventsThisWeek,
    };
  }, [events]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">
            Comprehensive analytics tracking with real-time monitoring and historical data
          </p>
        </div>
        <Button
          onClick={fetchEvents}
          variant="outline"
          className="border-brand-primary/30 hover:border-brand-primary/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Verification Status */}
      {verification && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`bg-dark-card border ${
            verification.firebaseAnalytics.available
              ? "border-green-500/30"
              : "border-red-500/30"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Firebase Analytics</p>
                  <p className="text-xs text-gray-500">{verification.firebaseAnalytics.message}</p>
                </div>
                {verification.firebaseAnalytics.available ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-dark-card border ${
            verification.gtag.available
              ? "border-green-500/30"
              : "border-red-500/30"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Google Analytics (gtag)</p>
                  <p className="text-xs text-gray-500">{verification.gtag.message}</p>
                </div>
                {verification.gtag.available ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-dark-card border ${
            verification.firestore.available
              ? "border-green-500/30"
              : "border-red-500/30"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Firestore</p>
                  <p className="text-xs text-gray-500">{verification.firestore.message}</p>
                </div>
                {verification.firestore.available ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Indicator */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
        isListening
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
      }`}>
        <div className={`w-2 h-2 rounded-full ${isListening ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
        <span className="text-sm font-medium">
          {isListening ? "Listening for real-time events" : "Not listening"}
        </span>
      </div>

      {/* Filters */}
      <Card className="bg-dark-card border-brand-primary/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-dark-bg border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Event Type</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="bg-dark-bg border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEventNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Page Path</label>
              <Select value={pageFilter} onValueChange={setPageFilter}>
                <SelectTrigger className="bg-dark-bg border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  {uniquePagePaths.map((path) => (
                    <SelectItem key={path} value={path}>
                      {path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All tracked events</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Unique Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.unique}</div>
            <p className="text-xs text-gray-500 mt-1">Different event types</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Events Today</CardTitle>
            <Calendar className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.today}</div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.thisWeek}</div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader>
            <CardTitle className="text-white">Events Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.eventsOverTime.length > 0 ? (
              <EventsOverTimeChart data={chartData.eventsOverTime} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader>
            <CardTitle className="text-white">Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.eventDistribution.length > 0 ? (
              <EventDistributionChart data={chartData.eventDistribution} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader>
            <CardTitle className="text-white">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.topPages.length > 0 ? (
              <TopPagesChart data={chartData.topPages} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-brand-primary/30">
          <CardHeader>
            <CardTitle className="text-white">Tracking Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.trackingMethods.some((m) => m.firebaseAnalytics > 0 || m.gtag > 0 || m.firestore > 0) ? (
              <TrackingMethodChart data={chartData.trackingMethods} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card className="bg-dark-card border-brand-primary/30">
        <CardHeader>
          <CardTitle className="text-white">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No events found</p>
              <p className="text-sm mt-2">Try adjusting your filters or wait for events to be tracked</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Event Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Page Path</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Timestamp</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 50).map((event) => (
                    <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-white">{event.eventName}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">{event.pagePath || "N/A"}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{formatTimestamp(event.timestamp)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {event.trackingResults?.firebaseAnalytics && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">FA</span>
                          )}
                          {event.trackingResults?.gtag && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">GT</span>
                          )}
                          {event.trackingResults?.firestore && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">FS</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
