"use client";

import { useEffect, useRef } from "react";

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

export default function SubtleTilesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

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
    const tileSize = 200; // Larger, more sparse tiles
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
        color: Math.random() < 0.5 ? "#4A5568" : "#374151",
        opacity: 0.02 + Math.random() * 0.03, // Very subtle
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

    // Helper function for hex to rgba conversion
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    function animate() {
      if (!ctx || !canvas) return;

      // Clear canvas with more fade for subtlety
      ctx.fillStyle = "rgba(10, 10, 10, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      // Sort tiles by z for proper depth rendering
      const sortedTiles = [...tiles].sort((a, b) => b.z - a.z);

      sortedTiles.forEach((tile, i) => {
        // Calculate distance from mouse
        const tileCenterX = tile.x + tile.size / 2;
        const tileCenterY = tile.y + tile.size / 2;
        const dx = mouseRef.current.x - tileCenterX;
        const dy = mouseRef.current.y - tileCenterY;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Subtle interactive rotation
        const maxDistance = 500;
        const influence = Math.max(0, 1 - mouseDistance / maxDistance);
        
        const rotationSpeed = influence * 0.02;
        tile.rotationY += (dx / maxDistance) * rotationSpeed;
        tile.rotationX += (-dy / maxDistance) * rotationSpeed;
        tile.rotationZ += Math.sin(Math.atan2(dy, dx)) * influence * 0.005;
        
        if (influence < 0.1) {
          tile.rotationZ += 0.0003;
        }
        
        tile.rotationX *= 0.96;
        tile.rotationY *= 0.96;
        tile.rotationZ *= 0.98;
        
        const interactiveOpacity = tile.opacity * (1 + influence * 1.5);

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
        
        const halfSize = tile.size / 2;
        const corners = [
          { x: -halfSize, y: -halfSize, z: 0 },
          { x: halfSize, y: -halfSize, z: 0 },
          { x: halfSize, y: halfSize, z: 0 },
          { x: -halfSize, y: halfSize, z: 0 },
        ];

        const projectedCorners = corners.map((corner) => {
          let y = corner.y * cosX - corner.z * sinX;
          let z = corner.y * sinX + corner.z * cosX;
          const x = corner.x;
          
          const newX = x * cosY + z * sinY;
          const newZ = -x * sinY + z * cosY;
          const newY = y;
          
          const finalX = newX * cosZ - newY * sinZ;
          const finalY = newX * sinZ + newY * cosZ;
          const finalZ = newZ;
          
          const projectedX = tile.x + halfSize + finalX * scale;
          const projectedY = tile.y + halfSize + finalY * scale;
          
          return { x: projectedX, y: projectedY, z: finalZ };
        });

        // Draw tile
        ctx.save();
        
        const gradient = ctx.createLinearGradient(
          projectedCorners[0].x,
          projectedCorners[0].y,
          projectedCorners[2].x,
          projectedCorners[2].y
        );
        
        const baseOpacity = interactiveOpacity * (0.1 + scale * 0.15);
        const lightIntensity = Math.max(0.1, Math.cos(tile.rotationX) * Math.cos(tile.rotationY));
        
        gradient.addColorStop(0, hexToRgba(tile.color, baseOpacity * lightIntensity));
        gradient.addColorStop(0.5, hexToRgba(tile.color, baseOpacity * (lightIntensity * 0.7)));
        gradient.addColorStop(1, hexToRgba(tile.color, baseOpacity * (lightIntensity * 0.5)));

        ctx.fillStyle = gradient;
        ctx.strokeStyle = hexToRgba(tile.color, baseOpacity * 0.15);
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
        ctx.lineTo(projectedCorners[1].x, projectedCorners[1].y);
        ctx.lineTo(projectedCorners[2].x, projectedCorners[2].y);
        ctx.lineTo(projectedCorners[3].x, projectedCorners[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      setCanvasSize();
      
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
          color: Math.random() < 0.5 ? "#4A5568" : "#374151",
          opacity: 0.02 + Math.random() * 0.03,
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

