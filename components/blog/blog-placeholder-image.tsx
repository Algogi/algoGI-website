"use client";

import { useEffect, useState } from "react";

interface BlogPlaceholderImageProps {
  title: string;
  className?: string;
  size?: "small" | "large";
}

export default function BlogPlaceholderImage({
  title,
  className = "",
  size = "large",
}: BlogPlaceholderImageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [time, setTime] = useState(0);

  // Generate a color based on the title (deterministic)
  const getColorFromTitle = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a color in the brand color range (blues/purples)
    const hue = (hash % 60) + 240; // 240-300 range (blue to purple)
    const saturation = 60 + (hash % 20); // 60-80%
    const lightness = 40 + (hash % 15); // 40-55%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Get initials from title
  const getInitials = (text: string): string => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return "B";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Animate time for dynamic effects
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 0.02);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Track mouse position for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const primaryColor = getColorFromTitle(title);
  const secondaryColor = getColorFromTitle(title + "secondary");
  const tertiaryColor = getColorFromTitle(title + "tertiary");
  const initials = getInitials(title);
  const height = size === "small" ? 192 : 384; // h-48 = 192px, h-96 = 384px

  // Calculate animated positions
  const circle1X = 100 + Math.sin(time) * 30;
  const circle1Y = 100 + Math.cos(time * 0.7) * 20;
  const circle2X = 700 + Math.cos(time * 0.8) * 40;
  const circle2Y = 300 + Math.sin(time * 1.2) * 30;
  const circle3X = 400 + Math.sin(time * 1.1) * 50;
  const circle3Y = 50 + Math.cos(time * 0.9) * 25;

  // Parallax offset based on mouse position
  const parallaxX = (mousePosition.x - 50) * 0.1;
  const parallaxY = (mousePosition.y - 50) * 0.1;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
      onMouseMove={handleMouseMove}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 400"
        className="absolute inset-0"
      >
        {/* Gradient Background with Animation */}
        <defs>
          <linearGradient
            id={`gradient-${title.replace(/\s+/g, "-")}`}
            x1={`${50 + parallaxX}%`}
            y1={`${50 + parallaxY}%`}
            x2={`${50 - parallaxX}%`}
            y2={`${50 - parallaxY}%`}
          >
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8">
              <animate
                attributeName="stop-opacity"
                values="0.8;0.9;0.8"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.6">
              <animate
                attributeName="stop-opacity"
                values="0.6;0.7;0.6"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={tertiaryColor} stopOpacity="0.4">
              <animate
                attributeName="stop-opacity"
                values="0.4;0.5;0.4"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          
          <pattern
            id={`pattern-${title.replace(/\s+/g, "-")}`}
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.1">
              <animate
                attributeName="opacity"
                values="0.1;0.2;0.1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </pattern>
          
          {/* Animated radial gradient for glow effect */}
          <radialGradient
            id={`glow-${title.replace(/\s+/g, "-")}`}
            cx={`${mousePosition.x}%`}
            cy={`${mousePosition.y}%`}
            r="30%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Background */}
        <rect width="100%" height="100%" fill={`url(#gradient-${title.replace(/\s+/g, "-")})`} />
        <rect width="100%" height="100%" fill={`url(#pattern-${title.replace(/\s+/g, "-")})`} />
        <rect width="100%" height="100%" fill={`url(#glow-${title.replace(/\s+/g, "-")})`} />
        
        {/* Animated decorative circles */}
        <circle
          cx={circle1X}
          cy={circle1Y}
          r="60"
          fill="white"
          opacity="0.05"
        >
          <animate
            attributeName="r"
            values="60;70;60"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx={circle2X}
          cy={circle2Y}
          r="80"
          fill="white"
          opacity="0.05"
        >
          <animate
            attributeName="r"
            values="80;90;80"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx={circle3X}
          cy={circle3Y}
          r="40"
          fill="white"
          opacity="0.08"
        >
          <animate
            attributeName="r"
            values="40;50;40"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Animated grid lines */}
        <g stroke="white" strokeWidth="1" opacity="0.1">
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 40 + Math.sin(time + i) * 2}
              x2="800"
              y2={i * 40 + Math.sin(time + i) * 2}
            >
              <animate
                attributeName="opacity"
                values="0.1;0.15;0.1"
                dur={`${2 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 40 + Math.cos(time + i) * 2}
              y1="0"
              x2={i * 40 + Math.cos(time + i) * 2}
              y2="400"
            >
              <animate
                attributeName="opacity"
                values="0.1;0.15;0.1"
                dur={`${2 + i * 0.1}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </g>
        
        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const particleX = (i * 100 + time * 20) % 800;
          const particleY = 50 + Math.sin(time + i) * 100;
          return (
            <circle
              key={`particle-${i}`}
              cx={particleX}
              cy={particleY}
              r="3"
              fill="white"
              opacity="0.3"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur={`${1 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>
      
      {/* Initials/Text Overlay with animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className="text-white font-bold drop-shadow-lg transition-transform duration-300"
            style={{
              fontSize: size === "small" ? "3rem" : "6rem",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px) scale(${1 + Math.sin(time) * 0.02})`,
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
}

