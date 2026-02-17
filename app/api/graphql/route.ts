import serverClient from '@/lib/server/serverClient';
import { gql } from '@apollo/client';
import { NextRequest, NextResponse } from 'next/server'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Allow specific HTTP methods
  'Access-Control-Allow-Headers': 'Content-Type, Authorization , Accept, X-Requested-With', // Allow specific headers
  'Access-Control-Allow-Credentials': 'true', // Optional: Include this if you need to support cookies or authentication
};


export async function POST(request: NextRequest) {
  const { query , variables } = await request.json();


  try {
    let result
    // if(query.trim().startsWith('mutation')){
      result= await serverClient.mutate({
        mutation: gql`
        ${query}
         `,
        variables,
      })


    const data = result.data;
    return NextResponse.json({ data },{headers:corsHeaders});
  } catch (error) {
    console.log('error',error)
      return NextResponse.json({error},{status:500});
  }
}