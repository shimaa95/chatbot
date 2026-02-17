import client from "@/qraphql/apolloClient";
import { Insert_Guests, InsertChatSession, InsertMessage } from "@/qraphql/mutations/mutations";

async function startNewChat(guestName:string,guestEmail:string,chatbotId:number){

    try {

        //create new guest intery
        const guestResult= await client.mutate({
           mutation:Insert_Guests,
           variables:{
               created_at:new Date().toISOString(),
               email:guestEmail,
               name:guestName,
           }
  
        })

      
        const guestId=guestResult.data.insertGuests.id

        // 2. initilaize a new chat session

        const chatSessionResult= await client.mutate({
            mutation:InsertChatSession,
            variables:{
                chatbot_id:chatbotId,
                guest_id:guestId,
                created_at:new Date().toISOString()
            }
        })

        const chatSessionId=chatSessionResult.data.insertChat_sessions.id;



        //insert Inital Message

        await client.mutate({
            mutation:InsertMessage,
            variables:{
                chat_session_id:chatSessionId,
                content:`Welcome ${guestName} !\n How can I assist you today?`,
                created_at:new Date().toISOString(),
                sender:'ai',
            }
        })
        console.log("New chat session started with id:");
        return chatSessionId;
    } catch (error) {
        console.error("Error starting new chat session:", error);
    }
}
export default startNewChat;