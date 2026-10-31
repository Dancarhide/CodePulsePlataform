'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Award,
  Loader2,
} from 'lucide-react';
import DashboardComponent from '../../DashboardComponent';
import CmsBlockRenderer from '../../cms/CmsBlockRenderer';
import { CmsCourse, CmsLesson } from '../../cms/CmsBlockTypes';

interface FlatLessonRef {
  modIdx: number;
  lecIdx: number;
  modTitle: string;
  lesson: CmsLesson;
}

export default function CourseStudentViewerPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';

  const [course, setCourse] = useState<CmsCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentFlatIdx, setCurrentFlatIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/cms/courses?slug=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active && data.course) {
          setCourse(data.course);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    const savedProgress = localStorage.getItem(`cp_progress_${slug}`);
    if (savedProgress) {
      try {
        setCompletedIds(JSON.parse(savedProgress));
      } catch {
        // ignore
      }
    }

    return () => {
      active = false;
    };
  }, [slug]);

  const flatLessons: FlatLessonRef[] = useMemo(() => {
    if (!course?.modulos) return [];
    const list: FlatLessonRef[] = [];
    course.modulos.forEach((mod, mIdx) => {
      (mod.lecciones || []).forEach((lec, lIdx) => {
        list.push({
          modIdx: mIdx,
          lecIdx: lIdx,
          modTitle: mod.titulo,
          lesson: lec,
        });
      });
    });
    return list;
  }, [course]);

  const activeItem = flatLessons[currentFlatIdx] || null;

  const toggleCompleted = (lessonId: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      if (slug) {
        localStorage.setItem(`cp_progress_${slug}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const progressPercent =
    flatLessons.length > 0
      ? Math.round(
          (flatLessons.filter((item) => completedIds.includes(item.lesson.id)).length /
            flatLessons.length) *
            100
        )
      : 0;

  return (
    <DashboardComponent>
      {loading ? (
        <div style={{ padding: '6rem 1.5rem', textAlign: 'center', color: '#c084fc' }}>
          <Loader2 size={32} style={{ marginBottom: '0.6rem' }} />
          <div>Cargando aula virtual...</div>
        </div>
      ) : notFound || !course ? (
        <div className="amber-inner-container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', marginBottom: '0.75rem' }}>
            Curso no encontrado
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            El curso solicitado no existe o ya no se encuentra disponible.
          </p>
          <Link
            href="/cursos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.35rem',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #9333ea, #e11d48)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> Volver al Catálogo
          </Link>
        </div>
      ) : (
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            padding: '2rem 1.5rem 4rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(270px, 330px) 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* SIDEBAR DE TEMARIO Y PROGRESO */}
          <aside
            style={{
              background: '#0b0617',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '18px',
              padding: '1.4rem',
              position: 'sticky',
              top: '88px',
            }}
          >
            <Link
              href="/cursos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#c084fc',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '0.9rem',
              }}
            >
              <ArrowLeft size={14} /> Todos los Cursos
            </Link>

            <h2
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 0.75rem 0',
                lineHeight: 1.2,
              }}
            >
              {course.titulo}
            </h2>

            {/* Barra de Progreso */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  color: '#cbd5e1',
                  marginBottom: '0.35rem',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={13} color="#f43f5e" /> Tu Progreso
                </span>
                <strong>{progressPercent}%</strong>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #9333ea, #f43f5e)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Módulos y Lecciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {course.modulos.map((mod, mIdx) => (
                <div key={mod.id}>
                  <div
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#f43f5e',
                      marginBottom: '0.45rem',
                    }}
                  >
                    {mod.titulo}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {mod.lecciones.map((lec, lIdx) => {
                      const fIdx = flatLessons.findIndex(
                        (f) => f.modIdx === mIdx && f.lecIdx === lIdx
                      );
                      const isCurrent = fIdx === currentFlatIdx;
                      const isDone = completedIds.includes(lec.id);

                      return (
                        <button
                          key={lec.id}
                          type="button"
                          onClick={() => {
                            setCurrentFlatIdx(fIdx);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            textAlign: 'left',
                            padding: '0.55rem 0.7rem',
                            borderRadius: '10px',
                            border: isCurrent
                              ? '1px solid #f43f5e'
                              : '1px solid rgba(255,255,255,0.06)',
                            background: isCurrent
                              ? 'linear-gradient(90deg, rgba(147,51,234,0.25), rgba(225,29,72,0.2))'
                              : 'rgba(255,255,255,0.02)',
                            color: isCurrent ? '#ffffff' : '#cbd5e1',
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              fontSize: '0.82rem',
                              fontWeight: isCurrent ? 700 : 500,
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={15} color="#64748b" style={{ flexShrink: 0 }} />
                            )}
                            <span>{lec.titulo}</span>
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>
                            {lec.duracion_estimada_minutos}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* HOJA PRINCIPAL DE LECCIÓN */}
          <section
            style={{
              background: '#0b0617',
              border: '1px solid rgba(168, 85, 247, 0.22)',
              borderRadius: '22px',
              padding: '2.5rem 2.75rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
              minWidth: 0,
            }}
          >
            {activeItem ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    paddingBottom: '1.15rem',
                    marginBottom: '1.75rem',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.18)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        color: '#c084fc',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {activeItem.modTitle}
                    </span>
                    <h1
                      style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        margin: '0.2rem 0 0 0',
                      }}
                    >
                      {activeItem.lesson.titulo}
                    </h1>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      fontSize: '0.8rem',
                      color: '#94a3b8',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <BookOpen size={14} color="#c084fc" />
                      {activeItem.lesson.tipo.toUpperCase()}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} color="#f43f5e" />
                      {activeItem.lesson.duracion_estimada_minutos} min
                    </span>
                  </div>
                </div>

                {/* Contenido Rico de Bloques */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  {(activeItem.lesson.contenido_bloques || []).map((block) => (
                    <CmsBlockRenderer key={block.id} block={block} />
                  ))}
                </div>

                {/* Navegación Inferior y Completado */}
                <div
                  style={{
                    marginTop: '3rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <button
                    type="button"
                    disabled={currentFlatIdx === 0}
                    onClick={() => {
                      setCurrentFlatIdx((i) => Math.max(0, i - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 1.15rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(255,255,255,0.04)',
                      color: currentFlatIdx === 0 ? '#475569' : '#e2e8f0',
                      fontWeight: 700,
                      cursor: currentFlatIdx === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ArrowLeft size={15} /> Anterior
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCompleted(activeItem.lesson.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.7rem 1.35rem',
                      borderRadius: '10px',
                      border: completedIds.includes(activeItem.lesson.id)
                        ? '1px solid #10b981'
                        : '1px solid rgba(168, 85, 247, 0.5)',
                      background: completedIds.includes(activeItem.lesson.id)
                        ? 'rgba(16, 185, 129, 0.16)'
                        : 'rgba(147, 51, 234, 0.18)',
                      color: completedIds.includes(activeItem.lesson.id) ? '#6ee7b7' : '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {completedIds.includes(activeItem.lesson.id)
                      ? 'Lección Completada'
                      : 'Marcar como Completada'}
                  </button>

                  <button
                    type="button"
                    disabled={currentFlatIdx >= flatLessons.length - 1}
                    onClick={() => {
                      if (!completedIds.includes(activeItem.lesson.id)) {
                        toggleCompleted(activeItem.lesson.id);
                      }
                      setCurrentFlatIdx((i) => Math.min(flatLessons.length - 1, i + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      border: 'none',
                      background:
                        currentFlatIdx >= flatLessons.length - 1
                          ? 'rgba(255,255,255,0.06)'
                          : 'linear-gradient(90deg, #9333ea, #e11d48)',
                      color: currentFlatIdx >= flatLessons.length - 1 ? '#64748b' : '#ffffff',
                      fontWeight: 700,
                      cursor:
                        currentFlatIdx >= flatLessons.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Siguiente Lección <ArrowRight size={15} />
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: '#94a3b8' }}>Este curso aún no contiene lecciones.</p>
            )}
          </section>
        </div>
      )}
    </DashboardComponent>
  );
}

