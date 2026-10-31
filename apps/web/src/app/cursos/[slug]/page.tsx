'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Lock,
} from 'lucide-react';
import DashboardComponent from '../../DashboardComponent';
import CmsBlockRenderer from '../../cms/CmsBlockRenderer';
import { StudentExamRunner, StudentLabWorkspace } from '../../cms/CmsExamAndLabBuilders';
import { CmsCourse, CmsLesson } from '../../cms/CmsBlockTypes';
import '../../cms/cms.css';

interface FlatLessonRef {
  modIdx: number;
  lecIdx: number;
  modTitle: string;
  unitKey: string;
  unitFormat: 'leccion' | 'examen' | 'laboratorio';
  pesoPuntos: number;
  lesson: CmsLesson;
}

export default function CourseStudentViewerPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : '';

  const [course, setCourse] = useState<CmsCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentFlatIdx, setCurrentFlatIdx] = useState(0);
  const [recordsByKey, setRecordsByKey] = useState<Record<string, any>>({});
  const [solvedBlocksMap, setSolvedBlocksMap] = useState<Record<string, boolean>>({});
  const [userSession, setUserSession] = useState<{ correo: string; nombre: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('codepulse_active_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUserSession({
          correo: parsed.correo || `${parsed.username || 'alumno'}@codepulse.local`,
          nombre: parsed.nombres || parsed.username || 'Estudiante',
        });
      } catch {
        // ignore
      }
    }
  }, []);

  const loadEvalRecords = useCallback(async (courseSlug: string, correo: string) => {
    try {
      const res = await fetch(
        `/api/v1/cms/evaluations?cursoSlug=${encodeURIComponent(
          courseSlug
        )}&correo=${encodeURIComponent(correo)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.records)) {
        const map: Record<string, any> = {};
        data.records.forEach((rec: any) => {
          map[rec.unidad_clave] = rec;
        });
        setRecordsByKey(map);
      }
    } catch {
      // fallback silencioso
    }
  }, []);

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

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (slug && userSession?.correo) {
      loadEvalRecords(slug, userSession.correo);
    }
  }, [slug, userSession, loadEvalRecords]);

  const flatLessons: FlatLessonRef[] = useMemo(() => {
    if (!course?.modulos) return [];
    const list: FlatLessonRef[] = [];
    course.modulos.forEach((mod, mIdx) => {
      (mod.lecciones || []).forEach((lec, lIdx) => {
        const fmt =
          lec.formato_unidad || (lec.tipo === 'examen' ? 'examen' : 'leccion');
        const peso =
          Number(lec.peso_puntos) ||
          (fmt === 'examen' ? 50 : fmt === 'laboratorio' ? 30 : 10);
        const unitKey = String(lec.clave_estable || lec.id || `u_${mIdx}_${lIdx}`);
        list.push({
          modIdx: mIdx,
          lecIdx: lIdx,
          modTitle: mod.titulo,
          unitKey,
          unitFormat: fmt,
          pesoPuntos: peso,
          lesson: lec,
        });
      });
    });
    return list;
  }, [course]);

  const activeItem = flatLessons[currentFlatIdx] || null;

  const isUnitAccredited = useCallback(
    (unitKey: string) => {
      const rec = recordsByKey[unitKey];
      return rec?.estado === 'completado' || rec?.estado === 'aprobado';
    },
    [recordsByKey]
  );

  const { totalPoints, earnedPoints, progressPercent } = useMemo(() => {
    const total = flatLessons.reduce((acc, u) => acc + u.pesoPuntos, 0);
    const earned = flatLessons.reduce(
      (acc, u) => acc + (isUnitAccredited(u.unitKey) ? u.pesoPuntos : 0),
      0
    );
    const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { totalPoints: total, earnedPoints: earned, progressPercent: pct };
  }, [flatLessons, isUnitAccredited]);

  // Actividades evaluables dentro de una lección normal
  const activeLessonBlocks = activeItem?.lesson.contenido_bloques || [];
  const requiredActivityBlocks = activeLessonBlocks.filter(
    (b) => b.type === 'quiz' || b.type === 'code_challenge' || b.type === 'fill_blank'
  );
  const solvedCountInActive = requiredActivityBlocks.filter((b) => solvedBlocksMap[b.id]).length;
  const allActivitiesSolved =
    requiredActivityBlocks.length === 0 ||
    solvedCountInActive >= requiredActivityBlocks.length;

  const saveEvaluationRecord = async (
    item: FlatLessonRef,
    estado: 'completado' | 'aprobado' | 'reprobado' | 'pendiente_revision' | 'no_completado',
    calificacion = 100,
    payload_entrega: any = {}
  ) => {
    const correo = userSession?.correo || 'invitado@codepulse.local';
    const nombre = userSession?.nombre || 'Estudiante';

    // Actualización optimista inmediata
    setRecordsByKey((prev) => {
      const next = { ...prev };
      if (estado === 'no_completado') {
        delete next[item.unitKey];
      } else {
        next[item.unitKey] = {
          ...(next[item.unitKey] || {}),
          unidad_clave: item.unitKey,
          estado,
          calificacion,
          puntos_peso: item.pesoPuntos,
          puntos_obtenidos:
            estado === 'completado' || estado === 'aprobado' ? item.pesoPuntos : 0,
          intentos: Number(next[item.unitKey]?.intentos || 0) + 1,
          payload_entrega,
        };
      }
      return next;
    });

    try {
      const res = await fetch('/api/v1/cms/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curso_slug: slug,
          curso_titulo: course?.titulo || slug,
          unidad_clave: item.unitKey,
          unidad_titulo: item.lesson.titulo,
          tipo_unidad: item.unitFormat,
          usuario_correo: correo,
          usuario_nombre: nombre,
          estado,
          calificacion,
          puntos_peso: item.pesoPuntos,
          payload_entrega,
        }),
      });
      const data = await res.json();
      if (data.record) {
        setRecordsByKey((prev) => ({
          ...prev,
          [item.unitKey]: data.record,
        }));
      }
    } catch {
      // mantiene estado optimista
    }
  };

  const toggleLessonComplete = async (item: FlatLessonRef) => {
    if (isUnitAccredited(item.unitKey)) {
      await saveEvaluationRecord(item, 'no_completado');
    } else {
      await saveEvaluationRecord(item, 'completado', 100);
    }
  };

  return (
    <DashboardComponent>
      {loading ? (
        <div style={{ padding: '6rem 1.5rem', textAlign: 'center', color: '#c084fc' }}>
          <Loader2 size={32} style={{ marginBottom: '0.6rem' }} />
          <div>Cargando aula virtual...</div>
        </div>
      ) : notFound || !course ? (
        <div
          className="amber-inner-container"
          style={{ textAlign: 'center', padding: '5rem 1.5rem' }}
        >
          <h2
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '2rem',
              marginBottom: '0.75rem',
            }}
          >
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
            maxWidth: 1380,
            margin: '0 auto',
            padding: '2rem 1.5rem 4rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 345px) 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* SIDEBAR DE TEMARIO Y PROGRESO PONDERADO */}
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
                margin: '0 0 0.85rem 0',
                lineHeight: 1.2,
              }}
            >
              {course.titulo}
            </h2>

            {/* Barra de Progreso Ponderado por Puntos */}
            <div
              style={{
                marginBottom: '1.4rem',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.22)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  marginBottom: '0.4rem',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                  <Award size={14} color="#f43f5e" /> Progreso Ponderado
                </span>
                <strong style={{ color: '#ffffff' }}>{progressPercent}%</strong>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  marginBottom: '0.4rem',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #9333ea, #f43f5e)',
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>
                <strong>{earnedPoints}</strong> / {totalPoints} pts obtenidos
              </div>
            </div>

            {/* Módulos y Unidades (Lecciones, Exámenes, Laboratorios) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '58vh',
                overflowY: 'auto',
              }}
            >
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
                      const flatRef = flatLessons[fIdx];
                      if (!flatRef) return null;

                      const isCurrent = fIdx === currentFlatIdx;
                      const rec = recordsByKey[flatRef.unitKey];
                      const isDone = isUnitAccredited(flatRef.unitKey);
                      const isPending = rec?.estado === 'pendiente_revision';

                      const badge =
                        flatRef.unitFormat === 'examen'
                          ? { label: 'EXAMEN', color: '#fda4af', bg: 'rgba(244,63,94,0.2)' }
                          : flatRef.unitFormat === 'laboratorio'
                          ? { label: 'LAB', color: '#67e8f9', bg: 'rgba(34,211,238,0.18)' }
                          : null;

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
                            padding: '0.58rem 0.7rem',
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
                              fontSize: '0.8rem',
                              fontWeight: isCurrent ? 700 : 500,
                              minWidth: 0,
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                            ) : isPending ? (
                              <Clock size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={15} color="#64748b" style={{ flexShrink: 0 }} />
                            )}
                            {badge && (
                              <span
                                style={{
                                  padding: '0.08rem 0.35rem',
                                  borderRadius: '4px',
                                  background: badge.bg,
                                  color: badge.color,
                                  fontFamily: 'monospace',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {badge.label}
                              </span>
                            )}
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {lec.titulo}
                            </span>
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: isDone ? '#6ee7b7' : '#94a3b8',
                              flexShrink: 0,
                            }}
                          >
                            +{flatRef.pesoPuntos}p
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* HOJA PRINCIPAL DE UNIDAD (LECCIÓN / EXAMEN / LABORATORIO) */}
          <section
            className={`cms-page-sheet ${
              activeItem?.lesson.configuracion_pagina?.maxWidth === 'wide'
                ? 'wide'
                : activeItem?.lesson.configuracion_pagina?.maxWidth === 'full'
                ? 'full'
                : ''
            } ${
              activeItem?.lesson.configuracion_pagina?.pattern === 'grid'
                ? 'pattern-grid'
                : activeItem?.lesson.configuracion_pagina?.pattern === 'dots'
                ? 'pattern-dots'
                : ''
            }`}
            style={{
              margin: 0,
              maxWidth: '100%',
              backgroundColor:
                activeItem?.lesson.configuracion_pagina?.sheetBg || '#0b0617',
              borderColor:
                activeItem?.lesson.configuracion_pagina?.accentBorder ||
                'rgba(168, 85, 247, 0.22)',
              minWidth: 0,
            }}
          >
            {activeItem ? (
              <>
                {activeItem.unitFormat === 'examen' ? (
                  <StudentExamRunner
                    unitTitle={activeItem.lesson.titulo}
                    pesoPuntos={activeItem.pesoPuntos}
                    config={activeItem.lesson.configuracion_actividad?.exam}
                    existingRecord={recordsByKey[activeItem.unitKey]}
                    onSubmitExam={async ({ calificacion, aprobado, answers }) => {
                      await saveEvaluationRecord(
                        activeItem,
                        aprobado ? 'aprobado' : 'reprobado',
                        calificacion,
                        { answers }
                      );
                    }}
                  />
                ) : activeItem.unitFormat === 'laboratorio' ? (
                  <StudentLabWorkspace
                    unitTitle={activeItem.lesson.titulo}
                    pesoPuntos={activeItem.pesoPuntos}
                    config={activeItem.lesson.configuracion_actividad?.lab}
                    existingRecord={recordsByKey[activeItem.unitKey]}
                    onSubmitLab={async ({ estado, calificacion, code, repoUrl, report }) => {
                      await saveEvaluationRecord(activeItem, estado, calificacion, {
                        code,
                        repoUrl,
                        report,
                      });
                    }}
                  />
                ) : (
                  <>
                    {/* Cabecera de Lección */}
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
                        <span
                          style={{
                            padding: '0.22rem 0.65rem',
                            borderRadius: '999px',
                            background: 'rgba(168,85,247,0.16)',
                            border: '1px solid rgba(168,85,247,0.35)',
                            color: '#e9d5ff',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                          }}
                        >
                          Valor: +{activeItem.pesoPuntos} pts
                        </span>
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

                    {/* Indicador si la lección tiene retos o quizzes interactivos */}
                    {requiredActivityBlocks.length > 0 && !isUnitAccredited(activeItem.unitKey) && (
                      <div
                        style={{
                          marginBottom: '1.4rem',
                          padding: '0.75rem 1.1rem',
                          borderRadius: '10px',
                          background: allActivitiesSolved
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(147, 51, 234, 0.12)',
                          border: `1px solid ${
                            allActivitiesSolved
                              ? 'rgba(16, 185, 129, 0.4)'
                              : 'rgba(168, 85, 247, 0.35)'
                          }`,
                          fontSize: '0.83rem',
                          color: allActivitiesSolved ? '#6ee7b7' : '#e9d5ff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <span>
                          Actividades prácticas de esta lección:{' '}
                          <strong>
                            {solvedCountInActive} / {requiredActivityBlocks.length} resueltas
                          </strong>
                        </span>
                        {!allActivitiesSolved && (
                          <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                            Resuélvelas para desbloquear los +{activeItem.pesoPuntos} pts
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bloques */}
                    <div className="cms-blocks-flow" style={{ gap: '1.25rem' }}>
                      {activeLessonBlocks.map((block) => (
                        <div
                          key={block.id}
                          className={`cms-flow-w-${block.style?.boxWidth || 100}`}
                        >
                          <CmsBlockRenderer
                            block={block}
                            onActivitySolved={(blkId) => {
                              setSolvedBlocksMap((prev) => ({ ...prev, [blkId]: true }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Navegación Inferior */}
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

                  {activeItem.unitFormat === 'leccion' && (
                    <button
                      type="button"
                      disabled={!allActivitiesSolved && !isUnitAccredited(activeItem.unitKey)}
                      onClick={() => toggleLessonComplete(activeItem)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.7rem 1.35rem',
                        borderRadius: '10px',
                        border: isUnitAccredited(activeItem.unitKey)
                          ? '1px solid #10b981'
                          : '1px solid rgba(168, 85, 247, 0.5)',
                        background: isUnitAccredited(activeItem.unitKey)
                          ? 'rgba(16, 185, 129, 0.16)'
                          : !allActivitiesSolved
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(147, 51, 234, 0.22)',
                        color: isUnitAccredited(activeItem.unitKey)
                          ? '#6ee7b7'
                          : !allActivitiesSolved
                          ? '#64748b'
                          : '#ffffff',
                        fontWeight: 700,
                        cursor:
                          !allActivitiesSolved && !isUnitAccredited(activeItem.unitKey)
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      {!allActivitiesSolved && !isUnitAccredited(activeItem.unitKey) ? (
                        <>
                          <Lock size={15} /> Completa las actividades primero
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          {isUnitAccredited(activeItem.unitKey)
                            ? `Acreditada (+${activeItem.pesoPuntos} pts)`
                            : `Completar Lección (+${activeItem.pesoPuntos} pts)`}
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={currentFlatIdx >= flatLessons.length - 1}
                    onClick={() => {
                      if (
                        activeItem.unitFormat === 'leccion' &&
                        allActivitiesSolved &&
                        !isUnitAccredited(activeItem.unitKey)
                      ) {
                        saveEvaluationRecord(activeItem, 'completado', 100);
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
                    Siguiente <ArrowRight size={15} />
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: '#94a3b8' }}>Este curso aún no contiene unidades.</p>
            )}
          </section>
        </div>
      )}
    </DashboardComponent>
  );
}
