import React, { useRef, useEffect, useState } from 'react';
import type { TileState } from '../mahjong/gameEngine';
import Tile from './Tile';

interface MahjongBoardProps {
  tiles: TileState[];
  styleSet: 'classic' | 'largePrint' | 'nature' | 'modernPop';
  highContrast: boolean;
  hintedPair: [string, string] | null;
  onTileClick: (tile: TileState) => void;
  bgTheme: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const MahjongBoard: React.FC<MahjongBoardProps> = ({
  tiles,
  styleSet,
  highContrast,
  hintedPair,
  onTileClick,
  bgTheme
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Spawns spark particles at the grid center of matching tiles
  useEffect(() => {
    // Look for freshly matched tiles (we check if any matched tile is in the tiles list
    // and trigger effect based on match state changes)
  }, [tiles]);

  // Particle Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to cover container
    const resizeCanvas = () => {
      if (canvas && containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // Gravity drift
        p.life--;
        p.alpha = p.life / p.maxLife;

        // Draw particle spark
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Listen for global tiles match custom events to trigger bursts
  useEffect(() => {
    const handleMatchEvent = (e: CustomEvent<{ x1: number; y1: number; x2: number; y2: number }>) => {
      const { x1, y1, x2, y2 } = e.detail;
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      
      // Map grid coordinates to screen pixel coordinates
      const gridWidth = 32; // match css template columns
      const gridHeight = 18; // match css template rows
      const cellW = rect.width / gridWidth;
      const cellH = rect.height / gridHeight;

      const px1 = (x1 + 1) * cellW + cellW;
      const py1 = (y1 + 1) * cellH + cellH;
      const px2 = (x2 + 1) * cellW + cellW;
      const py2 = (y2 + 1) * cellH + cellH;

      // Color palette based on current theme
      let colors = ['#ffd700', '#ff8c00', '#ffffff', '#e0f7fa']; // gold spark
      if (bgTheme === 'ocean') colors = ['#00e5ff', '#ffffff', '#18ffff', '#e0f7fa'];
      else if (bgTheme === 'bamboo') colors = ['#69f0ae', '#ffffff', '#b9f6ca', '#e8f5e9'];
      else if (bgTheme === 'sunset') colors = ['#ff6d00', '#ffd700', '#ffab40', '#ff3d00'];

      // Spawn 16 particles per tile location
      const spawnBurst = (cx: number, cy: number) => {
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 4;
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2, // blast upwards slightly
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2 + Math.random() * 4,
            alpha: 1.0,
            life: 30 + Math.floor(Math.random() * 20),
            maxLife: 50
          });
        }
      };

      spawnBurst(px1, py1);
      spawnBurst(px2, py2);
    };

    window.addEventListener('tile-match', handleMatchEvent as EventListener);
    return () => {
      window.removeEventListener('tile-match', handleMatchEvent as EventListener);
    };
  }, [bgTheme]);

  // Compute fit-to-screen zoom factor
  const computeFitZoom = () => {
    if (!containerRef.current) return 1.0;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const isSmallScreen = window.innerWidth <= 1024;
    const gridW = isSmallScreen ? (30 * 20 + 100) : (30 * 26 + 100);
    const gridH = isSmallScreen ? (18 * 22 + 100) : (18 * 28 + 100);

    const scaleX = containerWidth / gridW;
    const scaleY = containerHeight / gridH;
    const fitted = Math.min(scaleX, scaleY) * 0.94; // 94% safe margin

    return Math.min(Math.max(fitted, 0.35), 1.8);
  };

  // Auto-fit board on mount or layout change/restart
  useEffect(() => {
    const unmatchedCount = tiles.filter(t => !t.matched).length;
    const isNewGame = unmatchedCount === tiles.length;

    let timer: number | undefined;
    if (isNewGame) {
      timer = window.setTimeout(() => {
        const fitted = computeFitZoom();
        setZoom(fitted);
        setPan({ x: 0, y: 0 });
      }, 60);
    }

    const handleResize = () => {
      const fitted = computeFitZoom();
      setZoom(fitted);
      setPan({ x: 0, y: 0 });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [tiles]);

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.35));
  const resetZoom = () => {
    const fitted = computeFitZoom();
    setZoom(fitted);
    setPan({ x: 0, y: 0 });
  };

  // Dragging to Pan board (accessibility for smaller displays)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="mahjong-board-outer">
      {/* Zoom and Pan Floating Toolbar */}
      <div className="board-toolbar glassmorphism">
        <button onClick={zoomIn} aria-label="Zoom in" className="toolbar-btn">➕</button>
        <button onClick={zoomOut} aria-label="Zoom out" className="toolbar-btn">➖</button>
        <button onClick={resetZoom} aria-label="Reset zoom and center" className="toolbar-btn">🎯</button>
        <span className="toolbar-hint">Drag board to pan</span>
      </div>

      <div
        className="mahjong-board-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Canvas overlay for particle burst effects */}
        <canvas ref={canvasRef} className="particles-canvas" />

        {/* Floating background zen effects (leaves/bubbles) */}
        <div className={`floating-zen-bg ${bgTheme}-decorations`}>
          <div className="zen-petal petal-1"></div>
          <div className="zen-petal petal-2"></div>
          <div className="zen-petal petal-3"></div>
          <div className="zen-petal petal-4"></div>
        </div>

        {/* 3D stacked Board Grid */}
        <div
          className="mahjong-grid"
          style={{
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {tiles.map(tile => {
            const isHinted = hintedPair !== null && (tile.id === hintedPair[0] || tile.id === hintedPair[1]);
            return (
              <Tile
                key={tile.id}
                tile={tile}
                styleSet={styleSet}
                highContrast={highContrast}
                isHinted={isHinted}
                onClick={onTileClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MahjongBoard;
