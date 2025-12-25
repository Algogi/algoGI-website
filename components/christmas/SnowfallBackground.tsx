"use client";

import { useEffect, useRef } from 'react';
import { PerformanceMode } from '@/lib/christmas/use-performance-mode';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
}

interface SnowfallBackgroundProps {
  performanceMode?: PerformanceMode;
}

export default function SnowfallBackground({ performanceMode = 'high' }: SnowfallBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const snowflakesRef = useRef<Snowflake[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Determine snowflake count based on performance mode
    const getSnowflakeCount = (): number => {
      switch (performanceMode) {
        case 'high':
          return 100;
        case 'medium':
          return 50;
        case 'low':
          return 25;
        case 'minimal':
          return 10;
        default:
          return 100;
      }
    };

    // Initialize snowflakes
    const initSnowflakes = () => {
      const snowflakeCount = getSnowflakeCount();
      snowflakesRef.current = Array.from({ length: snowflakeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 5 + 2, // Larger snowflakes (2-7px)
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.5,
      }));
    };

    initSnowflakes();

    // Determine frame throttle based on performance mode
    const getFrameDelay = (): number => {
      switch (performanceMode) {
        case 'high':
          return 0; // No throttle, use requestAnimationFrame
        case 'medium':
          return 16; // ~60fps (1 frame delay)
        case 'low':
          return 33; // ~30fps (2 frame delay)
        case 'minimal':
          return 66; // ~15fps (4 frame delay)
        default:
          return 0;
      }
    };

    const frameDelay = getFrameDelay();
    let lastFrameTime = 0;

    const animate = (currentTime: number) => {
      // Throttle frames for lower performance modes
      if (frameDelay > 0 && currentTime - lastFrameTime < frameDelay) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((flake) => {
        // Update position
        flake.y += flake.speed;
        // Simplify horizontal drift for lower modes
        if (performanceMode !== 'minimal') {
          flake.x += Math.sin(flake.y * 0.01) * 0.5; // Slight horizontal drift
        }

        // Reset if off screen
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }

        // Draw snowflake
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [performanceMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        willChange: 'contents',
        contain: 'layout style paint',
        transform: 'translateZ(0)',
      }}
    />
  );
}
