import serverClient from '@/lib/server/serverClient';
import { gql } from '@apollo/client';
import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle CORS preflight requests — required for cross-origin iframe embeds
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const { query, variables } = await request.json();

  try {
    const result = await serverClient.mutate({
      mutation: gql`
        ${query}
      `,
      variables,
    });

    const data = result.data;
    return NextResponse.json({ data }, { headers: corsHeaders });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error }, { status: 500, headers: corsHeaders });
  }
}