import React from 'react';
import { CreatePost } from '~/components/post';
import { CirclePlus, House, MapPin, PlusCircle } from 'lucide-react';
import SparklesText from '~/components/ui/sparkles-text';
import Link from 'next/link';

const page = () => {
    return (
        <div className='w-full h-screen flex pt-10 flex-col items-center relative'>
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