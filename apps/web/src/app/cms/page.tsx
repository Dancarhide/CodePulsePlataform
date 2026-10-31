'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Search,
  SlidersHorizontal,
  Power,
  Copy,
  Settings,
  Star,
  Award,
  Archive,
  LayoutGrid,
  List as ListIcon,
  X,
  FileQuestion,
  Link2,
  UserCheck,
  KeyRound,
  GitCommit,
} from 'lucide-react';
import DashboardComponent from '../DashboardComponent';
import CmsStudioEditor from './CmsStudioEditor';
import {
  CmsCourse,
  CourseGovernanceConfig,
  CourseStatus,
  CourseVisibility,
  resolveCourseGovernance,
} from './CmsBlockTypes';

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

const STATUS_META: Record<
  CourseStatus,
  { label: string; short: string; color: string; bg: string; border: string }
> = {
  publicado: {
    label: 'PUBLICADO • ACTIVO',
    short: 'Publicado',
    color: '#6ee7b7',
    bg: 'rgba(16, 185, 129, 0.18)',
    border: 'rgba(16, 185, 129, 0.48)',
  },
  borrador: {
    label: 'BORRADOR • OCULTO',
    short: 'Borrador',
    color: '#cbd5e1',
    bg: 'rgba(148, 163, 184, 0.16)',
    border: 'rgba(148, 163, 184, 0.35)',
  },
  pausado: {
    label: 'APAGADO • EN PAUSA',
    short: 'Apagado',
    color: '#fda4af',
    bg: 'rgba(225, 29, 72, 0.2)',
    border: 'rgba(244, 63, 94, 0.5)',
  },
  proximamente: {
    label: 'PRÓXIMAMENTE',
    short: 'Próximamente',
    color: '#67e8f9',
    bg: 'rgba(8, 145, 178, 0.22)',
    border: 'rgba(34, 211, 238, 0.48)',
  },
  archivado: {
    label: 'ARCHIVADO',
    short: 'Archivado',
    color: '#fcd34d',
    bg: 'rgba(245, 158, 11, 0.16)',
    border: 'rgba(245, 158, 11, 0.4)',
  },
};

function getCoverGradient(category: string, accent?: string): string {
  if (accent && accent !== '#9333ea') {
    return `radial-gradient(circle at 85% 20%, ${accent}55 0%, rgba(14, 8, 28, 0.96) 70%)`;
  }
  const cat = (category || '').toLowerCase();
  if (cat.includes('ciber') || cat.includes('seguridad')) {
    return 'linear-gradient(135deg, #061826 0%, #0e7490 50%, #1e1b4b 100%)';
  }
  if (cat.includes('cloud') || cat.includes('devops') || cat.includes('redes')) {
    return 'linear-gradient(135deg, #090d24 0%, #1d4ed8 55%, #0891b2 100%)';
  }
  if (cat.includes('ia') || cat.includes('inteligencia') || cat.includes('datos')) {
    return 'linear-gradient(135deg, #1a0926 0%, #7e22ce 50%, #be185d 100%)';
  }
  return 'linear-gradient(135deg, #19072c 0%, #6b21a8 52%, #be123c 100%)';
}

