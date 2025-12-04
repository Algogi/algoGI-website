"use client";

import { useEffect, useRef } from "react";
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
}

export default function Tiles3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
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
      
      tiles.push({
        x,
        y,
        z: Math.random() * 100 - 50,
        rotationX: Math.random() * Math.PI * 0.1,
        rotationY: Math.random() * Math.PI * 0.1,
        rotationZ: Math.random() * Math.PI * 0.1,
        // Theme-aware colors
        color: isLight 
          ? (Math.random() < 0.5 ? "#D1D5DB" : "#E5E7EB") // Light gray tones for light theme
          : (Math.random() < 0.5 ? "#4A5568" : "#374151"), // Dark gray tones for dark theme
        opacity: 0.03 + Math.random() * 0.04, // Even more subtle
        size: tileSize,
      });
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    function animate() {
      if (!ctx || !canvas) return;

      // Clear canvas with theme-aware fade
      ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.03)" : "rgba(10, 10, 10, 0.05)";
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
        const maxDistance = 400;
        const influence = Math.max(0, 1 - mouseDistance / maxDistance);
        
        // Stronger rotation response
        const rotationSpeed = influence * 0.05;
        tile.rotationY += (dx / maxDistance) * rotationSpeed;
        tile.rotationX += (-dy / maxDistance) * rotationSpeed;
        
        // Z-axis rotation based on mouse movement
        const angle = Math.atan2(dy, dx);
        tile.rotationZ += Math.sin(angle) * influence * 0.01;
        
        // Subtle continuous rotation when not interacting
        if (influence < 0.1) {
          tile.rotationZ += 0.0005;
        }
        
        // Enhanced damping for smoother motion
        tile.rotationX *= 0.95;
        tile.rotationY *= 0.95;
        tile.rotationZ *= 0.97;
        
        // Interactive opacity - tiles brighten near mouse
        const interactiveOpacity = tile.opacity * (1 + influence * 2);

        // Calculate 3D position
        const cosX = Math.cos(tile.rotationX);
        const sinX = Math.sin(tile.rotationX);
        const cosY = Math.cos(tile.rotationY);
        const sinY = Math.sin(tile.rotationY);
        const cosZ = Math.cos(tile.rotationZ);
        const sinZ = Math.sin(tile.rotationZ);

        // 3D to 2D projection
        const perspective = 1000;
        const scale = perspective / (perspective + tile.z);
        
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
          const projectedX = tile.x + halfSize + finalX * scale;
          const projectedY = tile.y + halfSize + finalY * scale;
          
          return { x: projectedX, y: projectedY, z: finalZ };
        });

        // Draw tile with gradient based on rotation
        ctx.save();
        
        // Create gradient for tile face
        const gradient = ctx.createLinearGradient(
          projectedCorners[0].x,
          projectedCorners[0].y,
          projectedCorners[2].x,
          projectedCorners[2].y
        );
        
        const baseOpacity = interactiveOpacity * (0.15 + scale * 0.2); // Very subtle
        const lightIntensity = Math.max(0.15, Math.cos(tile.rotationX) * Math.cos(tile.rotationY));
        
        gradient.addColorStop(0, hexToRgba(tile.color, baseOpacity * lightIntensity));
        gradient.addColorStop(0.5, hexToRgba(tile.color, baseOpacity * (lightIntensity * 0.7)));
        gradient.addColorStop(1, hexToRgba(tile.color, baseOpacity * (lightIntensity * 0.5)));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = hexToRgba(tile.color, baseOpacity * 0.2);
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

        // Add very subtle glow for depth and interactivity
        const glowIntensity = influence * 0.3 + (scale > 0.8 ? 0.1 : 0);
        if (glowIntensity > 0.05) {
          const glowGradient = ctx.createRadialGradient(
            tileCenterX,
            tileCenterY,
            0,
            tileCenterX,
            tileCenterY,
            tile.size * 0.6
          );
          glowGradient.addColorStop(0, hexToRgba(tile.color, baseOpacity * glowIntensity * 0.2));
          glowGradient.addColorStop(1, "transparent");
          
          ctx.fillStyle = glowGradient;
          ctx.fillRect(
            tile.x - tile.size * 0.3,
            tile.y - tile.size * 0.3,
            tile.size * 1.6,
            tile.size * 1.6
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
        
        tiles.push({
          x,
          y,
          z: Math.random() * 100 - 50,
          rotationX: Math.random() * Math.PI * 0.1,
          rotationY: Math.random() * Math.PI * 0.1,
          rotationZ: Math.random() * Math.PI * 0.1,
          // Theme-aware colors
          color: isLight 
            ? (Math.random() < 0.5 ? "#D1D5DB" : "#E5E7EB") // Light gray tones for light theme
            : (Math.random() < 0.5 ? "#4A5568" : "#374151"), // Dark gray tones for dark theme
          opacity: 0.03 + Math.random() * 0.04, // Even more subtle
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
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

