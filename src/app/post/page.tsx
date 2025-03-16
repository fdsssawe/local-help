import React from 'react';
import { CreatePost } from '~/components/post';
import { CirclePlus, House, MapPin, PlusCircle } from 'lucide-react';
import SparklesText from '~/components/ui/sparkles-text';
import Link from 'next/link';

const page = () => {
    return (
        <div className='w-full h-full flex pt-20 md:pt-10 flex-col items-center relative px-4'>
            <CirclePlus size={50} className='text-primary mt-2'/>
            <h1 className='text-3xl md:text-4xl font-bold text-center flex justify-center items-center w-full max-w-[18rem]'><SparklesText text='New Post'/></h1>
            <h2 className='mt-2 text-text/50 text-center'>Let people around you know if you need/offer help</h2>
            <div className='h-[80vh] w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] xl:w-[30vw] rounded-2xl p-2 md:p-4 justify-center flex pt-10 md:pt-20'>
                <CreatePost/>
            </div>
        </div>
    );
};

export default page;