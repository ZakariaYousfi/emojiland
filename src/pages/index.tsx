import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {  api } from "~/utils/api";

import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";


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

export const Feed = () => {

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
          {isSignedIn && (<div ><CreatePostWizard/></div>)} { !isSignedIn && (<div className = "flex justify-center">  <SignInButton></SignInButton></div>)}
          </div>
      <Feed/>
      </PageLayout>
    </>
  );
}
