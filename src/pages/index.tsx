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

  const [page,setPage] = useState(0)

  const [nbPosts, setNbPosts] = useState(5)

  const q = api.post.infinitePosts.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // initialCursor: 1
    },
  );

  //const {data, isLoading: postsLoading } = api.post.getAll.useQuery()

  const handleFetchNextPage = async() => {
    const lg = q.data?.pages[page]?.posts?.length 
    lg ? (lg < 5 ? setNbPosts(lg) : null) : null
    await q.fetchNextPage();
    setPage((prev) => prev + 1);
  };

  const handleFetchPreviousPage = () => {
    setPage((prev) => prev - 1);
    page === 0 ? setNbPosts(5) : null
  };
  
  if(q.isLoading) return <LoadingPage/>

  if(q.error) return <div>Something went wrong</div>

  return (<div className="flex flex-col">
    {  q.data?.pages[page]?.posts?.map ((fullPost) => (<PostView {...fullPost} key = {fullPost.post.id}/>))}
    <div className = "flex flex-col items-center">
    <button onClick = {nbPosts === 5 || page === 0 ? handleFetchNextPage : handleFetchPreviousPage} className="h-16 w-32 bg-slate-600 border-slate-400 center m-4">{nbPosts === 5 || page === 0 ? "Load More Tweets" : "Previous Tweets"}</button>
    </div>
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
