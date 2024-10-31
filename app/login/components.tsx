'use client';

import { useState, FormEvent } from 'react';
import { loginUser } from '@/app/actions/login';
import {Button, Input} from "@nextui-org/react"

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
      const user = await loginUser({ email, password });
      console.log('Logged in user:', user); // Handle successful login (e.g., redirect)
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button type="submit" disabled={loading} className="m-2 p-2 rounded bg-white text-black justify-center flex" >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Button className="m-2 p-2 rounded bg-black text-white" >Entrar com Microsoft</Button>
    </form>
  );
}