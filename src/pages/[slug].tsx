import Head from "next/head";
import {  api } from "~/utils/api";"react-hot-toast";

const ProfilePage: NextPage<{ username: string}> = ({username}) => {

  const {data} = api.profile.getUserByUsername.useQuery({username})

  if(!data) return <div>404 not found</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
      <div>
        { data.username }
      </div>
      </PageLayout>
    </>
  );
}

import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { db
 } from "~/server/db";
import superjson from "superjson";import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { PageLayout } from "~/components/layout";
 "superjson";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {db, userId: null},
    transformer: superjson,
  });

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