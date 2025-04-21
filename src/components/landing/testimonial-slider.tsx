"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  content: string;
  author: string;
  role?: string;
  avatar?: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number; // in ms
  className?: string;
}

export function TestimonialSlider({ 
  testimonials, 
  autoPlayInterval = 5000,
  className 
}: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  }, [testimonials.length]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlayInterval <= 0) return;
    
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, goToNext]);

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-background shadow-sm",
      "p-4 sm:p-6", // Reduced padding on mobile
      className
    )}>
      <div className="relative h-full min-h-[200px] md:min-h-[220px]">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div 
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 sm:p-2"
          >
            <svg
              className="mb-2 sm:mb-4 h-8 w-8 sm:h-12 sm:w-12 text-primary/40"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="mb-4 sm:mb-6 text-base sm:text-lg md:text-xl font-medium leading-relaxed text-foreground line-clamp-5 sm:line-clamp-none">
              {testimonials[currentIndex].content}
            </p>
            <div className="flex items-center">
              {testimonials[currentIndex].avatar && (
                <div className="mr-4 h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full">
                  <img 
                    src={testimonials[currentIndex].avatar} 
                    alt={testimonials[currentIndex].author}
                    className="h-full w-full object-cover" 
                  />
                </div>
              )}
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">{testimonials[currentIndex].author}</div>
                {testimonials[currentIndex].role && (
                  <div className="text-xs sm:text-sm text-muted-foreground">{testimonials[currentIndex].role}</div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-2 sm:bottom-6 right-2 sm:right-6 flex items-center gap-2">
        <button 
          onClick={goToPrev}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-muted"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        <button 
          onClick={goToNext}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-muted"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>

      <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 flex items-center gap-1.5">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === currentIndex 
                ? "w-5 sm:w-6 bg-primary" 
                : "w-1.5 bg-primary/30"
            )}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}