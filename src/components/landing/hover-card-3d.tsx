"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface HoverCard3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  backgroundClassName?: string;
  depth?: number;
  imageUrl?: string;
}

export function HoverCard3D({
  children,
  className,
  backgroundClassName,
  depth = 14,
  imageUrl,
  ...props
}: HoverCard3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      // Calculate rotation values between -10 and 10 degrees
      const rotateY = ((mouseX - centerX) / (rect.width / 2)) * depth;
      const rotateX = ((centerY - mouseY) / (rect.height / 2)) * depth;
      
      setRotateX(rotateX);
      setRotateY(rotateY);
    }
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative z-0 cursor-pointer overflow-hidden rounded-xl border border-accent/20 bg-background transition-colors hover:border-accent/50",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      {...props}
    >
      {/* Background with subtle hover effect */}
      {imageUrl ? (
        <div
          className={cn("absolute inset-0 h-full w-full bg-cover bg-center", 
            backgroundClassName)}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className={cn("absolute inset-0 h-full w-full", backgroundClassName)} />
      )}

      {/* Card content - positioned in 3D space */}
      <motion.div 
        className="relative z-10 h-full"
        animate={{
          z: isHovered ? 10 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ transform: "translateZ(20px)" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}