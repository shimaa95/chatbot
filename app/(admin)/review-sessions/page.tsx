import ChatbotSessions from '@/components/ui/ChatbotSessions';
import serverClient from '@/lib/server/serverClient';
import { GET_USER_CHATBOTS } from '@/qraphql/queries/queries';
import { Chatbot, ChatbotData } from '@/types/types';
import { auth } from '@clerk/nextjs/server';
import React from 'react'

async function ReviewSessions() {
  const {userId} = await auth()
  if(!userId) return;

const {data} = await serverClient.query<ChatbotData>({
  query:GET_USER_CHATBOTS,
 
})

const chatbotsByUser :Chatbot[] = data.chatbotsList

const SortedChatbots = chatbotsByUser
  .filter(chatbot => chatbot.clerk_user_id === userId)
  .map((chatbot) => ({  
    ...chatbot,
    chat_sessions: [...chatbot.chat_sessions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }));

  return (
    <div className="flex-1 pb-20 p-x0">
      <h1 className="text-xl lg:text-3xl font-semibold mt-10">Chat Sessions</h1>
      <h2 className='mb-5'>Review all the chat sessions the chat bots have had with your customers</h2>
    <ChatbotSessions chatbots={SortedChatbots}/>
    </div>
  )
}

export default ReviewSessions