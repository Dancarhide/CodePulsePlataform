'use client';

import React from 'react';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import DashboardComponent from '../DashboardComponent';

export default function CursosPage() {
  const sampleCourses = [
    {
      num: '01',
      level: 'PRINCIPIANTE',
      title: 'Fundamentos de Algoritmos y Lógica',
      desc: 'Domina las bases de resolución de problemas, estructuras de control y complejidad.',
    },
    {
      num: '02',
      level: 'INTERMEDIO',
      title: 'Arquitectura de Microservicios con FastAPI & Next.js',
      desc: 'Construye plataformas escalables con autenticación JWT, Prisma ORM y API Gateways.',
    },
    {
      num: '03',
      level: 'AVANZADO',
      title: 'Ingeniería de Sistemas Distribuidos & Cloud',
      desc: 'Diseño de alta disponibilidad, contenedores, colas de mensajería y observabilidad.',
    },
    {
      num: '04',
      level: 'AVANZADO',
      title: 'Ciberseguridad & Auditoría de Aplicaciones',
      desc: 'Seguridad ofensiva y defensiva, protección de endpoints, criptografía y OWASP Top 10.',
    },
  ];

  return (
    <DashboardComponent>
      <div className="amber-inner-container">
        <div className="amber-section-header">
          <div>
            <span className="amber-kicker">// CATÁLOGO DE FORMACIÓN</span>
            <h1 className="amber-section-title">CURSOS &amp; ESPECIALIZACIONES</h1>
          </div>
        </div>

        <section className="amber-grid">
          {sampleCourses.map((course) => (
            <div key={course.num} className="amber-card">
              <div>
                <div className="amber-card-top">
                  <span className="amber-card-num">TRACK {course.num}</span>
                  <span className="amber-card-tag">{course.level}</span>
                </div>
                <h3 className="amber-card-title">{course.title}</h3>
                <p className="amber-card-desc">{course.desc}</p>
              </div>
              <div
                style={{
                  marginTop: '1.75rem',
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
                  <BookOpen size={15} /> VER PROGRAMA
                </span>
                <ArrowUpRight size={16} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </DashboardComponent>
  );
}
