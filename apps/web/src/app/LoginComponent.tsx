'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Trophy, 
  BookOpen, 
  LogOut,
  Info
} from 'lucide-react';
import './login.css';

// Importación de componentes divididos
import LoginFormComponent from './LoginFormComponent';
import RegisterComponent from './RegisterComponent';
import ForgotPasswordComponent from './ForgotPasswordComponent';

// Exportación de la interfaz del perfil de usuario para los demás componentes
export interface UserProfile {
  nombre: string;
  apellido1: string;
  apellido2?: string;
  correo: string;
  password?: string;
  username: string;
  avatarStyle: string;
  avatarSeed: string;
}

export default function LoginComponent() {
  // Vistas de la pantalla: 'login' (Iniciar sesión), 'register' (Registrarse), 'forgot_password' (Recuperar contraseña), 'dashboard' (Miembro activo)
  const [view, setView] = useState<'login' | 'register' | 'forgot_password' | 'dashboard'>('login');
  
  // Sistema de alertas superior
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Perfil del usuario que ha iniciado sesión actualmente
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Inicialización y carga de usuarios persistidos en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('codepulse_users');
      if (!storedUsers) {
        // Crear una cuenta de administrador de pruebas por defecto si no existe ninguna
        const defaultUser: UserProfile = {
          nombre: 'Administrador',
          apellido1: 'CodePulse',
          apellido2: 'Plataforma',
          correo: 'admin@codepulse.com',
          password: 'admin123',
          username: 'admin',
          avatarStyle: 'bottts',
          avatarSeed: 'admin'
        };
        localStorage.setItem('codepulse_users', JSON.stringify([defaultUser]));
      }

      // Comprobar si hay una sesión activa persistida en localStorage
      const activeSession = localStorage.getItem('codepulse_active_session');
      if (activeSession) {
        try {
          setCurrentUser(JSON.parse(activeSession));
          setView('dashboard');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Efecto para limpiar las alertas automáticamente después de 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Manejador del cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('codepulse_active_session');
    setCurrentUser(null);
    setView('login');
    setAlert({ type: 'info', message: 'Sesión cerrada correctamente.' });
  };

  // Construye la URL de Dicebear para los avatares correspondientes
  const getAvatarUrl = (style: string, seed: string) => {
    if (seed.includes('&') || seed.includes('=')) {
      return `https://api.dicebear.com/9.x/${style}/svg?${seed}`;
    }
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  return (
    <div className="login-container">
      {/* Panel Izquierda (Branding y Hero) */}
      <div className="login-left">
        {/* Círculos decorativos de fondo */}
        <div className="blob blob-top" />
        <div className="blob blob-bottom-left" />
        <div className="blob blob-bottom-right" />

        {/* Sección del Logo de CodePulse */}
        <div className="brand-logo-section">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ display: 'block' }}>
            <rect x="6" y="16" width="3" height="8" rx="1.5" fill="#a066ff" />
            <rect x="11" y="12" width="3" height="16" rx="1.5" fill="#a066ff" />
            <rect x="16" y="8" width="3" height="24" rx="1.5" fill="#a066ff" />
            <rect x="21" y="12" width="3" height="16" rx="1.5" fill="#a066ff" />
            <rect x="26" y="16" width="3" height="8" rx="1.5" fill="#a066ff" />
            <path d="M12 20h16" stroke="#a066ff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <div className="logo-text">
              Code<span className="logo-text-pulse">Pulse</span>
            </div>
            <div className="logo-text-sub">Platform</div>
          </div>
        </div>

        {/* Contenido Hero del panel izquierdo según el estado de la vista */}
        {view === 'dashboard' && currentUser ? (
          <div className="brand-content" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(160, 102, 255, 0.2)',
                  border: '2px solid #a066ff',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getAvatarUrl(currentUser.avatarStyle, currentUser.avatarSeed)} 
                  alt="User Avatar"
                  style={{ width: '48px', height: '48px' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>@{currentUser.username}</h3>
                <p style={{ fontSize: '0.85rem', color: '#a066ff', margin: 0 }}>Miembro de la comunidad</p>
              </div>
            </div>
            <h1 className="brand-title" style={{ fontSize: '2rem' }}>
              ¡Hola, <br />
              <span>{currentUser.nombre}</span>!
            </h1>
            <p className="brand-desc">
              Accede a tus cursos, practica en los laboratorios y compite con desarrolladores de todo el mundo.
            </p>
          </div>
        ) : (
          <div className="brand-content">
            <h1 className="brand-title">
              Bienvenido a <br />
              <span>Code Pulse Plataform</span> <br />
              insertar slogan
            </h1>
            <p className="brand-desc">
              En esta plataforma podras aprender, practicar todo lo referente al desarrollo de software.
            </p>
          </div>
        )}

        {/* Footer del panel izquierdo */}
        <div className="brand-footer">
          Creada por:<br />
          <strong>Omega Dev</strong><br />
          <strong>Dancar Dev</strong>
          <div style={{ marginTop: '1.5rem' }}>
            <button 
              onClick={() => {
                localStorage.removeItem('codepulse_users');
                localStorage.removeItem('codepulse_active_session');
                window.location.reload();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
            >
              LIMPIAR STORAGE (MOCK DB)
            </button>
          </div>
        </div>
      </div>

      {/* Panel de la Derecha (Formularios interactivos) */}
      <div className="login-right">
        <div className="form-wrapper">
          {/* Mensajes de Alerta */}
          {alert && (
            <div className={`alert-container alert-${alert.type}`}>
              {alert.type === 'error' ? (
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
              ) : alert.type === 'success' ? (
                <CheckCircle size={20} style={{ flexShrink: 0 }} />
              ) : (
                <Info size={20} style={{ flexShrink: 0 }} />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          {/* RENDERIZADO CONDICIONAL DE FORMULARIOS */}
          
          {/* 1. Formulario de Inicio de Sesión */}
          {view === 'login' && (
            <LoginFormComponent 
              onSuccess={(user, remember) => {
                setCurrentUser(user);
                if (remember) {
                  localStorage.setItem('codepulse_active_session', JSON.stringify(user));
                }
                setTimeout(() => {
                  setView('dashboard');
                  setAlert(null);
                }, 1000);
              }}
              onNavigateToRegister={() => {
                setView('register');
                setAlert(null);
              }}
              onNavigateToForgot={() => {
                setView('forgot_password');
                setAlert(null);
              }}
              setAlert={setAlert}
            />
          )}

          {/* 2. Formulario de Registro Multietapa */}
          {view === 'register' && (
            <RegisterComponent
              onSuccess={() => {
                setView('login');
                setAlert(null);
              }}
              onNavigateToLogin={() => {
                setView('login');
                setAlert(null);
              }}
              setAlert={setAlert}
            />
          )}

          {/* 3. Formulario de Recuperación de Contraseña */}
          {view === 'forgot_password' && (
            <ForgotPasswordComponent
              onSuccess={() => {
                setView('login');
                setAlert(null);
              }}
              onNavigateToLogin={() => {
                setView('login');
                setAlert(null);
              }}
              setAlert={setAlert}
            />
          )}

          {/* 4. Dashboard del usuario logueado */}
          {view === 'dashboard' && currentUser && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', position: 'relative', marginBottom: '1rem' }}>
                  <div 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '50%', 
                      background: 'radial-gradient(circle, #3b1b8c 0%, #0d061c 100%)',
                      border: '3px solid #a066ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(160, 102, 255, 0.3)'
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={getAvatarUrl(currentUser.avatarStyle, currentUser.avatarSeed)} 
                      alt="Logged User Avatar"
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      right: '0', 
                      backgroundColor: '#22c55e', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      border: '3px solid #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Usuario En línea"
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                  </div>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  @{currentUser.username}
                </h2>
                <p style={{ color: '#8b7ca0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {currentUser.nombre} {currentUser.apellido1} {currentUser.apellido2 || ''}
                </p>

                <div 
                  style={{ 
                    backgroundColor: '#0d061c', 
                    border: '1px solid #4a21a5', 
                    borderRadius: '12px', 
                    padding: '0.85rem 1rem', 
                    fontSize: '0.85rem', 
                    color: '#a066ff',
                    display: 'inline-block',
                    marginBottom: '2rem'
                  }}
                >
                  <strong>Correo:</strong> {currentUser.correo}
                </div>
              </div>

              {/* Estadísticas simuladas */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem', 
                  marginBottom: '2.5rem' 
                }}
              >
                <div 
                  style={{ 
                    backgroundColor: '#120926', 
                    border: '1px solid #3b1b8c', 
                    borderRadius: '12px', 
                    padding: '1.25rem', 
                    textAlign: 'center' 
                  }}
                >
                  <BookOpen size={24} style={{ color: '#a066ff', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>0</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b7ca0', textTransform: 'uppercase', fontWeight: 700 }}>Cursos</div>
                </div>

                <div 
                  style={{ 
                    backgroundColor: '#120926', 
                    border: '1px solid #3b1b8c', 
                    borderRadius: '12px', 
                    padding: '1.25rem', 
                    textAlign: 'center' 
                  }}
                >
                  <Trophy size={24} style={{ color: '#a066ff', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>0</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b7ca0', textTransform: 'uppercase', fontWeight: 700 }}>Torneos</div>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-secondary" style={{ borderColor: '#ef4444', color: '#fca5a5' }}>
                <LogOut size={16} /> CERRAR SESIÓN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
