import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Send, ChevronRight } from "lucide-react";

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">Contacts</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your contact database, verify emails, and send campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">
              <Send className="w-4 h-4 mr-2" />
              Manage Campaigns
            </Link>
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}

