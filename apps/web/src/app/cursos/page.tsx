'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowUpRight,
  Layers,
  Search,
  Loader2,
  Award,
  FlaskConical,
  Star,
  Clock,
  SlidersHorizontal,
  X,
  Lock,
  Sparkles,
  User,
} from 'lucide-react';
import DashboardComponent from '../DashboardComponent';
import { CmsCourse, resolveCourseGovernance } from '../cms/CmsBlockTypes';

function getCatalogCoverGradient(category: string, accent?: string): string {
  if (accent && accent !== '#9333ea') {
    return `radial-gradient(circle at 85% 20%, ${accent}55 0%, rgba(14, 8, 28, 0.96) 72%)`;
  }
  const cat = (category || '').toLowerCase();
  if (cat.includes('ciber') || cat.includes('seguridad')) {
    return 'linear-gradient(135deg, #061826 0%, #0e7490 52%, #1e1b4b 100%)';
  }
  if (cat.includes('cloud') || cat.includes('devops') || cat.includes('redes')) {
    return 'linear-gradient(135deg, #090d24 0%, #1d4ed8 55%, #0891b2 100%)';
  }
  if (cat.includes('ia') || cat.includes('inteligencia') || cat.includes('datos')) {
    return 'linear-gradient(135deg, #1a0926 0%, #7e22ce 50%, #be185d 100%)';
  }
  return 'linear-gradient(135deg, #19072c 0%, #6b21a8 52%, #be123c 100%)';
}

