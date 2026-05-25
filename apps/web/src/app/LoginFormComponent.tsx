'use client';

import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaGithub } from 'react-icons/fa';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from './LoginComponent';

// Interfaz para las propiedades del componente de inicio de sesión
interface LoginFormProps {
  onSuccess: (user: UserProfile, remember: boolean) => void; // Llamado cuando el login es correcto
  onNavigateToRegister: () => void; // Cambiar a la vista de registro
  onNavigateToForgot: () => void; // Cambiar a la vista de recuperar contraseña
  setAlert: (alert: { type: 'success' | 'error' | 'info'; message: string } | null) => void; // Cambiar alertas
}

export default function LoginFormComponent({
  onSuccess,
  onNavigateToRegister,
  onNavigateToForgot,
  setAlert
}: LoginFormProps) {
  // Estados para los campos del formulario
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Manejador del envío del formulario de inicio de sesión
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos vacíos
    if (!loginEmail || !loginPassword) {
      setAlert({ type: 'error', message: 'Por favor, introduce tu correo y contraseña.' });
      return;
    }

    // Obtener los usuarios registrados de localStorage
    const storedUsers = localStorage.getItem('codepulse_users');
    if (storedUsers) {
      const users: UserProfile[] = JSON.parse(storedUsers);
      // Buscar usuario que coincida con correo y contraseña
      const user = users.find(
        (u) => u.correo.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
      );

      if (user) {
        setAlert({ type: 'success', message: '¡Sesión iniciada con éxito!' });
        onSuccess(user, rememberMe);
      } else {
        setAlert({ type: 'error', message: 'El correo electrónico o la contraseña son incorrectos.' });
      }
    } else {
      setAlert({ type: 'error', message: 'El correo electrónico o la contraseña son incorrectos.' });
    }
  };

  return (
    <>
      {/* Título de la sección */}
      <h2 className="form-title">INICIAR SESION</h2>

      <form onSubmit={handleLogin}>
        {/* Campo de Correo Electrónico */}
        <div className="form-group">
          <label className="form-label">CORREO ELECTRONICO</label>
          <input
            type="email"
            className="form-input"
            placeholder="ingresa tu correo electrónico"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="form-group">
          <label className="form-label">CONTRASEÑA</label>
          <div className="password-wrapper">
            <input
              type={showLoginPassword ? "text" : "password"}
              className="form-input"
              placeholder="ingresa tu contraseña"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            {/* Botón para ver/ocultar contraseña */}
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Opciones adicionales: Recordarme y Olvidé contraseña */}
        <div className="form-options">
          <label className="checkbox-container">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Recordarme</span>
          </label>
          {/* Enlace para recuperar contraseña */}
          <span
            className="forgot-link"
            onClick={onNavigateToForgot}
            style={{ cursor: 'pointer' }}
          >
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        {/* Botón de Enviar */}
        <button type="submit" className="btn-submit">
          INICIAR SESION
        </button>
      </form>

      {/* Opción para registrarse */}
      <div className="signup-prompt">
        ¿Primera vez?
        <span className="signup-link" onClick={onNavigateToRegister}>
          Registrate.
        </span>
      </div>

      {/* Separador de opciones sociales */}
      <div className="social-separator">
        o continua con
      </div>

      {/* Botones de inicio de sesión social */}
      <div className="social-grid">
        <button className="social-button" aria-label="Iniciar sesión con Google">
          <FcGoogle size={22} />
        </button>
        <button className="social-button" aria-label="Iniciar sesión con Facebook">
          <FaFacebook size={22} color="#ffffff" />
        </button>
        <button className="social-button" aria-label="Iniciar sesión con GitHub">
          <FaGithub size={22} color="#ffffff" />
        </button>
      </div>
    </>
  );
}
