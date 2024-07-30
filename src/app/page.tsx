import Image from "next/image";
import  TextEditor  from "@/app/component/TextEditor";

export default function Home() {
  return (
    <main >
      <h1 className="text-red-600 text-3xl justify-center text-center font-bold mt-5">TextEditor</h1>
      <TextEditor/>
    </main>
  );
}
