import React from 'react';
import { CreatePost } from '~/components/post';
import { CirclePlus, House, MapPin, PlusCircle } from 'lucide-react';
import SparklesText from '~/components/ui/sparkles-text';
import Link from 'next/link';

const page = () => {
    return (
        <div className='w-full h-screen flex pt-10 flex-col items-center relative'>
            {/* <div className='hidden flex-col border-box min-w-[180px] w-[180px] pr-6 gap-2 items-start lg:flex absolute top-[15%] left-[14.5%]'>
                <a href="/"  className='text-base-subtle text-sm font-semibold leading-5 flex flex-row items-center gap-1 hover:bg-accent/10 w-[100px] px-1 rounded-md'><House className='h-4 w-4 text-primary'/> Home</a>
                <a href="/post" className='text-base-subtle text-sm font-semibold leading-5 flex flex-row items-center gap-1 hover:bg-accent/10 w-[100px] px-1 rounded-md'><PlusCircle className='h-4 w-4 text-primary'/> Post</a>
                <a href="/local" className='text-base-subtle text-sm font-semibold leading-5 flex flex-row items-center gap-1 hover:bg-accent/10 w-[100px] px-1 rounded-md'><MapPin className='h-4 w-4 text-primary'/> Local posts</a>
                <Link href="#note" className='text-base-subtle text-sm font-semibold leading-5'>fsfds</Link>
            </div> */}
            <CirclePlus size={50} className='text-primary mt-2'/>
            <h1 className='text-4xl font-bold text-center flex justify-center items-center w-full max-w-[18rem]'><SparklesText text='New Post'/></h1>
            <h2 className='mt-2 text-text/50'>Let people around you know if you need/offer help</h2>
            <div className='h-[80vh] w-[30vw] rounded-2xl p-4 justify-center flex pt-20'>
                <CreatePost/>
            </div>
        </div>
    );
};

export default page;