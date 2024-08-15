import Link from "next/link";


const mockUrls = [
  "https://utfs.io/f/8f50c735-de12-4587-9f19-8bc776443b38-3sad18.jpg",
  "https://utfs.io/f/16bdba7c-3957-424b-b915-a9976d40f73b-rj7jk.jpg"
]

const mockImage = mockUrls.map((url, index) => ({
  id : index + 1,
  url,
}))

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-3xl font-bold">Welcome to Next.js</h1>
      <div className="flex flex-wrap justify-center gap-4">
        {mockImage.map((image, index) => (
            <a key={index}>
              <img src={image.url} alt="image" className="w-40 h-40 object-cover" />
            </a>
        ))}
      </div>
    </main>
  );
}
