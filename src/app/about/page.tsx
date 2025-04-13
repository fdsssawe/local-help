'use client'

import { SignUpButton } from "@clerk/nextjs";
import Lottie from "lottie-react";
import Link from "next/link";
import groovyWalkAnimation from '~/../assets/about.json';
import { Button } from "~/components/ui/button";

export default function AboutPage() {
  return (
    <div className="w-full bg-background min-h-[calc(100vh-105px)] flex flex-col items-center py-16 px-4 md:px-8">
      <div className="max-w-5xl w-full mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          About <span className="bg-gradient-to-r from-primary via-accent to-secondary inline-block text-transparent bg-clip-text">Local Help</span>
        </h1>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 md:order-1">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg mb-6">
                Welcome to Local Help, your go-to marketplace for skill-sharing and service exchange within your local community. 
                We believe in fostering connections between individuals who have valuable skills to offer and those who need them.
              </p>
              <p className="text-lg">
                Whether you&apos;re looking for a handyman, language tutor, web developer, or fitness coach—our platform helps you find 
                trusted service providers near you.
              </p>
            </div>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <Lottie animationData={groovyWalkAnimation} className="w-full max-w-md" />
          </div>
        </div>
        
        <div className="space-y-16">
          <section className="bg-background/50 rounded-2xl p-8 shadow-sm border border-accent/10">
            <h2 className="text-2xl font-semibold mb-6 border-b border-accent/20 pb-3">Our Mission</h2>
            <p className="text-lg">
              Our mission is to empower local communities by making skill exchange accessible, convenient, and fair. 
              We aim to create an ecosystem where people can trade services, collaborate, and support each other 
              without the hassle of middlemen or excessive fees.
            </p>
          </section>

          <section className="bg-background/50 rounded-2xl p-8 shadow-sm border border-accent/10">
            <h2 className="text-2xl font-semibold mb-6 border-b border-accent/20 pb-3">Why Choose Us?</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <li className="flex gap-4 items-start">
                <div className="bg-primary/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Hyperlocal Matching</h3>
                  <p>Find skilled professionals or helpers in your area.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-primary/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Seamless Communication</h3>
                  <p>Chat with users directly without leaving the platform.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-primary/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Trusted Community</h3>
                  <p>Verified users, reviews, and ratings for safety.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-primary/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Diverse Services</h3>
                  <p>From tutoring to home repairs, find or offer any skill.</p>
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 shadow-sm border border-accent/10 text-center">
            <h2 className="text-2xl font-semibold mb-6">Get Started Today!</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join our growing community and start exchanging skills or offering your services today. 
              Whether you&apos;re a freelancer, a hobbyist, or someone who needs a hand, Local Help is here to connect you.
            </p>
            
              <Button asChild>
              <SignUpButton>
                👉 Sign Up Now
                </SignUpButton>
              </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
