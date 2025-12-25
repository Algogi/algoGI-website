"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LightString {
  id: number;
  centerX: number; // Center x position where semi-circle hangs from (percentage)
  radius: number; // Radius of the semi-circle (percentage)
  lights: Array<{
    id: number;
    y: number; // Y position along the string (percentage from top)
    x: number; // Calculated x position along semi-circle
    color: string;
    glow: string; // Glow color for the light
    size: number;
    delay: number;
    duration: number;
  }>;
}

// Traditional Christmas colors
const lightColors = [
  { light: "#DC2626", glow: "rgba(220, 38, 38, 0.9)" }, // Red
  { light: "#16A34A", glow: "rgba(22, 163, 74, 0.9)" }, // Green
  { light: "#FBBF24", glow: "rgba(251, 191, 36, 0.9)" }, // Gold/Yellow
  { light: "#F59E0B", glow: "rgba(245, 158, 11, 0.9)" }, // Amber
  { light: "#FFFFFF", glow: "rgba(255, 255, 255, 0.9)" }, // White
];

// Christmas color selection - balanced mix
function getRandomChristmasColor() {
  const rand = Math.random();
  // 30% red, 25% green, 25% gold, 10% amber, 10% white
  if (rand < 0.3) return lightColors[0]; // Red
  if (rand < 0.55) return lightColors[1]; // Green
  if (rand < 0.8) return lightColors[2]; // Gold
  if (rand < 0.9) return lightColors[3]; // Amber
  return lightColors[4]; // White
}

// Calculate position along a semi-circle arch with both edges touching the top
// Left edge: (centerX - radius, 0) - touches top
// Right edge: (centerX + radius, 0) - touches top  
// Bottom point: (centerX, radius) - maximum curve pointing down
// angle: 0 to π, where 0 is left edge and π is right edge
function calculateSemiCirclePosition(centerX: number, radius: number, angle: number): { x: number; y: number } {
  // Map angle from [0, π] to [-π/2, π/2] for the semi-circle
  // This gives us left edge (-π/2) to right edge (π/2)
  const circleAngle = angle - Math.PI / 2; // Maps [0, π] to [-π/2, π/2]
  
  // For an arch with both ends at top:
  // x: use sin to go from (centerX - radius) to (centerX + radius)
  // y: use cos² to go from 0 (at edges) to radius (at bottom center)
  const x = centerX + radius * Math.sin(circleAngle);
  const y = radius * Math.pow(Math.cos(circleAngle), 2);
  
  return { x, y };
}

export default function FairyLights() {
  const [strings, setStrings] = useState<LightString[]>([]);

  useEffect(() => {
    // Generate 5-6 strings of lights hanging from the top as semi-circles
    const stringCount = 5;
    
    const newStrings: LightString[] = Array.from({ length: stringCount }, (_, stringIndex) => {
      // Distribute strings evenly across the top with some margin
      const centerX = 10 + (stringIndex + 1) * (80 / (stringCount + 1)); // 10% to 90% range
      
      // Radius should make the lowest point reach about 1/3 down the page (33%)
      // Since bottom point is at radius * 2, radius should be around 16-17%
      const radius = 14 + Math.random() * 4; // 14-18% radius = 28-36% bottom point
      
      // Each string has 15-20 lights for better coverage
      const lightCount = Math.floor(Math.random() * 6) + 15;
      const lights = Array.from({ length: lightCount }, (_, lightIndex) => {
        // Distribute lights evenly along the full semi-circle (angle from 0 to π)
        // Start exactly at the left edge (angle 0) and go to the right edge (angle π)
        const angle = (Math.PI * lightIndex) / (lightCount - 1);
        
        const position = calculateSemiCirclePosition(centerX, radius, angle);
        
        // Ensure edge lights are exactly at y=0 (top of page)
        const y = (lightIndex === 0 || lightIndex === lightCount - 1) ? 0 : position.y;
        
        // Use Christmas color selection
        const colorData = getRandomChristmasColor();
        
        return {
          id: lightIndex,
          y,
          x: position.x,
          color: colorData.light,
          glow: colorData.glow,
          size: Math.random() * 0.3 + 0.7, // Scale between 0.7 and 1.0
          delay: Math.random() * 3,
          duration: Math.random() * 1.5 + 1.5, // Duration between 1.5-3 seconds
        };
      });
      
      return {
        id: stringIndex,
        centerX,
        radius,
        lights,
      };
    });
    
    setStrings(newStrings);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <svg 
        className="absolute inset-0 w-full h-full" 
        style={{ overflow: 'visible' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {strings.map((string, stringIdx) => {
          // Generate SVG path for semi-circle wire using the same calculation as lights
          // This ensures perfect alignment between wires and lights
          const centerX = string.centerX;
          const radius = string.radius;
          
          // Calculate points along the semi-circle for the path
          const pathPoints: string[] = [];
          const numPathPoints = 50; // Smooth curve with 50 points
          
          for (let i = 0; i <= numPathPoints; i++) {
            const angle = (Math.PI * i) / numPathPoints; // 0 to π (left edge to right edge)
            const position = calculateSemiCirclePosition(centerX, radius, angle);
            
            if (i === 0) {
              // Start at left edge, touching top (y=0)
              pathPoints.push(`M ${position.x} 0`);
            } else {
              pathPoints.push(`L ${position.x} ${position.y}`);
            }
          }
          // Ensure path ends at right edge, touching top
          const rightEdgePos = calculateSemiCirclePosition(centerX, radius, Math.PI);
          pathPoints.push(`L ${rightEdgePos.x} 0`);
          
          const path = pathPoints.join(' ');
          const stringKey = `wire-${string.id ?? stringIdx}`;
          
          return (
            <g key={stringKey}>
              {/* Wire/string path - semi-circle */}
              <motion.path
                d={path}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="0.15"
                className="dark:stroke-gray-400"
                opacity={0.3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Lights */}
      {strings.map((string) =>
        string.lights.map((light) => {
          // Ensure unique key with explicit type checking
          const uniqueKey = `string-${string.id ?? 'unknown'}-light-${light.id ?? 'unknown'}`;
          
          return (
            <motion.div
              key={uniqueKey}
              className="absolute"
              style={{
                left: `${light.x}%`,
                top: `${light.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                opacity: [0.7, 1, 0.7, 1, 0.7],
                scale: [light.size * 0.9, light.size * 1.2, light.size * 1, light.size * 1.15, light.size * 0.9],
              }}
              transition={{
                duration: light.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: light.delay,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: light.color,
                  boxShadow: `0 0 8px ${light.glow}, 0 0 16px ${light.glow}, 0 0 24px ${light.glow}, 0 0 32px ${light.glow}`,
                }}
              />
            </motion.div>
          );
        })
      )}
    </div>
  );
}

