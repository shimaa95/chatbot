'use client';

import { use, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GetChatbotByIdResponse, Message, MessagesbyChatSessionIdResponse, MessagesbyChatSessionIdResponseVariables } from "@/types/types";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import startNewChat from "@/lib/startNewChat";
import Avatar from "@/components/ui/Avatar";
import { useQuery } from "@apollo/client";
import { GET_CHATBOTS_by_ID, GET_MESSEGES_BY_CHAT_SESSION_ID } from "@/qraphql/queries/queries";
import Messages from "@/components/ui/Messages";
import {z} from "zod";
import {  useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage,Form } from "@/components/ui/form";


const formSchema = z.object({
message:z.string().min(3, 'Your Message is too short!'),
});
 
function ChatbotPage(props: { params: Promise<{ id: string }> })
{
  const params = use(props.params)
  const { id } = params
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [open,setOpen]=useState(true);
  const [chatId,setChatId]=useState(0);
  const [loading,setLoading]=useState(false);
  const[message,setMessage]=useState<Message[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver:zodResolver(formSchema),
    defaultValues:{
      message:''
    }
  })

  const  handleInformationSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
const chatId= await startNewChat(name,email,Number(id))
setChatId(chatId);
setLoading(false);
setOpen(false);
   
  }

  const {data:chatBotData} = useQuery <GetChatbotByIdResponse>(
    GET_CHATBOTS_by_ID,
    {
    variables:{
     id
    }}
  )

  const {loading:loadingQuery,error,data}=
  useQuery<MessagesbyChatSessionIdResponse,MessagesbyChatSessionIdResponseVariables>
  (
GET_MESSEGES_BY_CHAT_SESSION_ID,
{
  variables:{
    chat_session_id:chatId

  },
  skip:!chatId
} )


useEffect(() => {
  if (data) {
    const chatSession = data.chat_sessions as any
    setMessage(chatSession.messages)
  }
}, [data])

async function onsubmit(values: z.infer<typeof formSchema>) {
setLoading(true);
const {message:FormMessage} =values;

const message = FormMessage;
form.reset();

if(!name || !email){
  setOpen(true);
  setLoading(false);
  return;
}

//handle the message
if(!message.trim()){
  return;
}

//optimistcliy update the UI with the user message

const userMessage:Message={
  id:Date.now(),
  content:message,
  chat_session_id:chatId,
  sender:'user',  
  created_at:new Date().toISOString(),
};

const loadingMessage:Message={
  id:Date.now() + 1,
  content:'Thinking...',
  chat_session_id:chatId,
  created_at:new Date().toISOString(),
  sender:'ai',  
};
setMessage((prevMessages)=>[...prevMessages,userMessage,loadingMessage]);

try {
  const response= await fetch('/api/send-message',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      name:name,
      chat_session_id:chatId,
      chabot_id:id,
      content:message,
      created_at:new Date().toISOString(),
    })
  })
  const result= await response.json();
  console.log('result',result);

  //update the UI with the actual response

  setMessage((prevMessages)=>
    prevMessages.map((msg)=>
      msg.id === loadingMessage.id ? {...msg,content: result.content,id: result.id} : msg

    )
  ); 
} catch (error) {
  console.error('Error Sending Message:', error);
}

}

  return (

   <div className="w-full flex bg-gray-100">
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex sm:max-w-[425px]">
<form onSubmit={handleInformationSubmit}>
  <DialogHeader>
    <DialogTitle>Let help you out!</DialogTitle>
    <DialogDescription>
      I Just need your details to get started.
    </DialogDescription>
  </DialogHeader>
  <div className="grid gap-4 py-4">
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="name" className="text-right">
Name
    </Label>
    <Input
    id="name"
    value={name}
    onChange={(e)=>setName(e.target.value)}
    placeholder="John Doe"
    className="col-span-3"
    />
  </div>
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="username" className="text-right">
Email
    </Label>
    <Input
    id="username"
    value={email}
    onChange={(e)=>setEmail(e.target.value)}
    placeholder="jahn@appleseed.com"
    className="col-span-3"
    />
  </div>
  </div>
  <DialogFooter>
    <Button type="submit" disabled={!name || !email || loading} className="cursor-pointer">
     {!loading ? 'Continue' : 'Loading...'}

     </Button>
  </DialogFooter>
</form>
      </DialogContent>
    </Dialog>
    <div className="flex flex-col w-full max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-2xl md:mt-10">
      <div  className="pb-4 border-b sticky top-0 z-50 bg-[#4D7DFB] py-5 px-10 text-white md:rounded-t-lg flex items-center space-x-4">
        <Avatar
        seed={chatBotData?.chatbots.name ?? 'default-seed'}
className="w-12 h-12 bg-white rounded-full border-2 border-white"
/>
<div>
  <h1 className="truncate text-lg">{chatBotData?.chatbots.name}</h1>
  <p className="text-sm text-gray-300">
    Typiclly replies Instantly
  </p>

</div>
      </div>
      <Messages messages={message} chatbotName={chatBotData?.chatbots.name! || '' }  />

      <Form {...form}>
        <form className="flex items-start sticky bottom-0 space-x-4 drop-shadow-lg bg-gray-100 p-4 rounded-md"
         onSubmit={form.handleSubmit(onsubmit)}>
<FormField control={form.control} name="message"  render={({ field }) => (
  <FormItem className="flex-1">
    <FormLabel hidden>Message</FormLabel>
    <FormControl>
    <Input
    {...field}
    placeholder="Type a message ..."
    className="p-8"
    />
    </FormControl>
    <FormMessage />
    
  </FormItem>
)}/>
<Button type="submit" className="h-full cursor-pointer" disabled={form.formState.isSubmitting || !form.formState.isValid}>Send</Button>
        </form>
      </Form>
    </div>
    </div>
  )
}

export default ChatbotPage


