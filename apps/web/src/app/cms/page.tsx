'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Plus,
  Edit3,
  Trash2,
  Globe,
  Lock,
  BookOpen,
  Layers,
  ExternalLink,
  Loader2,
  Sparkles,
  FlaskConical,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import DashboardComponent from '../DashboardComponent';
import CmsStudioEditor from './CmsStudioEditor';
import { CmsCourse } from './CmsBlockTypes';

interface AdminEvaluationRecord {
  id: string;
  curso_slug: string;
  curso_titulo?: string;
  unidad_clave: string;
  unidad_titulo: string;
  tipo_unidad: 'leccion' | 'examen' | 'laboratorio';
  usuario_correo: string;
  usuario_nombre?: string;
  estado: 'completado' | 'aprobado' | 'reprobado' | 'rechazado' | 'pendiente_revision';
  calificacion: number;
  puntos_peso: number;
  puntos_obtenidos: number;
  intentos: number;
  payload_entrega?: {
    code?: string;
    repoUrl?: string;
    report?: string;
    respuestas?: Record<string, any>;
  };
  retroalimentacion?: string;
  actualizado_en?: string;
}

export default function CmsPage() {
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<CmsCourse | null>(null);

  const [activeTab, setActiveTab] = useState<'cursos' | 'revisiones'>('cursos');
  const [submissions, setSubmissions] = useState<AdminEvaluationRecord[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente_revision' | 'aprobado' | 'observados'>('todos');
  const [gradingDrafts, setGradingDrafts] = useState<
    Record<string, { calificacion: number; retroalimentacion: string; saving?: boolean }>
  >({});

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/cms/courses', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error cargando cursos CMS:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const res = await fetch('/api/v1/cms/evaluations?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
        setGradingDrafts((prev) => {
          const next = { ...prev };
          data.submissions.forEach((s: AdminEvaluationRecord) => {
            if (!next[s.id]) {
              next[s.id] = {
                calificacion: s.estado === 'pendiente_revision' ? 100 : Math.round(Number(s.calificacion ?? 100)),
                retroalimentacion: s.retroalimentacion || '',
              };
            }
          });
          return next;
        });
      }
    } catch (err) {
      console.error('Error cargando entregas de evaluación:', err);
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
    loadSubmissions();
  }, [loadCourses, loadSubmissions]);

  const handleGradeSubmission = async (
    submissionId: string,
    nuevoEstado: 'aprobado' | 'rechazado'
  ) => {
    const draft = gradingDrafts[submissionId] || { calificacion: 100, retroalimentacion: '' };
    setGradingDrafts((prev) => ({
      ...prev,
      [submissionId]: { ...draft, saving: true },
    }));

    try {
      const res = await fetch('/api/v1/cms/evaluations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submissionId,
          estado: nuevoEstado,
          calificacion: nuevoEstado === 'aprobado' ? draft.calificacion : Math.min(draft.calificacion, 59),
          retroalimentacion: draft.retroalimentacion,
        }),
      });
      const data = await res.json();
      if (data.record) {
        setSubmissions((prev) =>
          prev.map((item) => (item.id === submissionId ? data.record : item))
        );
      }
    } catch (err) {
      console.error('Error guardando calificación:', err);
    } finally {
      setGradingDrafts((prev) => ({
        ...prev,
        [submissionId]: { ...draft, saving: false },
      }));
    }
  };

  const handleCreateNew = () => {
    setEditingCourse({
      titulo: 'Nuevo Curso Profesional',
      slug: `curso-${Math.floor(1000 + Math.random() * 9000)}`,
      descripcion:
        'Aprende arquitectura, desarrollo práctico y despliegue en producción con estándares reales de la industria.',
      categoria: 'Desarrollo de Software',
      nivel: 'intermedio',
      imagen_portada_url: '',
      publicado: true,
      modulos: [],
    });
  };

  const handleOpenCourse = async (courseId?: string) => {
    if (!courseId) return;
    setOpeningId(courseId);
    try {
      const res = await fetch(`/api/v1/cms/courses?id=${courseId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.course) {
        setEditingCourse(data.course);
      }
    } catch (err) {
      console.error('No se pudo abrir el curso:', err);
    } finally {
      setOpeningId(null);
    }
  };

  const handleDeleteCourse = async (courseId?: string, title?: string) => {
    if (!courseId) return;
    const ok = window.confirm(`¿Seguro que deseas eliminar el curso "${title}"?`);
    if (!ok) return;
    try {
      await fetch(`/api/v1/cms/courses?id=${courseId}`, { method: 'DELETE' });
      await loadCourses();
    } catch (err) {
      console.error('Error eliminando curso:', err);
    }
  };

  if (editingCourse) {
    return (
      <DashboardComponent hideFooter>
        <CmsStudioEditor
          initialCourse={editingCourse}
          onBack={() => {
            setEditingCourse(null);
            loadCourses();
          }}
          onSaved={() => {
            loadCourses();
          }}
        />
      </DashboardComponent>
    );
  }

  const publishedCount = courses.filter((c) => c.publicado).length;
  const totalLessons = courses.reduce((acc, c) => acc + Number(c.total_lecciones || 0), 0);
  const pendingReviewCount = submissions.filter((s) => s.estado === 'pendiente_revision').length;

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === 'todos') return true;
    if (statusFilter === 'pendiente_revision') return s.estado === 'pendiente_revision';
    if (statusFilter === 'aprobado') return s.estado === 'aprobado';
    return s.estado === 'rechazado' || s.estado === 'reprobado';
  });

  return (
    <DashboardComponent>
      <div className="amber-inner-container">
        <div
          className="amber-section-header"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <span
              className="amber-kicker"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldAlert size={14} /> // STUDIO CMS VISUAL • ADMINISTRADOR
            </span>
            <h1 className="amber-section-title" style={{ marginBottom: '0.35rem' }}>
              CREADOR DE CURSOS &amp; EVALUACIONES
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: 680 }}>
              Diseña lecciones interactivas estilo Canva, exámenes cronometrados y laboratorios prácticos
              con peso real en el progreso del estudiante y acreditación conectada a PostgreSQL.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(90deg, #9333ea 0%, #e11d48 100%)',
              color: '#ffffff',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.02rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 10px 28px rgba(225, 29, 72, 0.3)',
            }}
          >
            <Plus size={18} /> Crear Nuevo Curso
          </button>
        </div>

        {/* Selector de Pestañas del Panel CMS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.8rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '0.9rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('cursos')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: `1px solid ${
                activeTab === 'cursos' ? '#a855f7' : 'rgba(255,255,255,0.1)'
              }`,
              background:
                activeTab === 'cursos' ? 'rgba(147, 51, 234, 0.24)' : 'rgba(14, 8, 26, 0.6)',
              color: activeTab === 'cursos' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <Layers size={16} color={activeTab === 'cursos' ? '#c084fc' : '#94a3b8'} />
            Cursos &amp; Studio Visual ({courses.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('revisiones');
              loadSubmissions();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: `1px solid ${
                activeTab === 'revisiones' ? '#22d3ee' : 'rgba(255,255,255,0.1)'
              }`,
              background:
                activeTab === 'revisiones' ? 'rgba(8, 145, 178, 0.22)' : 'rgba(14, 8, 26, 0.6)',
              color: activeTab === 'revisiones' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <FlaskConical size={16} color={activeTab === 'revisiones' ? '#22d3ee' : '#94a3b8'} />
            Revisión de Laboratorios &amp; Exámenes
            {pendingReviewCount > 0 && (
              <span
                style={{
                  padding: '0.12rem 0.55rem',
                  borderRadius: '999px',
                  background: '#f59e0b',
                  color: '#090512',
                  fontSize: '0.73rem',
                  fontWeight: 800,
                }}
              >
                {pendingReviewCount} pendientes
              </span>
            )}
          </button>
        </div>

        {/* Métricas Rápidas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
            gap: '1rem',
            marginBottom: '2.25rem',
          }}
        >
          <div
            style={{
              background: 'rgba(14, 8, 26, 0.78)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '14px',
              padding: '1.2rem 1.4rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.1em' }}>
              TOTAL DE CURSOS
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {courses.length}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(14, 8, 26, 0.78)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '14px',
              padding: '1.2rem 1.4rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', letterSpacing: '0.1em' }}>
              PUBLICADOS EN CATÁLOGO
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {publishedCount}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(14, 8, 26, 0.78)',
              border: '1px solid rgba(244, 63, 94, 0.28)',
              borderRadius: '14px',
              padding: '1.2rem 1.4rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#fda4af', letterSpacing: '0.1em' }}>
              UNIDADES EN TEMARIOS
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {totalLessons}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(14, 8, 26, 0.78)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: '14px',
              padding: '1.2rem 1.4rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#67e8f9', letterSpacing: '0.1em' }}>
              LABS POR REVISAR
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {pendingReviewCount}
            </div>
          </div>
        </div>

        {activeTab === 'revisiones' ? (
          <div>
            {/* Barra de filtros y recarga */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.35rem',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(
                  [
                    { id: 'todos', label: `Todas (${submissions.length})` },
                    { id: 'pendiente_revision', label: `Pendientes (${pendingReviewCount})` },
                    {
                      id: 'aprobado',
                      label: `Aprobadas (${submissions.filter((s) => s.estado === 'aprobado').length})`,
                    },
                    {
                      id: 'observados',
                      label: `No Acreditadas (${
                        submissions.filter((s) => s.estado === 'rechazado' || s.estado === 'reprobado')
                          .length
                      })`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '999px',
                      border: `1px solid ${
                        statusFilter === tab.id ? '#a855f7' : 'rgba(255,255,255,0.12)'
                      }`,
                      background:
                        statusFilter === tab.id
                          ? 'rgba(147, 51, 234, 0.25)'
                          : 'rgba(14, 8, 26, 0.65)',
                      color: statusFilter === tab.id ? '#ffffff' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={loadSubmissions}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} /> Actualizar Entregas
              </button>
            </div>

            {loadingSubs ? (
              <div style={{ padding: '3.5rem 0', textAlign: 'center', color: '#67e8f9' }}>
                <Loader2 size={26} style={{ marginBottom: '0.5rem' }} />
                <div>Consultando entregas de laboratorios y exámenes...</div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div
                style={{
                  background: 'rgba(14, 8, 26, 0.8)',
                  border: '1px dashed rgba(34, 211, 238, 0.35)',
                  borderRadius: '18px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                }}
              >
                <ClipboardCheck size={32} color="#22d3ee" style={{ marginBottom: '0.7rem' }} />
                <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', margin: '0 0 0.4rem' }}>
                  No hay entregas registradas en este filtro
                </h3>
                <p style={{ color: '#94a3b8', maxWidth: 520, margin: '0 auto' }}>
                  Cuando los estudiantes resuelvan exámenes o envíen actividades de laboratorio desde el
                  visor del curso, aparecerán aquí para auditar o calificar manualmente.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {filteredSubmissions.map((sub) => {
                  const draft = gradingDrafts[sub.id] || {
                    calificacion: Math.round(Number(sub.calificacion ?? 100)),
                    retroalimentacion: sub.retroalimentacion || '',
                  };
                  const payload = sub.payload_entrega || {};
                  const isLab = sub.tipo_unidad === 'laboratorio';

                  return (
                    <div
                      key={sub.id}
                      style={{
                        background: 'rgba(14, 8, 26, 0.86)',
                        border: `1px solid ${
                          sub.estado === 'pendiente_revision'
                            ? 'rgba(245, 158, 11, 0.45)'
                            : sub.estado === 'aprobado'
                            ? 'rgba(16, 185, 129, 0.35)'
                            : 'rgba(244, 63, 94, 0.35)'
                        }`,
                        borderRadius: '16px',
                        padding: '1.4rem 1.6rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      {/* Cabecera de la entrega */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '0.18rem 0.6rem',
                                borderRadius: '999px',
                                background: isLab
                                  ? 'rgba(34, 211, 238, 0.16)'
                                  : 'rgba(244, 63, 94, 0.18)',
                                color: isLab ? '#67e8f9' : '#fda4af',
                                border: `1px solid ${isLab ? 'rgba(34,211,238,0.4)' : 'rgba(244,63,94,0.4)'}`,
                                letterSpacing: '0.08em',
                              }}
                            >
                              {isLab ? 'LABORATORIO' : 'EXAMEN'} • {sub.puntos_peso} PTS
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700 }}>
                              {sub.curso_titulo || sub.curso_slug}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              • Intento #{sub.intentos || 1}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.35rem', margin: 0 }}>
                            {sub.unidad_titulo}
                          </h3>
                          <div style={{ fontSize: '0.83rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                            Estudiante:{' '}
                            <strong style={{ color: '#ffffff' }}>
                              {sub.usuario_nombre || sub.usuario_correo}
                            </strong>{' '}
                            <span style={{ color: '#94a3b8' }}>({sub.usuario_correo})</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {sub.estado === 'pendiente_revision' ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '999px',
                                background: 'rgba(245, 158, 11, 0.18)',
                                border: '1px solid #f59e0b',
                                color: '#fcd34d',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                              }}
                            >
                              <Clock size={13} /> PENDIENTE DE REVISIÓN
                            </span>
                          ) : sub.estado === 'aprobado' ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '999px',
                                background: 'rgba(16, 185, 129, 0.18)',
                                border: '1px solid #10b981',
                                color: '#6ee7b7',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                              }}
                            >
                              <CheckCircle2 size={13} /> ACREDITADO ({Math.round(Number(sub.calificacion || 100))}%)
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '999px',
                                background: 'rgba(239, 68, 68, 0.18)',
                                border: '1px solid #ef4444',
                                color: '#fca5a5',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                              }}
                            >
                              <XCircle size={13} /> NO ACREDITADO ({Math.round(Number(sub.calificacion || 0))}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contenido entregado por el estudiante */}
                      {(payload.repoUrl || payload.report || payload.code) && (
                        <div
                          style={{
                            background: 'rgba(5, 3, 12, 0.65)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '1rem 1.15rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                          }}
                        >
                          {payload.repoUrl && (
                            <div style={{ fontSize: '0.85rem' }}>
                              <strong style={{ color: '#67e8f9' }}>Repositorio / Demo: </strong>
                              <a
                                href={payload.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#c084fc', textDecoration: 'underline' }}
                              >
                                {payload.repoUrl}
                              </a>
                            </div>
                          )}

                          {payload.report && (
                            <div style={{ fontSize: '0.86rem', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                              <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
                                Notas Técnicas del Estudiante:
                              </strong>
                              {payload.report}
                            </div>
                          )}

                          {payload.code && (
                            <div>
                              <strong
                                style={{
                                  fontSize: '0.76rem',
                                  color: '#94a3b8',
                                  display: 'block',
                                  marginBottom: '0.35rem',
                                }}
                              >
                                CÓDIGO ENTREGADO:
                              </strong>
                              <pre
                                style={{
                                  margin: 0,
                                  padding: '0.85rem 1rem',
                                  borderRadius: '10px',
                                  background: '#050608',
                                  border: '1px solid rgba(34, 211, 238, 0.2)',
                                  color: '#e2e8f0',
                                  fontFamily: 'monospace',
                                  fontSize: '0.8rem',
                                  maxHeight: 240,
                                  overflow: 'auto',
                                }}
                              >
                                {payload.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Controles de Calificación y Retroalimentación del Instructor */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '120px 1fr auto',
                          gap: '0.75rem',
                          alignItems: 'end',
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                              marginBottom: '0.3rem',
                              fontWeight: 700,
                            }}
                          >
                            Calificación (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={draft.calificacion}
                            onChange={(e) =>
                              setGradingDrafts((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...draft,
                                  calificacion: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                                },
                              }))
                            }
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.7rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(168,85,247,0.35)',
                              background: '#090512',
                              color: '#ffffff',
                              fontWeight: 700,
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                              marginBottom: '0.3rem',
                              fontWeight: 700,
                            }}
                          >
                            Retroalimentación del Instructor
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Excelente implementación de índices y manejo de transacciones..."
                            value={draft.retroalimentacion}
                            onChange={(e) =>
                              setGradingDrafts((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...draft,
                                  retroalimentacion: e.target.value,
                                },
                              }))
                            }
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.8rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.14)',
                              background: '#090512',
                              color: '#ffffff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <button
                            type="button"
                            disabled={draft.saving}
                            onClick={() => handleGradeSubmission(sub.id, 'aprobado')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.58rem 0.95rem',
                              borderRadius: '8px',
                              border: '1px solid #10b981',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#6ee7b7',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            <CheckCircle2 size={15} />
                            Aprobar (+{sub.puntos_peso} pts)
                          </button>

                          <button
                            type="button"
                            disabled={draft.saving}
                            onClick={() => handleGradeSubmission(sub.id, 'rechazado')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.58rem 0.9rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(244, 63, 94, 0.5)',
                              background: 'rgba(225, 29, 72, 0.14)',
                              color: '#fda4af',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            <XCircle size={15} />
                            Solicitar Ajustes
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#c084fc' }}>
            <Loader2 size={28} style={{ marginBottom: '0.5rem' }} />
            <div>Cargando cursos desde Neon PostgreSQL...</div>
          </div>
        ) : courses.length === 0 ? (
          <div
            style={{
              background: 'rgba(14, 8, 26, 0.8)',
              border: '1px dashed rgba(168, 85, 247, 0.4)',
              borderRadius: '18px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <Sparkles size={34} color="#f43f5e" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', margin: '0 0 0.5rem 0' }}>
              Aún no has creado ningún curso en el Studio CMS
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: 520, margin: '0 auto 1.5rem' }}>
              Haz clic en &ldquo;Crear Nuevo Curso&rdquo; para abrir el lienzo visual y diseñar tu primera
              ruta de aprendizaje con lecciones, exámenes y laboratorios.
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                border: '1px solid #f43f5e',
                background: 'rgba(225, 29, 72, 0.16)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Abrir Lienzo Studio
            </button>
          </div>
        ) : (
          <section className="amber-grid">
            {courses.map((course) => (
              <div
                key={course.id}
                className="amber-card"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {course.imagen_portada_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.imagen_portada_url}
                      alt={course.titulo}
                      style={{
                        width: 'calc(100% + 4rem)',
                        margin: '-2rem -2rem 1.25rem -2rem',
                        height: 150,
                        objectFit: 'cover',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                  )}

                  <div className="amber-card-top">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.22rem 0.6rem',
                        borderRadius: '999px',
                        background: course.publicado
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(148, 163, 184, 0.15)',
                        color: course.publicado ? '#6ee7b7' : '#cbd5e1',
                        border: `1px solid ${
                          course.publicado ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.15)'
                        }`,
                      }}
                    >
                      {course.publicado ? <Globe size={12} /> : <Lock size={12} />}
                      {course.publicado ? 'PUBLICADO' : 'BORRADOR'}
                    </span>

                    <span className="amber-card-tag">{String(course.nivel || 'intermedio').toUpperCase()}</span>
                  </div>

                  <div style={{ fontSize: '0.73rem', color: '#c084fc', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {course.categoria || 'Desarrollo de Software'}
                  </div>

                  <h3 className="amber-card-title">{course.titulo}</h3>
                  <p className="amber-card-desc">
                    {course.descripcion || 'Sin descripción de catálogo.'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '1rem',
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Layers size={14} color="#c084fc" /> {course.total_modulos ?? 0} módulos
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} color="#f43f5e" /> {course.total_lecciones ?? 0} unidades
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    disabled={openingId === course.id}
                    onClick={() => handleOpenCourse(course.id)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(168, 85, 247, 0.5)',
                      background: 'rgba(147, 51, 234, 0.2)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                    {openingId === course.id ? 'Abriendo...' : 'Editar en Studio'}
                  </button>

                  {course.slug && (
                    <Link
                      href={`/cursos/${course.slug}`}
                      title="Ver vista del estudiante"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: '#cbd5e1',
                      }}
                    >
                      <ExternalLink size={15} />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course.id, course.titulo)}
                    title="Eliminar curso"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      background: 'rgba(225, 29, 72, 0.1)',
                      color: '#fb7185',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </DashboardComponent>
  );
}
