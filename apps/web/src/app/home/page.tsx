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
import CodePulseReelComponent from './CodePulseReelComponent';
import { HeroQuantumCrystal, RotatingLatamPlanet } from './HeroCrystalAndGlobe';

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
          1. HERO SECTION CON CRISTAL 3D ANIMADO (FRAMER MOTION)
         ========================================================= */}
      <section className="amber-crystal-hero">
        <HeroQuantumCrystal />

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
          2. SHOWREEL ANIMADO CON FRAMER MOTION (CRECE AL ACERCARSE Y SE REDUCE AL ALEJARSE)
         ========================================================= */}
      <section ref={reelSectionRef} className="amber-reel-section">
        <CodePulseReelComponent videoScale={videoScale} />
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
          6. COMUNIDAD LATAM CON PLANETA 3D GIRATORIO (Todos los países)
         ========================================================= */}
      <section className="amber-latam-section">
        <RotatingLatamPlanet />

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
