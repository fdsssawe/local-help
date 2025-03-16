import Image from "next/image";
import hero from "../../assets/hero.svg";
export const dynamic = "force-dynamic"
import { api, HydrateClient } from "~/trpc/server";
import Link from "next/link";

export default async function HomePage() {

  return (
    <HydrateClient>
      <div className="w-full flex text-text flex-col items-center h-full relative">
      <div className="w-full flex flex-col md:flex-row items-center min-h-[calc(100vh-105px)] pt-16 md:pt-0">
      <div className="h-full max-h-[700px] flex justify-center items-center flex-col w-full p-4 md:p-0">
        <div className="w-fit">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.8rem] font-[700] leading-tight md:leading-[4rem]">Trade Skills <br/>Build <p className="bg-gradient-to-r from-primary via-accent to-secondary inline-block text-transparent bg-clip-text leading-tight md:leading-[7rem]">Community</p></h1>
        <h2 className="text-sm sm:text-base leading-normal md:leading-[2rem] font-medium mt-2">Connect with your community and share your skills.<br className="hidden md:block"/> Local Help is your local hub for skill swapping and building connections.</h2>
        <div className="flex flex-wrap justify-center sm:justify-start items-center w-fit font-medium mt-4">
          <Link href='/local'><button className="bg-secondary/30 p-[0.8rem] px-6 rounded-[.41rem] my-2 w-full sm:w-auto">Get Started</button></Link>
          <Link href='/about'><button className="bg-primary px-6 p-[0.8rem] rounded-[.41rem] m-2 w-full sm:w-auto">Learn More</button></Link>
        </div>
        </div>
      </div>
      <div className="max-h-[400px] md:max-h-[700px] w-full items-start flex justify-center md:justify-start">
        <Image src={hero} alt="Hero Image" className="w-full max-w-md md:max-w-none" />
      </div>
      </div>
    </div>
    </HydrateClient>
  );
}
