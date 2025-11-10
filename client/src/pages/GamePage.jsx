import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function postScore(token, score) {
  return fetch('http://localhost:5000/api/score/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ score })
  }).then(r => r.json());
}

const saveActivity = async (score) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    await fetch('http://localhost:5000/api/activity/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score })
    });
  } catch (err) {
    console.error('Failed to save activity', err);
  }
};

export default function GamePage() {
  const canvasRef = useRef();
  const requestRef = useRef();
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).topScore || 0 : 0;
  });
  const navigate = useNavigate();

  // Audio
  const bgmRef = useRef(null);
  const jumpSoundRef = useRef(null);
  const hitSoundRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    bgmRef.current = new Audio('/sounds/bgm.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.3;
    bgmRef.current.play().catch(() => {});

    jumpSoundRef.current = new Audio('/sounds/jump.mp3');
    jumpSoundRef.current.volume = 0.5;

    hitSoundRef.current = new Audio('/sounds/hit.mp3');
    hitSoundRef.current.volume = 0.5;
  }, [navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 800);
    const height = (canvas.height = 450);

    const player = { x: 80, y: height - 90, w: 38, h: 46, vy: 0, onGround: false, radius: 24, jumpPower: -15 };
    const gravity = 0.8;
    const moveSpeed = 3.5;
    let keys = { left: false, right: false, space: false };
    let blades = [];
    let powerUps = [];
    let frame = 0;
    let currentScore = 0;
    let lastBladeTime = 0;
    let powerUpNextSpawn = 0;
    let powerUpIndex = 0; // For cycling power-ups
    let runningLocal = true;
    let canRestart = false;

    // Power-up states
    let shieldActive = false;
    let slowActive = false;
    let slowStart = 0;
    let jumpBoostActive = false;
    let playerColor = '#fde68a';

    const powerUpTypes = ["slow", "jump", "points", "shield"]; // cycling order

    // SPAWN FUNCTIONS
    function spawnBlade() {
      const now = performance.now();
      if (now - lastBladeTime < 1200) return;
      lastBladeTime = now;
      const radius = 22 + Math.random() * 15;
      const y = height - 20 - radius;
      const x = width + radius;
      const vx = -(3 + Math.random() * 2);
      blades.push({ x, y, r: radius, vx, angle: 0, scored: false });
    }

    function spawnPowerUp() {
      const now = performance.now();
      if (now < powerUpNextSpawn) return;

      powerUpNextSpawn = now + 10000 + Math.random() * 10000; // 10-20 sec

      const type = powerUpTypes[powerUpIndex];
      powerUpIndex = (powerUpIndex + 1) % powerUpTypes.length;

      const x = width + 50; // spawn offscreen
      const y = height - 120 - Math.random() * 30; // slightly higher
      const widthPU = 28;
      const heightPU = 28;

      powerUps.push({
        x,
        y,
        baseY: y,
        type,
        width: widthPU,
        height: heightPU,
        active: true,
        vx: -2,
        floatPhase: Math.random() * Math.PI // random phase for floating
      });
    }

    // GAME RESET & END
    function resetGame() {
      blades = [];
      powerUps = [];
      frame = 0;
      player.x = 80;
      player.y = height - 90;
      player.vy = 0;
      player.onGround = false;
      currentScore = 0;
      setScore(0);
      runningLocal = true;
      canRestart = false;
      shieldActive = false;
      slowActive = false;
      jumpBoostActive = false;
      playerColor = '#fde68a';
      powerUpNextSpawn = 0;
      powerUpIndex = 0;

      if (bgmRef.current) {
        bgmRef.current.currentTime = 0;
        bgmRef.current.play().catch(() => {});
      }
    }

    function endGame() {
      runningLocal = false;
      canRestart = true;
      setRunning(false);

      if (bgmRef.current) bgmRef.current.pause();
      if (hitSoundRef.current) hitSoundRef.current.play();

      const token = localStorage.getItem('token');
      if (!token) return;

      postScore(token, currentScore)
        .then(res => {
          if (res?.topScore !== undefined) {
            setBest(res.topScore);
            const userStr = localStorage.getItem('user');
            const userObj = userStr ? JSON.parse(userStr) : {};
            userObj.topScore = res.topScore;
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        })
        .catch(err => console.error(err));

      saveActivity(currentScore)
        .then(() => console.log('Activity saved'))
        .catch(err => console.error('Activity failed', err));
    }

    // POWER-UP ACTIVATION
    function activatePowerUp(type) {
      if (type === "shield") {
        shieldActive = true;
        playerColor = "#00f";
      } else if (type === "slow") {
        slowActive = true;
        slowStart = performance.now();
      } else if (type === "points") {
        currentScore += 10;
        setScore(currentScore);
      } else if (type === "jump") {
        jumpBoostActive = true;
        player.jumpPower = -20;
        setTimeout(() => {
          jumpBoostActive = false;
          player.jumpPower = -15;
        }, 5000);
      }
    }

    // UPDATE LOOP
    function update() {
      frame++;

      if (keys.left) player.x -= moveSpeed;
      if (keys.right) player.x += moveSpeed;
      if (player.x < 0) player.x = 0;
      if (player.x + player.w > width) player.x = width - player.w;

      if (keys.space && player.onGround) {
        player.vy = player.jumpPower;
        player.onGround = false;
        if (jumpSoundRef.current) jumpSoundRef.current.play();
      }

      player.vy += gravity;
      player.y += player.vy;

      if (player.y + player.h >= height - 20) {
        player.y = height - 20 - player.h;
        player.vy = 0;
        player.onGround = true;
      }

      spawnBlade();
      spawnPowerUp();

      // UPDATE BLADES
      blades.forEach(b => {
        if (slowActive && performance.now() - slowStart < 5000) {
          b.x += b.vx * 0.5;
        } else {
          slowActive = false;
          b.x += b.vx;
        }
        b.angle += 0.2;
      });
      blades = blades.filter(b => b.x + b.r > -50);

      // CHECK COLLISION BLADES
      for (const b of blades) {
        const dx = (player.x + player.radius / 2) - b.x;
        const dy = (player.y + player.radius / 2) - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.radius + b.r * 0.7) {
          if (shieldActive) {
            shieldActive = false;
            playerColor = '#fde68a';
            b.scored = true;
          } else {
            endGame();
          }
        }
        if (!b.scored && player.x > b.x + b.r) {
          currentScore += 1;
          setScore(currentScore);
          b.scored = true;
        }
      }

      // UPDATE POWER-UPS
      powerUps.forEach(p => {
        if (!p.active) return;
        p.x += p.vx;
        p.y = p.baseY + Math.sin(frame * 0.05 + p.floatPhase) * 8; // floating animation

        const dx = (player.x + player.radius / 2) - (p.x + p.width / 2);
        const dy = (player.y + player.radius / 2) - (p.y + p.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.radius + p.width / 2) {
          p.active = false;
          activatePowerUp(p.type);
        }
      });
      powerUps = powerUps.filter(p => p.active && p.x + p.width > 0);
    }

    // DRAW FUNCTIONS
    function drawPlayer() {
      const gradient = ctx.createRadialGradient(
        player.x + player.radius / 2,
        player.y + player.radius / 2,
        10,
        player.x + player.radius / 2,
        player.y + player.radius / 2,
        25
      );
      gradient.addColorStop(0, playerColor);
      gradient.addColorStop(0.6, '#f59e0b');
      gradient.addColorStop(1, '#b45309');

      ctx.beginPath();
      ctx.arc(player.x + player.radius / 2, player.y + player.radius / 2, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#facc15';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.fillStyle = '#111';
      ctx.arc(player.x + player.radius / 2 - 6, player.y + player.radius / 2 - 3, 3, 0, Math.PI * 2);
      ctx.arc(player.x + player.radius / 2 + 6, player.y + player.radius / 2 - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawBlade(b) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      const teeth = 12;
      for (let i = 0; i < teeth; i++) {
        const ang = (i / teeth) * Math.PI * 2;
        const x1 = Math.cos(ang) * (b.r * 0.6);
        const y1 = Math.sin(ang) * (b.r * 0.6);
        const x2 = Math.cos(ang + Math.PI * 2 / teeth * 0.3) * (b.r * 1.05);
        const y2 = Math.sin(ang + Math.PI * 2 / teeth * 0.3) * (b.r * 1.05);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(Math.cos(ang + Math.PI * 2 / teeth * 0.6) * (b.r * 0.6), Math.sin(ang + Math.PI * 2 / teeth * 0.6) * (b.r * 0.6));
        ctx.closePath();
        ctx.fillStyle = '#9333ea';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.restore();
    }

    function drawPowerUp(p) {
      if (!p.active) return;
      const colors = { shield:'#00f', slow:'#0f0', points:'#ff0', jump:'#f0f' };
      const gradient = ctx.createRadialGradient(
        p.x + p.width/2,
        p.y + p.height/2,
        2,
        p.x + p.width/2,
        p.y + p.height/2,
        p.width/2
      );
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.3, colors[p.type]);
      gradient.addColorStop(1, '#000');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI*2);
      ctx.fill();
    }

    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0,height-20,width,20);
      drawPlayer();
      blades.forEach(drawBlade);
      powerUps.forEach(drawPowerUp);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '18px sans-serif';
      ctx.fillText('Score: ' + currentScore, 16, 28);
      ctx.fillText('Top: ' + best, 16, 52);

      if (!runningLocal && canRestart) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0,0,width,height);
        ctx.fillStyle = '#fff';
        ctx.font = '36px sans-serif';
        ctx.fillText('Game Over', width/2-100, height/2-20);
        ctx.font = '20px sans-serif';
        ctx.fillText('Press Enter to Restart', width/2-110, height/2+20);
      }
    }

    function loop() {
      if (runningLocal) update();
      draw();
      requestRef.current = requestAnimationFrame(loop);
    }

    function onKey(e) {
      if (e.type === 'keydown') {
        if (e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'Space') keys.space = true;
        if (e.code === 'Enter' && canRestart) resetGame();
      } else {
        if (e.code === 'ArrowLeft') keys.left = false;
        if (e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'Space') keys.space = false;
      }
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    resetGame();
    setRunning(true);
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      if (bgmRef.current) bgmRef.current.pause();
    };
  }, [best, navigate]);

  return (
    <div className="center-col">
      <h2>Play</h2>
      <canvas ref={canvasRef} width="800" height="450" style={{ border: '1px solid #111', borderRadius:'12px' }} />
      <div style={{ marginTop: 8 }}>
        <strong>Score:</strong> {score} &nbsp; <strong>Top:</strong> {best}
      </div>
      <div style={{ marginTop: 8 }}>
        <small>Controls: ← → to move, Space to jump, Enter to restart.</small>
      </div>
      <div style={{ marginTop: 8 }}>
        <small>Power-ups: Green=Slow, Purple=Jump, Yellow=Points, Blue=Chnage Color</small>
      </div>
    </div>
  );
}
