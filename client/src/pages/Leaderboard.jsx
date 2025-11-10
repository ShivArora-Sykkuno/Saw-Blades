import React, { useEffect, useState } from 'react';

export default function Leaderboard(){
  const [list, setList] = useState([]);

  useEffect(()=> {
    fetch('http://localhost:5000/api/score/leaderboard?limit=15')
      .then(r=>r.json())
      .then(data => {
        setList(data || []);
      }).catch(()=>{});
  }, []);

  return (
    <div className="center-col">
      <h2>Leaderboard</h2>
      <div className="card">
        <ol>
          {list.map((u, i)=> (
            <li key={i} style={{ padding:'6px 0' }}>
              <strong>{u.username}</strong> {u.fullname ? `(${u.fullname})` : ''} — {u.topScore}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
