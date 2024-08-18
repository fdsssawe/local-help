import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Skeleton } from "~/components/ui/skeleton";
import Image from 'next/image';

export default function Header() {

    return (
        <header className="text-text body-font font-medium">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <Image src="https://utfs.io/f/1577fa92-718f-43f7-a234-8aac96ab384c-5nx4sw.png" alt="logo" width={40} height={40} />
            <span className="ml-3 text-xl">Local help</span>
            </a>
            <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
            <a className="mr-5 hover:text-gray-900">First Link</a>
            <a className="mr-5 hover:text-gray-900">Second Link</a>
            <a className="mr-5 hover:text-gray-900">Third Link</a>
            <a className="mr-5 hover:text-gray-900">Fourth Link</a>
            </nav>
            <SignedOut>
            <SignInButton />
            </SignedOut>
            <div className='relative overflow-hidden w-7 h-7'>
            <SignedIn>
            <UserButton />
            <Skeleton className='w-7 h-7 -z-10 absolute rounded-full'/>
            </SignedIn>
            </div>
        </div>
        </header>
    )
  
}