function formatCatalogDuration(minutes?: number, customHours?: number): string {
  if (customHours && customHours > 0) return `${customHours}h`;
  const mins = Number(minutes) || 0;
  if (mins <= 0) return 'A tu ritmo';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default function CursosPage() {
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscador y filtros multicriterio
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [featureFilter, setFeatureFilter] = useState<
    'todos' | 'con_labs' | 'con_examen' | 'certificado' | 'destacados'
  >('todos');
  const [sortBy, setSortBy] = useState<'destacados' | 'titulo' | 'puntos' | 'duracion'>(
    'destacados'
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/v1/cms/courses?publishedOnly=true', { cache: 'no-store' });
        const data = await res.json();
        if (active && Array.isArray(data.courses)) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error('Error cargando catálogo de cursos:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categoriesWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach((c) => {
      const cat = c.categoria || 'Desarrollo de Software';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return [
      { name: 'Todos', count: courses.length },
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
    ];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = courses.filter((c) => {
      const gov = resolveCourseGovernance(c);

      if (
        selectedCategory !== 'Todos' &&
        (c.categoria || 'Desarrollo de Software') !== selectedCategory
      ) {
        return false;
      }

      if (selectedLevel !== 'Todos' && (c.nivel || 'intermedio') !== selectedLevel) {
        return false;
      }

      if (featureFilter === 'con_labs' && Number(c.total_laboratorios || 0) === 0) return false;
      if (featureFilter === 'con_examen' && Number(c.total_examenes || 0) === 0) return false;
      if (featureFilter === 'certificado' && !gov.otorga_certificado) return false;
      if (featureFilter === 'destacados' && !gov.destacado) return false;

      if (q) {
        const matchTitle = c.titulo.toLowerCase().includes(q);
        const matchDesc = (c.descripcion || '').toLowerCase().includes(q);
        const matchCat = (c.categoria || '').toLowerCase().includes(q);
        const matchInst = gov.instructor_nombre.toLowerCase().includes(q);
        const matchTag = gov.etiquetas.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchInst && !matchTag) {
          return false;
        }
      }

      return true;
    });

    return list.sort((a, b) => {
      const govA = resolveCourseGovernance(a);
      const govB = resolveCourseGovernance(b);

      if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
      if (sortBy === 'puntos')
        return Number(b.total_puntos || 0) - Number(a.total_puntos || 0);
      if (sortBy === 'duracion')
        return (
          Number(b.duracion_total_minutos || 0) - Number(a.duracion_total_minutos || 0)
        );

      // Destacados y publicados antes que próximamente
      if (govB.destacado !== govA.destacado) return govB.destacado ? 1 : -1;
      if (govA.estado_curso !== govB.estado_curso) {
        return govA.estado_curso === 'publicado' ? -1 : 1;
      }
      return 0;
    });
  }, [courses, search, selectedCategory, selectedLevel, featureFilter, sortBy]);

  const hasFilters =
    search.trim() !== '' ||
    selectedCategory !== 'Todos' ||
    selectedLevel !== 'Todos' ||
    featureFilter !== 'todos';

  const totalLabs = courses.reduce((s, c) => s + Number(c.total_laboratorios || 0), 0);

  return (
    <DashboardComponent>
      <div className="amber-inner-container">
        {/* ENCABEZADO DEL CATÁLOGO */}
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
            <span className="amber-kicker">// CATÁLOGO DE INGENIERÍA &amp; PRÁCTICA</span>
            <h1 className="amber-section-title" style={{ marginBottom: '0.35rem' }}>
              CURSOS &amp; ESPECIALIZACIONES
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: 640 }}>
              Rutas técnicas diseñadas con laboratorios evaluables, retos interactivos en terminal,
              exámenes y progreso ponderado conectado a tu perfil.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                background: 'rgba(14, 8, 26, 0.8)',
                border: '1px solid rgba(168, 85, 247, 0.28)',
                fontSize: '0.78rem',
                color: '#cbd5e1',
              }}
            >
              <strong style={{ color: '#c084fc', fontSize: '1.05rem' }}>{courses.length}</strong>{' '}
              Rutas Disponibles
            </div>
            <div
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                background: 'rgba(14, 8, 26, 0.8)',
                border: '1px solid rgba(34, 211, 238, 0.28)',
                fontSize: '0.78rem',
                color: '#cbd5e1',
              }}
            >
              <strong style={{ color: '#67e8f9', fontSize: '1.05rem' }}>{totalLabs}</strong>{' '}
              Laboratorios Activos
            </div>
          </div>
        </div>

        {/* CONSOLA DE BÚSQUEDA Y FILTROS AVANZADOS */}
        <div
          style={{
            background: 'rgba(14, 8, 26, 0.86)',
            border: '1px solid rgba(168, 85, 247, 0.28)',
            borderRadius: '16px',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.95rem',
          }}
        >
          {/* Fila 1: Buscador + Nivel + Modalidad + Orden */}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar curso, tecnología (Docker, SQL, Python), categoría o instructor..."
                style={{
                  width: '100%',
                  background: '#080412',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: '10px',
                  padding: '0.68rem 2.2rem 0.68rem 2.45rem',
                  color: '#ffffff',
                  fontSize: '0.87rem',
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              <select
                aria-label="Filtrar por nivel"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
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
                aria-label="Filtrar por modalidad"
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value as any)}
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
                <option value="todos" style={{ background: '#090512' }}>
                  Formato: Todos
                </option>
                <option value="con_labs" style={{ background: '#090512' }}>
                  Con Laboratorios Prácticos
                </option>
                <option value="con_examen" style={{ background: '#090512' }}>
                  Con Examen Final
                </option>
                <option value="certificado" style={{ background: '#090512' }}>
                  Con Certificado CodePulse
                </option>
                <option value="destacados" style={{ background: '#090512' }}>
                  Cursos Destacados ⭐
                </option>
              </select>

              <select
                aria-label="Ordenar catálogo"
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
                <option value="destacados" style={{ background: '#090512' }}>
                  Orden: Recomendados
                </option>
                <option value="titulo" style={{ background: '#090512' }}>
                  Orden: Alfabético (A–Z)
                </option>
                <option value="puntos" style={{ background: '#090512' }}>
                  Orden: Mayor XP
                </option>
                <option value="duracion" style={{ background: '#090512' }}>
                  Orden: Duración
                </option>
              </select>
            </div>
          </div>

          {/* Fila 2: Categorías Dinámicas + Limpiar Filtros */}
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
                  marginRight: '0.2rem',
                }}
              >
                <SlidersHorizontal size={13} /> Área:
              </span>
              {categoriesWithCount.map((cat) => {
                const active = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      padding: '0.38rem 0.85rem',
                      borderRadius: '999px',
                      border: active
                        ? '1px solid #f43f5e'
                        : '1px solid rgba(168, 85, 247, 0.22)',
                      background: active
                        ? 'linear-gradient(90deg, rgba(147,51,234,0.36), rgba(225,29,72,0.3))'
                        : 'rgba(255,255,255,0.03)',
                      color: active ? '#ffffff' : '#cbd5e1',
                      fontSize: '0.77rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {cat.name} ({cat.count})
                  </button>
                );
              })}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('Todos');
                  setSelectedLevel('Todos');
                  setFeatureFilter('todos');
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
                Restablecer filtros ({filtered.length} encontrados)
              </button>
            )}
          </div>
        </div>

        {/* GRILLA DE TARJETAS DE CURSOS */}
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#c084fc' }}>
            <Loader2 size={28} style={{ marginBottom: '0.5rem' }} />
            <div>Cargando catálogo académico...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: 'rgba(14, 8, 26, 0.8)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '18px',
              padding: '3.2rem 2rem',
              textAlign: 'center',
            }}
          >
            <Sparkles size={32} color="#c084fc" style={{ marginBottom: '0.6rem' }} />
            <h3
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.55rem',
                margin: '0 0 0.5rem 0',
              }}
            >
              {courses.length === 0
                ? 'Próximamente nuevas rutas disponibles'
                : 'No encontramos cursos con esos filtros'}
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto 1.25rem' }}>
              {courses.length === 0
                ? 'Los cursos activados desde el panel de gobernanza CMS aparecerán aquí automáticamente.'
                : 'Prueba limpiando los filtros de nivel, formato o búsqueda.'}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('Todos');
                  setSelectedLevel('Todos');
                  setFeatureFilter('todos');
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9px',
                  border: '1px solid rgba(168,85,247,0.5)',
                  background: 'rgba(147,51,234,0.22)',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ver todos los cursos
              </button>
            )}
          </div>
        ) : (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.4rem',
            }}
          >
            {filtered.map((course, idx) => {
              const gov = resolveCourseGovernance(course);
              const isComingSoon = gov.estado_curso === 'proximamente';
              const isClosed = !gov.inscripciones_abiertas;

              return (
                <Link
                  key={course.id || course.slug}
                  href={`/cursos/${course.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'rgba(14, 8, 26, 0.9)',
                    border: `1px solid ${
                      gov.destacado
                        ? 'rgba(251, 191, 36, 0.48)'
                        : isComingSoon
                        ? 'rgba(34, 211, 238, 0.35)'
                        : 'rgba(168, 85, 247, 0.28)'
                    }`,
                    borderRadius: '18px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 14px 36px rgba(0, 0, 0, 0.38)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <div>
                    {/* PORTADA VISUAL */}
                    <div
                      style={{
                        position: 'relative',
                        height: 162,
                        background: course.imagen_portada_url
                          ? '#090512'
                          : getCatalogCoverGradient(course.categoria, gov.color_acento),
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
                            opacity: 0.85,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage:
                              'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
                            backgroundSize: '18px 18px',
                            opacity: 0.35,
                          }}
                        />
                      )}

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(6,3,14,0.38) 0%, rgba(10,5,20,0.92) 100%)',
                        }}
                      />

                      {/* Insignias superiores */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          right: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              background: 'rgba(9, 5, 18, 0.78)',
                              border: '1px solid rgba(255,255,255,0.16)',
                              color: '#e2e8f0',
                              letterSpacing: '0.08em',
                            }}
                          >
                            TRACK {String(idx + 1).padStart(2, '0')}
                          </span>

                          {gov.destacado && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                background: 'rgba(245, 158, 11, 0.25)',
                                border: '1px solid rgba(251, 191, 36, 0.55)',
                                color: '#fde68a',
                              }}
                            >
                              <Star size={11} fill="#fbbf24" /> DESTACADO
                            </span>
                          )}

                          {isComingSoon && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                background: 'rgba(8, 145, 178, 0.28)',
                                border: '1px solid #22d3ee',
                                color: '#67e8f9',
                              }}
                            >
                              PRÓXIMAMENTE
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.22rem 0.6rem',
                            borderRadius: '6px',
                            background: 'rgba(244, 63, 94, 0.22)',
                            border: '1px solid rgba(244, 63, 94, 0.45)',
                            color: '#fda4af',
                            textTransform: 'uppercase',
                          }}
                        >
                          {course.nivel || 'intermedio'}
                        </span>
                      </div>

                      {/* Categoría y Duración sobre la base de la portada */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 11,
                          left: 14,
                          right: 14,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#c084fc',
                            fontWeight: 800,
                          }}
                        >
                          {course.categoria || 'Desarrollo de Software'}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.73rem',
                            color: '#cbd5e1',
                          }}
                        >
                          <Clock size={12} color="#67e8f9" />
                          {formatCatalogDuration(
                            course.duracion_total_minutos,
                            gov.horas_curriculares
                          )}
                        </span>
                      </div>
                    </div>

                    {/* CONTENIDO DE LA TARJETA */}
                    <div style={{ padding: '1.25rem 1.35rem 1rem' }}>
                      <h3
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '1.45rem',
                          fontWeight: 800,
                          margin: '0 0 0.45rem',
                          color: '#ffffff',
                          lineHeight: 1.2,
                        }}
                      >
                        {course.titulo}
                      </h3>

                      <p
                        style={{
                          color: '#94a3b8',
                          fontSize: '0.86rem',
                          lineHeight: 1.58,
                          margin: '0 0 0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {course.descripcion}
                      </p>

                      {gov.etiquetas.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.35rem',
                            marginBottom: '0.9rem',
                          }}
                        >
                          {gov.etiquetas.slice(0, 4).map((t, idx2) => (
                            <span
                              key={idx2}
                              style={{
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.52rem',
                                borderRadius: '999px',
                                background: 'rgba(168,85,247,0.14)',
                                border: '1px solid rgba(168,85,247,0.32)',
                                color: '#e9d5ff',
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Instructor + Certificado */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#cbd5e1',
                          marginBottom: '0.85rem',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#94a3b8',
                          }}
                        >
                          <User size={13} color="#c084fc" />
                          {gov.instructor_nombre}
                        </span>

                        {gov.otorga_certificado && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.28rem',
                              color: '#6ee7b7',
                              fontWeight: 700,
                              fontSize: '0.71rem',
                            }}
                          >
                            <Award size={13} /> Certificado
                          </span>
                        )}
                      </div>

                      {/* Métricas de Contenido */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.8rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '0.76rem',
                          color: '#cbd5e1',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Layers size={13} color="#c084fc" /> {course.total_modulos ?? 0} módulos
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <BookOpen size={13} color="#f43f5e" /> {course.total_lecciones ?? 0}{' '}
                          unidades
                        </span>
                        {Number(course.total_laboratorios || 0) > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: '#67e8f9',
                            }}
                          >
                            <FlaskConical size={13} /> {course.total_laboratorios} labs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CTA INFERIOR */}
                  <div
                    style={{
                      padding: '0.9rem 1.35rem',
                      background: isComingSoon
                        ? 'rgba(8, 145, 178, 0.12)'
                        : 'rgba(147, 51, 234, 0.1)',
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: isComingSoon ? '#67e8f9' : isClosed ? '#fca5a5' : '#f43f5e',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                      {isComingSoon ? (
                        <>
                          <Clock size={15} /> PRÓXIMAMENTE • VER TEMARIO
                        </>
                      ) : isClosed ? (
                        <>
                          <Lock size={15} /> CUPO CERRADO
                        </>
                      ) : (
                        <>
                          <BookOpen size={15} /> ENTRAR AL CURSO
                        </>
                      )}
                    </span>
                    <ArrowUpRight size={16} />
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </DashboardComponent>
  );
}
