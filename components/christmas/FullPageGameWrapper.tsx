"use client";

import { ReactNode } from 'react';

interface FullPageGameWrapperProps {
  children: ReactNode;
  gameName: string;
  hideContent?: boolean;
}

export default function FullPageGameWrapper({ children, gameName, hideContent = false }: FullPageGameWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative">
      {/* Game Content */}
      <div className={`w-full max-w-4xl transition-opacity duration-300 ${hideContent ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 border-2 border-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
}

