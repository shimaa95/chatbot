 'use client'

import { Button } from "@/components/ui/button"
import Avatar from "../../../components/ui/Avatar"
import { Input } from "@/components/ui/input"
import { useMutation } from "@apollo/client"
import { useUser } from "@clerk/nextjs"
import { CREATE_CHATBOT } from "../../../qraphql/mutations/mutations"
 import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

function CreateChatbot() {
  const {user}=useUser();
  const [name,setName]=useState('');

  const router=useRouter();

  const [createChatbot, {data, loading, error}]=useMutation(CREATE_CHATBOT,{
variables:{ 
clerk_user_id:user?.id,
name,
created_at: new Date(),
},
  })

  const handleSubmit= async (e:FormEvent) => {
    e.preventDefault();
try {

  const data  = await createChatbot();
  setName('');
  router.push(`/edit-chatbot/${data.data.insertChatbots.id}`)
  
} catch (err) {
  console.error(err)
}
  }

if(!user) return null;

  return (
    <div className="flex flex-col items-center justify-center md:flex-row md:space-x-10 bg-white p-10 rounded-md m-10">
      <Avatar seed="create-chatbot" />
      <div >
         <h1 className="text-xl lg:text:3xl font-semibold">Create</h1>
        <h2 className="font-light">Create a new chatbot assist you in your conversation with your customers</h2>
      <form className="flex flex-col md:flex-row gap-5 mt-5 " onSubmit={handleSubmit}>
        <Input 
          placeholder="Chatbot Name..."
          type="text"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
          className="max-w-lg"
        />
        <Button disabled ={loading || !name}>{loading?'Loading...':'Create Chatbot'}</Button>
      </form>
      <p className="mt-5 text-gray-300"></p>
      </div>
    </div>
  )
}

export default CreateChatbot