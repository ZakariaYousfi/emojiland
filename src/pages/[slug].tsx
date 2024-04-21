import Head from "next/head";
import {  api } from "~/utils/api";"react-hot-toast";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
 "superjson";

const ProfileFeed = (props : {userId: string}) => {

  const {data, isLoading} = api.post.getPostsByUserId.useQuery({ userId: props.userId})

  if(isLoading) return <LoadingPage/>

  if(!data || data.length == 0) return <div>User has not postede</div>

  return <div className = "flex flex-col">
    {data.map(fullpost => (<PostView {...fullpost} key = {fullpost.post.id}/>))}
  </div>


}

const ProfilePage: NextPage<{ username: string}> = ({username}) => {

  const {data} = api.profile.getUserByUsername.useQuery({username})

  if(!data) return <div>404 not found</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
      <div className= "bg-slate-600 h-36 relative">
        <Image src={data.profileImageUrl} alt = {`${data.username ?? ""}'s profile picture`} width = {128} height = {128} className = "-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black bg-black"/>
      </div>
      <div className = "h-[64px]"></div>
        <div className = "p-4 text-2xl font-bold">{`@${data.username ?? ""}`}</div>
        <div className = "border-b border-slate-400 w-full"></div>
        <ProfileFeed userId = {data.id}/>
      </PageLayout>
    </>
  );
}



export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()

  const slug = context.params?.slug;

  if(typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@","")
  await ssg.profile.getUserByUsername.prefetch({username})

  return {
    props:{
      trpcState: ssg.dehydrate(),
      username,
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {paths:[], fallback: "blocking"}
}

export default ProfilePage