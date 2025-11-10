import React, { useEffect, useState } from 'react';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/api/activity', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // sort latest first just in case
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch activities', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  // Helper to format date nicely
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="center-col" style={{ width: '80%', maxWidth: 700 }}>
      <h2>Activity Log</h2>
      {activities.length === 0 ? (
        <div>No activity yet</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #333', padding: '8px' }}>Date</th>
              <th style={{ borderBottom: '2px solid #333', padding: '8px' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act._id}>
                <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
                  {formatDate(act.createdAt)}
                </td>
                <td style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>{act.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
