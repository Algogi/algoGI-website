"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TileCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function TileCard({ children, className = "", hoverEffect = true }: TileCardProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* 3D tile decorative corners */}
      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-gray-600/30 opacity-50" />
      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-gray-600/30 opacity-50" />
      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-gray-600/30 opacity-50" />
      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-gray-600/30 opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

