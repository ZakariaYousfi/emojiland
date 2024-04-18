import {  useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";"react-hot-toast";

export default function SinglePostPage() {

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center h-screen">
      <div>
        Post view
      </div>
      </main>
    </>
  );
}
