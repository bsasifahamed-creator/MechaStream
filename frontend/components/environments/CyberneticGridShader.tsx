'use client';

import React, { useEffect, useRef } from 'react';

interface CyberneticGridShaderProps {
  className?: string;
}

export default function CyberneticGridShader({ className }: CyberneticGridShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!ctx) return;

    // WebGL setup would go here
    // For this example, we'll use a simple CSS-based grid animation
    // In a real implementation, this would be a full WebGL shader

    const cleanup = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    // Simple grid animation using CSS transforms
    let time = 0;
    const animate = () => {
      time += 0.01;
      // Animation logic would go here
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return cleanup;
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particleFloat ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Hidden canvas for future WebGL implementation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'none' }}
      />

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
