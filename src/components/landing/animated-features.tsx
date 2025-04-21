"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AnimatedFeaturesProps {
  features: FeatureItem[];
  className?: string;
  highlightColor?: string;
}

export function AnimatedFeatures({ 
  features, 
  className,
  highlightColor = "rgba(59, 130, 246, 0.2)" 
}: AnimatedFeaturesProps) {
  return (
    <div className={cn("py-10", className)}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <FeatureCard
            key={idx}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={idx * 0.15}
            highlightColor={highlightColor}
          />
        ))}
      </div>
    </div>
  );
}

interface FeatureCardProps extends FeatureItem {
  delay: number;
  highlightColor: string;
}

function FeatureCard({ icon, title, description, delay, highlightColor }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-muted/15">
        {icon}
      </div>
      
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      
      <div
        className="absolute inset-0 -z-10 transform-gpu animate-pulse rounded-xl opacity-0 blur-3xl transition-all duration-300 group-hover:opacity-100"
        style={{ 
          background: `radial-gradient(circle at center, ${highlightColor} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}