import React, { useRef, useEffect, useState } from 'react';
import type { TileState } from '../mahjong/gameEngine';
import Tile from './Tile';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './SvgIcons';

interface MahjongBoardProps {
  tiles: TileState[];
  // Identifies the current run. Changes only when a new board is dealt (new
  // level, restart, resume) — the signal for re-fitting the board to screen.
  boardId: number;
  highContrast: boolean;
  hintedPair: string[] | null;
  onTileClick: (tile: TileState) => void;
  bgTheme: string;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

export const MahjongBoard: React.FC<MahjongBoardProps> = ({
  tiles,
  boardId,
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
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  
  // Pre-allocated Particle Pool to prevent dynamic GC stutter
  const PARTICLE_POOL_SIZE = 500;
  const particlesPoolRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  // The draw loop only runs while sparks are alive; bursts wake it via kickBurstRef.
  const burstRunningRef = useRef(false);
  const kickBurstRef = useRef<() => void>(() => {});

  // Initialize the particle pool once on mount
  useEffect(() => {
    const pool: Particle[] = [];
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: '',
        size: 0,
        alpha: 0,
        life: 0,
        maxLife: 0,
        rotation: 0,
        rotationSpeed: 0
      });
    }
    particlesPoolRef.current = pool;
  }, []);

  // Particle Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to cover container
    // Size the backing store to DEVICE pixels while the CSS box stays in CSS
    // pixels (the stylesheet gives it width/height: 100%). Without the dpr
    // factor a 2x or 3x phone renders every burst at half or a third of native
    // resolution and the sparks come out soft — most of this app's players are
    // on exactly those screens. The transform below then lets all the drawing
    // code keep working in CSS pixels, which matters because tileCenter() feeds
    // it getBoundingClientRect() values.
    const cssSize = { w: 0, h: 0 };
    const resizeCanvas = () => {
      const host = containerRef.current;
      if (!canvas || !host) return;
      const dpr = window.devicePixelRatio || 1;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w === 0 || h === 0) return;
      cssSize.w = w;
      cssSize.h = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Setting width/height resets the context, so the transform has to be
      // reapplied after every resize, not just once.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();

    // A ResizeObserver, not window.resize: the board area is `flex-grow: 1`
    // inside a flex column, so it changes height whenever a sibling mounts or
    // the layout reflows, with no window resize to react to. A stale backing
    // store then gets stretched by CSS, and because burst coordinates come from
    // getBoundingClientRect() in CSS pixels the sparks land off the tiles they
    // came from. This covers orientation changes for free too.
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(containerRef.current!);

    const updateAndDraw = () => {
      // CSS pixels: the context is scaled by dpr, so canvas.width would clear a
      // region dpr times too large.
      ctx.clearRect(0, 0, cssSize.w, cssSize.h);
      const pool = particlesPoolRef.current;
      let activeCount = 0;

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.x += p.vx;
        p.y += p.vy;

        // Custom theme-aware physics!
        if (bgTheme === 'ocean') {
          p.vy -= 0.03; // Anti-gravity bubbles float up
          p.vx += Math.sin(p.life * 0.1) * 0.1; // Gentle horizontal drift
        } else if (bgTheme === 'sunset') {
          p.vy -= 0.015; // Soft rising heat embers
          p.vx += (Math.random() - 0.5) * 0.25; // Crackling flicker drift
          p.vy += 0.02; // Slow gravity counterbalance
        } else if (bgTheme === 'zen') {
          p.vy += 0.03; // Light cherry blossoms drift down slowly
          p.vx += Math.cos(p.life * 0.05) * 0.05; // Wind wave sway
        } else {
          p.vy += 0.08; // Normal gravity for cyber neon sparks
        }

        p.rotation += p.rotationSpeed;

        p.life--;
        p.alpha = p.life / p.maxLife;

        // Draw particle spark
        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (bgTheme === 'zen') {
          // --- 🌸 ZEN GARDEN: Spinning Cherry Blossom Petals ---
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          // Draw standard cherry blossom petal ellipse
          ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else if (bgTheme === 'ocean') {
          // --- 🌊 DEEP OCEAN: Floating Hollow Water Bubbles ---
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.stroke();

          // Bubble highlight glint
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        } else if (bgTheme === 'sunset') {
          // --- 🪵 SUNSET AMBER: Floating Fire Embers (Stars/Diamonds) ---
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.quadraticCurveTo(p.x, p.y, p.x + p.size, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + p.size);
          ctx.quadraticCurveTo(p.x, p.y, p.x - p.size, p.y);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else {
          // --- 🌌 HEALING DARK: Cyberpunk 4-Point Neon Stars ---
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 1.4);
          ctx.lineTo(p.x + p.size * 0.35, p.y - p.size * 0.35);
          ctx.lineTo(p.x + p.size * 1.4, p.y);
          ctx.lineTo(p.x + p.size * 0.35, p.y + p.size * 0.35);
          ctx.lineTo(p.x, p.y + p.size * 1.4);
          ctx.lineTo(p.x - p.size * 0.35, p.y + p.size * 0.35);
          ctx.lineTo(p.x - p.size * 1.4, p.y);
          ctx.lineTo(p.x - p.size * 0.35, p.y - p.size * 0.35);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
        }

        ctx.restore();

        if (p.life <= 0) {
          p.active = false; // Recycle in pool
        } else {
          activeCount++;
        }
      }

      if (activeCount > 0) {
        animationFrameRef.current = requestAnimationFrame(updateAndDraw);
      } else {
        // Nothing left to animate: wipe the final frame and idle the loop so a
        // static board doesn't pay a full-canvas redraw every frame. The next
        // match burst restarts it via kickBurstRef.
        ctx.clearRect(0, 0, cssSize.w, cssSize.h);
        burstRunningRef.current = false;
      }
    };

    kickBurstRef.current = () => {
      if (burstRunningRef.current) return;
      burstRunningRef.current = true;
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    };

    return () => {
      ro.disconnect();
      burstRunningRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Retire every in-flight particle. The loop is what sets `active = false`
      // (at end of life), so cancelling it mid-burst would strand those slots as
      // permanently active — and spawnBurst only reuses inactive ones. Enough
      // theme switches mid-burst and bursts would silently stop appearing.
      const pool = particlesPoolRef.current;
      for (let i = 0; i < pool.length; i++) pool[i].active = false;
      ctx.clearRect(0, 0, cssSize.w, cssSize.h);
    };
  }, [bgTheme]);

  // Listen for global tiles match custom events to trigger bursts
  useEffect(() => {
    const handleMatchEvent = (e: CustomEvent<{ id1: string; id2: string }>) => {
      // Respect reduced-motion: matches still clear with sound/haptics, but no
      // canvas spark bursts (CSS can't suppress JS-driven animation).
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const { id1, id2 } = e.detail;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Burst at the tiles' actual rendered positions (matched tiles stay in
      // the DOM), so sparks line up regardless of zoom, pan, or orientation.
      const rect = container.getBoundingClientRect();
      const tileCenter = (id: string): { x: number; y: number } => {
        const el = container.querySelector(`[data-tile-id="${CSS.escape(id)}"]`);
        if (!el) return { x: rect.width / 2, y: rect.height / 2 };
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
      };
      const { x: px1, y: py1 } = tileCenter(id1);
      const { x: px2, y: py2 } = tileCenter(id2);

      // Color palettes tailored precisely for premium design sets
      let colors = ['#ffb7c5', '#ff9fb2', '#ffffff', '#ffd1dc']; // Zen pink sakura
      if (bgTheme === 'ocean') {
        colors = ['#e0f7fa', '#80deea', '#26c6da', '#00e5ff', '#ffffff']; // Ocean teals/blues
      } else if (bgTheme === 'sunset') {
        colors = ['#ff6d00', '#ffd700', '#ffab40', '#ff3d00', '#ff8f00']; // Sunset golds/reds
      } else if (bgTheme === 'dark') {
        colors = ['#ff007f', '#d500f9', '#7c4dff', '#00e5ff', '#ffffff']; // Cyber purple/magenta
      }

      // Recycle and activate particles from the pool instead of push
      const spawnBurst = (cx: number, cy: number) => {
        const pool = particlesPoolRef.current;
        let spawned = 0;

        for (let i = 0; i < pool.length; i++) {
          if (!pool[i].active) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4.5;
            
            pool[i].active = true;
            pool[i].x = cx;
            pool[i].y = cy;
            pool[i].vx = Math.cos(angle) * speed;
            pool[i].vy = Math.sin(angle) * speed - 1.5; // blast upwards slightly
            pool[i].color = colors[Math.floor(Math.random() * colors.length)];
            pool[i].size = 2.5 + Math.random() * 4.5;
            pool[i].alpha = 1.0;
            // maxLife tracks life, so alpha (= life / maxLife) starts at 1 and
            // fades to 0. Pinning maxLife at 50 meant a spark that rolled 30
            // frames was born at 60% opacity and only got dimmer.
            const life = 30 + Math.floor(Math.random() * 20);
            pool[i].life = life;
            pool[i].maxLife = life;
            pool[i].rotation = Math.random() * Math.PI * 2;
            pool[i].rotationSpeed = (Math.random() - 0.5) * 0.15;

            spawned++;
            if (spawned >= 16) {
              break;
            }
          }
        }
      };

      spawnBurst(px1, py1);
      spawnBurst(px2, py2);
      kickBurstRef.current(); // wake the draw loop for this burst
    };

    window.addEventListener('tile-match', handleMatchEvent as EventListener);
    return () => {
      window.removeEventListener('tile-match', handleMatchEvent as EventListener);
    };
  }, [bgTheme]);

  // Half-tile cell size straight off the live grid element. The fallbacks are
  // the landscape desktop values and only apply before the grid has mounted (or
  // if the custom properties ever go missing).
  const gridRef = useRef<HTMLDivElement>(null);
  interface GridGeometry { cellW: number; cellH: number; cols: number; rows: number }
  const GRID_FALLBACK: GridGeometry = { cellW: 30, cellH: 38, cols: 30, rows: 18 };
  const readGridGeometry = (): GridGeometry => {
    const el = gridRef.current;
    if (!el) return GRID_FALLBACK;
    const style = getComputedStyle(el);
    const num = (prop: string, fallback: number): number => {
      const v = parseFloat(style.getPropertyValue(prop));
      return Number.isFinite(v) && v > 0 ? v : fallback;
    };
    return {
      cellW: num('--cell-w', GRID_FALLBACK.cellW),
      cellH: num('--cell-h', GRID_FALLBACK.cellH),
      cols: num('--grid-cols', GRID_FALLBACK.cols),
      rows: num('--grid-rows', GRID_FALLBACK.rows)
    };
  };

  // Compute fit-to-screen transform by fitting the ACTUAL tile bounding box
  // (not the full 30x18 grid) so tiles render as large as possible and stay centered.
  const computeFitTransform = (): { zoom: number; panX: number; panY: number } => {
    if (!containerRef.current || tiles.length === 0) {
      return { zoom: 1.0, panX: 0, panY: 0 };
    }
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Cell geometry comes from the grid's own --cell-w / --cell-h, so the
    // orientation variants and the 1024px breakpoint are defined once in
    // index.css. Duplicating them here meant a CSS tweak silently broke board
    // fitting with nothing to catch it.
    const { cellW, cellH, cols, rows } = readGridGeometry();

    // Bounding box of all tiles in grid units (each tile spans 2 units)
    const active = tiles.filter(t => !t.matched);
    const ref = active.length > 0 ? active : tiles;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of ref) {
      const rx = isPortrait ? t.y : t.x;
      const ry = isPortrait ? t.x : t.y;
      if (rx < minX) minX = rx;
      if (rx + 2 > maxX) maxX = rx + 2;
      if (ry < minY) minY = ry;
      if (ry + 2 > maxY) maxY = ry + 2;
    }

    // Bounding box in pixels + padding for 3D walls, stacking shift and shadows
    const padPx = 32;
    const bboxW = (maxX - minX) * cellW + padPx * 2;
    const bboxH = (maxY - minY) * cellH + padPx * 2;

    const scaleX = containerWidth / bboxW;
    const scaleY = containerHeight / bboxH;
    const zoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.97, 0.35), 2.4);

    // Re-center: the grid centers its own geometric center (15 cols, 9 rows).
    // Offset the pan so the tile bounding-box center lands at the container center.
    const bboxCenterX = ((minX + maxX) / 2) * cellW;
    const bboxCenterY = ((minY + maxY) / 2) * cellH;
    // No orientation branch: .portrait-grid already swaps --grid-cols and
    // --grid-rows, so reading them back gives the transposed centre for free.
    const gridCenterX = (cols / 2) * cellW;
    const gridCenterY = (rows / 2) * cellH;
    const panX = -(bboxCenterX - gridCenterX) * zoom;
    const panY = -(bboxCenterY - gridCenterY) * zoom;

    return { zoom, panX, panY };
  };

  const applyFit = () => {
    const { zoom: z, panX, panY } = computeFitTransform();
    setZoom(z);
    setPan({ x: panX, y: panY });
  };

  // The resize handler must see the current tiles/orientation, but re-registering
  // it whenever `tiles` changes meant a listener teardown on every single tap.
  // Point it at a ref instead and register once.
  const applyFitRef = useRef(applyFit);
  useEffect(() => { applyFitRef.current = applyFit; });

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      applyFitRef.current();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-fit when a NEW board appears (new level, restart, resume) — keyed off
  // boardId rather than `tiles`, which also changes on every match.
  useEffect(() => {
    const portraitTimer = window.setTimeout(() => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    }, 0);
    // Deferred so the grid has laid out (and --cell-w/--cell-h resolve) first.
    const fitTimer = window.setTimeout(() => applyFitRef.current(), 60);
    return () => {
      clearTimeout(portraitTimer);
      clearTimeout(fitTimer);
    };
  }, [boardId]);

  // Zoom controls
  const MIN_ZOOM = 0.35;
  const MAX_ZOOM = 2.4;
  const clampZoom = (z: number) => Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM);
  const zoomIn = () => setZoom(prev => clampZoom(prev + 0.15));
  const zoomOut = () => setZoom(prev => clampZoom(prev - 0.15));
  const resetZoom = () => applyFit();

  // Tracks whether the current gesture moved far enough to count as a pan;
  // if so, the click that fires on release is swallowed so it can't pick a tile.
  const dragMovedRef = useRef(false);

  // Dragging to Pan board (accessibility for smaller displays)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragMovedRef.current = false;
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const nx = e.clientX - dragStart.x;
    const ny = e.clientY - dragStart.y;
    if (Math.abs(nx - pan.x) + Math.abs(ny - pan.y) > 4) dragMovedRef.current = true;
    setPan({ x: nx, y: ny });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Swallow the click that follows a pan gesture
  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      dragMovedRef.current = false;
    }
  };

  // Touch: one finger pans, two fingers pinch-zoom. The container uses
  // touch-action: none so the browser never scrolls/zooms the page instead.
  const touchRef = useRef<{ mode: 'pan' | 'pinch' | null; startX: number; startY: number; panX: number; panY: number; pinchDist: number; zoomStart: number }>({
    mode: null, startX: 0, startY: 0, panX: 0, panY: 0, pinchDist: 0, zoomStart: 1
  });

  const touchDist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    const s = touchRef.current;
    if (e.touches.length === 2) {
      s.mode = 'pinch';
      s.pinchDist = touchDist(e.touches);
      s.zoomStart = zoom;
    } else if (e.touches.length === 1) {
      s.mode = 'pan';
      s.startX = e.touches[0].clientX;
      s.startY = e.touches[0].clientY;
      s.panX = pan.x;
      s.panY = pan.y;
      dragMovedRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const s = touchRef.current;
    if (s.mode === 'pinch' && e.touches.length === 2 && s.pinchDist > 0) {
      setZoom(clampZoom(s.zoomStart * (touchDist(e.touches) / s.pinchDist)));
    } else if (s.mode === 'pan' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - s.startX;
      const dy = e.touches[0].clientY - s.startY;
      if (Math.abs(dx) + Math.abs(dy) > 8) {
        dragMovedRef.current = true;
        setPan({ x: s.panX + dx, y: s.panY + dy });
      }
    }
  };

  const handleTouchEnd = () => {
    touchRef.current.mode = null;
  };

  // Desktop convenience: mouse wheel zooms the board
  const handleWheel = (e: React.WheelEvent) => {
    setZoom(prev => clampZoom(prev - e.deltaY * 0.0015));
  };

  return (
    <div className="mahjong-board-outer">
      {/* Zoom and Pan Floating Toolbar */}
      <div className="board-toolbar glassmorphism">
        <button onClick={zoomIn} aria-label="Zoom in" className="toolbar-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ZoomInIcon size={18} />
        </button>
        <button onClick={zoomOut} aria-label="Zoom out" className="toolbar-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ZoomOutIcon size={18} />
        </button>
        <button onClick={resetZoom} aria-label="Reset zoom and center" className="toolbar-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResetZoomIcon size={18} />
        </button>
      </div>

      <div
        className="mahjong-board-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClickCapture={handleClickCapture}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
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
          ref={gridRef}
          className={`mahjong-grid ${isPortrait ? 'portrait-grid' : ''}`}
          style={{
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {tiles.map(tile => {
            const isHinted = hintedPair !== null && hintedPair.includes(tile.id);
            return (
              <Tile
                key={tile.id}
                tile={tile}
                transpose={isPortrait}
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
