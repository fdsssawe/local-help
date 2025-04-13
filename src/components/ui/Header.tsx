"use client"

import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Skeleton } from "~/components/ui/skeleton";
import Image from 'next/image';
import Link from "next/link"
import { cn } from "~/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "~/components/ui/navigation"
import { Menu, X, Search, MapPin, AlertCircle } from 'lucide-react';

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/40 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        className
                    )} 
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="text-text body-font font-medium font-primary fixed top-0 w-full z-50 bg-background shadow-sm">
            <div className="container mx-auto flex flex-wrap p-5 py-2 flex-row items-center">
                <a className="flex font-bold items-center text-gray-900 mb-0 flex-1" href='/'>
                    <Image src="https://utfs.io/f/1577fa92-718f-43f7-a234-8aac96ab384c-5nx4sw.png" alt="logo" width={40} height={40} />
                    <span className="ml-2 text-base text-text">Local help</span>
                </a>
                
                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                        className="focus:outline-none"
                    >
                        {mobileMenuOpen ? 
                            <X className="h-6 w-6" /> : 
                            <Menu className="h-6 w-6" />
                        }
                    </button>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <SignedIn>
                                    <NavigationMenuTrigger>Posts</NavigationMenuTrigger>
                                </SignedIn>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <a
                                                    className="flex h-full w-full select-none flex-col justify-center items-center rounded-md bg-gradient-to-b from-primary/40 to-secondary p-6 no-underline outline-none focus:shadow-md"
                                                    href="/"
                                                >
                                                    <Image src="https://utfs.io/f/1577fa92-718f-43f7-a234-8aac96ab384c-5nx4sw.png" alt="logo" width={36} height={36} />
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem href="/local" title="Local">
                                            List of the posts in your area.
                                        </ListItem>
                                        <ListItem href="/post" title="Post">
                                            Add a new post.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <SignedIn>
                                <NavigationMenuItem>
                                    <Link href="/chats" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                            Chats
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            </SignedIn>
                            <NavigationMenuItem>
                                <Link href="/about" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        About
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/lost-found" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Lost & Found
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className='relative overflow-hidden h-full flex-1 flex justify-end'>
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                        <Skeleton className='w-7 h-7 -z-10 absolute rounded-full' />
                    </SignedIn>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-gray-200 py-2">
                    <div className="container mx-auto px-5">
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="block py-2 hover:text-primary">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/local" className="block py-2 hover:text-primary">
                                    Local Posts
                                </Link>
                            </li>
                            <li>
                                <Link href="/post" className="block py-2 hover:text-primary">
                                    New Post
                                </Link>
                            </li>
                            <li>
                                <Link href="/chats" className="block py-2 hover:text-primary">
                                    My Chats
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="block py-2 hover:text-primary">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/lost-found" className="block py-2 hover:text-primary">
                                    Lost & Found
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </header>
    )
}
