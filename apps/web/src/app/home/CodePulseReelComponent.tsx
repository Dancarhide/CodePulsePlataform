'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Smartphone, Monitor, Cloud, Shield, Users } from 'lucide-react';

interface CodePulseReelProps {
  videoScale: number;
}

const TOTAL_DURATION_MS = 16000; // 16 segundos exactos
const TICK_MS = 33; // ~30 FPS

export default function CodePulseReelComponent({ videoScale }: CodePulseReelProps) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isVertical916, setIsVertical916] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setElapsedMs((prev) => (prev + TICK_MS) % TOTAL_DURATION_MS);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentSec = elapsedMs / 1000;

  // Determinar escena activa según la línea de tiempo (0-3s, 3-6s, 6-10s, 10-16s)
  const getActiveScene = () => {
    if (currentSec < 3) return 1; // 00:00 - 00:03 (El Quiebre)
    if (currentSec < 6) return 2; // 00:03 - 00:06 (El Reto)
    if (currentSec < 10) return 3; // 00:06 - 00:10 (La Solución - Tarjetas Flotantes)
    return 4; // 00:10 - 00:16 (Identidad y Llamado a la Acción)
  };

  const activeScene = getActiveScene();

  // Formatear tiempo 00:SS:FF (30 FPS)
  const formatTimecode = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const frames = Math.floor(((ms % 1000) / 1000) * 30);
    const sStr = String(secs).padStart(2, '0');
    const fStr = String(frames).padStart(2, '0');
    return `00:${sStr}:${fStr}`;
  };

  const jumpToSecond = (sec: number) => {
    setElapsedMs(sec * 1000);
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Barra superior de control de vista (16:9 Dashboard vs 9:16 Vertical 1080x1920) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setIsVertical916(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            background: !isVertical916 ? 'rgba(34, 211, 238, 0.16)' : 'rgba(5, 6, 8, 0.8)',
            color: !isVertical916 ? '#22d3ee' : '#9ca3af',
            border: !isVertical916 ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Monitor size={14} /> MODO CONSOLA PANORÁMICO
        </button>
        <button
          type="button"
          onClick={() => setIsVertical916(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            background: isVertical916 ? 'rgba(34, 211, 238, 0.16)' : 'rgba(5, 6, 8, 0.8)',
            color: isVertical916 ? '#22d3ee' : '#9ca3af',
            border: isVertical916 ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Smartphone size={14} /> FORMATO REEL 9:16 (1080×1920)
        </button>
      </div>

      {/* Contenedor Principal del Video HUD */}
      <div
        className="amber-reel-frame"
        style={{
          transform: `scale(${videoScale})`,
          backgroundColor: '#050608',
          maxWidth: isVertical916 ? '430px' : '1320px',
          height: isVertical916 ? '764px' : '76vh',
          minHeight: isVertical916 ? '720px' : '480px',
          borderRadius: '18px',
          border: '1px solid rgba(34, 211, 238, 0.28)',
          boxShadow:
            '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 45px rgba(34, 211, 238, 0.12)',
          transition: 'max-width 0.35s ease, height 0.35s ease, transform 0.12s ease-out',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 1. TEXTURA SUTIL DE GRID CUADRICULADO TENUE Y GRANO CINEMATOGRÁFICO */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.045) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.045) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.06) 0%, rgba(5, 6, 8, 0.92) 78%)',
            pointerEvents: 'none',
          }}
        />

        {/* Líneas de esquina tácticas HUD */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 18,
            height: 18,
            borderTop: '2px solid #22d3ee',
            borderLeft: '2px solid #22d3ee',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 18,
            height: 18,
            borderTop: '2px solid #22d3ee',
            borderRight: '2px solid #22d3ee',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            width: 18,
            height: 18,
            borderBottom: '2px solid #22d3ee',
            borderLeft: '2px solid #22d3ee',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            width: 18,
            height: 18,
            borderBottom: '2px solid #22d3ee',
            borderRight: '2px solid #22d3ee',
            pointerEvents: 'none',
          }}
        />

        {/* 2. ESQUINAS CON INDICADORES HUD TÉCNICOS FIJOS */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: isVertical916 ? '1.6rem 1.4rem' : '2rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 4,
          }}
        >
          {/* HUD Superior */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontFamily: 'monospace',
              fontSize: isVertical916 ? '0.68rem' : '0.76rem',
              letterSpacing: '0.12em',
            }}
          >
            <div>
              <div style={{ color: '#22d3ee', fontWeight: 700 }}>
                SYSTEM.LINK // CODEPULSE
              </div>
              <div style={{ color: '#64748b', fontSize: '0.66rem', marginTop: '2px' }}>
                NODE_CLUSTER: LATAM_MAINNET // 1080x1920 @ 30FPS
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '4px',
                  color: '#10b981',
                  fontWeight: 700,
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block',
                  }}
                />
                <span>STATUS: 200_OK</span>
              </div>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '4px',
                  background: 'rgba(34, 211, 238, 0.12)',
                  border: '1px solid rgba(34, 211, 238, 0.4)',
                  color: '#22d3ee',
                  cursor: 'pointer',
                }}
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setElapsedMs(0)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                }}
                title="Reiniciar 00:00"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* =========================================================
              ESCENARIO CENTRAL SINCRONIZADO (00:00 - 00:16)
             ========================================================= */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
            }}
          >
            <AnimatePresence mode="wait">
              {/* SEGUNDO 00:00 - 00:03 (EL QUIEBRE) */}
              {activeScene === 1 && (
                <motion.div
                  key="scene-quiebre"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{
                    textAlign: 'center',
                    maxWidth: '760px',
                    padding: '0 1rem',
                  }}
                >
                  {/* Badge técnico: [ STATUS: OUT_OF_SYLLABUS ] */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontFamily: 'monospace',
                      fontSize: isVertical916 ? '0.78rem' : '0.9rem',
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      color: '#22d3ee',
                      background: 'rgba(34, 211, 238, 0.08)',
                      border: '1px solid rgba(34, 211, 238, 0.4)',
                      padding: '0.45rem 1rem',
                      borderRadius: '4px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <span>[ STATUS: OUT_OF_SYLLABUS ]</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.65, repeat: Infinity }}
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '15px',
                        backgroundColor: '#22d3ee',
                      }}
                    />
                  </motion.div>

                  {/* Texto cinético de impacto */}
                  <motion.h2
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.12, ease: 'easeOut' }}
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isVertical916
                        ? 'clamp(2.1rem, 5vw, 2.7rem)'
                        : 'clamp(2.8rem, 5.2vw, 4.6rem)',
                      fontWeight: 700,
                      lineHeight: 1.08,
                      margin: 0,
                      background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    La universidad te dio las bases.
                  </motion.h2>
                </motion.div>
              )}

              {/* SEGUNDO 00:03 - 00:06 (EL RETO) */}
              {activeScene === 2 && (
                <motion.div
                  key="scene-reto"
                  initial={{ opacity: 0, x: 24, skewX: -8 }}
                  animate={{ opacity: 1, x: [ -6, 4, 0 ], skewX: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    textAlign: 'center',
                    maxWidth: '880px',
                    padding: '0 1rem',
                  }}
                >
                  {/* Subtítulo superior monoespaciado */}
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: isVertical916 ? '0.78rem' : '0.92rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      color: '#22d3ee',
                      marginBottom: '1rem',
                    }}
                  >
                    LEVEL_REQUIREMENT: PRODUCTION
                  </div>

                  {/* Tipografía pesada y expansiva */}
                  <motion.h2
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isVertical916
                        ? 'clamp(2.4rem, 6vw, 3.1rem)'
                        : 'clamp(3.2rem, 6vw, 5.2rem)',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                      color: '#ffffff',
                      margin: '0 0 1rem 0',
                      textShadow: '0 0 30px rgba(34, 211, 238, 0.25)',
                    }}
                  >
                    LA INDUSTRIA PIDE MÁS.
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.22, ease: 'easeOut' }}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: isVertical916 ? '1.1rem' : '1.45rem',
                      fontWeight: 500,
                      background: 'linear-gradient(90deg, #ffffff 0%, #9ca3af 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      margin: 0,
                    }}
                  >
                    Y nadie debería descifrarlo solo.
                  </motion.p>
                </motion.div>
              )}

              {/* SEGUNDO 00:06 - 00:10 (LA SOLUCIÓN - TARJETAS FLOTANTES) */}
              {activeScene === 3 && (
                <motion.div
                  key="scene-solucion"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: '100%',
                    maxWidth: isVertical916 ? '380px' : '1020px',
                    display: 'grid',
                    gridTemplateColumns: isVertical916
                      ? '1fr'
                      : 'repeat(3, minmax(240px, 1fr))',
                    gap: '1.1rem',
                    padding: '0 0.5rem',
                  }}
                >
                  {[
                    {
                      tag: '[CLOUD]',
                      desc: 'Despliegues reales y arquitecturas escalables.',
                      icon: <Cloud size={22} color="#22d3ee" />,
                    },
                    {
                      tag: '[NETWORKING]',
                      desc: 'Infraestructura, seguridad y protocolos.',
                      icon: <Shield size={22} color="#22d3ee" />,
                    },
                    {
                      tag: '[COMMUNITY]',
                      desc: 'Resolución colectiva sin barreras.',
                      icon: <Users size={22} color="#22d3ee" />,
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.tag}
                      initial={{ opacity: 0, y: 36, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: idx * 0.14,
                      }}
                      style={{
                        background: 'rgba(11, 15, 23, 0.78)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(34, 211, 238, 0.45)',
                        boxShadow:
                          '0 12px 32px rgba(0, 0, 0, 0.65), inset 0 0 20px rgba(34, 211, 238, 0.06)',
                        borderRadius: '10px',
                        padding: isVertical916 ? '1.1rem 1.25rem' : '1.65rem 1.5rem',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            color: '#22d3ee',
                          }}
                        >
                          {card.tag}
                        </span>
                        {card.icon}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: isVertical916 ? '0.92rem' : '1.02rem',
                          lineHeight: 1.5,
                          color: '#f1f5f9',
                          fontWeight: 500,
                        }}
                      >
                        {card.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* SEGUNDO 00:10 - 00:16 (IDENTIDAD Y LLAMADO A LA ACCIÓN) */}
              {activeScene === 4 && (
                <motion.div
                  key="scene-cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 1rem',
                  }}
                >
                  {/* Onda de choque circular (pulso de radar) desde el centro */}
                  {[0, 1].map((ring) => (
                    <motion.div
                      key={ring}
                      initial={{ width: 40, height: 40, opacity: 0.75 }}
                      animate={{ width: 560, height: 560, opacity: 0 }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        delay: ring * 1.1,
                        ease: 'easeOut',
                      }}
                      style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        border: '1.5px solid #22d3ee',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}

                  {/* Revelación del título principal: CODEPULSE con PULSE en cian neón brillante */}
                  <motion.h2
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: isVertical916
                        ? 'clamp(2.8rem, 8vw, 3.6rem)'
                        : 'clamp(3.8rem, 7vw, 6rem)',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      margin: '0 0 0.4rem 0',
                      color: '#ffffff',
                      lineHeight: 1,
                    }}
                  >
                    CODE
                    <span
                      style={{
                        color: '#22d3ee',
                        textShadow: '0 0 28px rgba(34, 211, 238, 0.75)',
                      }}
                    >
                      PULSE
                    </span>
                  </motion.h2>

                  {/* Subtítulo */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: isVertical916 ? '1rem' : '1.25rem',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#cbd5e1',
                      marginBottom: '2rem',
                    }}
                  >
                    Comunidad Privada de Desarrolladores
                  </motion.div>

                  {/* Botón flotante estilizado con efecto glow */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{
                      opacity: 1,
                      y: [0, -4, 0],
                    }}
                    transition={{
                      opacity: { duration: 0.25, delay: 0.28 },
                      y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{
                      padding: isVertical916 ? '0.85rem 1.4rem' : '1rem 2.2rem',
                      borderRadius: '8px',
                      background: 'rgba(34, 211, 238, 0.12)',
                      border: '1.5px solid #22d3ee',
                      boxShadow:
                        '0 0 28px rgba(34, 211, 238, 0.45), inset 0 0 12px rgba(34, 211, 238, 0.2)',
                      fontFamily: 'monospace',
                      fontSize: isVertical916 ? '0.8rem' : '0.95rem',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      color: '#ffffff',
                    }}
                  >
                    ACCESO VÍA WHATSAPP — LINK EN BIO
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HUD Inferior: Coordenadas de red + Línea de tiempo de 16s */}
          <div style={{ width: '100%' }}>
            {/* Barra de tiempo interactiva dividida en los 4 bloques (0-3s, 3-6s, 6-10s, 10-16s) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '3fr 3fr 4fr 6fr',
                gap: '6px',
                marginBottom: '0.75rem',
              }}
            >
              {[
                { label: '00:00 QUIEBRE', start: 0, end: 3 },
                { label: '00:03 RETO', start: 3, end: 6 },
                { label: '00:06 SOLUCIÓN', start: 6, end: 10 },
                { label: '00:10 IDENTIDAD', start: 10, end: 16 },
              ].map((seg) => {
                const segDuration = seg.end - seg.start;
                const progress = Math.max(
                  0,
                  Math.min(100, ((currentSec - seg.start) / segDuration) * 100)
                );
                return (
                  <button
                    key={seg.label}
                    type="button"
                    onClick={() => jumpToSecond(seg.start)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      height: '5px',
                      borderRadius: '3px',
                      border: 'none',
                      padding: 0,
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    title={seg.label}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: '#22d3ee',
                        boxShadow: '0 0 10px #22d3ee',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'monospace',
                fontSize: isVertical916 ? '0.65rem' : '0.74rem',
                letterSpacing: '0.1em',
                color: '#64748b',
              }}
            >
              <span>NET.COORD // 19.4326° N, 99.1332° W</span>
              <span style={{ color: '#22d3ee', fontWeight: 700 }}>
                TIMECODE // {formatTimecode(elapsedMs)} / 00:16:00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
