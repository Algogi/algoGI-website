"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/navigation/site-header";
import SiteFooter from "@/components/footer/site-footer";
import FloatingCTA from "@/components/cta/floating-cta";

export default function AdminRouteHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't render site header/footer/CTA for admin routes
  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <FloatingCTA />
    </>
  );
}

