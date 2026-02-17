import Avatar from "@/components/ui/Avatar"
import { Button } from "@/components/ui/button"

import { GET_CHATBOTS_by_USER, GET_USER_CHATBOTS } from "@/qraphql/queries/queries"
import serverClient from '@/lib/server/serverClient'
import { Chatbot, ChatbotData,ChatSession } from "@/types/types"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function ViewChatbots () {
    const  {userId} = await auth()
if(!userId) return;


const {data} = await serverClient.query<ChatbotData>({
    query: GET_CHATBOTS_by_USER,
     
})



const chatbotsByUser : Chatbot[] = data.chatbotsList

const userChatbots = chatbotsByUser
  .filter(chatbot => chatbot.clerk_user_id === userId)
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


  return (
    <div className="flex-1 pb-20 p-10">
        <h1 className="text-xl lg:text-3xl font-semibold mb-5">Active Chatbots</h1>
        {userChatbots.length === 0  && (
            <div>
                <p>You have not created any chatbots yet, Click on the button below to create one</p>
                <Link href="/create-chatbot" className="cursor-pointer">
                <Button  className='bg-[#64B5F5] text-white p-3 rounded-md mt-5 cursor-pointer'>Create Chatbot</Button>
                </Link>
            </div>
        )}

        <ul className="flex flex-col space-y-5">
            {userChatbots.map((chatbot) => (
               <Link key={chatbot.id} href={`/edit-chatbot/${chatbot.id}`}>
                <li className="relative p-10 border rounded-md max-w-3xl bg-white">
                    <div className="flex justify-between items-center">
                        <div className="flex item-center space-x-4 ">
                            <Avatar seed={chatbot.name} />
                            <h2 className="text-xl font-bold items-center flex">{chatbot.name}</h2>
                        </div>
                            <p className="absolute top-5 right-5 text-xs text-gray-400">
                                Created:{new Date(chatbot.created_at).toLocaleDateString()}
                            </p>
                    </div>
                    <hr className="mt-2 mb-1"/>
                    <div className="grid grid-cols-2 gap-10">
                        <h3 className="italic"> Characteristics:  </h3>
                        <ul className="text-xs">
                            {!chatbot.chatbot_characteristics.length && (
                                <li className="text-sm">No characteristics added yet</li>
                            )}
                            {chatbot.chatbot_characteristics.map((characteristic) => (
                                <li key={characteristic.id} className=" list-disc break-words" >{characteristic.content}</li>   
                            ))}
                        </ul>
                        <h3 className="italic"> Number of Sessions: </h3>
                       <p>{chatbot.chat_sessions?.length} </p>
                    </div>
                </li>
               </Link>
            ))}
        </ul>
    </div>

  )
}

export default ViewChatbots