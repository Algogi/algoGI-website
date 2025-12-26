"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, MessageSquare, Download, TrendingUp, Plus, UserCheck, Mail, UserCircle, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    portfolio: 0,
    testimonials: 0,
    downloads: 0,
    leads: 0,
    newsletter: 0,
    careers: 0,
    emails: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [portfolioRes, testimonialsRes, downloadsRes, leadsRes, newsletterRes, careersRes, emailsRes] = await Promise.all([
          fetch("/api/cms/portfolio"),
          fetch("/api/cms/testimonials"),
          fetch("/api/cms/downloads"),
          fetch("/api/cms/leads"),
          fetch("/api/cms/newsletter"),
          fetch("/api/cms/careers"),
          fetch("/admin/campaigns/api?pageSize=1"),
        ]);

        const portfolio = await portfolioRes.json();
        const testimonials = await testimonialsRes.json();
        const downloads = await downloadsRes.json();
        const leads = await leadsRes.json();
        const newsletter = await newsletterRes.json();
        const careers = await careersRes.json();
        const emails = await emailsRes.json();

        setStats({
          portfolio: portfolio.length || 0,
          testimonials: testimonials.length || 0,
          downloads: downloads.length || 0,
          leads: leads.length || 0,
          newsletter: newsletter.length || 0,
          careers: careers.length || 0,
          emails: emails.total || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Manage your portfolio, testimonials, downloads, leads, newsletter, and careers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-7 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Portfolio Items</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.portfolio}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/portfolio" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.testimonials}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/testimonials" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Downloads</CardTitle>
            <Download className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.downloads}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/downloads" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Leads</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.leads}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/leads" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.newsletter}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/newsletter" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Jobs</CardTitle>
            <UserCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.careers}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/careers" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Email Campaigns</CardTitle>
            <Send className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.emails}</div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/admin/campaigns" className="text-neon-blue hover:underline">
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto p-6 justify-start border-neon-blue/30 hover:border-neon-blue/50"
              asChild
            >
              <Link href="/admin/portfolio/new">
                <Plus className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Add Portfolio Item</p>
                  <p className="text-xs text-gray-400">Create a new case study</p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 justify-start border-neon-blue/30 hover:border-neon-blue/50"
              asChild
            >
              <Link href="/admin/testimonials/new">
                <Plus className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Add Testimonial</p>
                  <p className="text-xs text-gray-400">Add a new client testimonial</p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 justify-start border-neon-blue/30 hover:border-neon-blue/50"
              asChild
            >
              <Link href="/admin/careers/new">
                <Plus className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Create Job</p>
                  <p className="text-xs text-gray-400">Post a new job opening</p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 justify-start border-neon-blue/30 hover:border-neon-blue/50"
              asChild
            >
              <Link href="/admin/campaigns/new">
                <Plus className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Create Campaign</p>
                  <p className="text-xs text-gray-400">Build a new email campaign</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

