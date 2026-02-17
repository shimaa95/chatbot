import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Home() {
  return (
<main className="p-10 bg-white m-10 rounded-md w-full">
  <h1 className="text-4xl font-light"> Welcome to {" "}
<span className="text-[#64B5F5] font-semibold">Assistly</span>
  </h1>
  <h2 className="mt-2 mb-10">
    Your customisable AI  chat agent that helps your manager your customer conversations.
  </h2>
  <Link href={"/create-chatbot"} className="cursor-pointer">
  <Button className="bg-[#64B5F5] text-white cursor-pointer">
    Lets get Started by creating Your first Chatbot
  </Button>
  </Link>
</main>
  );
}
 