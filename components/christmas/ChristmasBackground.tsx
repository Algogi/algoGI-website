"use client";

import GlowingChristmasTree from "./GlowingChristmasTree";
import BackgroundStars from "./BackgroundStars";
import SnowfallBackground from "./SnowfallBackground";
import FairyLights from "./FairyLights";
import { usePerformanceMode } from "@/lib/christmas/use-performance-mode";

export default function ChristmasBackground() {
  const performanceMode = usePerformanceMode();

  return (
    <>
      {/* Snowfall Background */}
      <SnowfallBackground performanceMode={performanceMode} />
      
      {/* Christmas Tree Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          contain: 'layout style paint',
          transform: 'translateZ(0)',
        }}
      >
        {/* Main tree on the right - always visible */}
        <GlowingChristmasTree position="right" performanceMode={performanceMode} />
        
        {/* Conditional trees based on performance mode */}
        {performanceMode === 'high' && (
          <>
            {/* Tree on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 md:w-1/4 lg:w-1/5 h-full flex items-center justify-center pointer-events-none z-0 opacity-15 dark:opacity-10">
              <div className="scale-75 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Smaller tree in the middle-left background */}
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-1/4 md:w-1/5 h-64 md:h-80 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-50 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Smaller tree in the middle-right background */}
            <div className="absolute right-[15%] top-1/3 -translate-y-1/2 w-1/4 md:w-1/5 h-64 md:h-80 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-50 w-full h-full">
                <GlowingChristmasTree position="right" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in top-left corner */}
            <div className="absolute left-[5%] top-[10%] w-1/5 md:w-1/6 h-48 md:h-64 flex items-center justify-center pointer-events-none z-0 opacity-8 dark:opacity-6">
              <div className="scale-40 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in top-right corner */}
            <div className="absolute right-[8%] top-[15%] w-1/5 md:w-1/6 h-48 md:h-64 flex items-center justify-center pointer-events-none z-0 opacity-8 dark:opacity-6">
              <div className="scale-40 w-full h-full">
                <GlowingChristmasTree position="right" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in bottom-left */}
            <div className="absolute left-[8%] bottom-[15%] w-1/4 md:w-1/5 h-72 md:h-88 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-55 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in bottom-right */}
            <div className="absolute right-[12%] bottom-[20%] w-1/4 md:w-1/5 h-72 md:h-88 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-55 w-full h-full">
                <GlowingChristmasTree position="right" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in center-left */}
            <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-1/5 md:w-1/6 h-56 md:h-72 flex items-center justify-center pointer-events-none z-0 opacity-8 dark:opacity-6">
              <div className="scale-45 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in center-right */}
            <div className="absolute right-[25%] top-2/3 -translate-y-1/2 w-1/5 md:w-1/6 h-56 md:h-72 flex items-center justify-center pointer-events-none z-0 opacity-8 dark:opacity-6">
              <div className="scale-45 w-full h-full">
                <GlowingChristmasTree position="right" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
          </>
        )}

        {(performanceMode === 'medium') && (
          <>
            {/* Tree on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 md:w-1/4 lg:w-1/5 h-full flex items-center justify-center pointer-events-none z-0 opacity-15 dark:opacity-10">
              <div className="scale-75 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Smaller tree in the middle-left background */}
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-1/4 md:w-1/5 h-64 md:h-80 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-50 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Smaller tree in the middle-right background */}
            <div className="absolute right-[15%] top-1/3 -translate-y-1/2 w-1/4 md:w-1/5 h-64 md:h-80 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-50 w-full h-full">
                <GlowingChristmasTree position="right" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Tree in bottom-left */}
            <div className="absolute left-[8%] bottom-[15%] w-1/4 md:w-1/5 h-72 md:h-88 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-55 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
          </>
        )}

        {(performanceMode === 'low') && (
          <>
            {/* Tree on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 md:w-1/4 lg:w-1/5 h-full flex items-center justify-center pointer-events-none z-0 opacity-15 dark:opacity-10">
              <div className="scale-75 w-full h-full">
                <GlowingChristmasTree position="left" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
            
            {/* Smaller tree in the middle-right background */}
            <div className="absolute right-[15%] top-1/3 -translate-y-1/2 w-1/4 md:w-1/5 h-64 md:h-80 flex items-center justify-center pointer-events-none z-0 opacity-10 dark:opacity-8">
              <div className="scale-50 w-full h-full">
                <GlowingChristmasTree position="right" useAbsolute={true} performanceMode={performanceMode} />
              </div>
            </div>
          </>
        )}
        
        {/* Background stars - conditionally render based on mode */}
        {performanceMode !== 'minimal' && (
          <BackgroundStars performanceMode={performanceMode} />
        )}
        
        {/* Fairy lights - conditionally render based on mode */}
        {performanceMode !== 'minimal' && (
          <FairyLights performanceMode={performanceMode} />
        )}
      </div>
    </>
  );
}

