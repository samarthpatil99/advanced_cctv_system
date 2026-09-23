import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface PixelCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
  speed?: number;
  colors?: string[];
  variant?: 'default' | 'trail' | 'glow';
  noFocus?: boolean;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function interpolateColor(color1: RGB, color2: RGB, factor: number): RGB {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor),
  };
}

interface ActivePixel {
  col: number;
  row: number;
  life: number; // 1 -> 0
  decay: number;
  colorIdx: number;
  nextColorIdx: number;
  maxAlpha: number;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  gap = 7,
  speed = 0.03,
  colors = ['#0B1F3A', '#123B68', '#1E5A8A', '#2B78A8'],
  variant = 'default',
  noFocus = false,
  className,
  style,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Parse colors to RGB
    const rgbColors: RGB[] = colors.map((c) => hexToRgb(c));
    if (rgbColors.length === 0) {
      rgbColors.push({ r: 11, g: 31, b: 58 });
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId: number;
    let isMounted = true;

    // Sparse active pixels map: key `${col},${row}`
    const activePixels = new Map<string, ActivePixel>();

    const updateSize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    const activatePixel = (
      col: number,
      row: number,
      preferredColor?: number,
      maxAlpha = 0.85
    ) => {
      const cols = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);
      if (col < 0 || col >= cols || row < 0 || row >= rows) return;

      const key = `${col},${row}`;
      const colorIdx =
        preferredColor !== undefined
          ? preferredColor % rgbColors.length
          : Math.floor(Math.random() * rgbColors.length);

      const nextColorIdx = (colorIdx + 1) % rgbColors.length;
      // Slight decay variance to create organic, subtle fading
      const decay = speed * (0.8 + Math.random() * 0.4);

      activePixels.set(key, {
        col,
        row,
        life: 1.0,
        decay: Math.max(0.005, decay),
        colorIdx,
        nextColorIdx,
        maxAlpha,
      });
    };

    // Pointer move listener on parent to activate pixels safely
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      const centerCol = Math.floor(x / gap);
      const centerRow = Math.floor(y / gap);

      // Light up center and immediate adjacent cells subtly
      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (Math.random() < 0.7) {
            const dist = Math.sqrt(dc * dc + dr * dr);
            const alpha = dist === 0 ? 0.75 : 0.45;
            activatePixel(centerCol + dc, centerRow + dr, undefined, alpha);
          }
        }
      }
    };

    // Attach listener to parent element so interaction is detected smoothly
    const parent = container.parentElement || container;
    parent.addEventListener('pointermove', handlePointerMove as EventListener, { passive: true });

    let frameCount = 0;

    const render = () => {
      if (!isMounted) return;
      frameCount++;

      ctx.clearRect(0, 0, width, height);

      // Gentle ambient idle pulse: randomly spawn subtle pixels periodically
      if (frameCount % 4 === 0 && activePixels.size < 60) {
        const cols = Math.ceil(width / gap);
        const rows = Math.ceil(height / gap);
        if (cols > 0 && rows > 0) {
          const randCol = Math.floor(Math.random() * cols);
          const randRow = Math.floor(Math.random() * rows);
          // Very low alpha (0.25 - 0.45) for dark navy command-center feel
          activatePixel(randCol, randRow, undefined, 0.35);
        }
      }

      // Draw and decay active pixels
      for (const [key, p] of activePixels.entries()) {
        p.life -= p.decay;

        if (p.life <= 0) {
          activePixels.delete(key);
          continue;
        }

        const colorA = rgbColors[p.colorIdx];
        const colorB = rgbColors[p.nextColorIdx];
        const colorFactor = 1 - p.life;
        const currentRgb = interpolateColor(colorA, colorB, colorFactor);

        // Alpha calculation: smooth ramp down
        const alpha = Math.max(0, Math.min(1, p.life * p.maxAlpha));
        const px = p.col * gap;
        const py = p.row * gap;
        const size = Math.max(1, gap - 1);

        ctx.fillStyle = `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${alpha.toFixed(3)})`;

        if (variant === 'glow') {
          ctx.shadowColor = `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${(alpha * 0.5).toFixed(3)})`;
          ctx.shadowBlur = gap * 1.2;
          ctx.fillRect(px, py, size, size);
          ctx.shadowBlur = 0;
        } else if (variant === 'trail') {
          ctx.beginPath();
          const radius = size / 2;
          ctx.arc(px + radius, py + radius, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Default: crisp square pixels
          ctx.fillRect(px, py, size, size);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      parent.removeEventListener('pointermove', handlePointerMove as EventListener);
    };
  }, [gap, speed, colors, variant, noFocus]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 pointer-events-none w-full h-full overflow-hidden select-none',
        className
      )}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="block pointer-events-none w-full h-full"
      />
    </div>
  );
};
export default PixelCanvas;
