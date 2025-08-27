'use client';
import { useState } from 'react';
import axios from 'axios';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchData = async () => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/signin`, {
      email, 
      password
    });
    localStorage.setItem("token", response.data.token);
    console.log(response);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData();
    console.log('Sign In:', { email, password });
    alert(`Signed in with email: ${email}`);
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
