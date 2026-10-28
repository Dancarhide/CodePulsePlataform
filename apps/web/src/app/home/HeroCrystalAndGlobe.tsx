'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ============================================================================
   1. CRISTAL PRISMÁTICO 3D ANIMADO CON FRAMER MOTION (HERO SECTION)
   ============================================================================ */
export function HeroQuantumCrystal() {
  return (
    <div
      style={{
        position: 'relative',
        width: '340px',
        height: '310px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px',
        marginBottom: '-0.5rem',
        zIndex: 2,
      }}
      aria-hidden="true"
    >
      {/* Halo de energía volumétrico trasero */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '230px',
          height: '230px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(225, 29, 72, 0.55) 0%, rgba(147, 51, 234, 0.38) 50%, transparent 75%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Anillo orbital exterior 1 */}
      <motion.div
        animate={{ rotateZ: 360, rotateX: [62, 68, 62], rotateY: [-15, 15, -15] }}
        transition={{
          rotateZ: { duration: 14, repeat: Infinity, ease: 'linear' },
          rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          width: '275px',
          height: '275px',
          borderRadius: '50%',
          border: '1.5px solid rgba(244, 63, 94, 0.45)',
          boxShadow: '0 0 20px rgba(225, 29, 72, 0.25)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Anillo orbital exterior 2 */}
      <motion.div
        animate={{ rotateZ: -360, rotateX: [70, 58, 70], rotateY: [22, -22, 22] }}
        transition={{
          rotateZ: { duration: 18, repeat: Infinity, ease: 'linear' },
          rotateX: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '1px dashed rgba(192, 132, 252, 0.55)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Contenedor 3D del Cristal de Cuarzo / Rubí Cibernético */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotateY: [-18, 18, -18],
          rotateX: [6, -6, 6],
          rotateZ: [-3, 3, -3],
        }}
        transition={{
          y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'relative',
          width: '220px',
          height: '240px',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 20px 35px rgba(225, 29, 72, 0.45))',
        }}
      >
        <svg width="220" height="240" viewBox="0 0 240 260" fill="none">
          <defs>
            <linearGradient id="gemTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="45%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="gemTopRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="gemCenterLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="50%" stopColor="#881337" />
              <stop offset="100%" stopColor="#2e1065" />
            </linearGradient>
            <linearGradient id="gemCenterRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="55%" stopColor="#6b21a8" />
              <stop offset="100%" stopColor="#1e052e" />
            </linearGradient>
            <linearGradient id="gemCenterFront" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="38%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
            <linearGradient id="gemBottomLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6b21a8" />
              <stop offset="100%" stopColor="#1f062c" />
            </linearGradient>
            <linearGradient id="gemBottomRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9f1239" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
            <linearGradient id="gemShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#fda4af" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Corona superior facetada */}
          <polygon points="120,10 55,62 92,76" fill="url(#gemTopLeft)" />
          <polygon points="120,10 92,76 148,76" fill="url(#gemCenterFront)" />
          <polygon points="120,10 148,76 185,62" fill="url(#gemTopRight)" />

          {/* Cuerpo central de múltiples caras (Octaedro tallado) */}
          <polygon points="55,62 34,126 82,145 92,76" fill="url(#gemCenterLeft)" />
          <polygon points="92,76 82,145 158,145 148,76" fill="url(#gemCenterFront)" />
          <polygon points="148,76 158,145 206,126 185,62" fill="url(#gemCenterRight)" />

          {/* Punta inferior tallada */}
          <polygon points="34,126 82,145 120,244" fill="url(#gemBottomLeft)" />
          <polygon points="82,145 158,145 120,244" fill="url(#gemCenterLeft)" />
          <polygon points="158,145 206,126 120,244" fill="url(#gemBottomRight)" />

          {/* Reflejo especular de cristal */}
          <polygon points="120,10 92,76 120,145 148,76" fill="url(#gemShine)" opacity="0.45" />

          {/* Aristas internas luminosas */}
          <g stroke="#fecdd3" strokeOpacity="0.55" strokeWidth="1">
            <line x1="120" y1="10" x2="92" y2="76" />
            <line x1="120" y1="10" x2="148" y2="76" />
            <line x1="55" y1="62" x2="185" y2="62" strokeOpacity="0.2" />
            <line x1="92" y1="76" x2="148" y2="76" />
            <line x1="92" y1="76" x2="82" y2="145" />
            <line x1="148" y1="76" x2="158" y2="145" />
            <line x1="82" y1="145" x2="158" y2="145" />
            <line x1="82" y1="145" x2="120" y2="244" />
            <line x1="158" y1="145" x2="120" y2="244" />
          </g>

          {/* Contorno exterior brillante */}
          <polygon
            points="120,10 185,62 206,126 120,244 34,126 55,62"
            stroke="#fda4af"
            strokeOpacity="0.7"
            strokeWidth="1.3"
            fill="none"
          />
        </svg>

        {/* Destello estelar animado en la arista superior */}
        <motion.div
          animate={{
            scale: [0.8, 1.35, 0.8],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 90, 180],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '44px',
            right: '36px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 0%, #f43f5e 60%, transparent 100%)',
            boxShadow: '0 0 18px #ffffff, 0 0 30px #f43f5e',
          }}
        />
      </motion.div>

      {/* Partículas flotantes alrededor del cristal */}
      {[
        { top: '18%', left: '16%', size: 6, delay: 0 },
        { top: '26%', right: '14%', size: 5, delay: 0.8 },
        { bottom: '22%', left: '20%', size: 4, delay: 1.5 },
        { bottom: '18%', right: '18%', size: 6, delay: 2.1 },
      ].map((p, idx) => (
        <motion.span
          key={idx}
          animate={{
            y: [0, -18, 0],
            opacity: [0.25, 0.95, 0.25],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: idx % 2 === 0 ? '#f43f5e' : '#c084fc',
            boxShadow: `0 0 12px ${idx % 2 === 0 ? '#f43f5e' : '#c084fc'}`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================================
   2. PLANETA 3D GIRATORIO EN TIEMPO REAL CON MATRIZ DE PUNTOS Y NODOS (LATAM)
   ============================================================================ */
export function RotatingLatamPlanet() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 680;
    const height = 680;
    canvas.width = width;
    canvas.height = height;

    const cx = width / 2;
    const cy = height / 2;
    const radius = 248;

    // Generar puntos esféricos (latitud / longitud) + mayor densidad en la franja continental
    interface SpherePoint {
      lat: number;
      lon: number;
      isHub: boolean;
      size: number;
    }

    const points: SpherePoint[] = [];
    const latSteps = 26;
    const lonSteps = 52;

    for (let i = 1; i < latSteps; i++) {
      const lat = (i / latSteps - 0.5) * Math.PI;
      for (let j = 0; j < lonSteps; j++) {
        const lon = (j / lonSteps) * Math.PI * 2;
        // Simular masa continental con función trigonométrica suave para que se vean continentes definidos
        const landSignal =
          Math.sin(lat * 2.6 + 0.5) * Math.cos(lon * 1.8) +
          Math.cos(lat * 3.8 - lon * 1.4) * 0.55;
        const isContinent = landSignal > 0.08;
        const isHub = landSignal > 0.68 && (i + j) % 5 === 0;

        points.push({
          lat,
          lon,
          isHub,
          size: isHub ? 3.3 : isContinent ? 1.85 : 1.0,
        });
      }
    }

    let angleY = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Resplandor atmosférico del planeta
      const bgGlow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.18);
      bgGlow.addColorStop(0, 'rgba(147, 51, 234, 0.25)');
      bgGlow.addColorStop(0.55, 'rgba(225, 29, 72, 0.16)');
      bgGlow.addColorStop(0.85, 'rgba(88, 28, 135, 0.06)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Borde exterior de la atmósfera
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.32)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const tiltX = 0.24; // Inclinación axial del planeta
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);

      const projectedHubs: { x: number; y: number; z: number }[] = [];

      // Proyectar cada punto 3D y dibujar
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const lonRot = p.lon + angleY;

        const x0 = radius * Math.cos(p.lat) * Math.sin(lonRot);
        const y0 = radius * Math.sin(p.lat);
        const z0 = radius * Math.cos(p.lat) * Math.cos(lonRot);

        // Aplicar inclinación X
        const y = y0 * cosX - z0 * sinX;
        const z = y0 * sinX + z0 * cosX;
        const x = x0;

        // Mostrar tanto cara frontal como trasera tenue para efecto holográfico 3D
        const depthAlpha = (z + radius) / (2 * radius);
        if (depthAlpha < 0.12) continue;

        const screenX = cx + x;
        const screenY = cy + y;

        if (p.isHub && z > 0) {
          projectedHubs.push({ x: screenX, y: screenY, z });
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * (0.65 + depthAlpha * 0.55), 0, Math.PI * 2);

        if (p.isHub && z > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, depthAlpha + 0.3)})`;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
        } else if (p.size > 1.5) {
          ctx.fillStyle = `rgba(244, 63, 94, ${depthAlpha * 0.85})`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(192, 132, 252, ${depthAlpha * 0.38})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      // Conectar los nodos principales visibles con líneas de red (constelación sobre el planeta)
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      for (let i = 0; i < projectedHubs.length; i++) {
        for (let j = i + 1; j < projectedHubs.length; j++) {
          const a = projectedHubs[i];
          const b = projectedHubs[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 115) {
            const lineAlpha = (1 - dist / 115) * 0.52;
            ctx.strokeStyle = `rgba(244, 63, 94, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      angleY += 0.0045; // Velocidad de rotación fluida del planeta
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="amber-globe-backdrop"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      {/* Anillo orbital exterior animado con Framer Motion */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          border: '1px dashed rgba(192, 132, 252, 0.3)',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '615px',
          height: '615px',
          borderRadius: '50%',
          border: '1px solid rgba(244, 63, 94, 0.18)',
        }}
      />

      {/* Planeta 3D en rotación continua */}
      <canvas
        ref={canvasRef}
        style={{
          width: '680px',
          height: '680px',
          maxWidth: '92vw',
          maxHeight: '92vw',
        }}
      />
    </div>
  );
}
