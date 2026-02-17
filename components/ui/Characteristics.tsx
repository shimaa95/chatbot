'use client'

import { REMOVE_CHARACTERISTIC } from '@/qraphql/mutations/mutations'
import { ChatbotCharacteristic } from '@/types/types'
import { useMutation } from '@apollo/client'
import {   CircleX  } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'


export default function Characteristics({ characteristics }:
   { characteristics: ChatbotCharacteristic }) {
  
  const [removeCharacteristic] = useMutation(REMOVE_CHARACTERISTIC, {
   refetchQueries: ["GETCHATBOTSBYID"],
  })
  const handleDeleteCharacteristic =async () => {
 try {
  const promise = removeCharacteristic({
    variables: { Id: characteristics.id },

  })
 } catch (error) {
  console.error(error)
 }
  }
  
  return (
    
    <li className='relative p-10 bg-white rounded-lg' key={characteristics.id}>{characteristics.content}
    <CircleX  className='w-6 h-6 text-white fill-red-500 absolute top-1 right-1 
    cursor-pointer hover:opacity-50' 
    onClick={()=>{
      console.log(characteristics.id)
      const promise = handleDeleteCharacteristic();
      toast.promise(promise, {
        loading: 'Removing...',
        success: 'Characteristic removed',
        error: 'Failed to remove characteristic',
      },
      )
    }}
    />
    </li>
  )
}
