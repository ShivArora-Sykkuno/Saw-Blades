# React Canvas Runner Game

A fast-paced browser-based runner game built with **React** and **Canvas API**, featuring obstacles and collectible power-ups. The game includes a **score system**, **top score tracking**, and interactive **power-ups** that enhance gameplay.

---

## 🎮 Game Overview

- **Player controls a running character** on a 2D canvas.
- **Avoid spinning blades** and survive as long as possible.
- **Collect power-ups** to gain advantages:
  - **Blue Shield**: Absorbs one hit from an obstacle (one-time use).
  - **Purple Jump Boost**: Higher jumps for 5 seconds.
  - **Yellow Points**: Instantly adds 10 points to your score.
- **Power-ups spawn** in a cyclic order: Blue → Purple → Yellow.

---

## ⚡ Features

- **Smooth animations** using Canvas API.
- **Floating and glowing power-ups** for better visual appeal.
- **Score tracking**: displays current score and top score.
- **Audio effects**:
  - Background music
  - Jump sound
  - Hit sound
- **Keyboard controls**:
  - Arrow Left / Right: Move
  - Space: Jump
  - Enter: Restart game

---

## 🛠️ Installation & Setup

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
```bash

2. Install dependencies:
    ```bash
    npm install
    ```bash
3. Start the development server:
    ```bash
    npm run server
    ```bash