import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState({
    fullname: '',
    username: '',
    topScore: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    setUser(JSON.parse(userStr)); // your state
  }
}, []);

  const handleDelete = async () => {
    setErr('');
    setSuccess('');
    if (!password) return setErr('Enter your password');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.msg || 'Failed to delete');

      setSuccess('Account deleted successfully');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => navigate('/register'), 1500);
    } catch (err) {
      setErr('Network error');
    }
  };

  return (
    <div className="center-col">
      <h2>Profile</h2>
      <div className="card">
        <p><strong>Full Name:</strong> {user.fullname}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Top Score:</strong> {user.topScore}</p>

        <div style={{ marginTop: 20, borderTop: '1px solid #333', paddingTop: 20 }}>
          <h3>Delete Account</h3>
          <button
            className="btn"
            style={{ backgroundColor: 'red', color: 'white' }}
            onClick={() => setShowModal(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Themed Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1f2937', padding: 20, borderRadius: 12,
            width: 400, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#fde68a' }}>Confirm Account Deletion</h3>
            <p style={{ color: '#fff' }}>Are you sure you want to delete your account?</p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '90%', padding: 8, marginTop: 10, marginBottom: 10,
                borderRadius: 6, border: '1px solid #555', backgroundColor: '#0f172a',
                color: '#fff'
              }}
            />
            {err && <div className="error">{err}</div>}
            {success && <div style={{ color: '#a3e635' }}>{success}</div>}
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                style={{ backgroundColor: 'red', color: 'white', marginRight: 10 }}
                onClick={handleDelete}
              >
                Surely Delete
              </button>
              <button
                className="btn"
                style={{ backgroundColor: '#fde68a', color: '#0f172a' }}
                onClick={() => {
                  setShowModal(false);
                  setPassword('');
                  setErr('');
                  setSuccess('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
