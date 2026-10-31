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
} from 'lucide-react';
import DashboardComponent from '../DashboardComponent';
import CmsStudioEditor from './CmsStudioEditor';
import { CmsCourse } from './CmsBlockTypes';

export default function CmsPage() {
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<CmsCourse | null>(null);

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

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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
              CREADOR DE CURSOS &amp; CONTENIDO
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: 640 }}>
              Diseña lecciones interactivas estilo Canva y Notion con títulos, tablas dinámicas,
              columnas, bloques de código, imágenes, videos y autoevaluaciones conectadas a PostgreSQL.
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

        {/* Métricas Rápidas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              LECCIONES CREADAS
            </span>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
              {totalLessons}
            </div>
          </div>
        </div>

        {/* Lista de Cursos */}
        {loading ? (
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
              ruta de aprendizaje con bloques profesionales.
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
                      <BookOpen size={14} color="#f43f5e" /> {course.total_lecciones ?? 0} lecciones
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
