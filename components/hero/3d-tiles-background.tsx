"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Tile {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  color: string;
  opacity: number;
  size: number;
  baseColor: string; // Store original color for interpolation
}

export default function Tiles3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseVelocityRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const tiles: Tile[] = [];
    const tileSize = 150; // Larger tiles, less dense
    const cols = Math.ceil(canvas.width / tileSize) + 2;
    const rows = Math.ceil(canvas.height / tileSize) + 2;
    const totalTiles = cols * rows;

    // Create grid of 3D tiles
    for (let i = 0; i < totalTiles; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - 1) * tileSize;
      const y = (row - 1) * tileSize;
      
      const baseColor = isLight 
        ? (Math.random() < 0.5 ? "#6B7280" : "#4B5563") // Medium-dark grays for light theme
        : (Math.random() < 0.5 ? "#4A5568" : "#374151"); // Dark gray tones for dark theme
      
      tiles.push({
        x,
        y,
        z: Math.random() * 100 - 50,
        rotationX: Math.random() * Math.PI * 0.1,
        rotationY: Math.random() * Math.PI * 0.1,
        rotationZ: Math.random() * Math.PI * 0.1,
        // Theme-aware colors
        color: baseColor,
        baseColor: baseColor, // Store original for color interpolation
        opacity: 0.08 + Math.random() * 0.06, // More visible
        size: tileSize,
      });
    }

    // Mouse interaction with velocity tracking
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastTimeRef.current) / 16.67; // Normalize to ~60fps
      
      // Calculate velocity
      mouseVelocityRef.current = {
        x: (e.clientX - lastMouseRef.current.x) / dt,
        y: (e.clientY - lastMouseRef.current.y) / dt,
      };
      
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
      
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      lastTimeRef.current = now;
    };

    window.addEventListener("mousemove", handleMouseMove);

    function animate() {
      if (!ctx || !canvas) return;

      // Clear canvas with theme-aware fade
      ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.08)" : "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Sort tiles by z for proper depth rendering
      const sortedTiles = [...tiles].sort((a, b) => b.z - a.z);

      // Helper function for hex to rgba conversion
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      sortedTiles.forEach((tile, i) => {
        // Calculate distance from mouse
        const tileCenterX = tile.x + tile.size / 2;
        const tileCenterY = tile.y + tile.size / 2;
        const dx = mouseRef.current.x - tileCenterX;
        const dy = mouseRef.current.y - tileCenterY;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Enhanced interactive rotation based on mouse position
        const maxDistance = 600; // Increased from 400
        const influence = Math.max(0, 1 - mouseDistance / maxDistance);
        
        // Velocity-based momentum for smoother, more dynamic effects
        const velocityInfluence = Math.min(1, (Math.abs(mouseVelocityRef.current.x) + Math.abs(mouseVelocityRef.current.y)) / 50);
        const momentum = 1 + velocityInfluence * 0.5;
        
        // Stronger rotation response with velocity momentum
        const rotationSpeed = influence * 0.12 * momentum; // Increased from 0.05
        tile.rotationY += (dx / maxDistance) * rotationSpeed * 1.5;
        tile.rotationX += (-dy / maxDistance) * rotationSpeed * 1.5;
        
        // Z-axis rotation based on mouse movement with velocity
        const angle = Math.atan2(dy, dx);
        tile.rotationZ += Math.sin(angle) * influence * 0.02 * momentum; // Increased from 0.01
        
        // Subtle continuous rotation when not interacting
        if (influence < 0.1) {
          tile.rotationZ += 0.0005;
        }
        
        // Enhanced damping for smoother motion
        tile.rotationX *= 0.95;
        tile.rotationY *= 0.95;
        tile.rotationZ *= 0.97;
        
        // Interactive opacity - tiles brighten near mouse (more dramatic)
        const interactiveOpacity = tile.opacity * (1 + influence * 4); // Increased from * 2

        // Calculate 3D position
        const cosX = Math.cos(tile.rotationX);
        const sinX = Math.sin(tile.rotationX);
        const cosY = Math.cos(tile.rotationY);
        const sinY = Math.sin(tile.rotationY);
        const cosZ = Math.cos(tile.rotationZ);
        const sinZ = Math.sin(tile.rotationZ);

        // 3D to 2D projection
        const perspective = 1000;
        const depthScale = perspective / (perspective + tile.z);
        
        // Calculate tile corners in 3D space
        const halfSize = tile.size / 2;
        const corners = [
          { x: -halfSize, y: -halfSize, z: 0 },
          { x: halfSize, y: -halfSize, z: 0 },
          { x: halfSize, y: halfSize, z: 0 },
          { x: -halfSize, y: halfSize, z: 0 },
        ];

        // Rotate and project corners
        const projectedCorners = corners.map((corner) => {
          // Rotate around X
          let y = corner.y * cosX - corner.z * sinX;
          let z = corner.y * sinX + corner.z * cosX;
          const x = corner.x;
          
          // Rotate around Y
          const newX = x * cosY + z * sinY;
          const newZ = -x * sinY + z * cosY;
          const newY = y;
          
          // Rotate around Z
          const finalX = newX * cosZ - newY * sinZ;
          const finalY = newX * sinZ + newY * cosZ;
          const finalZ = newZ;
          
          // Project to 2D
          const projectedX = tile.x + halfSize + finalX * depthScale;
          const projectedY = tile.y + halfSize + finalY * depthScale;
          
          return { x: projectedX, y: projectedY, z: finalZ };
        });

        // Draw tile with gradient based on rotation
        ctx.save();
        
        // Use base color (no color interpolation)
        const currentColor = tile.baseColor;
        
        // Create gradient for tile face
        const gradient = ctx.createLinearGradient(
          projectedCorners[0].x,
          projectedCorners[0].y,
          projectedCorners[2].x,
          projectedCorners[2].y
        );
        
        const baseOpacity = interactiveOpacity * (0.25 + depthScale * 0.3); // Increased visibility
        const lightIntensity = Math.max(0.15, Math.cos(tile.rotationX) * Math.cos(tile.rotationY));
        
        gradient.addColorStop(0, hexToRgba(currentColor, baseOpacity * lightIntensity));
        gradient.addColorStop(0.5, hexToRgba(currentColor, baseOpacity * (lightIntensity * 0.7)));
        gradient.addColorStop(1, hexToRgba(currentColor, baseOpacity * (lightIntensity * 0.5)));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = hexToRgba(currentColor, baseOpacity * 0.2);
        ctx.lineWidth = 0.5; // Thinner lines

        // Draw tile
        ctx.beginPath();
        ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
        ctx.lineTo(projectedCorners[1].x, projectedCorners[1].y);
        ctx.lineTo(projectedCorners[2].x, projectedCorners[2].y);
        ctx.lineTo(projectedCorners[3].x, projectedCorners[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Enhanced glow for depth and interactivity (more visible)
        const glowIntensity = influence * 0.6 + (depthScale > 0.8 ? 0.15 : 0); // Increased from 0.3
        if (glowIntensity > 0.05) {
          const glowSize = tile.size * 0.8;
          const glowGradient = ctx.createRadialGradient(
            tileCenterX,
            tileCenterY,
            0,
            tileCenterX,
            tileCenterY,
            glowSize
          );
          glowGradient.addColorStop(0, hexToRgba(currentColor, baseOpacity * glowIntensity * 0.4)); // Increased from 0.2
          glowGradient.addColorStop(0.5, hexToRgba(currentColor, baseOpacity * glowIntensity * 0.15));
          glowGradient.addColorStop(1, "transparent");
          
          ctx.fillStyle = glowGradient;
          ctx.fillRect(
            tile.x - tile.size * 0.4,
            tile.y - tile.size * 0.4,
            tile.size * 1.8,
            tile.size * 1.8
          );
        }

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      setCanvasSize();
      
      // Recreate tiles for new size
      tiles.length = 0;
      const newCols = Math.ceil(canvas.width / tileSize) + 2;
      const newRows = Math.ceil(canvas.height / tileSize) + 2;
      const newTotalTiles = newCols * newRows;
      
      for (let i = 0; i < newTotalTiles; i++) {
        const col = i % newCols;
        const row = Math.floor(i / newCols);
        const x = (col - 1) * tileSize;
        const y = (row - 1) * tileSize;
        
        const baseColor = isLight 
          ? (Math.random() < 0.5 ? "#6B7280" : "#4B5563") // Medium-dark grays for light theme
          : (Math.random() < 0.5 ? "#4A5568" : "#374151"); // Dark gray tones for dark theme
          
        tiles.push({
          x,
          y,
          z: Math.random() * 100 - 50,
          rotationX: Math.random() * Math.PI * 0.1,
          rotationY: Math.random() * Math.PI * 0.1,
          rotationZ: Math.random() * Math.PI * 0.1,
          // Theme-aware colors
          color: baseColor,
          baseColor: baseColor, // Store original for color interpolation
          opacity: 0.08 + Math.random() * 0.06, // More visible
          size: tileSize,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLight, mounted]);

  // Don't render canvas until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

