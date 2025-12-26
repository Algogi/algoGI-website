"use client";

import { useEffect } from 'react';
import { trackChristmasStart } from '@/lib/analytics/ga4';

export default function ChristmasPageClient() {
  useEffect(() => {
    trackChristmasStart();
  }, []);

  return null;
}


