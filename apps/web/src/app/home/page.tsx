'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Terminal,
  ShieldCheck,
  Cpu,
  Cloud,
  Database,
  Code2,
  Layers,
  GitBranch,
  Globe,
  Smartphone,
  Server,
  Lock,
  Workflow,
  Binary,
  Boxes,
  Sparkles,
} from 'lucide-react';
import DashboardComponent from '../DashboardComponent';

export default function HomePage() {
  const reelSectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoScale, setVideoScale] = useState<number>(0.82);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeCourseIdx, setActiveCourseIdx] = useState<number>(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!reelSectionRef.current) return;
      const rect = reelSectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = Math.abs(viewportCenter - elementCenter);

      const maxDistance = viewportHeight * 0.85;
      const normalized = Math.max(0, Math.min(1, 1 - distance / maxDistance));
      const nextScale = 0.76 + normalized * 0.27;
      setVideoScale(Number(nextScale.toFixed(3)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 3. Sección "Latest On CodePulse" (Morado & Rojo)
  const latestNews = [
    {
      category: 'NUEVOS LABORATORIOS',
      title: 'Entornos de Ejecución en Vivo ya Disponibles',
      desc: 'Compila y ejecuta retos de estructuras de datos y algoritmos en contenedores aislados con métricas en tiempo real.',
      gradient: 'linear-gradient(135deg, #2e1065 0%, #7e22ce 55%, #be123c 100%)',
      badge: 'LABS 2.0',
    },
    {
      category: 'TORNEOS & LOGROS',
      title: 'CodePulse Global Hackathon & Arena 2026',
      desc: 'Participa en los torneos semanales de programación competitiva, desbloquea insignias y sube de nivel en la comunidad.',
      gradient: 'linear-gradient(135deg, #4c0519 0%, #e11d48 55%, #6b21a8 100%)',
      badge: 'ARENA AWARDS',
    },
    {
      category: 'CASOS DE ESTUDIO',
      title: 'Arquitectura de Microservicios en Producción',
      desc: 'Cómo diseñar ecosistemas escalables combinando Next.js, API Gateways, FastAPI y bases de datos distribuidas en Neon.',
      gradient: 'linear-gradient(135deg, #3b0764 0%, #9333ea 50%, #f43f5e 100%)',
      badge: 'ARQUITECTURA',
    },
  ];

  // 4. Sección Blanca: 2 Hileras de Tecnologías y Áreas TI
  const techRow1 = [
    { name: 'Full-Stack Web', sub: 'React • Next.js • TypeScript', icon: <Code2 size={36} color="#0f172a" /> },
    { name: 'Backend & APIs', sub: 'Python • FastAPI • Node.js', icon: <Terminal size={36} color="#0f172a" /> },
    { name: 'Ciberseguridad', sub: 'Pentesting • Criptografía • JWT', icon: <ShieldCheck size={36} color="#0f172a" /> },
    { name: 'Inteligencia Artificial', sub: 'Machine Learning • LLMs • Datos', icon: <Cpu size={36} color="#0f172a" /> },
    { name: 'Cloud & DevOps', sub: 'Docker • Kubernetes • CI/CD', icon: <Cloud size={36} color="#0f172a" /> },
    { name: 'Bases de Datos', sub: 'PostgreSQL • Prisma • Redis', icon: <Database size={36} color="#0f172a" /> },
    { name: 'Microservicios', sub: 'Sistemas Distribuidos • Gateways', icon: <Layers size={36} color="#0f172a" /> },
    { name: 'Control & Flujos', sub: 'Git • GitHub Actions • Monorepos', icon: <GitBranch size={36} color="#0f172a" /> },
  ];

  const techRow2 = [
    { name: 'Redes & Infraestructura', sub: 'Linux • Protocolos • Servidores', icon: <Globe size={36} color="#0f172a" /> },
    { name: 'Desarrollo Móvil', sub: 'Apps Nativas & Multiplataforma', icon: <Smartphone size={36} color="#0f172a" /> },
    { name: 'Arquitectura Cloud', sub: 'AWS • Serverless • Escalabilidad', icon: <Server size={36} color="#0f172a" /> },
    { name: 'Seguridad Ofensiva', sub: 'Auditoría • OWASP • Red Team', icon: <Lock size={36} color="#0f172a" /> },
    { name: 'Automatización QA', sub: 'Testing E2E • Pipelines • Calidad', icon: <Workflow size={36} color="#0f172a" /> },
    { name: 'Algoritmos & Lógica', sub: 'Grafos • Árboles • Competitiva', icon: <Binary size={36} color="#0f172a" /> },
    { name: 'Contenedores & Orquestación', sub: 'Docker • Micro-entornos • Cloud', icon: <Boxes size={36} color="#0f172a" /> },
    { name: 'Ingeniería de Prompts & IA', sub: 'Agentes • RAG • Automatización', icon: <Sparkles size={36} color="#0f172a" /> },
  ];

  // 5. Sección "Our Recent Work" -> Cursos Destacados (Morado & Rojo)
  const featuredCourses = [
    {
      id: 'python-backend',
      title: 'PYTHON & FASTAPI MASTERCLASS',
      subtitle: 'Construye microservicios de alto rendimiento con autenticación JWT, Prisma ORM y despliegue moderno.',
      level: 'INTERMEDIO',
      bg: 'radial-gradient(circle at 50% 40%, rgba(147, 51, 234, 0.38) 0%, rgba(88, 28, 135, 0.28) 42%, #06020c 80%)',
      cardBg: 'linear-gradient(135deg, #4c1d95 0%, #9333ea 100%)',
    },
    {
      id: 'fullstack-nextjs',
      title: 'INGENIERÍA FULL-STACK CON NEXT.JS',
      subtitle: 'Domina React 18, App Router, Server Actions, diseño de interfaces modernas y arquitecturas empresariales.',
      level: 'AVANZADO',
      bg: 'radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.38) 0%, rgba(136, 19, 55, 0.28) 42%, #06020c 80%)',
      cardBg: 'linear-gradient(135deg, #881337 0%, #e11d48 100%)',
    },
    {
      id: 'algoritmos-estructura',
      title: 'ESTRUCTURAS DE DATOS Y ALGORITMOS',
      subtitle: 'Entrena tu lógica para entrevistas técnicas y competencias resolviendo problemas de grafos, árboles y programación dinámica.',
      level: 'PRINCIPIANTE',
      bg: 'radial-gradient(circle at 50% 40%, rgba(168, 85, 247, 0.36) 0%, rgba(225, 29, 72, 0.24) 42%, #06020c 80%)',
      cardBg: 'linear-gradient(135deg, #581c87 0%, #be123c 100%)',
    },
    {
      id: 'ciberseguridad-cloud',
      title: 'CIBERSEGURIDAD & DEVOPS CLOUD',
      subtitle: 'Protege infraestructuras críticas, automatiza despliegues con contenedores Docker y audita aplicaciones web.',
      level: 'AVANZADO',
      bg: 'radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.38) 0%, rgba(107, 33, 168, 0.25) 42%, #06020c 80%)',
      cardBg: 'linear-gradient(135deg, #7f1d1d 0%, #9333ea 100%)',
    },
  ];

  const currentCourse = featuredCourses[activeCourseIdx];

  const prevCourse = () => {
    setActiveCourseIdx((prev) => (prev === 0 ? featuredCourses.length - 1 : prev - 1));
  };

  const nextCourse = () => {
    setActiveCourseIdx((prev) => (prev === featuredCourses.length - 1 ? 0 : prev + 1));
  };

  return (
    <DashboardComponent>
      {/* =========================================================
          1. HERO SECTION CON CRISTAL FACETADO MORADO Y ROJO
         ========================================================= */}
      <section className="amber-crystal-hero">
        <div className="amber-crystal-wrap" aria-hidden="true">
          <svg width="310" height="270" viewBox="0 0 320 280" fill="none">
            <defs>
              <linearGradient id="purpleRedFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="45%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="purpleRedFacet2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="55%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#1e052d" />
              </linearGradient>
              <linearGradient id="purpleRedFacet3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b0764" />
                <stop offset="60%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
              <linearGradient id="purpleRedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#e11d48" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            {/* Resplandor trasero morado/rojo */}
            <circle cx="160" cy="135" r="105" fill="url(#purpleRedGlow)" opacity="0.26" filter="blur(24px)" />
            {/* Polígonos del cristal facetado */}
            <polygon points="85,15 215,10 255,75 155,95 65,65" fill="url(#purpleRedFacet1)" stroke="#fda4af" strokeWidth="0.6" />
            <polygon points="65,65 155,95 135,195 75,160" fill="url(#purpleRedFacet2)" stroke="#c084fc" strokeWidth="0.6" />
            <polygon points="155,95 255,75 225,180 135,195" fill="url(#purpleRedFacet3)" stroke="#fb7185" strokeWidth="0.7" />
            <polygon points="75,160 135,195 160,255 95,215" fill="#2e1065" stroke="#9333ea" strokeWidth="0.6" />
            <polygon points="135,195 225,180 160,255" fill="url(#purpleRedFacet2)" stroke="#f43f5e" strokeWidth="0.6" />
            {/* Destello prismático */}
            <line x1="232" y1="35" x2="256" y2="75" stroke="#fecdd3" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="amber-crystal-title">
          Evolucionando la Ciencia y el Arte del Código
        </h1>
        <p className="amber-crystal-sub">
          Somos tu plataforma de innovación tecnológica, impulsando un nuevo modelo de
          aprendizaje práctico e ingeniería para la industria del software.
        </p>

        <Link href="/cursos" className="amber-rect-btn">
          Explorar Cursos
        </Link>
      </section>

      {/* =========================================================
          2. VIDEO REEL QUE CRECE AL ACERCARSE Y SE REDUCE AL ALEJARSE
         ========================================================= */}
      <section ref={reelSectionRef} className="amber-reel-section">
        <div
          className="amber-reel-frame"
          style={{
            transform: `scale(${videoScale})`,
          }}
        >
          <video
            ref={videoRef}
            className="amber-reel-video-bg"
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-the-earth-29350-large.mp4"
              type="video/mp4"
            />
          </video>

          <div className="amber-reel-overlay">
            <div className="amber-reel-header">
              <div className="amber-reel-badge-icon">CP</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                  CodePulse Engineering Reel • 2026
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d4d4d8' }}>CodePulse Studio</div>
              </div>
            </div>

            <div className="amber-reel-center">
              <h2 className="amber-reel-headline">
                CodePulse es una red global <br />
                de formación en tecnologías TI
              </h2>
              <button
                type="button"
                onClick={toggleVideoPlay}
                className="amber-reel-play-btn"
                aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
              >
                {isPlaying ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: '4px' }} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#a1a1aa' }}>
              <span>SCROLL INTERACTIVO • ZOOM DINÁMICO</span>
              <span>FULL HD // 60 FPS</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. LATEST ON CODEPULSE
         ========================================================= */}
      <section className="amber-latest-section">
        <div className="amber-latest-box">
          <h2 className="amber-section-big-title">Latest On CodePulse</h2>

          <div className="amber-latest-grid">
            {latestNews.map((item, idx) => (
              <div key={idx}>
                <div className="amber-latest-cat">{item.category}</div>
                <div className="amber-latest-thumb" style={{ background: item.gradient }}>
                  <span
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: '#ffffff',
                      padding: '0.4rem 1.2rem',
                      border: '2px solid rgba(255,255,255,0.45)',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.35)',
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="amber-latest-card-title">{item.title}</h3>
                <p className="amber-latest-card-desc">{item.desc}</p>
                <Link href="/cursos" className="amber-read-more">
                  Explorar más <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          4. SECCIÓN BLANCA CON 2 HILERAS DE TECNOLOGÍAS Y ÁREAS TI
         ========================================================= */}
      <section className="amber-industry-white">
        <h2 className="amber-industry-title">Tecnologías y Áreas TI que Enseñamos</h2>

        <div className="amber-marquee-wrapper">
          {/* Hilera 1 */}
          <div className="amber-marquee-row amber-marquee-row-left">
            {[...techRow1, ...techRow1].map((tech, index) => (
              <div key={`r1-${index}`} className="amber-tech-cell">
                {tech.icon}
                <div className="amber-tech-name">{tech.name}</div>
                <div className="amber-tech-sub">{tech.sub}</div>
              </div>
            ))}
          </div>

          {/* Hilera 2 */}
          <div className="amber-marquee-row amber-marquee-row-right">
            {[...techRow2, ...techRow2].map((tech, index) => (
              <div key={`r2-${index}`} className="amber-tech-cell">
                {tech.icon}
                <div className="amber-tech-name">{tech.name}</div>
                <div className="amber-tech-sub">{tech.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          5. NUESTROS CURSOS DESTACADOS
         ========================================================= */}
      <section className="amber-courses-showcase">
        <div
          className="amber-course-backdrop"
          style={{ background: currentCourse.bg }}
        />

        <button
          type="button"
          onClick={prevCourse}
          className="amber-arrow-btn amber-arrow-left"
          aria-label="Curso anterior"
        >
          <ChevronLeft size={54} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={nextCourse}
          className="amber-arrow-btn amber-arrow-right"
          aria-label="Siguiente curso"
        >
          <ChevronRight size={54} strokeWidth={1.5} />
        </button>

        <div className="amber-showcase-content">
          <h2 className="amber-section-big-title" style={{ marginBottom: '1rem' }}>
            Nuestros Cursos
          </h2>

          <div className="amber-showcase-banner">
            <span className="amber-kicker">// NIVEL {currentCourse.level}</span>
            <h3
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                fontWeight: 800,
                margin: '0.5rem 0 1rem',
                letterSpacing: '0.04em',
              }}
            >
              {currentCourse.title}
            </h3>
            <p
              style={{
                maxWidth: '640px',
                margin: '0 auto 2rem',
                color: '#d4d4d8',
                fontSize: '1.05rem',
                lineHeight: 1.6,
              }}
            >
              {currentCourse.subtitle}
            </p>
            <Link href="/cursos" className="amber-rect-btn">
              Ir al Curso
            </Link>
          </div>
        </div>

        <div className="amber-course-thumbs-row">
          {featuredCourses.map((course, idx) => (
            <div
              key={course.id}
              onClick={() => setActiveCourseIdx(idx)}
              className={`amber-course-thumb-card ${idx === activeCourseIdx ? 'active' : ''}`}
              style={{ background: course.cardBg }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: '0.3rem',
                }}
              >
                {course.level}
              </span>
              <div
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: '#ffffff',
                }}
              >
                {course.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          6. COMUNIDAD LATAM CON GLOBO MORADO Y ROJO (Todos los países)
         ========================================================= */}
      <section className="amber-latam-section">
        <div className="amber-globe-backdrop" aria-hidden="true">
          <svg width="680" height="680" viewBox="0 0 680 680" fill="none">
            <defs>
              <radialGradient id="globeCorePurpleRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e11d48" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#7e22ce" stopOpacity="0.26" />
                <stop offset="85%" stopColor="#2e1065" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Esfera luminosa central morado/rojo */}
            <circle cx="340" cy="360" r="265" fill="url(#globeCorePurpleRed)" />
            <circle cx="340" cy="360" r="250" stroke="#e11d48" strokeOpacity="0.38" strokeWidth="1.2" strokeDasharray="4 6" />
            <circle cx="340" cy="360" r="205" stroke="#a855f7" strokeOpacity="0.28" strokeWidth="1" />
            <ellipse cx="340" cy="360" rx="250" ry="110" stroke="#f43f5e" strokeOpacity="0.24" strokeWidth="1" transform="rotate(-22 340 360)" />
            <ellipse cx="340" cy="360" rx="125" ry="250" stroke="#a855f7" strokeOpacity="0.24" strokeWidth="1" transform="rotate(15 340 360)" />

            {/* Silueta estilizada de América Latina */}
            <path
              d="M220 210 L265 225 L290 265 L325 280 L355 310 L425 350 L445 410 L395 485 L355 565 L330 585 L320 510 L310 420 L285 355 L265 295 L230 250 Z"
              fill="#9333ea"
              fillOpacity="0.2"
              stroke="#f43f5e"
              strokeWidth="1.5"
            />

            {/* Red de nodos de constelación */}
            <g stroke="#c084fc" strokeOpacity="0.48" strokeWidth="1">
              <line x1="220" y1="210" x2="290" y2="265" />
              <line x1="265" y1="225" x2="345" y2="205" />
              <line x1="290" y1="265" x2="355" y2="310" />
              <line x1="355" y1="310" x2="425" y2="350" />
              <line x1="355" y1="310" x2="310" y2="420" />
              <line x1="425" y1="350" x2="395" y2="485" />
              <line x1="310" y1="420" x2="395" y2="485" />
              <line x1="395" y1="485" x2="355" y2="565" />
              <line x1="310" y1="420" x2="330" y2="585" />
              <line x1="220" y1="210" x2="155" y2="285" />
              <line x1="155" y1="285" x2="265" y2="295" />
              <line x1="425" y1="350" x2="505" y2="310" />
              <line x1="395" y1="485" x2="485" y2="455" />
            </g>

            {/* Puntos brillantes de cada capital/nodo */}
            {[
              [220, 210], [265, 225], [290, 265], [325, 280], [355, 310],
              [425, 350], [445, 410], [395, 485], [355, 565], [330, 585],
              [310, 420], [285, 355], [265, 295], [155, 285], [345, 205],
              [505, 310], [485, 455], [205, 385], [375, 255], [415, 285]
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="5.5" fill="#f43f5e" opacity="0.45" />
                <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
              </g>
            ))}
          </svg>
        </div>

        <div className="amber-latam-content">
          <h2 className="amber-section-big-title" style={{ marginBottom: '0.5rem' }}>
            Una Comunidad de Artesanos en LATAM
          </h2>

          <div className="amber-latam-grid">
            {/* Columna 1: México y Centroamérica */}
            <div className="amber-latam-col">
              <span className="amber-latam-country">México</span>
              <span className="amber-latam-country">Guatemala</span>
              <span className="amber-latam-country">El Salvador</span>
              <span className="amber-latam-country">Honduras</span>
              <span className="amber-latam-country">Nicaragua</span>
              <span className="amber-latam-country">Costa Rica</span>
              <span className="amber-latam-country">Panamá</span>
            </div>

            {/* Columna 2: Caribe y Región Andina */}
            <div className="amber-latam-col">
              <span className="amber-latam-country">Cuba</span>
              <span className="amber-latam-country">República Dominicana</span>
              <span className="amber-latam-country">Puerto Rico</span>
              <span className="amber-latam-country">Colombia</span>
              <span className="amber-latam-country">Venezuela</span>
              <span className="amber-latam-country">Ecuador</span>
              <span className="amber-latam-country">Perú</span>
            </div>

            {/* Columna 3: Sudamérica y Cono Sur */}
            <div className="amber-latam-col">
              <span className="amber-latam-country">Bolivia</span>
              <span className="amber-latam-country">Brasil</span>
              <span className="amber-latam-country">Paraguay</span>
              <span className="amber-latam-country">Chile</span>
              <span className="amber-latam-country">Argentina</span>
              <span className="amber-latam-country">Uruguay</span>
            </div>
          </div>
        </div>
      </section>
    </DashboardComponent>
  );
}
