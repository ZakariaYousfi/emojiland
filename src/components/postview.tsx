
import Link from "next/link";
import dayjs
 from "dayjs";
 import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import type {  RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["post"]["getAll"][number]

export const PostView = (props: PostWithUser) => {
  const {post, author} = props
  return <Link href = {`/post/${post.id}`}><div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
    <Image src={author.profileImageUrl} className="w-14 h-14 rounded-full" alt={`@${author.username}'s profile picture`} width={56} height = {56} />
    <div className = "flex flex-col">
      <div className ='flex text-slate-300 font-bold gap-1'><Link href = {`/@${author.username}`}><span>{`@${author.username}`}</span></Link><span className='font-thin'>{` · ${dayjs(post.createdAt).fromNow()}`}</span></div>
    <span className = "text-2xl">{post.content}</span></div></div></Link>
}

