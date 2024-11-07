'use server'

import prisma  from '@/app/lib/localDb';
import bcrypt from 'bcrypt'; // Assuming passwords are hashed in the database
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginUser({ email, password }: LoginCredentials) {
  // Retrieve the user from the database by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Return error if user not found or password doesn't match
    throw new Error('Invalid email or password');
  }
  
  const cookieStore = await cookies()
  cookieStore.set('logged_user', JSON.stringify(user))

  redirect('/agent/'+user.id)

}

export async function logout(){
  const cookieStore = cookies()
  cookieStore.delete('logged_user')
  redirect('/login')
}