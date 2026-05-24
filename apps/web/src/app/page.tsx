'use client';

import React from 'react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaGithub } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div className="login-container">

      {/*Panel izquierda*/}
      <div className="login-left">
        {/* Circulos */}
        <div className="blob blob-top" />
        <div className="blob blob-bottom-left" />
        <div className="blob blob-bottom-right" />

        {/* Logo Codigo */}
        <div className="brand-logo-section">
          {/* Logo */}
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

        {/* Hero  */}
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

        {/* Authores Footer */}
        <div className="brand-footer">
          Creada por:<br />
          <strong>Omega Dev</strong><br />
          <strong>Dancar Dev</strong>
        </div>
      </div>

      {/* Panel de la derecha */}
      <div className="login-right">
        <div className="form-wrapper">
          <h2 className="form-title">INICIAR SESION</h2>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Correo*/}
            <div className="form-group">
              <label className="form-label">CORREO ELECTRONICO</label>
              <input
                type="email"
                className="form-input"
                placeholder="ingresa tu correo electrónico"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label className="form-label">CONTRASEÑA</label>
              <input
                type="password"
                className="form-input"
                placeholder="ingresa tu contraseña"
                required
              />
            </div>

            {/* Opciones */}
            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" className="checkbox-input" />
                <span>Recordarme</span>
              </label>
              <Link href="#" className="forgot-link">
                ¿Olvidastes tu contraseña?
              </Link>
            </div>

            {/* Enviar */}
            <button type="submit" className="btn-submit">
              INICIAR SESION
            </button>
          </form>

          {/* Registrarse boton */}
          <div className="signup-prompt">
            ¿Primera vez?
            <Link href="#" className="signup-link">
              Registrate.
            </Link>
          </div>

          {/* separador */}
          <div className="social-separator">
            o continua con
          </div>

          {/* Opciones para iniciar sesion */}
          <div className="social-grid">
            {/* Google */}
            <button className="social-button" aria-label="Iniciar sesión con Google">
              <FcGoogle size={22} />
            </button>

            {/* Facebook */}
            <button className="social-button" aria-label="Iniciar sesión con Facebook">
              <FaFacebook size={22} color="#ffffff" />
            </button>

            {/* Github */}
            <button className="social-button" aria-label="Iniciar sesión con GitHub">
              <FaGithub size={22} color="#ffffff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
