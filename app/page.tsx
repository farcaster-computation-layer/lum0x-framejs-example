import { fetchMetadata } from "frames.js/next";
import type { Metadata } from "next";
import { createExampleURL } from "./utils";
import { Frame } from "./components/Frame";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "lum0x with frames.js",
    description: "This is a lum0x with frames.js template",
    other: {
      ...(await fetchMetadata(createExampleURL("/lum0x"))),
    },
  };
}

// This is a react server component only
export default async function Home() {
  const metadata = await generateMetadata();

  // then, when done, return next frame
  return (
    <div className="flex flex-col max-w-[600px] w-full gap-2 mx-auto p-2">
      <Frame metadata={metadata} url={createExampleURL("/lum0x")} />
    </div>
  );
}
