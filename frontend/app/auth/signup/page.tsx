'use client';
import { useState } from 'react';
import axios from 'axios';
export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fetchData = async () => {
    console.log(process.env.NEXT_PUBLIC_BACKEND_API);
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/signup`, {
      email,
      password
    });
    console.log(response);
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData();
    console.log('Sign Up:', { name, email, password });
    alert(`Signed up with email: ${email}`);
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
