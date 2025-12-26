"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Mail, MailOpen, MousePointerClick, XCircle, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailAnalytics } from "@/lib/types/email";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function EmailAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setCampaignId(id);

      try {
        const response = await fetch(`/admin/emails/api/analytics/${id}`);
        if (!response.ok) throw new Error("Failed to load analytics");
        const data = await response.json();
        setAnalytics(data);
      } catch (err: any) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="px-4 py-6">
        <Button variant="outline" onClick={() => router.push("/admin/emails")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Emails
        </Button>
        <div className="text-center py-12 text-gray-400">
          <p>No analytics data available for this campaign</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Sent",
      value: analytics.totalSent,
      icon: Mail,
      color: "text-blue-400",
    },
    {
      label: "Opened",
      value: analytics.uniqueOpened,
      icon: MailOpen,
      color: "text-green-400",
      percentage: analytics.openRate.toFixed(1) + "%",
    },
    {
      label: "Clicked",
      value: analytics.uniqueClicked,
      icon: MousePointerClick,
      color: "text-purple-400",
      percentage: analytics.clickRate.toFixed(1) + "%",
    },
    {
      label: "Bounced",
      value: analytics.totalBounced,
      icon: XCircle,
      color: "text-red-400",
      percentage: analytics.bounceRate.toFixed(1) + "%",
    },
    {
      label: "Unsubscribed",
      value: analytics.totalUnsubscribed,
      icon: UserX,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.push("/admin/emails")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Emails
        </Button>
        <h1 className="text-3xl font-bold text-white">Email Analytics</h1>
        <p className="mt-2 text-sm text-gray-400">Campaign performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                {stat.percentage && (
                  <p className="text-xs text-gray-400 mt-1">{stat.percentage} rate</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Open Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                <Legend />
                <Line type="monotone" dataKey="opens" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Click Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recipient Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Recipient Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-blue/20">
                  <th className="text-left p-2 text-white">Email</th>
                  <th className="text-left p-2 text-white">Opened</th>
                  <th className="text-left p-2 text-white">Clicked</th>
                  <th className="text-left p-2 text-white">Bounced</th>
                  <th className="text-left p-2 text-white">Unsubscribed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recipientAnalytics.slice(0, 50).map((recipient, index) => (
                  <tr key={index} className="border-b border-neon-blue/10">
                    <td className="p-2 text-gray-300">{recipient.email}</td>
                    <td className="p-2 text-gray-300">
                      {recipient.opened ? "✓" : "✗"}
                    </td>
                    <td className="p-2 text-gray-300">
                      {recipient.clicked ? "✓" : "✗"}
                    </td>
                    <td className="p-2 text-gray-300">
                      {recipient.bounced ? "✓" : "✗"}
                    </td>
                    <td className="p-2 text-gray-300">
                      {recipient.unsubscribed ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

