import serverClient from "@/lib/server/serverClient"
import { InsertMessage } from "@/qraphql/mutations/mutations"
import { GET_CHATBOTS_by_ID, GET_MESSEGES_BY_CHAT_SESSION_ID } from "@/qraphql/queries/queries"
import type { GetChatbotByIdResponse, Message, MessagesbyChatSessionIdResponse } from "@/types/types"
import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(req: NextRequest) {
  const { name, chat_session_id, chabot_id, content, created_at } = await req.json()
  console.log(`receiving message ${chat_session_id} ${content} (chatbot ${chabot_id})`)

  try {
    // Fetch chatbot characteristics
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOTS_by_ID,
      variables: {
        id: chabot_id,
      },
    })
    const chatbot = data.chatbots
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Fetch previous messages
    const { data: messagesData } = await serverClient.query<MessagesbyChatSessionIdResponse>({
      query: GET_MESSEGES_BY_CHAT_SESSION_ID,
      variables: {
        chat_session_id,
        fetchPolicy: "no-cache",
      },
    })
    const chatSession = messagesData.chat_sessions as any
    const previousMessages = chatSession.messages

    // Format previous messages for context
    const formattedPreviousMessages = previousMessages.map((message: Message) => ({
      role: message.sender === "ai" ? "assistant" : "user",
      content: message.content,
    }))

    // Combine the characteristics into a prompt
    const systemPrompt = chatbot.chatbot_characteristics.map((c) => c.content).join(" + ")


    // Create conversation history including system prompt and current message
    const messages = [
      {
        role: "system",
        content: `You are SMOEDESIGN professional front desk assistant talking to $ ${name}.
             Here is some key information that you should be aware of: ${systemPrompt}.`,
      },
      ...formattedPreviousMessages,
      {
        role: "user",
        content: content,
      },
    ]

    let aiResponse

    try {
      // Call Hugging Face inference API
      const response = await hf.chatCompletion({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content: `You are SMOEDESIGN professional front desk assistant talking to $ ${name}.
             Here is some key information that you should be aware of: ${systemPrompt}.`
          },
          ...formattedPreviousMessages, // Include conversation history if available
          { 
            role: "user", 
            content: content
          }
        ],
        max_tokens: 512,
        temperature: 0.7, // Added temperature for more control over randomness
        provider: "sambanova", // or together, fal-ai, replicate, cohere …
      })
      aiResponse = response.choices[0].message.content

      // If the response starts with "assistant:" remove it
      if (aiResponse?.startsWith("assistant:")) {
        aiResponse = aiResponse.substring("assistant:".length).trim()
      }
    } catch (error: any) {
      console.error("Hugging Face API Error:", error)

      // Handle API errors
      if (error.status === 429) {
        aiResponse = "I'm sorry, but I'm currently unavailable due to service limitations. Please try again later."
      } else {
        aiResponse = "I apologize, but I encountered an issue processing your request. Please try again."
      }
    }

    if (!aiResponse) {
      return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
    }

    // Store user message first
    await serverClient.mutate({
      mutation: InsertMessage,
      variables: {
        chat_session_id,
        content,
        created_at,
        sender: "user",
      },
    })

    const aiMessage = await serverClient.mutate({
      mutation: InsertMessage,
      variables: {
        chat_session_id,
        content: aiResponse,
        created_at: new Date().toISOString(),
        sender: "ai",
      },
    })

    return NextResponse.json(
      {
        id: aiMessage.data.insertMessages.id,
        content: aiResponse,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error Sending Message:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your message",
        content: "I'm sorry, but I encountered an error. Please try again later.",
      },
      { status: 500 },
    )
  }
}

