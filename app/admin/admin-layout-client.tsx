"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import AlgogiLogo from "@/components/logo/algogi-logo";
import { LogOut, LayoutDashboard, Briefcase, MessageSquare, Download, ExternalLink, Image as ImageIcon, FileText, Mail, Users, Menu, X, BookOpen, Sun, Moon, UserCircle, ClipboardList, Gift, Gamepad2, BarChart3, ChevronDown, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: {
    email: string;
    name: string;
    picture?: string;
  } | null;
}

export default function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isChristmasActive = pathname.startsWith("/admin/christmas");
  const [christmasExpanded, setChristmasExpanded] = useState(isChristmasActive);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if no session (but not on login page itself)
  useEffect(() => {
    if (pathname !== "/admin/login" && !session) {
      router.push("/admin/login");
    }
  }, [session, router, pathname]);

  // Skip auth check and layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      // Dashboard should only be active on exact /admin path
      return pathname === "/admin";
    }
    // Other paths should match if pathname starts with the path
    return pathname === path || pathname.startsWith(path + "/");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
    { href: "/admin/blog", label: "Blog", icon: BookOpen },
    { href: "/admin/careers", label: "Careers", icon: UserCircle },
    { href: "/admin/application-forms", label: "Application Forms", icon: ClipboardList },
    { href: "/admin/emails", label: "Emails", icon: Mail },
    { href: "/admin/campaigns", label: "Campaigns", icon: Send },
    { href: "/admin/leads", label: "Leads", icon: Mail },
    { href: "/admin/contacts", label: "Contacts", icon: Users },
    { href: "/admin/newsletter", label: "Newsletter", icon: Users },
    { href: "/admin/downloads", label: "Downloads", icon: Download },
    { href: "/admin/media", label: "Media", icon: ImageIcon },
    { href: "/admin/files", label: "Files", icon: FileText },
  ];

  const christmasSubItems = [
    { href: "/admin/christmas", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/christmas/submissions", label: "Submissions", icon: FileText },
    { href: "/admin/christmas/game-plays", label: "Game Plays", icon: Gamepad2 },
    { href: "/admin/christmas/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/christmas/prizes", label: "Prizes", icon: Gift },
    { href: "/admin/christmas/badges", label: "Badges", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-neon-blue/20 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed max-h-screen`}>
        <div className="flex flex-col h-screen max-h-screen">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-neon-blue/20">
            <Link href="/admin" className="flex items-center">
              <AlgogiLogo
                className="h-8 w-auto"
                animateOnMount={false}
                enableHover={false}
                enableSvgAnimation={false}
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-neon-blue/10 text-neon-blue"
                      : "text-white hover:bg-dark-surface"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Christmas Campaign Section */}
            <div className="mt-2">
              <button
                onClick={() => setChristmasExpanded(!christmasExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isChristmasActive
                    ? "bg-neon-blue/10 text-neon-blue"
                    : "text-white hover:bg-dark-surface"
                }`}
              >
                <div className="flex items-center">
                  <Gift className="w-5 h-5 mr-3" />
                  Christmas Campaign
                </div>
                {christmasExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {christmasExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-neon-blue/20 pl-2">
                  {christmasSubItems.map((item) => {
                    const Icon = item.icon;
                    const isSubActive = pathname === item.href || (item.href === "/admin/christmas" && pathname === "/admin/christmas");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isSubActive
                            ? "bg-neon-blue/10 text-neon-blue"
                            : "text-gray-400 hover:text-white hover:bg-dark-surface"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-neon-blue/20 p-4">
            <div className="flex items-center mb-3">
              {session.picture && (
                <Image
                  src={session.picture}
                  alt={session.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full mr-3"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.email}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted ? (
                  theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Theme
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Theme
                    </>
                  )
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Theme
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Site
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                asChild
              >
                <a href="/api/auth/logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-dark-card border-b border-neon-blue/20 px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/admin" className="ml-3 flex items-center">
            <AlgogiLogo
              className="h-6 w-auto"
              animateOnMount={false}
              enableHover={false}
              enableSvgAnimation={false}
            />
          </Link>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

