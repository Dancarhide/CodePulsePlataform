'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  AlertCircle, 
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
  rol?: string;
}

export default function LoginComponent() {
  const router = useRouter();

  // Vistas de la pantalla: 'login' (Iniciar sesión), 'register' (Registrarse), 'forgot_password' (Recuperar contraseña)
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  // Sistema de alertas superior
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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
          avatarSeed: 'admin',
          rol: 'admin'
        };
        localStorage.setItem('codepulse_users', JSON.stringify([defaultUser]));
      }

      // Comprobar si hay una sesión activa persistida en localStorage
      const activeSession = localStorage.getItem('codepulse_active_session');
      if (activeSession) {
        try {
          JSON.parse(activeSession);
          router.replace('/home');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router]);

  // Efecto para limpiar las alertas automáticamente después de 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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

        {/* Contenido Hero del panel izquierdo */}
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

        {/* Footer del panel izquierdo */}
        <div className="brand-footer">
          Creada por:<br />
          <strong>Omega Dev</strong><br />
          <strong>Dancar Dev</strong>
        </div>
      </div>

      {/* Panel de la Derecha (Formularios interactivos) */}
      <div className="login-right">
        <div className="form-wrapper">
          {/* Mensajes de Alerta */}
          {alert && (
            <div className={`alert-container alert-${alert.type}`}>
              <span>{alert.message}</span>
            </div>
          )}

          {/* RENDERIZADO CONDICIONAL DE FORMULARIOS */}
          
          {/* 1. Formulario de Inicio de Sesión */}
          {view === 'login' && (
            <LoginFormComponent 
              onSuccess={(user) => {
                localStorage.setItem('codepulse_active_session', JSON.stringify(user));
                setTimeout(() => {
                  router.push('/home');
                }, 600);
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
        </div>
      </div>
    </div>
  );
}
