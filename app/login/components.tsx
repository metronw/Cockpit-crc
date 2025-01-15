'use client';

import { useState, FormEvent } from 'react';
import {Button, Input} from "@nextui-org/react"
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // await loginUser({ email, password });
      const response = await signIn("credentials", { email, password, callbackUrl: '/monitor'})
      // console.log('Logged in user:', user); // Handle successful login (e.g., redirect)
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div>
        <Input
          className='mx-2 p-2 rounded'
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          className='mx-2 p-2 rounded'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className='text-red-500'>{error}</p>}
      <Button type="submit" disabled={loading} className="m-2 p-2 rounded bg-white text-black justify-center flex" >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <SsoButton />
    </form>
  );
}



export default function SsoButton() {

  return (
    <>
      <Button className="m-2 p-2 rounded bg-black text-white" onPress={() => signIn("azure-ad", {callbackUrl: "/monitor"})}>Sign In with Microsoft</Button>
    </>
  );
}