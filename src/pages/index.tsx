import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";
import dayjs
 from "dayjs";
 import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";

 dayjs.extend(relativeTime)

const CreatePostWizard = () => {

  const { user } = useUser()

  const [input, setInput] = useState("")

  const ctx = api.useContext()

  const {mutate, isPending: isPosting} = api.post.create.useMutation({
    onSuccess: () =>{
      setInput("")
      void ctx.post.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if(errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to post! Please try again later.")
      }

    }
  })

  if(!user) return null

  return <div className="flex gap-3 ">
    <Image src = {user.profileImageUrl} alt = 'profile image' className="w-14 h-14 rounded-full" width={56} height = {56}/>
    <input placeholder='type some emojis' className ='bg-transparent grow outline-none' 
    value = {input}
    onChange = {(e) => setInput(e.target.value)}
    onKeyDown = {(e) => {
      if(e.key == "Enter") {
        e.preventDefault()
        if(input !== ""){
          mutate({content : input })
        }
      }
    }}
    disabled = {isPosting}
    />
    { input !== "" && (<button onClick = { () => mutate({ content: input })}> Post </button>)}

    {isPosting && (<div className = "flex items-center justify-center"><LoadingSpinner size = {20}/></div>)}
  </div>
}

type PostWithUser = RouterOutputs["post"]["getAll"][number]

const PostView = (props: PostWithUser) => {
  const {post, author} = props
  return <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
    <Image src={author.profileImageUrl} className="w-14 h-14 rounded-full" alt={`@${author.username}'s profile picture`} width={56} height = {56} />
    <div className = "flex flex-col">
      <div className ='flex text-slate-300 font-bold gap-1'><Link href = {`/@${author.username}`}><span>{`@${author.username}`}</span></Link><Link href = {`/post/${post.id}`}><span className='font-thin'>{` · ${dayjs(post.createdAt).fromNow()}`}</span></Link></div>
    <span className = "text-2xl">{post.content}</span></div></div>
}

const Feed = () => {

  const {data, isLoading: postsLoading } = api.post.getAll.useQuery()
  
  if(postsLoading) return <LoadingPage/>

  if(!data) return <div>Something went wrong</div>

  return (<div className="flex flex-col">
    {data?.map ((fullPost) => (<PostView {...fullPost} key = {fullPost.post.id}/>))}
  </div>)
}
export default function Home() {

  const {isLoaded: userLoaded, isSignedIn }= useUser() 

  // start fetching asap
  api.post.getAll.useQuery()
  // return empty div if user isn't loaded yet
  if(!userLoaded) return <div/>

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-4">      
          {isSignedIn ? <div ><CreatePostWizard/></div> : (isSignedIn && (<div className = "flex justify-center">  <SignInButton></SignInButton></div>))}
          </div>
      <Feed/>
      </PageLayout>
    </>
  );
}
