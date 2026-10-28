'use client';

import React from 'react';
import { ShieldAlert, PlusCircle, Users, FileCheck, Terminal } from 'lucide-react';
import DashboardComponent from '../DashboardComponent';

export default function CmsPage() {
  const cmsModules = [
    {
      num: 'CMS-01',
      tag: 'ACADEMIA',
      title: 'Gestión de Cursos y Módulos',
      desc: 'Crear, editar y publicar cursos, lecciones, quizzes y exámenes de certificación.',
      icon: <PlusCircle size={20} color="#f43f5e" />,
    },
    {
      num: 'CMS-02',
      tag: 'USUARIOS',
      title: 'Control de Usuarios y Roles',
      desc: 'Administrar cuentas de estudiantes, instructores, auditores y permisos de acceso.',
      icon: <Users size={20} color="#f43f5e" />,
    },
    {
      num: 'CMS-03',
      tag: 'EVALUACIÓN',
      title: 'Revisión de Exámenes y Certificados',
      desc: 'Validar intentos de examen y emitir constancias o certificados con código QR.',
      icon: <FileCheck size={20} color="#f43f5e" />,
    },
    {
      num: 'CMS-04',
      tag: 'LABS',
      title: 'Configuración de Laboratorios',
      desc: 'Administrar repositorios base, límites de tiempo/memoria y casos de prueba.',
      icon: <Terminal size={20} color="#f43f5e" />,
    },
  ];

  return (
    <DashboardComponent>
      <div className="amber-inner-container">
        <div className="amber-section-header">
          <div>
            <span className="amber-kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={14} /> // ACCESO EXCLUSIVO ADMINISTRADOR
            </span>
            <h1 className="amber-section-title">STUDIO CMS // PANEL DE CONTROL</h1>
          </div>
        </div>

        <section className="amber-grid">
          {cmsModules.map((mod) => (
            <div key={mod.num} className="amber-card">
              <div>
                <div className="amber-card-top">
                  <span className="amber-card-num">{mod.num}</span>
                  <span className="amber-card-tag">{mod.tag}</span>
                </div>
                <h3 className="amber-card-title">{mod.title}</h3>
                <p className="amber-card-desc">{mod.desc}</p>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                {mod.icon}
              </div>
            </div>
          ))}
        </section>
      </div>
    </DashboardComponent>
  );
}
