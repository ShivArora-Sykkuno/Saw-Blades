import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, username, password }),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.msg || 'Register failed');

      // ✅ Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Navigate to game
      navigate('/game');
    } catch (err) {
      console.error(err);
      setErr('Network error');
    }
  };

  return (
    <div className="center-col">
      <h2>Register</h2>
      <form onSubmit={submit} className="card">
        <input
          placeholder="Full name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn" type="submit">Register</button>
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}
