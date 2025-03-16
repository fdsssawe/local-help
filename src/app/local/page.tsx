import React from 'react';
import { CreatePost } from '~/components/post';
import { CirclePlus, House, MapPin, PlusCircle } from 'lucide-react';
import { GetLocal } from '~/components/local';

const page = () => {
    return (
        <div className='w-full h-full flex pt-20 md:pt-10 flex-col items-center relative px-2 sm:px-4'>
            {/* <div className='hidden flex-col border-box min-w-[180px] w-[180px] pr-6 gap-2 items-start lg:flex absolute top-[15%] left-[14.5%]'>
                <a href="/"  className='text-base-subtle text-sm font-semibold leading-5 flex flex-row items-center gap-1 hover:bg-accent/10 w-[100px] px-1 rounded-md'><House className='h-4 w-4 text-primary'/> Home</a>
                <a href="/post" className='text-base-subtle text-sm font-semibold leading-5 flex flex-row items-center gap-1 hover:bg-accent/10 w-[100px] px-1 rounded-md'><PlusCircle className='h-4 w-4 text-primary'/> Post</a>
                <a href="/local" className='text-base-subtle text-sm font-semibold leading-5 flex flex-row items-center gap-1 hover:bg-accent/10 w-[100px] px-1 rounded-md'><MapPin className='h-4 w-4 text-primary'/> Local posts</a>
                <Link href="#note" className='text-base-subtle text-sm font-semibold leading-5'>fsfds</Link>
            </div> */}
            <div className='w-full max-w-6xl flex justify-center'>
                <GetLocal/>
            </div>
        </div>
    );
};

export default page;