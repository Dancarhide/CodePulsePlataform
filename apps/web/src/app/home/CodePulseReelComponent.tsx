'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Code2,
  Layers,
  ShieldCheck,
  Terminal,
  Trophy,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Cpu,
  Lock,
  Server,
} from 'lucide-react';

interface CodePulseReelProps {
  videoScale: number;
}

const SCENE_DURATION_MS = 4600;

export default function CodePulseReelComponent({ videoScale }: CodePulseReelProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);

  const scenes = [
    {
      id: 'intro',
      badge: '01 // CODEPULSE PLATAFORM',
      title: 'VEN A APRENDER EL FUTURO TI',
      subtitle: 'La plataforma interactiva donde dominas la ingeniería moderna en la práctica.',
    },
    {
      id: 'pillars',
      badge: '02 // ECOSISTEMA INTERACTIVO',
      title: 'LABORATORIOS • TORNEOS • FORO',
      subtitle: 'Entrena en contenedores en vivo, compite por XP y resuelve dudas con toda la comunidad.',
    },
    {
      id: 'dev',
      badge: '03 // ESPECIALIDAD PRINCIPAL',
      title: 'DESARROLLO DE SOFTWARE',
      subtitle: 'Full-Stack Web, Backend de alto rendimiento, APIs modernas, algoritmos y estructuras de datos.',
    },
    {
      id: 'arch',
      badge: '04 // SISTEMAS ESCALABLES',
      title: 'ARQUITECTURA DE SOFTWARE',
      subtitle: 'Microservicios distribuidos, API Gateways, diseño de bases de datos, Cloud y alta disponibilidad.',
    },
    {
      id: 'cyber',
      badge: '05 // SEGURIDAD & TECNOLOGÍAS AVANZADAS',
      title: 'CIBERSEGURIDAD Y MÁS',
      subtitle: 'Auditoría ofensiva/defensiva, criptografía, protección cloud, Inteligencia Artificial y DevOps.',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % scenes.length);
    }, SCENE_DURATION_MS);
    return () => clearInterval(interval);
  }, [isPlaying, scenes.length]);

  return (
    <div
      className="amber-reel-frame"
      style={{
        transform: `scale(${videoScale})`,
        background:
          'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.28) 0%, rgba(225, 29, 72, 0.22) 45%, #06020d 90%)',
      }}
    >
      {/* Fondo animado de partículas y rejilla cibernética con Framer Motion */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Esferas de luz en movimiento continuo */}
        <motion.div
          animate={{
            x: [0, 90, -60, 0],
            y: [0, -50, 60, 0],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '18%',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.32) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />
        <motion.div
          animate={{
            x: [0, -100, 70, 0],
            y: [0, 70, -40, 0],
            scale: [1, 1.15, 1.3, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '8%',
            right: '15%',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(225, 29, 72, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Malla de fondo estilo estudio */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(168, 85, 247, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(225, 29, 72, 0.07) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 90%)',
          }}
        />
      </div>

      {/* Overlay con Header, Escena Central Animada y Controles Inferiores */}
      <div className="amber-reel-overlay" style={{ background: 'rgba(5, 2, 10, 0.35)' }}>
        {/* Encabezado del Showreel */}
        <div
          className="amber-reel-header"
          style={{ justifyContent: 'space-between', width: '100%', zIndex: 5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="amber-reel-badge-icon">CP</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                CodePulse Plataform • Official Showreel
              </div>
              <div style={{ fontSize: '0.8rem', color: '#d4d4d8' }}>
                Laboratorios • Torneos • Foro
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              background: 'rgba(15, 7, 28, 0.78)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              color: '#ffffff',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? 'PAUSAR REEL' : 'REPRODUCIR'}
          </button>
        </div>

        {/* Escenario Central Multicámara con AnimatePresence */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            zIndex: 4,
            padding: '1rem 0',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={scenes[sceneIndex].id}
              initial={{ opacity: 0, y: 28, scale: 0.94, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, scale: 1.04, filter: 'blur(8px)' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                maxWidth: '980px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Etiqueta superior animada */}
              <motion.span
                initial={{ opacity: 0, letterSpacing: '0.05em' }}
                animate={{ opacity: 1, letterSpacing: '0.22em' }}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#fb7185',
                  textTransform: 'uppercase',
                  marginBottom: '0.6rem',
                  padding: '0.25rem 0.9rem',
                  borderRadius: '999px',
                  background: 'rgba(225, 29, 72, 0.16)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                }}
              >
                {scenes[sceneIndex].badge}
              </motion.span>

              {/* Título Principal de la Escena */}
              <h2
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: 'clamp(2.2rem, 4.8vw, 4.2rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  margin: '0.25rem 0 0.75rem',
                  background: 'linear-gradient(90deg, #ffffff 0%, #e9d5ff 50%, #fda4af 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {scenes[sceneIndex].title}
              </h2>

              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)',
                  color: '#d4d4d8',
                  maxWidth: '680px',
                  margin: '0 auto 1.75rem',
                  lineHeight: 1.5,
                }}
              >
                {scenes[sceneIndex].subtitle}
              </p>

              {/* GRÁFICOS INTERACTIVOS ESPECÍFICOS DE CADA ESCENA */}

              {/* ESCENA 1: CODEPULSE PLATAFORM - VEN A APRENDER */}
              {sceneIndex === 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {[
                    { label: 'Desarrollo de Software', icon: <Code2 size={18} color="#c084fc" /> },
                    { label: 'Arquitectura de Software', icon: <Layers size={18} color="#fb7185" /> },
                    { label: 'Ciberseguridad', icon: <ShieldCheck size={18} color="#c084fc" /> },
                    { label: 'IA, Cloud y Más', icon: <Sparkles size={18} color="#fb7185" /> },
                  ].map((pill, i) => (
                    <motion.div
                      key={pill.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '14px',
                        background: 'rgba(14, 7, 26, 0.85)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.45)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                      }}
                    >
                      {pill.icon}
                      <span>{pill.label}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ESCENA 2: LABORATORIOS • TORNEOS • FORO */}
              {sceneIndex === 1 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(190px, 250px))',
                    gap: '1.15rem',
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {[
                    {
                      title: 'LABORATORIOS',
                      sub: 'Ejecución de código en vivo y contenedores aislados',
                      icon: <Terminal size={26} color="#f43f5e" />,
                    },
                    {
                      title: 'TORNEOS',
                      sub: 'Competencias globales, hackathons y ranking XP',
                      icon: <Trophy size={26} color="#c084fc" />,
                    },
                    {
                      title: 'FORO',
                      sub: 'Comunidad colaborativa de desarrolladores LATAM',
                      icon: <MessageSquare size={26} color="#f43f5e" />,
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.12 + i * 0.12 }}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        background:
                          'linear-gradient(145deg, rgba(30, 11, 54, 0.85), rgba(60, 7, 28, 0.75))',
                        border: '1px solid rgba(244, 63, 94, 0.4)',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ marginBottom: '0.6rem' }}>{card.icon}</div>
                      <div
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontWeight: 800,
                          fontSize: '1.25rem',
                          color: '#ffffff',
                        }}
                      >
                        {card.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#d4d4d8', marginTop: '0.25rem' }}>
                        {card.sub}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ESCENA 3: DESARROLLO DE SOFTWARE (Terminal animada) */}
              {sceneIndex === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    width: '100%',
                    maxWidth: '640px',
                    background: 'rgba(8, 4, 16, 0.92)',
                    border: '1px solid rgba(168, 85, 247, 0.45)',
                    borderRadius: '16px',
                    padding: '1.15rem 1.4rem',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '0.86rem',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ec4899' }} />
                    <span style={{ marginLeft: '0.5rem', color: '#a1a1aa', fontSize: '0.75rem' }}>
                      codepulse-lab // fullstack-engine.ts
                    </span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    style={{ color: '#c084fc' }}
                  >
                    {`> const stack = ['Next.js', 'FastAPI', 'TypeScript', 'PostgreSQL'];`}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{ color: '#fda4af', marginTop: '0.35rem' }}
                  >
                    {`> await CodePulse.deployLab({ mode: 'production', tests: 42 });`}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{
                      color: '#f43f5e',
                      marginTop: '0.55rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={16} /> COMPILACIÓN EXITOSA • 42/42 TESTS SUPERADOS (+250 XP)
                  </motion.div>
                </motion.div>
              )}

              {/* ESCENA 4: ARQUITECTURA DE SOFTWARE (Nodos conectados) */}
              {sceneIndex === 3 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.85rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {[
                    { name: 'API Gateway', sub: 'Balanceo & Proxy', icon: <Server size={22} color="#c084fc" /> },
                    { name: 'Microservicios', sub: 'Auth • Cursos • Labs', icon: <Layers size={22} color="#fb7185" /> },
                    { name: 'Cloud & DB', sub: 'PostgreSQL Distribuido', icon: <Cpu size={22} color="#c084fc" /> },
                  ].map((node, i) => (
                    <React.Fragment key={node.name}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.18 }}
                        style={{
                          padding: '1rem 1.35rem',
                          borderRadius: '14px',
                          background: 'rgba(15, 6, 30, 0.9)',
                          border: '1px solid rgba(168, 85, 247, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        {node.icon}
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{node.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{node.sub}</div>
                        </div>
                      </motion.div>
                      {i < 2 && (
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.9, 1.1, 0.9] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{
                            width: '36px',
                            height: '3px',
                            background: 'linear-gradient(90deg, #9333ea, #e11d48)',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* ESCENA 5: CIBERSEGURIDAD Y MÁS */}
              {sceneIndex === 4 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1rem',
                  }}
                >
                  {[
                    { title: 'Pentesting & OWASP', desc: 'Auditoría de vulnerabilidades web', icon: <ShieldCheck size={22} color="#f43f5e" /> },
                    { title: 'Criptografía & JWT', desc: 'Protección de identidades y tokens', icon: <Lock size={22} color="#c084fc" /> },
                    { title: 'IA, Cloud & DevOps', desc: 'Automatización, Docker y LLMs', icon: <Sparkles size={22} color="#f43f5e" /> },
                  ].map((sec, i) => (
                    <motion.div
                      key={sec.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.14 }}
                      style={{
                        padding: '1rem 1.35rem',
                        borderRadius: '14px',
                        background: 'rgba(20, 6, 28, 0.88)',
                        border: '1px solid rgba(225, 29, 72, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        textAlign: 'left',
                      }}
                    >
                      {sec.icon}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                          {sec.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#d4d4d8' }}>{sec.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Barra inferior con selectores de escena y progreso en vivo */}
        <div style={{ width: '100%', zIndex: 5 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${scenes.length}, 1fr)`,
              gap: '0.6rem',
              marginBottom: '0.6rem',
            }}
          >
            {scenes.map((s, idx) => {
              const active = idx === sceneIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSceneIndex(idx)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    height: '5px',
                    borderRadius: '999px',
                    border: 'none',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  aria-label={s.title}
                >
                  {active && (
                    <motion.div
                      key={`bar-${sceneIndex}-${isPlaying}`}
                      initial={{ width: '0%' }}
                      animate={{ width: isPlaying ? '100%' : '100%' }}
                      transition={{
                        duration: isPlaying ? SCENE_DURATION_MS / 1000 : 0,
                        ease: 'linear',
                      }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #a855f7, #e11d48)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.76rem',
              color: '#a1a1aa',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.1em',
            }}
          >
            <span>CODEPULSE PLATAFORM // VEN A APRENDER</span>
            <span>
              ESCENA 0{sceneIndex + 1} / 0{scenes.length} • FRAMER MOTION ENGINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
