"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

// Import custom components
import { FloatingCard } from "~/components/landing/floating-card";
import { TextHoverEffect } from "~/components/landing/text-hover-effect";
import { HoverCard3D } from "~/components/landing/hover-card-3d";
import { AnimatedFeatures } from "~/components/landing/animated-features";
import { TestimonialSlider } from "~/components/landing/testimonial-slider";

// Import lucide icons
import { 
  Users, Handshake, MapPin, Award, 
  Star, MessageSquare, ArrowRight,
  ShieldCheck, Clock, Heart
} from "lucide-react";

// Import hero image
import hero from "../../assets/hero.svg";

export default function HomePage() {
  // References for scroll animations
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const howItWorksRef = useRef(null);
  
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });

  // Typewriter words
  const words = [
    { text: "Community" },
    { text: "Skills" },
    { text: "Connections" },
    { text: "Resources" },
    { text: "Support" },
  ];

  // Features data
  const features = [
    {
      icon: <Handshake className="h-6 w-6 text-primary" />,
      title: "Skill Exchange",
      description: "Trade your skills with neighbors and community members to help each other grow and save money.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Build Connections",
      description: "Forge meaningful relationships in your community through collaborative exchanges and mutual support.",
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Local Focus",
      description: "All exchanges happen locally, strengthening your community and reducing travel time.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Direct Communication",
      description: "Chat directly with community members to coordinate exchanges and build rapport.",
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Reputation System",
      description: "Build your reputation through reliable exchanges and positive feedback from community members.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Secure & Trusted",
      description: "Our verification system ensures safe interactions within your community network.",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      content: "Local Help connected me with a neighbor who taught me how to fix my bike. In return, I helped with their garden. It's amazing how we can help each other!",
      author: "Sarah Johnson",
      role: "Community Member",
    },
    {
      content: "I've been able to learn new skills without spending money on expensive classes. The people I've met through Local Help have become real friends.",
      author: "Michael Torres",
      role: "Skill Sharer",
    },
    {
      content: "As a newcomer to the neighborhood, Local Help made it easy to get involved and meet people. Now I feel truly connected to my community.",
      author: "Emma Wright",
      role: "New Resident",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      
      {/* Hero Section */}
      <section className="relative w-full px-4 py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-4">
                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Trade Skills,<br />
                  Build{" "}
                  <TextHoverEffect 
                    text="Community"
                    className="font-bold text-4xl sm:text-5xl lg:text-6xl"
                    containerClassName="inline-block"
                  />
                </motion.h1>
                
                <motion.p 
                  className="text-lg md:text-xl text-text max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Connect with your community, share your skills, and build lasting relationships. 
                  Local Help is your local hub for skill swapping and community building.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href='/local'>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-all"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
                <Link href='/about'>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-secondary/30 px-8 py-3 rounded-lg font-medium hover:bg-secondary/40 transition-all"
                  >
                    Learn More
                  </motion.button>
                </Link>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 border-2 border-white" />
                  ))}
                </div>
                <span>Joined by 1,000+ community members</span>
              </motion.div>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <FloatingCard 
                  hoverScale={1.02}
                  rotateIntensity={2}
                  backgroundGlow={true}
                  className="border-none shadow-xl rounded-2xl overflow-hidden p-4"
                >
                  <Image 
                    src={hero} 
                    alt="People connecting and helping each other" 
                    className="w-full h-auto" 
                    priority
                  />
                </FloatingCard>
              </motion.div>
              
              {/* Background decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section 
        ref={featuresRef} 
        className="w-full px-4 py-20 md:py-32 bg-white"
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Local Help</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make community collaboration simple, secure, and rewarding.
            </p>
          </motion.div>
          
          <AnimatedFeatures 
            features={features} 
            highlightColor="rgba(var(--primary-rgb), 0.1)"
          />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section 
        ref={howItWorksRef} 
        className="w-full px-4 py-20 md:py-32 bg-secondary/50"
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with Local Help is easy - here's how to begin sharing skills in your community.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Create Your Profile",
                description: "Sign up and list the skills you can offer and those you'd like to learn."
              },
              {
                icon: <MapPin className="h-8 w-8 text-primary" />,
                title: "Connect Locally",
                description: "Browse community members nearby with complementary skills and interests."
              },
              {
                icon: <Handshake className="h-8 w-8 text-primary" />,
                title: "Exchange Skills",
                description: "Arrange skill swaps and build your community network through meaningful exchanges."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                <HoverCard3D className="h-full p-6 bg-white">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-medium">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </HoverCard3D>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/local">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-all mx-auto"
              >
                Start Exchanging Skills <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        className="w-full px-4 py-20 md:py-32 bg-white"
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how Local Help is making a difference in communities just like yours.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TestimonialSlider 
              testimonials={testimonials}
              className="max-w-4xl mx-auto shadow-lg"
            />
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full px-4 py-20 md:py-24 bg-gradient-to-br from-primary/90 via-primary to-accent text-white">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Ready to Start Building Your Community?
            </motion.h2>
            
            <motion.p 
              className="text-lg opacity-90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Join Local Help today and begin connecting with neighbors, sharing skills, and strengthening your community.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/local">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Get Started Now
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
