"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main campaigns page where users can create campaigns with criteria
    router.replace("/admin/campaigns");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
    </div>
  );
}

