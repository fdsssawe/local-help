import Link from "next/link";
import { db } from "~/server/db";

export const dynamic = "force-dynamic"

export default async function HomePage() {

  const images = await db.query.posts.findMany({
    orderBy: (model, {desc}) => desc(model.id),
  })


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-3xl font-bold">Welcome to Next.js</h1>
      <div className="flex flex-wrap justify-center gap-4" >
        {images.map((image, index) => (
            <a key={index}>
              <img src={image.url} alt="image" className="w-40 h-40 object-cover" />
              <span>{image.name}</span>
            </a>
        ))}
      </div>
    </main>
  );
}
