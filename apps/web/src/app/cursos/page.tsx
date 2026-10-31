'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowUpRight, Layers, Search, Loader2 } from 'lucide-react';
import DashboardComponent from '../DashboardComponent';
import { CmsCourse } from '../cms/CmsBlockTypes';

export default function CursosPage() {
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [search, setSearch] = useState('');

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

  const categories = [
    'Todos',
    ...Array.from(
      new Set(courses.map((c) => c.categoria || 'Desarrollo de Software').filter(Boolean))
    ),
  ];

  const filtered = courses.filter((c) => {
    const matchesCat =
      selectedCategory === 'Todos' ||
      (c.categoria || 'Desarrollo de Software') === selectedCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.titulo.toLowerCase().includes(q) ||
      (c.descripcion || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
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
            gap: '1.2rem',
          }}
        >
          <div>
            <span className="amber-kicker">// CATÁLOGO DE FORMACIÓN</span>
            <h1 className="amber-section-title">CURSOS &amp; ESPECIALIZACIONES</h1>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 320,
            }}
          >
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar curso o tecnología..."
              style={{
                width: '100%',
                background: 'rgba(14, 8, 26, 0.85)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem 0.65rem 2.3rem',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Filtros de Categoría */}
        {categories.length > 1 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.55rem',
              marginBottom: '2rem',
            }}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    border: active
                      ? '1px solid #f43f5e'
                      : '1px solid rgba(168, 85, 247, 0.25)',
                    background: active
                      ? 'linear-gradient(90deg, rgba(147,51,234,0.35), rgba(225,29,72,0.3))'
                      : 'rgba(14, 8, 26, 0.65)',
                    color: active ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#c084fc' }}>
            <Loader2 size={28} style={{ marginBottom: '0.5rem' }} />
            <div>Cargando catálogo académico...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: 'rgba(14, 8, 26, 0.78)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '18px',
              padding: '3.2rem 2rem',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.55rem', margin: '0 0 0.5rem 0' }}>
              {courses.length === 0
                ? 'Próximamente nuevos cursos disponibles'
                : 'No encontramos cursos con ese criterio'}
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
              {courses.length === 0
                ? 'Los cursos publicados desde el Studio CMS aparecerán automáticamente en este catálogo.'
                : 'Prueba seleccionando otra categoría o limpiando el buscador.'}
            </p>
          </div>
        ) : (
          <section className="amber-grid">
            {filtered.map((course, idx) => (
              <Link
                key={course.id || course.slug}
                href={`/cursos/${course.slug}`}
                className="amber-card"
                style={{
                  textDecoration: 'none',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
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
                        height: 155,
                        objectFit: 'cover',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                  )}

                  <div className="amber-card-top">
                    <span className="amber-card-num">
                      TRACK {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="amber-card-tag">
                      {String(course.nivel || 'intermedio').toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.73rem',
                      color: '#c084fc',
                      fontWeight: 700,
                      marginBottom: '0.3rem',
                    }}
                  >
                    {course.categoria || 'Desarrollo de Software'}
                  </div>

                  <h3 className="amber-card-title">{course.titulo}</h3>
                  <p className="amber-card-desc">{course.descripcion}</p>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '1.15rem',
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

                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#f43f5e',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BookOpen size={15} /> ENTRAR AL CURSO
                    </span>
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </DashboardComponent>
  );
}
