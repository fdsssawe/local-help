"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  rotateIntensity?: number;
  backgroundGlow?: boolean;
  glowColor?: string;
}

export function FloatingCard({
  children,
  className,
  hoverScale = 1.05,
  rotateIntensity = 7,
  backgroundGlow = false,
  glowColor = "rgba(100, 255, 218, 0.15)",
  ...props
}: FloatingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -rotateIntensity;
    const rotateY = ((x - centerX) / centerX) * rotateIntensity;

    setMousePosition({ x: rotateY, y: rotateX });
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-background transition-colors",
        backgroundGlow && isHovered && "shadow-[0_0_30px_-5px_var(--glow-color)]",
        className
      )}
      style={{ 
        "--glow-color": glowColor 
      } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      animate={{
        rotateX: isHovered ? mousePosition.y : 0,
        rotateY: isHovered ? mousePosition.x : 0,
        scale: isHovered ? hoverScale : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}