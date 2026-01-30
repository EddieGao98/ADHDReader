import React, { useEffect, useRef, useCallback } from 'react';

interface BackgroundGameProps {
  opacity: number;
  isPlaying: boolean;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

/**
 * A simple endless runner game to play in the background
 * Inspired by Subway Surfers - provides visual stimulation for ADHD focus
 */
const BackgroundGame: React.FC<BackgroundGameProps> = ({ opacity, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const gameStateRef = useRef({
    player: { x: 80, y: 200, width: 30, height: 40, vy: 0, lane: 1 },
    obstacles: [] as GameObject[],
    coins: [] as GameObject[],
    particles: [] as Particle[],
    ground: [] as { x: number; width: number; height: number }[],
    buildings: [] as { x: number; width: number; height: number; color: string }[],
    score: 0,
    speed: 3,
    frame: 0,
    isJumping: false,
    gravity: 0.5,
    jumpForce: -12,
    groundY: 280,
  });

  const colors = {
    sky: ['#1a1a2e', '#16213e', '#0f3460'],
    buildings: ['#e94560', '#533483', '#0f3460', '#16213e'],
    player: '#00ff88',
    coin: '#ffd700',
    obstacle: '#ff4757',
    ground: '#2d3436',
    particles: ['#00ff88', '#ffd700', '#ff6b6b', '#74b9ff'],
  };

  const initGame = useCallback(() => {
    const state = gameStateRef.current;
    state.player = { x: 80, y: state.groundY - 40, width: 30, height: 40, vy: 0, lane: 1 };
    state.obstacles = [];
    state.coins = [];
    state.particles = [];
    state.score = 0;
    state.speed = 3;
    state.frame = 0;
    state.isJumping = false;

    // Initialize buildings
    state.buildings = [];
    for (let i = 0; i < 10; i++) {
      state.buildings.push({
        x: i * 120,
        width: 60 + Math.random() * 60,
        height: 80 + Math.random() * 150,
        color: colors.buildings[Math.floor(Math.random() * colors.buildings.length)],
      });
    }

    // Initialize ground segments
    state.ground = [];
    for (let i = 0; i < 20; i++) {
      state.ground.push({
        x: i * 60,
        width: 60,
        height: 40,
      });
    }
  }, []);

  const createParticles = useCallback((x: number, y: number, count: number, color?: string) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30 + Math.random() * 20,
        color: color || colors.particles[Math.floor(Math.random() * colors.particles.length)],
        size: 3 + Math.random() * 4,
      });
    }
  }, []);

  const update = useCallback(() => {
    const state = gameStateRef.current;
    state.frame++;

    // Gradually increase speed
    state.speed = 3 + Math.floor(state.frame / 500) * 0.5;

    // Update player
    state.player.vy += state.gravity;
    state.player.y += state.player.vy;

    // Ground collision
    if (state.player.y >= state.groundY - state.player.height) {
      state.player.y = state.groundY - state.player.height;
      state.player.vy = 0;
      state.isJumping = false;
    }

    // Update buildings (parallax - slower)
    state.buildings.forEach((building) => {
      building.x -= state.speed * 0.3;
      if (building.x + building.width < 0) {
        building.x = 800 + Math.random() * 100;
        building.height = 80 + Math.random() * 150;
        building.width = 60 + Math.random() * 60;
        building.color = colors.buildings[Math.floor(Math.random() * colors.buildings.length)];
      }
    });

    // Update ground
    state.ground.forEach((segment) => {
      segment.x -= state.speed;
      if (segment.x + segment.width < 0) {
        segment.x = state.ground.reduce((max, s) => Math.max(max, s.x), 0) + 60;
      }
    });

    // Spawn obstacles
    if (state.frame % 90 === 0 && Math.random() > 0.3) {
      state.obstacles.push({
        x: 800,
        y: state.groundY - 30,
        width: 25,
        height: 30,
        color: colors.obstacle,
        speed: state.speed,
      });
    }

    // Spawn coins
    if (state.frame % 45 === 0 && Math.random() > 0.4) {
      const coinY = state.groundY - 60 - Math.random() * 80;
      state.coins.push({
        x: 800,
        y: coinY,
        width: 15,
        height: 15,
        color: colors.coin,
        speed: state.speed,
      });
    }

    // Update obstacles
    state.obstacles = state.obstacles.filter((obs) => {
      obs.x -= state.speed;
      return obs.x + obs.width > -50;
    });

    // Update coins
    state.coins = state.coins.filter((coin) => {
      coin.x -= state.speed;

      // Coin collection
      if (
        state.player.x < coin.x + coin.width &&
        state.player.x + state.player.width > coin.x &&
        state.player.y < coin.y + coin.height &&
        state.player.y + state.player.height > coin.y
      ) {
        state.score += 10;
        createParticles(coin.x + coin.width / 2, coin.y + coin.height / 2, 8, colors.coin);
        return false;
      }

      return coin.x + coin.width > -50;
    });

    // Collision detection with obstacles
    for (const obs of state.obstacles) {
      if (
        state.player.x < obs.x + obs.width &&
        state.player.x + state.player.width > obs.x &&
        state.player.y < obs.y + obs.height &&
        state.player.y + state.player.height > obs.y
      ) {
        // Hit! Create explosion effect and respawn
        createParticles(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, 15);
        state.player.x = 80;
        state.player.y = state.groundY - state.player.height;
        state.score = Math.max(0, state.score - 5);
      }
    }

    // Update particles
    state.particles = state.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      return p.life > 0;
    });

    // Auto-jump when obstacle is near
    const nearestObstacle = state.obstacles.find(
      (obs) => obs.x > state.player.x && obs.x < state.player.x + 150
    );
    if (nearestObstacle && !state.isJumping && state.player.y >= state.groundY - state.player.height - 1) {
      state.player.vy = state.jumpForce;
      state.isJumping = true;
      createParticles(state.player.x + state.player.width / 2, state.player.y + state.player.height, 5);
    }
  }, [createParticles]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const state = gameStateRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.sky[0]);
    gradient.addColorStop(0.5, colors.sky[1]);
    gradient.addColorStop(1, colors.sky[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37 + state.frame * 0.1) % width;
      const y = (i * 53) % (state.groundY - 50);
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw buildings (background)
    state.buildings.forEach((building) => {
      ctx.fillStyle = building.color;
      ctx.fillRect(building.x, state.groundY - building.height, building.width, building.height);

      // Windows
      ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
      for (let row = 0; row < Math.floor(building.height / 25); row++) {
        for (let col = 0; col < Math.floor(building.width / 20); col++) {
          if (Math.random() > 0.3 || state.frame % 60 < 30) {
            ctx.fillRect(
              building.x + 8 + col * 20,
              state.groundY - building.height + 10 + row * 25,
              8,
              12
            );
          }
        }
      }
    });

    // Draw ground
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, state.groundY, width, height - state.groundY);

    // Ground line
    ctx.strokeStyle = '#636e72';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(width, state.groundY);
    ctx.stroke();

    // Draw obstacles
    state.obstacles.forEach((obs) => {
      ctx.fillStyle = obs.color;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      // Obstacle glow
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
    });

    // Draw coins
    state.coins.forEach((coin) => {
      ctx.fillStyle = coin.color;
      ctx.beginPath();
      ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Coin shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(coin.x + coin.width / 2 - 3, coin.y + coin.height / 2 - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    ctx.fillStyle = colors.player;
    ctx.shadowColor = colors.player;
    ctx.shadowBlur = 15;

    // Player body
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

    // Player running animation
    const runFrame = Math.floor(state.frame / 5) % 4;
    const legOffset = state.isJumping ? 5 : Math.sin(runFrame * Math.PI / 2) * 5;

    // Eyes
    ctx.fillStyle = '#000';
    ctx.shadowBlur = 0;
    ctx.fillRect(state.player.x + 18, state.player.y + 8, 6, 6);

    // Trail effect
    ctx.fillStyle = `rgba(0, 255, 136, ${0.1 + legOffset * 0.02})`;
    ctx.fillRect(state.player.x - 20, state.player.y + 10, 20, state.player.height - 20);

    // Draw particles
    state.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 50;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw score
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`Score: ${state.score}`, 20, 30);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (isPlaying) {
        update();
        draw(ctx, canvas.width, canvas.height);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, update, draw]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gameStateRef.current.groundY = canvas.height - 40;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export default BackgroundGame;
