'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { UserProfile } from './LoginComponent';
import './dashboard.css';

interface DashboardProps {
  user?: UserProfile;
  onLogout?: () => void;
  children?: React.ReactNode;
}

export default function DashboardComponent({ user: propUser, onLogout, children }: DashboardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(propUser || null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (propUser) {
      setUser(propUser);
      return;
    }
    const activeSession = localStorage.getItem('codepulse_active_session');
    if (activeSession) {
      try {
        const parsed: UserProfile = JSON.parse(activeSession);
        setUser(parsed);
      } catch {
        router.replace('/');
      }
    } else {
      router.replace('/');
    }
  }, [propUser, router]);

  const isAdmin =
    !!user &&
    (user.rol === 'admin' ||
      user.correo === 'admin@codepulse.com' ||
      user.username === 'admin');

  useEffect(() => {
    if (mounted && user && pathname === '/cms' && !isAdmin) {
      router.replace('/home');
    }
  }, [mounted, user, pathname, isAdmin, router]);

  const handleLogout = () => {
    localStorage.removeItem('codepulse_active_session');
    localStorage.removeItem('codepulse_access_token');
    if (onLogout) {
      onLogout();
    } else {
      router.push('/');
    }
  };

  if (!mounted || !user) {
    return <div className="amber-shell" />;
  }

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/cursos', label: 'Cursos' },
    ...(isAdmin ? [{ href: '/cms', label: 'CMS' }] : []),
  ];

  return (
    <div className="amber-shell">
      {/* Navbar estilo Amber Studio */}
      <header className="amber-navbar">
        <Link href="/home" className="amber-brand">
          <span className="amber-brand-title">
            CODE<span className="amber-brand-accent">PULSE</span>
          </span>
        </Link>

        <div className="amber-nav-right">
          <nav className="amber-nav-links">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`amber-nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="amber-user-zone">
            <div className="amber-user-pill">
              <span>@{user.username}</span>
              {isAdmin && <span className="amber-admin-badge">ADMIN</span>}
            </div>
            <button onClick={handleLogout} className="amber-rect-btn">
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="amber-main">{children}</main>

      {/* Pie de Página Completo estilo Amber Studio */}
      <footer className="amber-footer">
        <div className="amber-footer-top">
          <div>
            <Link href="/home" className="amber-brand">
              <span className="amber-brand-title">
                CODE<span className="amber-brand-accent">PULSE</span>
              </span>
            </Link>
            <p className="amber-footer-brand-desc">
              Plataforma latinoamericana de ingeniería de software, laboratorios interactivos
              y formación tecnológica de alto impacto.
            </p>
          </div>

          <div>
            <h4 className="amber-footer-col-title">Navegación</h4>
            <ul className="amber-footer-links">
              <li>
                <Link href="/home" className="amber-footer-link">Home</Link>
              </li>
              <li>
                <Link href="/cursos" className="amber-footer-link">Cursos &amp; Tracks</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/cms" className="amber-footer-link">Panel CMS (Admin)</Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="amber-footer-col-title">Áreas TI</h4>
            <ul className="amber-footer-links">
              <li><span className="amber-footer-link">Desarrollo Full-Stack</span></li>
              <li><span className="amber-footer-link">Backend &amp; Microservicios</span></li>
              <li><span className="amber-footer-link">Ciberseguridad &amp; Cloud</span></li>
              <li><span className="amber-footer-link">Inteligencia Artificial</span></li>
            </ul>
          </div>

          <div>
            <h4 className="amber-footer-col-title">Comunidad LATAM</h4>
            <ul className="amber-footer-links">
              <li><span className="amber-footer-link">Laboratorios en Vivo</span></li>
              <li><span className="amber-footer-link">Torneos &amp; Hackathons</span></li>
              <li><span className="amber-footer-link">Certificados Verificables</span></li>
              <li><span className="amber-footer-link">Foro de Ingeniería</span></li>
            </ul>
          </div>
        </div>

        <div className="amber-footer-bottom">
          <span>© 2026 CODEPULSE PLATFORM // CREADO POR OMEGA DEV &amp; DANCAR DEV</span>
          <span>LATINOAMÉRICA • TODOS LOS DERECHOS RESERVADOS</span>
        </div>
      </footer>
    </div>
  );
}
