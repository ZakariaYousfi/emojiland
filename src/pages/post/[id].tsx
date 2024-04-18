import {  useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";"react-hot-toast";

export default function SinglePostPage() {

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
      <div>
        Post view
      </div>
      </main>
    </>
  );
}
