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
    return 'linear-gradient(135deg, #1a0926 0%, #7e22ce 50%, #3b1b8c 100%)';
  }
  return 'linear-gradient(135deg, #1b0c40 0%, #3b1b8c 50%, #0d061c 100%)';
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
            <span className="amber-kicker" style={{ color: '#a066ff' }}>// CATÁLOGO DE INGENIERÍA &amp; PRÁCTICA</span>
            <h1 className="amber-section-title" style={{ fontFamily: "'Outfit', sans-serif", marginBottom: '0.35rem' }}>
              CURSOS &amp; ESPECIALIZACIONES
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, maxWidth: 640 }}>
              Rutas técnicas diseñadas con laboratorios evaluables, retos interactivos en terminal,
              exámenes y progreso ponderado conectado a tu perfil.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: '12px',
                background: '#0d061c',
                border: '1px solid #4a21a5',
                fontSize: '0.78rem',
                color: '#cbd5e1',
              }}
            >
              <strong style={{ color: '#a066ff', fontSize: '1.05rem' }}>{courses.length}</strong>{' '}
              Rutas Disponibles
            </div>
            <div
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: '12px',
                background: '#0d061c',
                border: '1px solid #4a21a5',
                fontSize: '0.78rem',
                color: '#cbd5e1',
              }}
            >
              <strong style={{ color: '#a066ff', fontSize: '1.05rem' }}>{totalLabs}</strong>{' '}
              Laboratorios Activos
            </div>
          </div>
        </div>

        {/* CONSOLA DE BÚSQUEDA Y FILTROS AVANZADOS (ESTILO LOGIN CODEPULSE) */}
        <div
          style={{
            background: '#0d061c',
            border: '1px solid #4a21a5',
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
                color="#a066ff"
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
                  background: '#080312',
                  border: '1px solid #4a21a5',
                  borderRadius: '12px',
                  padding: '0.72rem 2.2rem 0.72rem 2.45rem',
                  color: '#ffffff',
                  fontSize: '0.87rem',
                  outline: 'none',
                  fontFamily: "'Outfit', sans-serif",
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
                  background: '#080312',
                  border: '1px solid #4a21a5',
                  borderRadius: '12px',
                  padding: '0.65rem 0.95rem',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                }}
              >
                <option value="Todos" style={{ background: '#0d061c' }}>
                  Nivel: Todos
                </option>
                <option value="principiante" style={{ background: '#0d061c' }}>
                  Principiante
                </option>
                <option value="intermedio" style={{ background: '#0d061c' }}>
                  Intermedio
                </option>
                <option value="avanzado" style={{ background: '#0d061c' }}>
                  Avanzado
                </option>
              </select>

              <select
                aria-label="Filtrar por modalidad"
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value as any)}
                style={{
                  background: '#080312',
                  border: '1px solid #4a21a5',
                  borderRadius: '12px',
                  padding: '0.65rem 0.95rem',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                }}
              >
                <option value="todos" style={{ background: '#0d061c' }}>
                  Formato: Todos
                </option>
                <option value="con_labs" style={{ background: '#0d061c' }}>
                  Con Laboratorios Prácticos
                </option>
                <option value="con_examen" style={{ background: '#0d061c' }}>
                  Con Examen Final
                </option>
                <option value="certificado" style={{ background: '#0d061c' }}>
                  Con Certificado CodePulse
                </option>
                <option value="destacados" style={{ background: '#0d061c' }}>
                  Cursos Destacados ⭐
                </option>
              </select>

              <select
                aria-label="Ordenar catálogo"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  background: '#080312',
                  border: '1px solid #4a21a5',
                  borderRadius: '12px',
                  padding: '0.65rem 0.95rem',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                }}
              >
                <option value="destacados" style={{ background: '#0d061c' }}>
                  Orden: Recomendados
                </option>
                <option value="titulo" style={{ background: '#0d061c' }}>
                  Orden: Alfabético (A–Z)
                </option>
                <option value="puntos" style={{ background: '#0d061c' }}>
                  Orden: Mayor XP
                </option>
                <option value="duracion" style={{ background: '#0d061c' }}>
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
                  color: '#a066ff',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginRight: '0.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
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
                      padding: '0.42rem 0.95rem',
                      borderRadius: '999px',
                      border: active
                        ? '1px solid #a066ff'
                        : '1px solid #4a21a5',
                      background: active
                        ? '#a000ff'
                        : '#0d061c',
                      color: active ? '#ffffff' : '#cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: active ? '0 2px 14px rgba(160, 0, 255, 0.45)' : 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: "'Outfit', sans-serif",
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
                  color: '#a066ff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: "'Outfit', sans-serif",
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
                fontFamily: "'Outfit', sans-serif",
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
                    background: '#0d061c',
                    border: `1px solid ${
                      gov.destacado
                        ? '#fbbf24'
                        : isComingSoon
                        ? '#22d3ee'
                        : '#4a21a5'
                    }`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div>
                    {/* PORTADA VISUAL */}
                    <div
                      style={{
                        position: 'relative',
                        height: 168,
                        background: '#080312',
                        borderBottom: '1px solid #4a21a5',
                        overflow: 'hidden',
                      }}
                    >
                      {course.imagen_portada_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.imagen_portada_url}
                          alt={course.titulo}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: getCatalogCoverGradient(course.categoria, gov.color_acento),
                          }}
                        />
                      )}

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(13,6,28,0.85) 100%)',
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
                              background: 'rgba(0, 0, 0, 0.75)',
                              border: '1px solid #4a21a5',
                              color: '#ffffff',
                              letterSpacing: '0.08em',
                              fontFamily: "'Outfit', sans-serif",
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
                                fontFamily: "'Outfit', sans-serif",
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
                                fontFamily: "'Outfit', sans-serif",
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
                            padding: '0.24rem 0.65rem',
                            borderRadius: '8px',
                            background: 'rgba(160, 102, 255, 0.16)',
                            border: '1px solid #4a21a5',
                            color: '#a066ff',
                            textTransform: 'uppercase',
                            fontFamily: "'Outfit', sans-serif",
                            letterSpacing: '0.05em',
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
                            color: '#a066ff',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontFamily: "'Outfit', sans-serif",
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
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          <Clock size={12} color="#a066ff" />
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
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          margin: '0 0 0.45rem',
                          color: '#ffffff',
                          lineHeight: 1.25,
                        }}
                      >
                        {course.titulo}
                      </h3>

                      <p
                        style={{
                          color: '#cbd5e1',
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
                                background: 'rgba(160, 102, 255, 0.12)',
                                border: '1px solid #4a21a5',
                                color: '#a066ff',
                                fontWeight: 600,
                                fontFamily: "'Outfit', sans-serif",
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
                          fontFamily: "'Outfit', sans-serif",
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
                          <User size={13} color="#a066ff" />
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
                          borderTop: '1px solid rgba(74, 33, 165, 0.35)',
                          fontSize: '0.76rem',
                          color: '#cbd5e1',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Layers size={13} color="#a066ff" /> {course.total_modulos ?? 0} módulos
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <BookOpen size={13} color="#a066ff" /> {course.total_lecciones ?? 0}{' '}
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

                  {/* CTA INFERIOR ESTILO BOTON LOGIN */}
                  <div
                    style={{
                      padding: '0.95rem 1.35rem',
                      background: isComingSoon
                        ? 'rgba(8, 145, 178, 0.16)'
                        : isClosed
                        ? 'rgba(239, 68, 68, 0.16)'
                        : '#a000ff',
                      borderTop: '1px solid #4a21a5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: isComingSoon ? '#67e8f9' : isClosed ? '#fca5a5' : '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: !isComingSoon && !isClosed ? '0 4px 18px rgba(160, 0, 255, 0.35)' : 'none',
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
