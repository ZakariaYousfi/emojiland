import Head from "next/head";
import {  api } from "~/utils/api";"react-hot-toast";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
 "superjson";


const SinglePostPage: NextPage<{ id: string}> = ({id}) => {

  const {data} = api.post.getById.useQuery({id})

  if(!data) return <div>404 not found</div>

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data}/>
      </PageLayout>
    </>
  );
}



export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()

  const id = context.params?.id;

  if(typeof id !== "string") throw new Error("no id");

  await ssg.post.getById.prefetch({id})

  return {
    props:{
      trpcState: ssg.dehydrate(),
      id,
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {paths:[], fallback: "blocking"}
}

export default SinglePostPage