function formatDuration(minutes?: number, customHours?: number): string {
  if (customHours && customHours > 0) return `${customHours}h curriculares`;
  const mins = Number(minutes) || 0;
  if (mins <= 0) return 'A tu ritmo';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default function CmsPage() {
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<CmsCourse | null>(null);

  // Pestaña superior
  const [activeTab, setActiveTab] = useState<'cursos' | 'revisiones'>('cursos');

  // Buscador, filtros y vista de cursos en Admin
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStateFilter, setCourseStateFilter] = useState<
    'todos' | CourseStatus | 'destacados'
  >('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [levelFilter, setLevelFilter] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'titulo' | 'unidades' | 'puntos'>('recientes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal de Configuración Profesional del Curso
  const [configModalCourse, setConfigModalCourse] = useState<CmsCourse | null>(null);
  const [modalDraft, setModalDraft] = useState<{
    titulo: string;
    slug: string;
    categoria: string;
    nivel: CmsCourse['nivel'];
    descripcion: string;
    imagen_portada_url: string;
    gov: Required<CourseGovernanceConfig>;
  } | null>(null);
  const [modalTagInput, setModalTagInput] = useState('');
  const [savingModal, setSavingModal] = useState(false);

  // Estado de revisiones de Labs & Exámenes
  const [submissions, setSubmissions] = useState<AdminEvaluationRecord[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'todos' | 'pendiente_revision' | 'aprobado' | 'observados'
  >('todos');
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
                calificacion:
                  s.estado === 'pendiente_revision' ? 100 : Math.round(Number(s.calificacion ?? 100)),
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

  // --- Acciones Rápidas de Administración de Cursos (PATCH sin abrir Studio) ---
  const quickPatchCourse = async (courseId: string | undefined, payload: Record<string, any>) => {
    if (!courseId) return;
    setBusyCourseId(courseId);
    try {
      const res = await fetch('/api/v1/cms/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: courseId, ...payload }),
      });
      if (res.ok) {
        await loadCourses();
      }
    } catch (err) {
      console.error('Error en actualización rápida de curso:', err);
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleTogglePower = async (course: CmsCourse) => {
    const gov = resolveCourseGovernance(course);
    // Si está publicado -> lo apaga ('pausado'); si está apagado/borrador/etc. -> lo enciende ('publicado')
    const nextState: CourseStatus = gov.estado_curso === 'publicado' ? 'pausado' : 'publicado';
    await quickPatchCourse(course.id, { estado_curso: nextState });
  };

  const handleToggleFeatured = async (course: CmsCourse) => {
    const gov = resolveCourseGovernance(course);
    await quickPatchCourse(course.id, {
      configuracion_curso: {
        ...(course.configuracion_curso || {}),
        destacado: !gov.destacado,
      },
    });
  };

  const handleDuplicateCourse = async (course: CmsCourse) => {
    if (!course.id) return;
    setBusyCourseId(course.id);
    try {
      const res = await fetch('/api/v1/cms/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: course.id, action: 'duplicate' }),
      });
      if (res.ok) {
        await loadCourses();
      }
    } catch (err) {
      console.error('Error duplicando curso:', err);
    } finally {
      setBusyCourseId(null);
    }
  };

  const openConfigModal = (course: CmsCourse) => {
    setConfigModalCourse(course);
    setModalTagInput('');
    setModalDraft({
      titulo: course.titulo,
      slug: course.slug,
      categoria: course.categoria || 'Desarrollo de Software',
      nivel: course.nivel || 'intermedio',
      descripcion: course.descripcion || '',
      imagen_portada_url: course.imagen_portada_url || '',
      gov: resolveCourseGovernance(course),
    });
  };

  const handleSaveConfigModal = async () => {
    if (!configModalCourse?.id || !modalDraft) return;
    setSavingModal(true);
    try {
      const res = await fetch('/api/v1/cms/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: configModalCourse.id,
          titulo: modalDraft.titulo.trim() || configModalCourse.titulo,
          slug: modalDraft.slug.trim() || configModalCourse.slug,
          categoria: modalDraft.categoria,
          nivel: modalDraft.nivel,
          descripcion: modalDraft.descripcion,
          imagen_portada_url: modalDraft.imagen_portada_url,
          estado_curso: modalDraft.gov.estado_curso,
          configuracion_curso: modalDraft.gov,
        }),
      });
      if (res.ok) {
        await loadCourses();
        setConfigModalCourse(null);
        setModalDraft(null);
      }
    } catch (err) {
      console.error('Error guardando configuración del curso:', err);
    } finally {
      setSavingModal(false);
    }
  };

  const handleCopyCourseLink = (slug: string) => {
    const url = `${window.location.origin}/cursos/${slug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2200);
  };

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
          calificacion:
            nuevoEstado === 'aprobado' ? draft.calificacion : Math.min(draft.calificacion, 59),
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
      publicado: false,
      configuracion_curso: {
        estado_curso: 'borrador',
        visibilidad: 'publico',
        inscripciones_abiertas: true,
        otorga_certificado: true,
        porcentaje_minimo_certificado: 100,
        navegacion_secuencial: false,
        destacado: false,
        etiquetas: ['Producción', 'Arquitectura'],
      },
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
    const ok = window.confirm(`¿Seguro que deseas enviar a la papelera el curso "${title}"?`);
    if (!ok) return;
    try {
      await fetch(`/api/v1/cms/courses?id=${courseId}`, { method: 'DELETE' });
      await loadCourses();
    } catch (err) {
      console.error('Error eliminando curso:', err);
    }
  };

  // --- Cálculos y Filtros del Centro de Cursos ---
  const stats = useMemo(() => {
    let publicados = 0;
    let borradores = 0;
    let pausados = 0;
    let proximamente = 0;
    let archivados = 0;
    let destacados = 0;
    let unidades = 0;
    let labs = 0;
    let examenes = 0;

    courses.forEach((c) => {
      const gov = resolveCourseGovernance(c);
      if (gov.estado_curso === 'publicado') publicados++;
      else if (gov.estado_curso === 'borrador') borradores++;
      else if (gov.estado_curso === 'pausado') pausados++;
      else if (gov.estado_curso === 'proximamente') proximamente++;
      else if (gov.estado_curso === 'archivado') archivados++;
      if (gov.destacado) destacados++;
      unidades += Number(c.total_lecciones || 0);
      labs += Number(c.total_laboratorios || 0);
      examenes += Number(c.total_examenes || 0);
    });

    return {
      publicados,
      borradores,
      pausados,
      proximamente,
      archivados,
      destacados,
      unidades,
      labs,
      examenes,
    };
  }, [courses]);

  const categoriesList = useMemo(
    () => [
      'Todas',
      ...Array.from(
        new Set(courses.map((c) => c.categoria || 'Desarrollo de Software').filter(Boolean))
      ),
    ],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();

    const list = courses.filter((c) => {
      const gov = resolveCourseGovernance(c);

      if (courseStateFilter === 'destacados' && !gov.destacado) return false;
      if (
        courseStateFilter !== 'todos' &&
        courseStateFilter !== 'destacados' &&
        gov.estado_curso !== courseStateFilter
      ) {
        return false;
      }

      if (
        categoryFilter !== 'Todas' &&
        (c.categoria || 'Desarrollo de Software') !== categoryFilter
      ) {
        return false;
      }

      if (levelFilter !== 'Todos' && (c.nivel || 'intermedio') !== levelFilter) {
        return false;
      }

      if (q) {
        const hayTitulo = c.titulo.toLowerCase().includes(q);
        const haySlug = (c.slug || '').toLowerCase().includes(q);
        const hayDesc = (c.descripcion || '').toLowerCase().includes(q);
        const hayCat = (c.categoria || '').toLowerCase().includes(q);
        const hayInst = gov.instructor_nombre.toLowerCase().includes(q);
        const hayTags = gov.etiquetas.some((t) => t.toLowerCase().includes(q));
        if (!hayTitulo && !haySlug && !hayDesc && !hayCat && !hayInst && !hayTags) {
          return false;
        }
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
      if (sortBy === 'unidades')
        return Number(b.total_lecciones || 0) - Number(a.total_lecciones || 0);
      if (sortBy === 'puntos')
        return Number(b.total_puntos || 0) - Number(a.total_puntos || 0);
      // Recientes primero, priorizando destacados
      const aDest = resolveCourseGovernance(a).destacado ? 1 : 0;
      const bDest = resolveCourseGovernance(b).destacado ? 1 : 0;
      if (bDest !== aDest) return bDest - aDest;
      return 0;
    });
  }, [courses, courseSearch, courseStateFilter, categoryFilter, levelFilter, sortBy]);

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

  const pendingReviewCount = submissions.filter((s) => s.estado === 'pendiente_revision').length;

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === 'todos') return true;
    if (statusFilter === 'pendiente_revision') return s.estado === 'pendiente_revision';
    if (statusFilter === 'aprobado') return s.estado === 'aprobado';
    return s.estado === 'rechazado' || s.estado === 'reprobado';
  });

  const hasActiveCourseFilters =
    courseSearch.trim() !== '' ||
    courseStateFilter !== 'todos' ||
    categoryFilter !== 'Todas' ||
    levelFilter !== 'Todos';

  return (
    <DashboardComponent>
      <div className="amber-inner-container">
        {/* ENCABEZADO DEL PANEL */}
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
              <ShieldAlert size={14} /> // CONSOLA DE GOBERNANZA ACADÉMICA • ADMIN
            </span>
            <h1 className="amber-section-title" style={{ marginBottom: '0.35rem' }}>
              GESTIÓN PROFESIONAL DE CURSOS &amp; STUDIO
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: 690 }}>
              Controla publicación, borradores, apagado por mantenimiento, visibilidad privada,
              certificación, exámenes y laboratorios desde un solo centro operativo.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <Link
              href="/cursos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.82rem 1.2rem',
                borderRadius: '10px',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                background: 'rgba(14, 8, 26, 0.8)',
                color: '#e9d5ff',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={16} /> Ver Catálogo Público
            </Link>

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
        </div>

        {/* PESTAÑAS PRINCIPALES */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.6rem',
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
            Cursos &amp; Gobernanza ({courses.length})
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

        {/* TARJETAS KPI INTERACTIVAS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
            gap: '0.9rem',
            marginBottom: '1.85rem',
          }}
        >
          <div
            onClick={() => {
              setActiveTab('cursos');
              setCourseStateFilter('todos');
            }}
            style={{
              background: 'rgba(14, 8, 26, 0.82)',
              border: `1px solid ${
                courseStateFilter === 'todos' && activeTab === 'cursos'
                  ? '#a855f7'
                  : 'rgba(168, 85, 247, 0.25)'
              }`,
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.1em' }}>
              TOTAL DE CURSOS
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {courses.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#c084fc' }}>
              {stats.destacados} destacados ⭐
            </span>
          </div>

          <div
            onClick={() => {
              setActiveTab('cursos');
              setCourseStateFilter('publicado');
            }}
            style={{
              background: 'rgba(14, 8, 26, 0.82)',
              border: `1px solid ${
                courseStateFilter === 'publicado'
                  ? '#10b981'
                  : 'rgba(16, 185, 129, 0.28)'
              }`,
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#6ee7b7', letterSpacing: '0.1em' }}>
              ACTIVOS EN CATÁLOGO
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {stats.publicados}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              +{stats.proximamente} próximamente
            </span>
          </div>

          <div
            onClick={() => {
              setActiveTab('cursos');
              setCourseStateFilter(stats.pausados > 0 ? 'pausado' : 'borrador');
            }}
            style={{
              background: 'rgba(14, 8, 26, 0.82)',
              border: '1px solid rgba(244, 63, 94, 0.28)',
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#fda4af', letterSpacing: '0.1em' }}>
              BORRADORES / APAGADOS
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {stats.borradores + stats.pausados}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {stats.borradores} borradores • {stats.pausados} en pausa
            </span>
          </div>

          <div
            style={{
              background: 'rgba(14, 8, 26, 0.82)',
              border: '1px solid rgba(168, 85, 247, 0.24)',
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#d8b4fe', letterSpacing: '0.1em' }}>
              UNIDADES EN TEMARIOS
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {stats.unidades}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {stats.labs} labs • {stats.examenes} exámenes
            </span>
          </div>

          <div
            onClick={() => {
              setActiveTab('revisiones');
              setStatusFilter('pendiente_revision');
            }}
            style={{
              background: 'rgba(14, 8, 26, 0.82)',
              border: '1px solid rgba(34, 211, 238, 0.32)',
              borderRadius: '14px',
              padding: '1.1rem 1.3rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#67e8f9', letterSpacing: '0.1em' }}>
              LABS POR REVISAR
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {pendingReviewCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#67e8f9' }}>
              Ir a bandeja de calificación →
            </span>
          </div>
        </div>

        {/* =========================================================
            PESTAÑA 2: REVISIÓN DE LABORATORIOS Y EXÁMENES
           ========================================================= */}
        {activeTab === 'revisiones' ? (
          <div>
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
                        submissions.filter(
                          (s) => s.estado === 'rechazado' || s.estado === 'reprobado'
                        ).length
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
                <h3
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1.5rem',
                    margin: '0 0 0.4rem',
                  }}
                >
                  No hay entregas registradas en este filtro
                </h3>
                <p style={{ color: '#94a3b8', maxWidth: 520, margin: '0 auto' }}>
                  Cuando los estudiantes resuelvan exámenes o envíen actividades de laboratorio
                  desde el visor del curso, aparecerán aquí para auditar o calificar manualmente.
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
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              alignItems: 'center',
                              marginBottom: '0.35rem',
                            }}
                          >
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
                                border: `1px solid ${
                                  isLab ? 'rgba(34,211,238,0.4)' : 'rgba(244,63,94,0.4)'
                                }`,
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

                          <h3
                            style={{
                              fontFamily: 'Rajdhani, sans-serif',
                              fontSize: '1.35rem',
                              margin: 0,
                            }}
                          >
                            {sub.unidad_titulo}
                          </h3>
                          <div
                            style={{ fontSize: '0.83rem', color: '#cbd5e1', marginTop: '0.2rem' }}
                          >
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
                              <CheckCircle2 size={13} /> ACREDITADO (
                              {Math.round(Number(sub.calificacion || 100))}%)
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
                              <XCircle size={13} /> NO ACREDITADO (
                              {Math.round(Number(sub.calificacion || 0))}%)
                            </span>
                          )}
                        </div>
                      </div>

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
                            <div
                              style={{
                                fontSize: '0.86rem',
                                color: '#e2e8f0',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              <strong
                                style={{
                                  color: '#cbd5e1',
                                  display: 'block',
                                  marginBottom: '0.2rem',
                                }}
                              >
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

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '0.75rem',
                          alignItems: 'end',
                        }}
                      >
                        <div style={{ maxWidth: 150 }}>
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
                                  calificacion: Math.max(
                                    0,
                                    Math.min(100, Number(e.target.value) || 0)
                                  ),
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

                        <div style={{ gridColumn: 'span 2' }}>
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
        ) : (
          /* =========================================================
             PESTAÑA 1: CENTRO AVANZADO DE CURSOS, BUSCADOR Y FILTROS
             ========================================================= */
          <div>
            {/* PANEL DE BÚSQUEDA Y FILTROS MULTICRITERIO */}
            <div
              style={{
                background: 'rgba(14, 8, 26, 0.85)',
                border: '1px solid rgba(168, 85, 247, 0.28)',
                borderRadius: '16px',
                padding: '1.15rem 1.35rem',
                marginBottom: '1.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.95rem',
              }}
            >
              {/* Fila 1: Buscador + Selectores de Categoría, Nivel, Orden y Vista */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 240 }}>
                  <Search
                    size={16}
                    color="#a855f7"
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Buscar por nombre de curso, slug, instructor o etiquetas (Docker, SQL, IA)..."
                    style={{
                      width: '100%',
                      background: '#080412',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: '10px',
                      padding: '0.68rem 2.2rem 0.68rem 2.45rem',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  {courseSearch && (
                    <button
                      type="button"
                      onClick={() => setCourseSearch('')}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', alignItems: 'center' }}>
                  <select
                    aria-label="Filtrar por categoría"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      background: '#080412',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '10px',
                      padding: '0.62rem 0.85rem',
                      color: '#e2e8f0',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat} style={{ background: '#090512' }}>
                        {cat === 'Todas' ? 'Categoría: Todas' : cat}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filtrar por nivel"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    style={{
                      background: '#080412',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '10px',
                      padding: '0.62rem 0.85rem',
                      color: '#e2e8f0',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Todos" style={{ background: '#090512' }}>
                      Nivel: Todos
                    </option>
                    <option value="principiante" style={{ background: '#090512' }}>
                      Principiante
                    </option>
                    <option value="intermedio" style={{ background: '#090512' }}>
                      Intermedio
                    </option>
                    <option value="avanzado" style={{ background: '#090512' }}>
                      Avanzado
                    </option>
                  </select>

                  <select
                    aria-label="Ordenar cursos"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      background: '#080412',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '10px',
                      padding: '0.62rem 0.85rem',
                      color: '#e2e8f0',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="recientes" style={{ background: '#090512' }}>
                      Orden: Destacados / Recientes
                    </option>
                    <option value="titulo" style={{ background: '#090512' }}>
                      Orden: Título (A–Z)
                    </option>
                    <option value="unidades" style={{ background: '#090512' }}>
                      Orden: Más Unidades
                    </option>
                    <option value="puntos" style={{ background: '#090512' }}>
                      Orden: Mayor Puntaje XP
                    </option>
                  </select>

                  {/* Selector de Vista: Tarjetas vs Lista */}
                  <div
                    style={{
                      display: 'inline-flex',
                      background: '#080412',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      title="Vista en Tarjetas"
                      style={{
                        padding: '0.58rem 0.7rem',
                        border: 'none',
                        background:
                          viewMode === 'grid' ? 'rgba(147, 51, 234, 0.35)' : 'transparent',
                        color: viewMode === 'grid' ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                      }}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      title="Vista en Tabla Compacta"
                      style={{
                        padding: '0.58rem 0.7rem',
                        border: 'none',
                        background:
                          viewMode === 'list' ? 'rgba(147, 51, 234, 0.35)' : 'transparent',
                        color: viewMode === 'list' ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                      }}
                    >
                      <ListIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fila 2: Píldoras de Estado Operativo */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.73rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginRight: '0.25rem',
                    }}
                  >
                    <SlidersHorizontal size={13} /> Estado:
                  </span>
                  {(
                    [
                      { id: 'todos', label: `Todos (${courses.length})` },
                      { id: 'publicado', label: `Publicados (${stats.publicados})` },
                      { id: 'borrador', label: `Borradores (${stats.borradores})` },
                      { id: 'pausado', label: `Apagados / Pausa (${stats.pausados})` },
                      { id: 'proximamente', label: `Próximamente (${stats.proximamente})` },
                      { id: 'archivado', label: `Archivados (${stats.archivados})` },
                      { id: 'destacados', label: `Destacados ⭐ (${stats.destacados})` },
                    ] as const
                  ).map((pill) => {
                    const active = courseStateFilter === pill.id;
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setCourseStateFilter(pill.id)}
                        style={{
                          padding: '0.36rem 0.8rem',
                          borderRadius: '999px',
                          border: active
                            ? '1px solid #f43f5e'
                            : '1px solid rgba(255,255,255,0.1)',
                          background: active
                            ? 'linear-gradient(90deg, rgba(147,51,234,0.35), rgba(225,29,72,0.3))'
                            : 'rgba(255,255,255,0.03)',
                          color: active ? '#ffffff' : '#cbd5e1',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>

                {hasActiveCourseFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseSearch('');
                      setCourseStateFilter('todos');
                      setCategoryFilter('Todas');
                      setLevelFilter('Todos');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f43f5e',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Limpiar filtros ({filteredCourses.length} resultados)
                  </button>
                )}
              </div>
            </div>

            {/* LISTADO / TARJETAS DE CURSOS */}
            {loading ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#c084fc' }}>
                <Loader2 size={28} style={{ marginBottom: '0.5rem' }} />
                <div>Cargando cursos desde Neon PostgreSQL...</div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div
                style={{
                  background: 'rgba(14, 8, 26, 0.8)',
                  border: '1px dashed rgba(168, 85, 247, 0.4)',
                  borderRadius: '18px',
                  padding: '3.2rem 2rem',
                  textAlign: 'center',
                }}
              >
                <Sparkles size={34} color="#f43f5e" style={{ marginBottom: '0.75rem' }} />
                <h3
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1.6rem',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {courses.length === 0
                    ? 'Aún no has creado ningún curso en el Studio CMS'
                    : 'Ningún curso coincide con los filtros actuales'}
                </h3>
                <p style={{ color: '#94a3b8', maxWidth: 520, margin: '0 auto 1.4rem' }}>
                  {courses.length === 0
                    ? 'Crea tu primer curso para habilitar borradores, control de encendido/apagado, laboratorios y exámenes.'
                    : 'Prueba cambiando el filtro de estado o limpiando el término de búsqueda.'}
                </p>
                {courses.length === 0 ? (
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
                    <Plus size={16} /> Crear Primer Curso
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseSearch('');
                      setCourseStateFilter('todos');
                      setCategoryFilter('Todas');
                      setLevelFilter('Todos');
                    }}
                    style={{
                      padding: '0.65rem 1.2rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(168,85,247,0.5)',
                      background: 'rgba(147,51,234,0.2)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mostrar todos los cursos
                  </button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              /* VISTA COMPACTA EN LISTA ADMINISTRATIVA */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredCourses.map((course) => {
                  const gov = resolveCourseGovernance(course);
                  const st = STATUS_META[gov.estado_curso];
                  const isBusy = busyCourseId === course.id;

                  return (
                    <div
                      key={course.id}
                      style={{
                        background: 'rgba(14, 8, 26, 0.88)',
                        border: '1px solid rgba(168, 85, 247, 0.24)',
                        borderRadius: '14px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: '1 1 300px', minWidth: 240 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.55rem',
                              borderRadius: '999px',
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                            }}
                          >
                            {st.label}
                          </span>
                          <span style={{ fontSize: '0.73rem', color: '#c084fc', fontWeight: 700 }}>
                            {course.categoria || 'Desarrollo de Software'} •{' '}
                            {String(course.nivel || 'intermedio').toUpperCase()}
                          </span>
                          {gov.destacado && (
                            <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>
                              ★ Destacado
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', fontWeight: 700 }}>
                          {course.titulo}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                          /{course.slug} • {course.total_modulos ?? 0} mód •{' '}
                          {course.total_lecciones ?? 0} unidades ({course.total_laboratorios ?? 0}{' '}
                          labs, {course.total_examenes ?? 0} exámenes) • {course.total_puntos ?? 0}{' '}
                          pts
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
                        <select
                          aria-label="Cambiar estado rápido"
                          disabled={isBusy}
                          value={gov.estado_curso}
                          onChange={(e) =>
                            quickPatchCourse(course.id, {
                              estado_curso: e.target.value as CourseStatus,
                            })
                          }
                          style={{
                            background: '#090512',
                            border: `1px solid ${st.border}`,
                            color: st.color,
                            borderRadius: '8px',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="publicado">● Publicado</option>
                          <option value="borrador">○ Borrador</option>
                          <option value="pausado">⏻ Apagado / Pausa</option>
                          <option value="proximamente">◈ Próximamente</option>
                          <option value="archivado">▣ Archivado</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => openConfigModal(course)}
                          title="Configuración avanzada del curso"
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(34,211,238,0.4)',
                            background: 'rgba(8,145,178,0.16)',
                            color: '#67e8f9',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Settings size={14} /> Config
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCourse(course.id)}
                          style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(168,85,247,0.5)',
                            background: 'rgba(147,51,234,0.24)',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Edit3 size={14} /> Studio
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateCourse(course)}
                          title="Duplicar curso como borrador"
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.14)',
                            background: 'transparent',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                          }}
                        >
                          <Copy size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id, course.titulo)}
                          title="Eliminar curso"
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(244,63,94,0.35)',
                            background: 'rgba(225,29,72,0.1)',
                            color: '#fb7185',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* VISTA PRINCIPAL EN TARJETAS PRO (PROPORCIÓN EQUILIBRADA MÁX 3 COLUMNAS) */
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1.35rem',
                }}
              >
                {filteredCourses.map((course) => {
                  const gov = resolveCourseGovernance(course);
                  const st = STATUS_META[gov.estado_curso];
                  const isBusy = busyCourseId === course.id;
                  const isLive = gov.estado_curso === 'publicado';

                  return (
                    <div
                      key={course.id}
                      style={{
                        background: 'rgba(14, 8, 26, 0.9)',
                        border: `1px solid ${
                          gov.destacado
                            ? 'rgba(251, 191, 36, 0.45)'
                            : gov.estado_curso === 'pausado'
                            ? 'rgba(244, 63, 94, 0.38)'
                            : 'rgba(168, 85, 247, 0.28)'
                        }`,
                        borderRadius: '18px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 14px 34px rgba(0, 0, 0, 0.38)',
                        opacity: gov.estado_curso === 'archivado' ? 0.78 : 1,
                      }}
                    >
                      <div>
                        {/* PORTADA VISUAL CON CONTROLES FLOTANTES */}
                        <div
                          style={{
                            position: 'relative',
                            height: 158,
                            background: course.imagen_portada_url
                              ? '#090512'
                              : getCoverGradient(course.categoria, gov.color_acento),
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          {course.imagen_portada_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.imagen_portada_url}
                              alt={course.titulo}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: gov.estado_curso === 'pausado' ? 0.45 : 0.85,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage:
                                  'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                                backgroundSize: '18px 18px',
                                opacity: 0.35,
                              }}
                            />
                          )}

                          {/* Overlay oscuro inferior para legibilidad */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(180deg, rgba(6,3,14,0.45) 0%, rgba(10,5,20,0.92) 100%)',
                            }}
                          />

                          {/* Fila superior flotante: Badge de Estado + Botones Estrella y Power ON/OFF */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              right: 12,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.24rem 0.65rem',
                                borderRadius: '999px',
                                background: st.bg,
                                color: st.color,
                                border: `1px solid ${st.border}`,
                                backdropFilter: 'blur(8px)',
                                letterSpacing: '0.06em',
                              }}
                            >
                              {isLive ? <Globe size={11} /> : <Lock size={11} />}
                              {st.label}
                            </span>

                            <div style={{ display: 'flex', gap: '0.38rem' }}>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleToggleFeatured(course)}
                                title={
                                  gov.destacado
                                    ? 'Quitar de cursos destacados'
                                    : 'Destacar curso en catálogo'
                                }
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: '8px',
                                  border: `1px solid ${
                                    gov.destacado
                                      ? 'rgba(251,191,36,0.6)'
                                      : 'rgba(255,255,255,0.18)'
                                  }`,
                                  background: gov.destacado
                                    ? 'rgba(245, 158, 11, 0.28)'
                                    : 'rgba(9, 5, 18, 0.72)',
                                  color: gov.destacado ? '#fbbf24' : '#cbd5e1',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                <Star size={14} fill={gov.destacado ? '#fbbf24' : 'none'} />
                              </button>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleTogglePower(course)}
                                title={
                                  isLive
                                    ? 'Apagar / Pausar curso inmediatamente'
                                    : 'Encender y Publicar curso ahora'
                                }
                                style={{
                                  height: 30,
                                  padding: '0 0.55rem',
                                  borderRadius: '8px',
                                  border: `1px solid ${
                                    isLive
                                      ? 'rgba(16, 185, 129, 0.55)'
                                      : 'rgba(244, 63, 94, 0.55)'
                                  }`,
                                  background: isLive
                                    ? 'rgba(16, 185, 129, 0.24)'
                                    : 'rgba(225, 29, 72, 0.25)',
                                  color: isLive ? '#6ee7b7' : '#fda4af',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                <Power size={12} />
                                {isLive ? 'ON' : 'OFF'}
                              </button>
                            </div>
                          </div>

                          {/* Fila inferior dentro de la portada: Categoría, Nivel y Slug */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 11,
                              left: 14,
                              right: 14,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-end',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#c084fc',
                                  fontWeight: 800,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {course.categoria || 'Desarrollo de Software'}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.7rem',
                                  color: '#94a3b8',
                                }}
                              >
                                /cursos/{course.slug}
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                background: 'rgba(244, 63, 94, 0.2)',
                                border: '1px solid rgba(244, 63, 94, 0.4)',
                                color: '#fda4af',
                                textTransform: 'uppercase',
                              }}
                            >
                              {course.nivel || 'intermedio'}
                            </span>
                          </div>
                        </div>

                        {/* CUERPO DE LA TARJETA */}
                        <div style={{ padding: '1.2rem 1.3rem 0.9rem' }}>
                          <h3
                            style={{
                              fontFamily: 'Rajdhani, sans-serif',
                              fontSize: '1.42rem',
                              fontWeight: 800,
                              margin: '0 0 0.4rem',
                              color: '#ffffff',
                              lineHeight: 1.2,
                            }}
                          >
                            {course.titulo}
                          </h3>

                          <p
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.85rem',
                              lineHeight: 1.55,
                              margin: '0 0 0.85rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {course.descripcion || 'Sin descripción de catálogo.'}
                          </p>

                          {/* Etiquetas tecnológicas */}
                          {gov.etiquetas.length > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.35rem',
                                marginBottom: '0.85rem',
                              }}
                            >
                              {gov.etiquetas.slice(0, 4).map((tag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.68rem',
                                    padding: '0.14rem 0.5rem',
                                    borderRadius: '999px',
                                    background: 'rgba(168, 85, 247, 0.14)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    color: '#e9d5ff',
                                    fontWeight: 600,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Telemetría Académica */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '0.45rem',
                              padding: '0.65rem',
                              borderRadius: '10px',
                              background: 'rgba(5, 3, 12, 0.6)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              fontSize: '0.73rem',
                              color: '#cbd5e1',
                            }}
                          >
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>
                                ESTRUCTURA
                              </span>
                              <strong>
                                {course.total_modulos ?? 0} mód • {course.total_lecciones ?? 0} uds
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>
                                EVALUACIÓN
                              </span>
                              <strong style={{ color: '#67e8f9' }}>
                                {course.total_laboratorios ?? 0} labs • {course.total_examenes ?? 0}{' '}
                                ex
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>
                                VALOR / TIEMPO
                              </span>
                              <strong style={{ color: '#f43f5e' }}>
                                {course.total_puntos ?? 0} pts •{' '}
                                {formatDuration(
                                  course.duracion_total_minutos,
                                  gov.horas_curriculares
                                )}
                              </strong>
                            </div>
                          </div>

                          {/* Indicadores de Gobernanza Activos */}
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.4rem',
                              marginTop: '0.75rem',
                              fontSize: '0.69rem',
                              color: '#94a3b8',
                            }}
                          >
                            {gov.visibilidad !== 'publico' && (
                              <span
                                style={{
                                  padding: '0.14rem 0.45rem',
                                  borderRadius: '5px',
                                  background: 'rgba(245,158,11,0.14)',
                                  color: '#fcd34d',
                                }}
                              >
                                {gov.visibilidad === 'privado_link'
                                  ? 'Link Privado'
                                  : 'Solo Miembros'}
                              </span>
                            )}
                            {gov.codigo_acceso && (
                              <span
                                style={{
                                  padding: '0.14rem 0.45rem',
                                  borderRadius: '5px',
                                  background: 'rgba(244,63,94,0.15)',
                                  color: '#fda4af',
                                }}
                              >
                                PIN Activo
                              </span>
                            )}
                            {gov.navegacion_secuencial && (
                              <span
                                style={{
                                  padding: '0.14rem 0.45rem',
                                  borderRadius: '5px',
                                  background: 'rgba(34,211,238,0.14)',
                                  color: '#67e8f9',
                                }}
                              >
                                Orden Secuencial
                              </span>
                            )}
                            {gov.otorga_certificado && (
                              <span
                                style={{
                                  padding: '0.14rem 0.45rem',
                                  borderRadius: '5px',
                                  background: 'rgba(16,185,129,0.14)',
                                  color: '#6ee7b7',
                                }}
                              >
                                Certificado ({gov.porcentaje_minimo_certificado}%)
                              </span>
                            )}
                            {!gov.inscripciones_abiertas && (
                              <span
                                style={{
                                  padding: '0.14rem 0.45rem',
                                  borderRadius: '5px',
                                  background: 'rgba(239,68,68,0.18)',
                                  color: '#fca5a5',
                                }}
                              >
                                Cupo Cerrado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PIE DE TARJETA: CAMBIO RÁPIDO DE ESTADO + ACCIONES PRO */}
                      <div
                        style={{
                          padding: '0.9rem 1.3rem 1.2rem',
                          borderTop: '1px solid rgba(255,255,255,0.07)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                            Estado:
                          </span>
                          <select
                            aria-label="Selector rápido de estado"
                            disabled={isBusy}
                            value={gov.estado_curso}
                            onChange={(e) =>
                              quickPatchCourse(course.id, {
                                estado_curso: e.target.value as CourseStatus,
                              })
                            }
                            style={{
                              flex: 1,
                              background: '#080412',
                              border: `1px solid ${st.border}`,
                              color: st.color,
                              borderRadius: '8px',
                              padding: '0.38rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="publicado" style={{ background: '#090512' }}>
                              ● Publicado (Visible y Activo)
                            </option>
                            <option value="borrador" style={{ background: '#090512' }}>
                              ○ Borrador (En edición)
                            </option>
                            <option value="pausado" style={{ background: '#090512' }}>
                              ⏻ Apagado / En Mantenimiento
                            </option>
                            <option value="proximamente" style={{ background: '#090512' }}>
                              ◈ Próximamente en Catálogo
                            </option>
                            <option value="archivado" style={{ background: '#090512' }}>
                              ▣ Archivado
                            </option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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
                              padding: '0.58rem 0.85rem',
                              borderRadius: '9px',
                              border: '1px solid rgba(168, 85, 247, 0.55)',
                              background:
                                'linear-gradient(90deg, rgba(147,51,234,0.32), rgba(225,29,72,0.22))',
                              color: '#ffffff',
                              fontSize: '0.81rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={14} />
                            {openingId === course.id ? 'Abriendo...' : 'Editar en Studio'}
                          </button>

                          <button
                            type="button"
                            onClick={() => openConfigModal(course)}
                            title="Configuración avanzada del curso (Visibilidad, PIN, Certificados, Apagar...)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.58rem',
                              borderRadius: '9px',
                              border: '1px solid rgba(34, 211, 238, 0.42)',
                              background: 'rgba(8, 145, 178, 0.16)',
                              color: '#67e8f9',
                              cursor: 'pointer',
                            }}
                          >
                            <Settings size={15} />
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDuplicateCourse(course)}
                            title="Clonar curso completo como Borrador"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.58rem',
                              borderRadius: '9px',
                              border: '1px solid rgba(255,255,255,0.14)',
                              background: 'rgba(255,255,255,0.04)',
                              color: '#cbd5e1',
                              cursor: 'pointer',
                            }}
                          >
                            <Copy size={15} />
                          </button>

                          {course.slug && (
                            <button
                              type="button"
                              onClick={() => handleCopyCourseLink(course.slug)}
                              title="Copiar enlace directo del curso"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.58rem',
                                borderRadius: '9px',
                                border: '1px solid rgba(255,255,255,0.14)',
                                background:
                                  copiedSlug === course.slug
                                    ? 'rgba(16,185,129,0.22)'
                                    : 'rgba(255,255,255,0.04)',
                                color: copiedSlug === course.slug ? '#6ee7b7' : '#cbd5e1',
                                cursor: 'pointer',
                              }}
                            >
                              {copiedSlug === course.slug ? (
                                <CheckCircle2 size={15} />
                              ) : (
                                <Link2 size={15} />
                              )}
                            </button>
                          )}

                          {course.slug && (
                            <Link
                              href={`/cursos/${course.slug}`}
                              title="Abrir vista del estudiante"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.58rem',
                                borderRadius: '9px',
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
                              padding: '0.58rem',
                              borderRadius: '9px',
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
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        )}

        {/* =========================================================
            MODAL DE CONFIGURACIÓN PROFESIONAL DEL CURSO
           ========================================================= */}
        {configModalCourse && modalDraft && (
          <div
            onClick={() => setConfigModalCourse(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(4, 2, 10, 0.82)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 760,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#0c0618',
                border: '1px solid rgba(168, 85, 247, 0.45)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#67e8f9',
                      letterSpacing: '0.1em',
                    }}
                  >
                    // CONFIGURACIÓN PROFESIONAL &amp; GOBERNANZA
                  </span>
                  <h2
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.65rem',
                      margin: '0.2rem 0 0',
                    }}
                  >
                    {configModalCourse.titulo}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigModalCourse(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1. Estado Operativo & Visibilidad */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.9rem',
                  marginBottom: '1.1rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Estado Operativo del Curso
                  </label>
                  <select
                    value={modalDraft.gov.estado_curso}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, estado_curso: e.target.value as CourseStatus },
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.62rem 0.8rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(168,85,247,0.4)',
                      background: '#070310',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    <option value="publicado">● Publicado (Activo en Catálogo)</option>
                    <option value="borrador">○ Borrador (En construcción / Oculto)</option>
                    <option value="pausado">⏻ Apagado / En Mantenimiento</option>
                    <option value="proximamente">◈ Próximamente (Preventa / Vista previa)</option>
                    <option value="archivado">▣ Archivado (Retirado)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Visibilidad y Distribución
                  </label>
                  <select
                    value={modalDraft.gov.visibilidad}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: {
                          ...modalDraft.gov,
                          visibilidad: e.target.value as CourseVisibility,
                        },
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.62rem 0.8rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.16)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  >
                    <option value="publico">Público en Catálogo /cursos</option>
                    <option value="privado_link">Oculto (Acceso solo con Link directo)</option>
                    <option value="solo_miembros">Solo Usuarios con Sesión Iniciada</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.35rem' }}>
                    PIN / Código de Acceso (Cohorte Privada)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound
                      size={14}
                      color="#f43f5e"
                      style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      placeholder="Vacío = sin código"
                      value={modalDraft.gov.codigo_acceso}
                      onChange={(e) =>
                        setModalDraft({
                          ...modalDraft,
                          gov: { ...modalDraft.gov, codigo_acceso: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.62rem 0.8rem 0.62rem 2rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.16)',
                        background: '#070310',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              </div>

              {modalDraft.gov.estado_curso === 'pausado' && (
                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#fda4af', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Aviso mostrado a estudiantes cuando el curso está Apagado / En Pausa:
                  </label>
                  <textarea
                    rows={2}
                    value={modalDraft.gov.mensaje_pausa}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, mensaje_pausa: e.target.value },
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(244,63,94,0.45)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  />
                </div>
              )}

              {/* 2. Switches de Reglas Académicas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.65rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(168,85,247,0.22)',
                  marginBottom: '1.2rem',
                  fontSize: '0.83rem',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalDraft.gov.destacado}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, destacado: e.target.checked },
                      })
                    }
                  />
                  <span>
                    <Star size={13} color="#fbbf24" style={{ verticalAlign: 'middle' }} /> Destacar
                    arriba en el catálogo
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalDraft.gov.inscripciones_abiertas}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, inscripciones_abiertas: e.target.checked },
                      })
                    }
                  />
                  <span>
                    <UserCheck size={13} color="#34d399" style={{ verticalAlign: 'middle' }} />{' '}
                    Inscripciones abiertas
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalDraft.gov.navegacion_secuencial}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, navegacion_secuencial: e.target.checked },
                      })
                    }
                  />
                  <span>
                    <GitCommit size={13} color="#22d3ee" style={{ verticalAlign: 'middle' }} />{' '}
                    Avance secuencial obligatorio
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalDraft.gov.otorga_certificado}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, otorga_certificado: e.target.checked },
                      })
                    }
                  />
                  <span>
                    <Award size={13} color="#c084fc" style={{ verticalAlign: 'middle' }} /> Otorga
                    Certificado CodePulse
                  </span>
                </label>
              </div>

              {/* 3. Metadatos de Catálogo, Horas y Certificación */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                    Título del Curso
                  </label>
                  <input
                    type="text"
                    value={modalDraft.titulo}
                    onChange={(e) => setModalDraft({ ...modalDraft, titulo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.58rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                    Slug / URL (/cursos/...)
                  </label>
                  <input
                    type="text"
                    value={modalDraft.slug}
                    onChange={(e) => setModalDraft({ ...modalDraft, slug: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.58rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: '#070310',
                      color: '#ffffff',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={modalDraft.categoria}
                    onChange={(e) => setModalDraft({ ...modalDraft, categoria: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.58rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                    Nivel Académico
                  </label>
                  <select
                    value={modalDraft.nivel}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        nivel: e.target.value as CmsCourse['nivel'],
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.58rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                    Instructor / Autor
                  </label>
                  <input
                    type="text"
                    value={modalDraft.gov.instructor_nombre}
                    onChange={(e) =>
                      setModalDraft({
                        ...modalDraft,
                        gov: { ...modalDraft.gov, instructor_nombre: e.target.value },
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.58rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                      % Mín. Cert.
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={modalDraft.gov.porcentaje_minimo_certificado}
                      onChange={(e) =>
                        setModalDraft({
                          ...modalDraft,
                          gov: {
                            ...modalDraft.gov,
                            porcentaje_minimo_certificado: Math.max(
                              50,
                              Math.min(100, Number(e.target.value) || 100)
                            ),
                          },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.58rem 0.6rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: '#070310',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                      Horas Oficiales
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Auto"
                      value={modalDraft.gov.horas_curriculares || ''}
                      onChange={(e) =>
                        setModalDraft({
                          ...modalDraft,
                          gov: {
                            ...modalDraft.gov,
                            horas_curriculares: Number(e.target.value) || 0,
                          },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.58rem 0.6rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: '#070310',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Etiquetas tecnológicas */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Etiquetas / Tecnologías del Curso (mejoran el buscador y filtros)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
                  {modalDraft.gov.etiquetas.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'rgba(168,85,247,0.18)',
                        border: '1px solid rgba(168,85,247,0.45)',
                        color: '#e9d5ff',
                        fontSize: '0.75rem',
                      }}
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setModalDraft({
                            ...modalDraft,
                            gov: {
                              ...modalDraft.gov,
                              etiquetas: modalDraft.gov.etiquetas.filter((_, idx) => idx !== i),
                            },
                          })
                        }
                        style={{ background: 'none', border: 'none', color: '#fda4af', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <input
                    type="text"
                    placeholder="Ej. PostgreSQL, Docker, Next.js, Ciberseguridad..."
                    value={modalTagInput}
                    onChange={(e) => setModalTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && modalTagInput.trim()) {
                        e.preventDefault();
                        setModalDraft({
                          ...modalDraft,
                          gov: {
                            ...modalDraft.gov,
                            etiquetas: [...modalDraft.gov.etiquetas, modalTagInput.trim()],
                          },
                        });
                        setModalTagInput('');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: '#070310',
                      color: '#ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!modalTagInput.trim()) return;
                      setModalDraft({
                        ...modalDraft,
                        gov: {
                          ...modalDraft.gov,
                          etiquetas: [...modalDraft.gov.etiquetas, modalTagInput.trim()],
                        },
                      });
                      setModalTagInput('');
                    }}
                    style={{
                      padding: '0.55rem 0.95rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(168,85,247,0.5)',
                      background: 'rgba(147,51,234,0.24)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Etiqueta
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 700 }}>
                  Descripción de Catálogo
                </label>
                <textarea
                  rows={3}
                  value={modalDraft.descripcion}
                  onChange={(e) => setModalDraft({ ...modalDraft, descripcion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: '#070310',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setConfigModalCourse(null)}
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.16)',
                    background: 'transparent',
                    color: '#cbd5e1',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingModal}
                  onClick={handleSaveConfigModal}
                  style={{
                    padding: '0.68rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(90deg, #9333ea 0%, #e11d48 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {savingModal ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardComponent>
  );
}
