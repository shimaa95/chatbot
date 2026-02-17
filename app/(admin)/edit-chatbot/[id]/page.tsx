'use client'

import React, { FormEvent, use, useEffect, useState } from 'react'
import Link from 'next/link' 
import { Input } from '@/components/ui/input'
import { getBaseURL } from '@/qraphql/apolloClient';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from "sonner"
import Avatar from '@/components/ui/Avatar';
import {  useMutation, useQuery } from '@apollo/client';
import { GET_CHATBOTS_by_ID } from '@/qraphql/queries/queries';
import { GetChatbotByIdResponse, GetChatbotByIdResponseVariables } from '@/types/types';
import { ADD_CHARACTERISTIC, DELETE_CHATBOT, UPDATE_CHATBOT } from '@/qraphql/mutations/mutations';
import { redirect } from 'next/navigation';
import Characteristics from '@/components/ui/Characteristics';


function page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const { id } = params
  const [url,setUrl]=useState<string>('');
const [chatbotName,setChatbotName]=useState<string>('');
const [newCharacteristic,setNewCharacteristic]=useState<string>('');
const [deleteChatbot]=useMutation(DELETE_CHATBOT,{
  refetchQueries: ["GETCHATBOTSBYID"],
  awaitRefetchQueries: true,
})
const [updateChatbot]=useMutation(UPDATE_CHATBOT,
  {
    refetchQueries:["GETCHATBOTSBYID"]
  
  })

const [addCharacteristic]= useMutation(ADD_CHARACTERISTIC,
  {
    refetchQueries:["GETCHATBOTSBYID"]
  
  })

const {data,loading,error}= useQuery<GetChatbotByIdResponse,GetChatbotByIdResponseVariables>(
  GET_CHATBOTS_by_ID,
  {    variables:{id}})

useEffect(()=>{
  if(data){
    setChatbotName(data.chatbots.name)
  }
},[data])

useEffect(()=>{
  const url=`${getBaseURL()}/chatbot/${id}`
setUrl(url)
},[id])

const handleUpdateChatbot = async (e:FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const promise = updateChatbot({
      variables: {
        id,
        name:chatbotName,
      },
    })
    toast.promise(promise,{
loading:'Updating...',
success:'Chatbot Name Successfully updated!',
error:'Failed to update chatbot',
    })
  } catch (error) {
    console.error("Error updating chatbot:", error);
  }
}

const handleDelete = async (id:string) => {
const isConfirmed= window.confirm('Are you sure you want to delete this chatbot?')
if(isConfirmed)
  try {
    const promise = deleteChatbot({
      variables: {
        id: id,
      },
    })
    toast.promise(promise,{
loading:'Deleting...',
success:'Chatbot Successfully deleted!',
error:'Failed to delete chatbot',
    })
    
    
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    toast.error('Failed to delete chatbot')
  }
}

const handleAddCharacteristic = async (content:string)=>{
  try {
    const promise = addCharacteristic({
    variables: {
      chatbotId:Number(id),
      content,
      created_at:new Date(),
    },
    })
    toast.promise(promise,{
  loading:'Adding...',
  success:'Information added',
  error:'Failed to add information',
  
    });
  
  } catch (error) {
    console.error("Error adding information:", error);
  }
  }

if(loading)
  return(
<div className="mx-auto animate-spin p-10">
  <Avatar seed='papafam support Agent'/>
</div>)

if(error) return <p>Error: {error.message}</p>

if(!data?.chatbots) return redirect('/view-chatbots');


  return (
    <div className='px-0 md:p-10'>
<div className='md:sticky md:top-0 z-50 sm:max-w-sm ml-auto md-border space-y-2 rounded-b-lg md:rounded-lg mb-5 bg-[#2991EE] p-5 '>
   <h2 className="text-white text-sm font-bold ">Link to Chat</h2>
<p className="text-sm italic text-white">Share this link with your customers to start conversation with your chatbot</p>
<div className='flex items-center space-x-2 space-y-3'>
  <Link href = {url} className='w-full cursor-pointer hover:opacity-50'>
  <Input value = {url} className='cursor-pointer text-black bg-white' readOnly />
  </Link>
  <Button
  size={'sm'}
  className='px-3 cursor-pointer'
  onClick={()=>{  navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard")
  }}>
    <span className='sr-only cursor-pointer '>Copy</span>
<Copy className='w-4 h-4 cursor-pointer' />
  </Button>
</div>
</div>

  <section className='relative mt-5 bg-white p-5 md:p-10 rounded-lg'>
    <Button variant={'destructive'} className='absolute right-2 top-2 h-8 w-2 ' 
    onClick={()=> handleDelete(id)}
    >
X
    </Button>
    <div className='flex space-x-4'>
      <Avatar seed={chatbotName}/>
      <form className='flex flex-1 space-x-2 items-center' 
      onSubmit={handleUpdateChatbot}
      >
        <Input 
        value={chatbotName}
        onChange={(e)=>setChatbotName(e.target.value)}
        placeholder={chatbotName}
  required
  className='w-full border-gray-200 bg-transparent text-xl font-bold text-black'
  />
        <Button type='submit' className='cursor-pointer' disabled={!chatbotName}>Update</Button>
      </form>
    </div>
    <h2 className="text-xl font-bold mt-10 mb-1">Heres what your AI knows...</h2>
    <p>Your chatbot is equipped with the following information to assist you in your conversations with your customers & users</p>

    <div className='bg-gray-200 p-5 rounded-md md:p-5 mt-5'>
      <form onSubmit={e=>{
        e.preventDefault();
        handleAddCharacteristic(newCharacteristic)
        setNewCharacteristic("")
      }}
      className='flex mb-5  space-x-2 items-center '
      >
        <Input type='text'
         placeholder='Example: if your customer ask for price, provide pricing page: www.example.com/pricing' 
         value={newCharacteristic}
         onChange={(e)=>setNewCharacteristic(e.target.value)}
         className='w-full border-gray-200 bg-transparent text-xl font-bold text-black mt-5 '
         />
        <Button type='submit' className='cursor-pointer mt-5' disabled={!newCharacteristic}>Add</Button>
        </form>
        <ul className='flex flex-wrap-reverse gap-5'>
          {data?.chatbots?.chatbot_characteristics?.map((characteristic)=>(
           
            <Characteristics key={characteristic.id}  characteristics={characteristic}  />

          ))}
        </ul>
    </div>
  </section>
    </div>
  )
}

export default page