"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";

export { m };

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

