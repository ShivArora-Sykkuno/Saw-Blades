import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import GamePage from './pages/GamePage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ActivityLog from './pages/ActivityLog';

function Nav() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
   return (
    <nav className="nav">
      {!token && <Link to="/">Home</Link>}
      {token ? (
        <>
          <Link to="/game">Play</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/activity">Activity</Link>
          <button onClick={logout} className="small">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default function App(){
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<ActivityLog />} />
      </Routes>
    </div>
  );
}

function Landing(){
  return (
    <div className="center-col">
      <h1>SawBlades — Web Run</h1>
      <p>Use left/right arrow keys and Space to jump. Avoid saws and collect points.</p>
      <Link to="/register" className="btn">Get Started</Link>
    </div>
  );
}
