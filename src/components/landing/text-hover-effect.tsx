"use client";

import { cn } from "~/lib/utils";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface TextHoverEffectProps {
  text: string;
  className?: string;
  containerClassName?: string;
}

export function TextHoverEffect({
  text,
  className,
  containerClassName,
}: TextHoverEffectProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset position on mount and when text changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      setPosition({ x: width / 2, y: height / 2 });
    }
  }, [text]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { left, top, width, height } = container.getBoundingClientRect();
    
    // Calculate the mouse position relative to the container
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    setPosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0"
        animate={{
          opacity: isHovered ? 0.15 : 0,
          background: isHovered 
            ? `radial-gradient(circle at ${position.x}px ${position.y}px, hsl(var(--primary)), transparent 50%)`
            : "none",
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Foreground text */}
      <div className={cn(
        "relative z-10 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent",
        className
      )}>
        {text}
      </div>
    </div>
  );
}