import { gql } from "@apollo/client";

export const GET_USER_CHATBOTS = gql`
 query getAllChatbots {
  chatbotsList {
    id
    name
    created_at
    clerk_user_id
    chat_sessions {
      id
      created_at
      guests {
        name
        id
        email
      }
    }
  }
  
}
`



export const GET_CHATBOTS_by_ID = gql`
  query GETCHATBOTSBYID($id: Int!) 
  {
  chatbots(id: $id) {
    id
    name
    created_at
    chatbot_characteristics {
      created_at
      content
      id
      chatbots {
        chat_sessions {
          guest_id
          created_at
          id
          messages {
            id
            content
            created_at
          }
        }
      }
    }
  }
}   
`
export const GET_CHATBOTS_by_USER = gql`
query getAllChatbots {
  chatbotsList {
    id
    name
    created_at
    chatbot_characteristics {
      created_at
      content
      id
      chatbots {
        chat_sessions {
          guest_id
          created_at
          id
          messages {
            id
            content
            created_at
          }
        }
      }
    }
    clerk_user_id
    chat_sessions {
     chatbot_id
      created_at
      guests {
        email
        name
        id
      }
     
    }
  }
}
 ` 
 export const GET_CHAT_SESSIONS_MESSAGES = gql`
   query getChatSessionsMessages($id:Int!){
   chat_sessions(id: $id) {
    created_at
    id
    guests {
      email
      name
    }
    chatbots {
      name
    }
    messages {
      id
      sender
      content
      created_at
    }
  }
  
   }
 `
export  const GET_MESSEGES_BY_CHAT_SESSION_ID= gql`
 query GetMessagesByChatSessionId($chat_session_id:Int!) {
 chat_sessions(id: $chat_session_id) {
  created_at
  id
  messages {
    id
    sender
    content
    created_at
  }
 }
 
  }
 `