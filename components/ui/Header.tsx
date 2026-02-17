import Link from 'next/link'
import React from 'react'
import Avatar from '../../components/ui/Avatar'
import { SignedIn, UserButton,SignedOut,SignInButton } from '@clerk/nextjs'

function Header() {
  return (
    <header className='flex bg-white shadow-sm text-gray-800 justify-between p-5'>
        <Link href="/" className='flex items-center text-4xl font-thin'>
        <Avatar seed='Katherine' />
        <div className='ml-2'>
        <h1 className='mb-1'>Assisly</h1>
          <h2 className='text-sm'>Your Cusomized AI Chat Agent</h2>
        </div>
        </Link>
        <div className='flex items-center cursor-pointer '>
          <SignedIn >
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
        
    </header>
  )
}

export default Header