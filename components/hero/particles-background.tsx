"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  pulsePhase: number;
  trail: Array<{ x: number; y: number; opacity: number }>;
  angle: number;
  angularVelocity: number;
  orbitRadius: number;
  orbitCenter: { x: number; y: number };
  speed: number;
  type: 'normal' | 'orbital' | 'fast';
  pulseTimer: number;
  baseOpacity: number;
  depth: number; // For depth-of-field blur
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const scrollYRef = useRef(0);

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

    const particles: Particle[] = [];
    const particleCount = 250; // 200-300 particles for neural network
    const colors = [
      { main: "#8B5CF6", glow: "rgba(139, 92, 246, 0.6)" }, // Neon purple
      { main: "#06B6D4", glow: "rgba(6, 182, 212, 0.6)" }, // Cyan
      { main: "#3B82F6", glow: "rgba(59, 130, 246, 0.6)" }, // Electric blue
    ];

    // Create neural network layers (input, hidden, output)
    const networkLayers = [
      { x: canvas.width * 0.15, y: canvas.height * 0.5, label: 'input' },
      { x: canvas.width * 0.4, y: canvas.height * 0.3, label: 'hidden1' },
      { x: canvas.width * 0.4, y: canvas.height * 0.7, label: 'hidden2' },
      { x: canvas.width * 0.65, y: canvas.height * 0.5, label: 'output' },
    ];

    // Initialize particles as neural network nodes
    for (let i = 0; i < particleCount; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      const baseRadius = Math.random() * 1.2 + 0.8; // Smaller particles for low-poly aesthetic
      const depth = Math.random(); // Depth for blur effect
      
      // Assign nodes to layers for neural network structure
      const layerIndex = Math.floor((i / particleCount) * networkLayers.length);
      const layer = networkLayers[layerIndex];
      const layerSpread = 150;
      
      const particleType = Math.random() < 0.15 ? 'orbital' : 'normal';
      
      let initialX, initialY, initialVx, initialVy, angle, angularVelocity, orbitRadius, orbitCenter;
      
      if (particleType === 'orbital') {
        // Orbital nodes around layer centers
        const center = layer;
        orbitRadius = Math.random() * 60 + 40;
        angle = Math.random() * Math.PI * 2;
        angularVelocity = (Math.random() - 0.5) * 0.01;
        initialX = center.x + Math.cos(angle) * orbitRadius;
        initialY = center.y + Math.sin(angle) * orbitRadius;
        initialVx = 0;
        initialVy = 0;
        orbitCenter = center;
      } else {
        // Nodes positioned in neural network layers with slight variation
        const layerOffsetX = (Math.random() - 0.5) * layerSpread;
        const layerOffsetY = (Math.random() - 0.5) * layerSpread;
        initialX = layer.x + layerOffsetX;
        initialY = layer.y + layerOffsetY;
        const speed = 0.15; // Slower, more stable movement
        const direction = Math.random() * Math.PI * 2;
        initialVx = Math.cos(direction) * speed;
        initialVy = Math.sin(direction) * speed;
        angle = 0;
        angularVelocity = 0;
        orbitRadius = 0;
        orbitCenter = { x: 0, y: 0 };
      }
      
      particles.push({
        x: initialX,
        y: initialY,
        vx: initialVx,
        vy: initialVy,
        radius: baseRadius,
        color: color.main,
        opacity: Math.random() * 0.4 + 0.3,
        baseOpacity: Math.random() * 0.4 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseTimer: Math.random() * 5, // Random pulse timing (3-5 seconds)
        trail: [],
        angle,
        angularVelocity,
        orbitRadius,
        orbitCenter,
        speed: particleType === 'fast' ? 0.4 : particleType === 'orbital' ? 0 : 0.25,
        type: particleType,
        depth,
      });
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Scroll interaction
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    function animate() {
      if (!ctx || !canvas) return;

      // Clear with fade effect for trails
      ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;
      const scrollOffset = scrollYRef.current * 0.5; // Scroll effect multiplier

      particles.forEach((particle, i) => {
        // Scroll effect - particles fade upward
        if (scrollOffset > 0) {
          particle.y -= scrollOffset * 0.1;
          particle.opacity = Math.max(0, particle.baseOpacity - scrollOffset * 0.01);
        } else {
          particle.opacity = particle.baseOpacity;
        }

        // Update position based on particle type
        if (particle.type === 'orbital') {
          // Orbital motion
          particle.angle += particle.angularVelocity;
          particle.x = particle.orbitCenter.x + Math.cos(particle.angle) * particle.orbitRadius;
          particle.y = particle.orbitCenter.y + Math.sin(particle.angle) * particle.orbitRadius;
          
          // Subtle drift to orbit center
          particle.orbitCenter.x += Math.sin(time * 0.3 + i) * 0.1;
          particle.orbitCenter.y += Math.cos(time * 0.3 + i) * 0.1;
        } else {
          // Normal movement with subtle wave patterns for fast particles
          if (particle.type === 'fast') {
            // Fast particles with subtle wave motion
            particle.x += particle.vx + Math.sin(time * 1.5 + i) * 0.15;
            particle.y += particle.vy + Math.cos(time * 1.5 + i) * 0.15;
          } else {
            particle.x += particle.vx;
            particle.y += particle.vy;
          }
        }

        // Boundary wrapping with smooth transition
        if (particle.x < -50) {
          particle.x = canvas.width + 50;
        } else if (particle.x > canvas.width + 50) {
          particle.x = -50;
        }
        if (particle.y < -50) {
          particle.y = canvas.height + 50;
        } else if (particle.y > canvas.height + 50) {
          particle.y = -50;
        }

        // Enhanced mouse interaction - particles accelerate and form clusters
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (mouseDistance < 150) {
          const force = (150 - mouseDistance) / 150;
          const pushForce = force * 0.05; // Stronger acceleration
          particle.vx += (dx / mouseDistance) * pushForce;
          particle.vy += (dy / mouseDistance) * pushForce;
          
          // Form clusters when close
          if (mouseDistance < 80) {
            particle.vx += (dx / mouseDistance) * 0.02; // Attraction to form cluster
            particle.vy += (dy / mouseDistance) * 0.02;
          }
        }

        // Smooth damping for calm movement
        if (particle.type !== 'orbital') {
          particle.vx *= 0.995;
          particle.vy *= 0.995;
          
          // Less frequent random variation
          if (Math.random() < 0.005) {
            particle.vx += (Math.random() - 0.5) * 0.1;
            particle.vy += (Math.random() - 0.5) * 0.1;
          }
        }

        // Pulsing effect with electric blue glow every 3-5 seconds
        particle.pulseTimer += 0.016; // ~60fps
        const pulseInterval = 3 + (particle.pulsePhase % 2); // 3-5 seconds
        const pulseCycle = (particle.pulseTimer % pulseInterval) / pulseInterval;
        const pulse = pulseCycle < 0.1 ? 1 + Math.sin(pulseCycle * Math.PI * 10) * 0.5 : 1; // Sharp pulse
        const currentRadius = particle.radius * pulse;
        
        // Electric blue glow during pulse
        const isPulsing = pulseCycle < 0.15;
        const glowColor = isPulsing ? "#3B82F6" : particle.color;

        // Update trail with fewer points for cleaner trails
        particle.trail.push({ x: particle.x, y: particle.y, opacity: 1 });
        if (particle.trail.length > (particle.type === 'fast' ? 6 : 5)) {
          particle.trail.shift();
        }

        // Draw enhanced trail with connecting lines
        particle.trail.forEach((point, index) => {
          if (index > 0) {
            const prevPoint = particle.trail[index - 1];
            const trailOpacity = (index / particle.trail.length) * particle.opacity * 0.4;
            
            // Draw connecting line
            const lineGradient = ctx.createLinearGradient(
              prevPoint.x,
              prevPoint.y,
              point.x,
              point.y
            );
            lineGradient.addColorStop(0, particle.color.replace("1)", `${trailOpacity * 0.3})`));
            lineGradient.addColorStop(1, particle.color.replace("1)", `${trailOpacity * 0.1})`));
            
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
          
          const trailOpacity = (index / particle.trail.length) * particle.opacity * 0.5;
          const trailRadius = currentRadius * (index / particle.trail.length + 0.2);
          
          const gradient = ctx.createRadialGradient(
            point.x,
            point.y,
            0,
            point.x,
            point.y,
            trailRadius * 3
          );
          gradient.addColorStop(0, particle.color.replace("1)", `${trailOpacity})`));
          gradient.addColorStop(1, "transparent");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, trailRadius * 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // Enhanced glow effect with depth-of-field blur simulation
        const glowSize = currentRadius * (3 + particle.depth * 2); // Larger glow for closer particles
        const blurAmount = particle.depth * 0.5; // More blur for distant particles
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize
        );
        
        const glowOpacity = isPulsing ? 0.8 : 0.4;
        glowGradient.addColorStop(0, glowColor);
        glowGradient.addColorStop(0.2, glowColor.replace("1)", `${glowOpacity * (1 - blurAmount)})`));
        glowGradient.addColorStop(0.5, glowColor.replace("1)", `${glowOpacity * 0.3 * (1 - blurAmount)})`));
        glowGradient.addColorStop(1, "transparent");

        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = particle.opacity * (1 - blurAmount * 0.3);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Core particle with inner glow (low-poly aesthetic)
        const coreGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          currentRadius
        );
        const coreColor = isPulsing ? "#3B82F6" : glowColor;
        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.4, coreColor);
        coreGradient.addColorStop(1, coreColor.replace("1)", "0.6)"));

        ctx.fillStyle = coreGradient;
        ctx.globalAlpha = particle.opacity * (1 - blurAmount * 0.2);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Neural network connections - connect to nearby nodes
        particles.slice(i + 1).forEach((otherParticle, sliceIndex) => {
          const otherIndex = i + 1 + sliceIndex;
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes within 100px with neon-purple and cyan lines
          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.4;
            const animatedOffset = Math.sin(time * 1.2 + i) * 0.1;
            
            // Animate connection strength (like neural network weights)
            const connectionStrength = 0.5 + Math.sin(time * 0.8 + i + otherIndex) * 0.3;
            
            // Alternate between purple and cyan for connections
            const connectionColorIndex = Math.floor((i + otherIndex) % 2);
            const connectionColor = connectionColorIndex === 0 ? "#8B5CF6" : "#06B6D4";
            
            const connectionGradient = ctx.createLinearGradient(
              particle.x,
              particle.y,
              otherParticle.x,
              otherParticle.y
            );
            
            // Neural network connection gradient with animated signal flow
            const flowPhase = (time * 0.8 + i) % 1;
            const signalOpacity = opacity * connectionStrength;
            
            // Convert hex to rgba for opacity manipulation
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            const color1 = hexToRgba(connectionColor, signalOpacity * (0.7 + animatedOffset));
            const color2 = hexToRgba(connectionColor, signalOpacity * (0.8 + Math.sin(flowPhase * Math.PI * 2) * 0.1));
            const color3 = hexToRgba(connectionColor, signalOpacity * (0.7 + animatedOffset));
            
            connectionGradient.addColorStop(0, color1);
            connectionGradient.addColorStop(0.3 + flowPhase * 0.2, color2);
            connectionGradient.addColorStop(0.7 + flowPhase * 0.2, color2);
            connectionGradient.addColorStop(1, color3);

            ctx.strokeStyle = connectionGradient;
            ctx.lineWidth = 0.8 + connectionStrength * 0.4;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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
