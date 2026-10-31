'use client';

import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  FlaskConical,
  Plus,
  Trash2,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Play,
  Send,
  Lightbulb,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Code2,
} from 'lucide-react';
import {
  ExamQuestion,
  ExamQuestionKind,
  ExamUnitConfig,
  LabCriterion,
  LabUnitConfig,
  createDefaultExamConfig,
  createDefaultLabConfig,
} from './CmsBlockTypes';
import { renderRichInline } from './CmsBlockRenderer';

/* =====================================================================
   1. CONSTRUCTOR EXCLUSIVO DE EXÁMENES (CMS ADMIN)
   ===================================================================== */

export function CmsExamBuilder({
  title,
  pesoPuntos,
  config,
  onChangeMeta,
  onChangeConfig,
}: {
  title: string;
  pesoPuntos: number;
  config?: ExamUnitConfig;
  onChangeMeta: (patch: { titulo?: string; peso_puntos?: number; duracion_estimada_minutos?: number }) => void;
  onChangeConfig: (next: ExamUnitConfig) => void;
}) {
  const exam = config || createDefaultExamConfig();

  const addQuestion = (kind: ExamQuestionKind) => {
    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    let nextQ: ExamQuestion = {
      id,
      kind,
      enunciado: 'Escribe aquí el enunciado de la pregunta...',
      puntos: 10,
      options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correctIndex: 0,
      explanation: 'Justificación técnica de la respuesta correcta.',
    };

    if (kind === 'boolean') {
      nextQ = {
        ...nextQ,
        enunciado: 'Indica si la siguiente afirmación técnica es verdadera o falsa:',
        options: ['Verdadero', 'Falso'],
        correctIndex: 0,
      };
    } else if (kind === 'multiple') {
      nextQ = {
        ...nextQ,
        enunciado: 'Selecciona TODAS las opciones que apliquen correctamente:',
        correctIndices: [0, 1],
      };
    } else if (kind === 'command') {
      nextQ = {
        ...nextQ,
        enunciado: 'Escribe el comando o palabra clave exacta:',
        options: [],
        expectedCommand: 'docker ps',
      };
    }

    onChangeConfig({
      ...exam,
      preguntas: [...exam.preguntas, nextQ],
    });
  };

  const updateQuestion = (qIdx: number, patch: Partial<ExamQuestion>) => {
    const next = exam.preguntas.map((q, idx) => (idx === qIdx ? { ...q, ...patch } : q));
    onChangeConfig({ ...exam, preguntas: next });
  };

  const moveQuestion = (qIdx: number, dir: -1 | 1) => {
    const target = qIdx + dir;
    if (target < 0 || target >= exam.preguntas.length) return;
    const arr = [...exam.preguntas];
    const [moved] = arr.splice(qIdx, 1);
    arr.splice(target, 0, moved);
    onChangeConfig({ ...exam, preguntas: arr });
  };

  const removeQuestion = (qIdx: number) => {
    if (exam.preguntas.length <= 1) return;
    onChangeConfig({
      ...exam,
      preguntas: exam.preguntas.filter((_, idx) => idx !== qIdx),
    });
  };

  const totalQuestionPoints = exam.preguntas.reduce((acc, q) => acc + (Number(q.puntos) || 10), 0);

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Cabecera de Plantilla de Examen */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(225, 29, 72, 0.18))',
          border: '1px solid rgba(244, 63, 94, 0.45)',
          borderRadius: '18px',
          padding: '1.75rem 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.8rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.28rem 0.8rem',
              borderRadius: '999px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid #f43f5e',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#fda4af',
            }}
          >
            <FileQuestion size={14} /> PLANTILLA EXCLUSIVA DE EXAMEN EVALUABLE
          </span>

          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 700 }}>
            {exam.preguntas.length} reactivos • Suma interna: {totalQuestionPoints} pts
          </span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => onChangeMeta({ titulo: e.target.value })}
          placeholder="Título del Examen..."
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.28)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '10px',
            padding: '0.65rem 0.9rem',
            color: '#ffffff',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.55rem',
            fontWeight: 800,
            outline: 'none',
            marginBottom: '1rem',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="cms-label">Peso en el Progreso (Pts)</label>
            <input
              type="number"
              min={5}
              max={300}
              className="cms-input"
              value={pesoPuntos}
              onChange={(e) => onChangeMeta({ peso_puntos: Math.max(1, Number(e.target.value) || 50) })}
            />
          </div>
          <div>
            <label className="cms-label">Nota Mínima Aprobatoria (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              className="cms-input"
              value={exam.notaMinima}
              onChange={(e) =>
                onChangeConfig({ ...exam, notaMinima: Math.min(100, Math.max(10, Number(e.target.value) || 70)) })
              }
            />
          </div>
          <div>
            <label className="cms-label">Tiempo Límite (Min, 0=Libre)</label>
            <input
              type="number"
              min={0}
              max={240}
              className="cms-input"
              value={exam.tiempoLimiteMinutos}
              onChange={(e) => {
                const mins = Math.max(0, Number(e.target.value) || 0);
                onChangeConfig({ ...exam, tiempoLimiteMinutos: mins });
                if (mins > 0) onChangeMeta({ duracion_estimada_minutos: mins });
              }}
            />
          </div>
          <div>
            <label className="cms-label">Intentos Máx (0=Ilimitados)</label>
            <input
              type="number"
              min={0}
              max={20}
              className="cms-input"
              value={exam.intentosMaximos}
              onChange={(e) =>
                onChangeConfig({ ...exam, intentosMaximos: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
        </div>

        <div style={{ marginTop: '0.9rem' }}>
          <label className="cms-label">Instrucciones para el Alumno</label>
          <textarea
            rows={2}
            className="cms-textarea"
            value={exam.instrucciones}
            onChange={(e) => onChangeConfig({ ...exam, instrucciones: e.target.value })}
          />
        </div>
      </div>

      {/* Barra para Agregar Nuevos Tipos de Pregunta */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          padding: '0.9rem 1.2rem',
          borderRadius: '14px',
          background: '#0d071c',
          border: '1px solid rgba(168, 85, 247, 0.3)',
        }}
      >
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#c084fc' }}>
          AGREGAR PREGUNTA AL EXAMEN:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          <button type="button" onClick={() => addQuestion('single')} className="cms-pill-toggle preview-active">
            <Plus size={14} /> Opción Múltiple
          </button>
          <button type="button" onClick={() => addQuestion('boolean')} className="cms-pill-toggle">
            <Plus size={14} /> Verdadero / Falso
          </button>
          <button type="button" onClick={() => addQuestion('multiple')} className="cms-pill-toggle">
            <Plus size={14} /> Selección Múltiple
          </button>
          <button type="button" onClick={() => addQuestion('command')} className="cms-pill-toggle">
            <Plus size={14} /> Comando / Código Exacto
          </button>
        </div>
      </div>

      {/* Lista de Preguntas */}
      {exam.preguntas.map((q, qIdx) => (
        <div
          key={q.id}
          style={{
            background: '#0b0617',
            border: '1px solid rgba(168, 85, 247, 0.26)',
            borderRadius: '16px',
            padding: '1.4rem 1.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  padding: '0.22rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(147, 51, 234, 0.25)',
                  color: '#e9d5ff',
                  fontFamily: 'monospace',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                }}
              >
                PREGUNTA {qIdx + 1}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase' }}>
                {q.kind === 'single'
                  ? 'Opción Única'
                  : q.kind === 'boolean'
                  ? 'Verdadero / Falso'
                  : q.kind === 'multiple'
                  ? 'Casillas Múltiples'
                  : 'Respuesta de Comando / Código'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Valor:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={q.puntos}
                onChange={(e) => updateQuestion(qIdx, { puntos: Math.max(1, Number(e.target.value) || 10) })}
                className="cms-input"
                style={{ width: 64, padding: '0.28rem 0.45rem', fontSize: '0.8rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>pts</span>

              <button type="button" onClick={() => moveQuestion(qIdx, -1)} className="cms-mini-icon-btn" title="Subir">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => moveQuestion(qIdx, 1)} className="cms-mini-icon-btn" title="Bajar">
                <ArrowDown size={14} />
              </button>
              {exam.preguntas.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qIdx)} className="cms-mini-icon-btn" title="Eliminar">
                  <Trash2 size={14} color="#fb7185" />
                </button>
              )}
            </div>
          </div>

          <div className="cms-field-group">
            <label className="cms-label">Enunciado de la Pregunta</label>
            <textarea
              rows={2}
              className="cms-textarea"
              value={q.enunciado}
              onChange={(e) => updateQuestion(qIdx, { enunciado: e.target.value })}
            />
          </div>

          <div className="cms-field-group">
            <label className="cms-label">Fragmento de Código de Apoyo (Opcional)</label>
            <textarea
              rows={2}
              className="cms-textarea"
              style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              placeholder="Opcional: pega código que el alumno deba analizar para responder..."
              value={q.codeSnippet || ''}
              onChange={(e) => updateQuestion(qIdx, { codeSnippet: e.target.value })}
            />
          </div>

          {/* Opciones según el tipo */}
          {(q.kind === 'single' || q.kind === 'boolean') && (
            <div className="cms-field-group">
              <label className="cms-label">Opciones (Marca el círculo de la respuesta correcta)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name={`exam_q_${q.id}`}
                      checked={(q.correctIndex ?? 0) === oIdx}
                      onChange={() => updateQuestion(qIdx, { correctIndex: oIdx })}
                    />
                    <input
                      type="text"
                      className="cms-input"
                      disabled={q.kind === 'boolean'}
                      value={opt}
                      onChange={(e) => {
                        const nextOpts = [...q.options];
                        nextOpts[oIdx] = e.target.value;
                        updateQuestion(qIdx, { options: nextOpts });
                      }}
                    />
                    {q.kind === 'single' && q.options.length > 2 && (
                      <button
                        type="button"
                        className="cms-mini-icon-btn"
                        onClick={() => {
                          const nextOpts = q.options.filter((_, i) => i !== oIdx);
                          updateQuestion(qIdx, { options: nextOpts, correctIndex: 0 });
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {q.kind === 'single' && (
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(qIdx, { options: [...q.options, `Opción ${q.options.length + 1}`] })
                    }
                    className="cms-pill-toggle"
                    style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                  >
                    + Añadir Opción
                  </button>
                )}
              </div>
            </div>
          )}

          {q.kind === 'multiple' && (
            <div className="cms-field-group">
              <label className="cms-label">Opciones (Marca TODAS las casillas correctas)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {q.options.map((opt, oIdx) => {
                  const checked = (q.correctIndices || []).includes(oIdx);
                  return (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const set = new Set(q.correctIndices || []);
                          if (e.target.checked) set.add(oIdx);
                          else set.delete(oIdx);
                          updateQuestion(qIdx, { correctIndices: Array.from(set).sort() });
                        }}
                      />
                      <input
                        type="text"
                        className="cms-input"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...q.options];
                          nextOpts[oIdx] = e.target.value;
                          updateQuestion(qIdx, { options: nextOpts });
                        }}
                      />
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    updateQuestion(qIdx, { options: [...q.options, `Opción ${q.options.length + 1}`] })
                  }
                  className="cms-pill-toggle"
                  style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                >
                  + Añadir Opción
                </button>
              </div>
            </div>
          )}

          {q.kind === 'command' && (
            <div className="cms-field-group">
              <label className="cms-label">Respuesta Exacta / Comando Esperado</label>
              <input
                type="text"
                className="cms-input"
                style={{ fontFamily: 'monospace' }}
                value={q.expectedCommand || ''}
                onChange={(e) => updateQuestion(qIdx, { expectedCommand: e.target.value })}
                placeholder="Ej. SELECT, PATCH, git rebase, chmod 600..."
              />
            </div>
          )}

          <div className="cms-field-group" style={{ marginBottom: 0 }}>
            <label className="cms-label">Retroalimentación / Explicación</label>
            <input
              type="text"
              className="cms-input"
              value={q.explanation || ''}
              onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
              placeholder="Se muestra al finalizar el examen..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
   2. CONSTRUCTOR EXCLUSIVO DE LABORATORIOS / ACTIVIDADES (CMS ADMIN)
   ===================================================================== */

export function CmsLabBuilder({
  title,
  pesoPuntos,
  config,
  onChangeMeta,
  onChangeConfig,
}: {
  title: string;
  pesoPuntos: number;
  config?: LabUnitConfig;
  onChangeMeta: (patch: { titulo?: string; peso_puntos?: number; duracion_estimada_minutos?: number }) => void;
  onChangeConfig: (next: LabUnitConfig) => void;
}) {
  const lab = config || createDefaultLabConfig();
  const [tokenInput, setTokenInput] = useState('');

  const addCriterion = () => {
    const item: LabCriterion = {
      id: `rub_${Date.now()}`,
      titulo: 'Nuevo criterio técnico a evaluar',
      puntos: 25,
    };
    onChangeConfig({ ...lab, rubrica: [...(lab.rubrica || []), item] });
  };

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2), rgba(147, 51, 234, 0.22))',
          border: '1px solid rgba(34, 211, 238, 0.45)',
          borderRadius: '18px',
          padding: '1.75rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.28rem 0.8rem',
              borderRadius: '999px',
              background: 'rgba(34, 211, 238, 0.16)',
              border: '1px solid #22d3ee',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#67e8f9',
            }}
          >
            <FlaskConical size={14} /> PLANTILLA EXCLUSIVA DE LABORATORIO / ACTIVIDAD PRÁCTICA
          </span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => onChangeMeta({ titulo: e.target.value })}
          placeholder="Título del Laboratorio o Proyecto..."
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.28)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '10px',
            padding: '0.65rem 0.9rem',
            color: '#ffffff',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.55rem',
            fontWeight: 800,
            outline: 'none',
            marginBottom: '1rem',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="cms-label">Peso en el Progreso (Pts)</label>
            <input
              type="number"
              min={5}
              max={300}
              className="cms-input"
              value={pesoPuntos}
              onChange={(e) => onChangeMeta({ peso_puntos: Math.max(1, Number(e.target.value) || 30) })}
            />
          </div>

          <div>
            <label className="cms-label">Modo de Evaluación</label>
            <select
              className="cms-select"
              value={lab.modoCalificacion}
              onChange={(e) =>
                onChangeConfig({
                  ...lab,
                  modoCalificacion: e.target.value as LabUnitConfig['modoCalificacion'],
                })
              }
            >
              <option value="ambos">Auto-Validación + Opción Revisión Admin</option>
              <option value="auto">100% Automática por Tests/Tokens</option>
              <option value="manual">Revisión Manual del Admin en CMS</option>
            </select>
          </div>

          <div>
            <label className="cms-label">Entorno / Lenguaje</label>
            <select
              className="cms-select"
              value={lab.entorno}
              onChange={(e) => onChangeConfig({ ...lab, entorno: e.target.value })}
            >
              <option value="Python">Python / FastAPI</option>
              <option value="TypeScript">TypeScript / Next.js</option>
              <option value="SQL">PostgreSQL / SQL</option>
              <option value="Bash / Linux">Bash / Ciberseguridad</option>
              <option value="Docker">Docker / Cloud</option>
              <option value="Full-Stack">Arquitectura Full-Stack</option>
            </select>
          </div>

          <div>
            <label className="cms-label">Dificultad</label>
            <select
              className="cms-select"
              value={lab.dificultad}
              onChange={(e) =>
                onChangeConfig({
                  ...lab,
                  dificultad: e.target.value as LabUnitConfig['dificultad'],
                })
              }
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Planteamiento e Instrucciones */}
      <div
        style={{
          background: '#0b0617',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <div className="cms-field-group">
          <label className="cms-label">Contexto / Escenario del Problema</label>
          <textarea
            rows={3}
            className="cms-textarea"
            value={lab.escenario}
            onChange={(e) => onChangeConfig({ ...lab, escenario: e.target.value })}
          />
        </div>

        <div className="cms-field-group">
          <label className="cms-label">Instrucciones Paso a Paso de la Actividad</label>
          <textarea
            rows={5}
            className="cms-textarea"
            value={lab.instrucciones}
            onChange={(e) => onChangeConfig({ ...lab, instrucciones: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div className="cms-field-group">
            <label className="cms-label">URL de Repositorio Base / Recursos (Opcional)</label>
            <input
              type="text"
              className="cms-input"
              value={lab.repoBaseUrl || ''}
              onChange={(e) => onChangeConfig({ ...lab, repoBaseUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="cms-field-group">
            <label className="cms-label">Pista de Ayuda (Opcional)</label>
            <input
              type="text"
              className="cms-input"
              value={lab.pista || ''}
              onChange={(e) => onChangeConfig({ ...lab, pista: e.target.value })}
            />
          </div>
        </div>

        <div className="cms-field-group" style={{ marginBottom: 0 }}>
          <label className="cms-label">Código Inicial / Boilerplate para el Estudiante</label>
          <textarea
            rows={6}
            className="cms-textarea"
            style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
            value={lab.starterCode || ''}
            onChange={(e) => onChangeConfig({ ...lab, starterCode: e.target.value })}
          />
        </div>
      </div>

      {/* Entregables y Validación Automática */}
      <div
        style={{
          background: '#0b0617',
          border: '1px solid rgba(34, 211, 238, 0.28)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <div className="cms-drawer-section-title" style={{ marginTop: 0 }}>
          Entregables Solicitados y Criterios de Validación
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lab.pideCodigo}
              onChange={(e) => onChangeConfig({ ...lab, pideCodigo: e.target.checked })}
            />
            Solicitar Código / Script en Editor
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lab.pideRepoUrl}
              onChange={(e) => onChangeConfig({ ...lab, pideRepoUrl: e.target.checked })}
            />
            Solicitar Enlace GitHub / Demo
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lab.pideReporte}
              onChange={(e) => onChangeConfig({ ...lab, pideReporte: e.target.checked })}
            />
            Solicitar Notas / Conclusión Técnica
          </label>
        </div>

        {lab.modoCalificacion !== 'manual' && (
          <div className="cms-field-group">
            <label className="cms-label">
              Tokens / Expresiones Clave que el Validador Automático Verifica en el Código
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {(lab.tokensObligatorios || []).map((tk, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    background: 'rgba(34, 211, 238, 0.14)',
                    border: '1px solid rgba(34, 211, 238, 0.45)',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#67e8f9',
                  }}
                >
                  {tk}
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig({
                        ...lab,
                        tokensObligatorios: lab.tokensObligatorios.filter((_, i) => i !== idx),
                      })
                    }
                    style={{ background: 'none', border: 'none', color: '#fda4af', cursor: 'pointer', padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="cms-input"
                style={{ fontFamily: 'monospace' }}
                placeholder="Ej. @app.post, SELECT, async, try, Docker..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tokenInput.trim()) {
                    e.preventDefault();
                    onChangeConfig({
                      ...lab,
                      tokensObligatorios: [...(lab.tokensObligatorios || []), tokenInput.trim()],
                    });
                    setTokenInput('');
                  }
                }}
              />
              <button
                type="button"
                className="cms-pill-toggle preview-active"
                onClick={() => {
                  if (!tokenInput.trim()) return;
                  onChangeConfig({
                    ...lab,
                    tokensObligatorios: [...(lab.tokensObligatorios || []), tokenInput.trim()],
                  });
                  setTokenInput('');
                }}
              >
                + Agregar Regla
              </button>
            </div>
          </div>
        )}

        {/* Rúbrica */}
        <div className="cms-field-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="cms-label">Rúbrica / Checklist de Evaluación</label>
            <button type="button" onClick={addCriterion} className="cms-pill-toggle" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
              + Criterio
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {(lab.rubrica || []).map((crit, cIdx) => (
              <div key={crit.id} style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="cms-input"
                  value={crit.titulo}
                  onChange={(e) => {
                    const next = [...lab.rubrica];
                    next[cIdx] = { ...next[cIdx], titulo: e.target.value };
                    onChangeConfig({ ...lab, rubrica: next });
                  }}
                />
                <input
                  type="number"
                  className="cms-input"
                  style={{ width: 80 }}
                  value={crit.puntos}
                  onChange={(e) => {
                    const next = [...lab.rubrica];
                    next[cIdx] = { ...next[cIdx], puntos: Number(e.target.value) || 20 };
                    onChangeConfig({ ...lab, rubrica: next });
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>%</span>
                <button
                  type="button"
                  className="cms-mini-icon-btn"
                  onClick={() =>
                    onChangeConfig({
                      ...lab,
                      rubrica: lab.rubrica.filter((_, i) => i !== cIdx),
                    })
                  }
                >
                  <Trash2 size={14} color="#fb7185" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   3. EJECUTOR DE EXAMEN PARA EL ESTUDIANTE (/cursos/[slug])
   ===================================================================== */

export function StudentExamRunner({
  unitTitle,
  pesoPuntos,
  config,
  existingRecord,
  onSubmitExam,
}: {
  unitTitle: string;
  pesoPuntos: number;
  config?: ExamUnitConfig;
  existingRecord?: any;
  onSubmitExam: (result: {
    calificacion: number;
    aprobado: boolean;
    answers: Record<string, any>;
  }) => Promise<void>;
}) {
  const exam = config || createDefaultExamConfig();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  const attemptsUsed = Number(existingRecord?.intentos || 0);
  const maxAttemptsReached =
    exam.intentosMaximos > 0 &&
    attemptsUsed >= exam.intentosMaximos &&
    existingRecord?.estado !== 'aprobado';

  useEffect(() => {
    setStarted(false);
    setAnswers({});
    setLastResult(null);
    setSecondsLeft(null);
  }, [unitTitle]);

  useEffect(() => {
    if (!started || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, secondsLeft]);

  const startAttempt = () => {
    setAnswers({});
    setLastResult(null);
    setStarted(true);
    if (exam.tiempoLimiteMinutos > 0) {
      setSecondsLeft(exam.tiempoLimiteMinutos * 60);
    }
  };

  const evaluateQuestion = (q: ExamQuestion, ans: any): boolean => {
    if (q.kind === 'single' || q.kind === 'boolean') {
      return Number(ans) === Number(q.correctIndex ?? 0);
    }
    if (q.kind === 'multiple') {
      const expected = [...(q.correctIndices || [])].sort().join(',');
      const given = Array.isArray(ans) ? [...ans].sort().join(',') : '';
      return expected.length > 0 && expected === given;
    }
    if (q.kind === 'command') {
      return (
        String(ans || '').trim().toLowerCase() ===
        String(q.expectedCommand || '').trim().toLowerCase()
      );
    }
    return false;
  };

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    let earned = 0;
    let total = 0;
    exam.preguntas.forEach((q) => {
      const pts = Number(q.puntos) || 10;
      total += pts;
      if (evaluateQuestion(q, answers[q.id])) {
        earned += pts;
      }
    });
    const score = total > 0 ? Math.round((earned / total) * 100) : 100;
    const passed = score >= exam.notaMinima;

    try {
      await onSubmitExam({ calificacion: score, aprobado: passed, answers });
      setLastResult({ score, passed });
      setStarted(false);
      setSecondsLeft(null);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tarjeta Resumen del Examen */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(147,51,234,0.18), rgba(225,29,72,0.16))',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: '18px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: 800, color: '#fda4af', letterSpacing: '0.12em' }}>
              EVALUACIÓN OFICIAL • VALOR: {pesoPuntos} PTS EN EL CURSO
            </span>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.85rem', margin: '0.25rem 0 0.5rem' }}>
              {unitTitle}
            </h2>
            <p style={{ color: '#e2e8f0', margin: 0, fontSize: '0.94rem', lineHeight: 1.6 }}>
              {exam.instrucciones}
            </p>
          </div>

          {started && secondsLeft !== null && (
            <div
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: '12px',
                background: secondsLeft < 60 ? 'rgba(239,68,68,0.25)' : 'rgba(0,0,0,0.45)',
                border: `1px solid ${secondsLeft < 60 ? '#ef4444' : '#f43f5e'}`,
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Clock size={18} color="#f43f5e" />
              {formatTimer(secondsLeft)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '1.15rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
          <span>Preguntas: <strong>{exam.preguntas.length}</strong></span>
          <span>Nota mínima: <strong>{exam.notaMinima}%</strong></span>
          <span>
            Tiempo: <strong>{exam.tiempoLimiteMinutos > 0 ? `${exam.tiempoLimiteMinutos} min` : 'Sin límite'}</strong>
          </span>
          <span>
            Intentos: <strong>{exam.intentosMaximos > 0 ? `${attemptsUsed}/${exam.intentosMaximos}` : 'Ilimitados'}</strong>
          </span>
        </div>

        {/* Estado previo o resultado recién obtenido */}
        {(lastResult || existingRecord) && !started && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background:
                (lastResult ? lastResult.passed : existingRecord?.estado === 'aprobado')
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${
                (lastResult ? lastResult.passed : existingRecord?.estado === 'aprobado')
                  ? '#10b981'
                  : '#ef4444'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {(lastResult ? lastResult.passed : existingRecord?.estado === 'aprobado') ? (
                <CheckCircle2 size={22} color="#10b981" />
              ) : (
                <XCircle size={22} color="#ef4444" />
              )}
              <div>
                <strong style={{ color: '#ffffff' }}>
                  {(lastResult ? lastResult.passed : existingRecord?.estado === 'aprobado')
                    ? `¡Examen Aprobado! (+${pesoPuntos} pts acreditados)`
                    : 'Aún no alcanzas la nota mínima aprobatoria'}
                </strong>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Calificación registrada:{' '}
                  <strong>
                    {lastResult ? lastResult.score : Math.round(Number(existingRecord?.calificacion || 0))}%
                  </strong>{' '}
                  (Mínimo requerido: {exam.notaMinima}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {!started && !maxAttemptsReached && (
          <button
            type="button"
            onClick={startAttempt}
            style={{
              marginTop: '1.35rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.6rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(90deg, #9333ea, #e11d48)',
              color: '#ffffff',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <Play size={16} />
            {existingRecord ? 'Realizar Nuevo Intento' : 'Comenzar Examen Ahora'}
          </button>
        )}
      </div>

      {/* Preguntas Activas */}
      {started && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {exam.preguntas.map((q, idx) => (
            <div
              key={q.id}
              style={{
                background: 'rgba(14, 8, 28, 0.92)',
                border: '1px solid rgba(168, 85, 247, 0.28)',
                borderRadius: '16px',
                padding: '1.4rem 1.6rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#c084fc', fontWeight: 700 }}>
                  REACTIVO {idx + 1} DE {exam.preguntas.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700 }}>
                  {q.puntos} pts
                </span>
              </div>

              <h4 style={{ margin: '0 0 0.85rem', fontSize: '1.08rem', color: '#ffffff', lineHeight: 1.5 }}>
                {renderRichInline(q.enunciado)}
              </h4>

              {q.codeSnippet && (
                <pre
                  style={{
                    margin: '0 0 1rem',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '10px',
                    background: '#06030c',
                    border: '1px solid rgba(168,85,247,0.25)',
                    fontFamily: "'Fira Code', Consolas, monospace",
                    fontSize: '0.84rem',
                    color: '#f8fafc',
                    overflowX: 'auto',
                  }}
                >
                  <code>{q.codeSnippet}</code>
                </pre>
              )}

              {(q.kind === 'single' || q.kind === 'boolean') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, oIdx) => {
                    const selected = answers[q.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: selected ? '1.5px solid #f43f5e' : '1px solid rgba(255,255,255,0.12)',
                          background: selected ? 'rgba(244,63,94,0.14)' : 'rgba(255,255,255,0.03)',
                          color: '#f1f5f9',
                          fontSize: '0.93rem',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.kind === 'multiple' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, oIdx) => {
                    const curr: number[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                    const selected = curr.includes(oIdx);
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          const next = selected
                            ? curr.filter((x) => x !== oIdx)
                            : [...curr, oIdx];
                          setAnswers((prev) => ({ ...prev, [q.id]: next }));
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: selected ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
                          background: selected ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.03)',
                          color: '#f1f5f9',
                          fontSize: '0.93rem',
                          cursor: 'pointer',
                        }}
                      >
                        {selected ? '☑ ' : '☐ '} {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.kind === 'command' && (
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Escribe tu respuesta o comando aquí..."
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    background: '#06030c',
                    border: '1px solid rgba(34,211,238,0.4)',
                    color: '#22d3ee',
                    fontFamily: "'Fira Code', Consolas, monospace",
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinish}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.85rem 1.8rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                color: '#ffffff',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <Send size={16} />
              {submitting ? 'Calificando Examen...' : 'Enviar y Calificar Examen'}
            </button>
          </div>
        </div>
      )}

      {/* Retroalimentación tras terminar */}
      {lastResult && exam.mostrarRespuestasAlFinal && !started && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem', margin: 0, color: '#c084fc' }}>
            REVISIÓN DE REACTIVOS
          </h4>
          {exam.preguntas.map((q, idx) => {
            const ok = evaluateQuestion(q, answers[q.id]);
            return (
              <div
                key={q.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                  {idx + 1}. {q.enunciado}
                </div>
                {q.explanation && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   4. WORKSPACE DE LABORATORIO PRÁCTICO PARA EL ESTUDIANTE (/cursos/[slug])
   ===================================================================== */

export function StudentLabWorkspace({
  unitTitle,
  pesoPuntos,
  config,
  existingRecord,
  onSubmitLab,
}: {
  unitTitle: string;
  pesoPuntos: number;
  config?: LabUnitConfig;
  existingRecord?: any;
  onSubmitLab: (payload: {
    estado: 'aprobado' | 'pendiente_revision';
    calificacion: number;
    code: string;
    repoUrl: string;
    report: string;
  }) => Promise<void>;
}) {
  const lab = config || createDefaultLabConfig();
  const prevPayload = existingRecord?.payload_entrega || {};

  const [code, setCode] = useState<string>(prevPayload.code || lab.starterCode || '');
  const [repoUrl, setRepoUrl] = useState<string>(prevPayload.repoUrl || '');
  const [report, setReport] = useState<string>(prevPayload.report || '');
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState<{
    ok: boolean;
    messages: string[];
  } | null>(null);

  useEffect(() => {
    const saved = existingRecord?.payload_entrega || {};
    setCode(saved.code ?? lab.starterCode ?? '');
    setRepoUrl(saved.repoUrl ?? '');
    setReport(saved.report ?? '');
    setValidationFeedback(null);
  }, [unitTitle, existingRecord, lab.starterCode]);

  const runChecks = (): { passed: boolean; details: string[] } => {
    const details: string[] = [];
    let allPassed = true;

    if (lab.pideCodigo) {
      const minLen = lab.longitudMinimaCodigo || 20;
      if (code.trim().length < minLen) {
        allPassed = false;
        details.push(`✖ El código enviado es demasiado corto (mínimo ${minLen} caracteres).`);
      } else {
        details.push('✔ Longitud mínima de implementación verificada.');
      }

      (lab.tokensObligatorios || []).forEach((tk) => {
        if (code.toLowerCase().includes(tk.toLowerCase())) {
          details.push(`✔ Se detectó estructura requerida: "${tk}"`);
        } else {
          allPassed = false;
          details.push(`✖ Falta incluir o implementar: "${tk}"`);
        }
      });
    }

    if (lab.pideRepoUrl && !lab.pideCodigo && !repoUrl.trim().startsWith('http')) {
      allPassed = false;
      details.push('✖ Debes proporcionar un enlace válido (https://...) a tu repositorio o entrega.');
    }

    return { passed: allPassed, details };
  };

  const handleDeliver = async (sendForManualReview = false) => {
    setSubmitting(true);
    try {
      if (lab.modoCalificacion === 'manual' || sendForManualReview) {
        await onSubmitLab({
          estado: 'pendiente_revision',
          calificacion: 0,
          code,
          repoUrl,
          report,
        });
        setValidationFeedback({
          ok: true,
          messages: [
            '✔ Tu laboratorio fue enviado al panel del Instructor / Admin para revisión manual.',
          ],
        });
        return;
      }

      const check = runChecks();
      setValidationFeedback({ ok: check.passed, messages: check.details });

      if (check.passed) {
        await onSubmitLab({
          estado: 'aprobado',
          calificacion: 100,
          code,
          repoUrl,
          report,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado de Actividad Práctica */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(8,145,178,0.18), rgba(147,51,234,0.18))',
          border: '1px solid rgba(34, 211, 238, 0.4)',
          borderRadius: '18px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: 800, color: '#67e8f9', letterSpacing: '0.12em' }}>
            LABORATORIO ENTREGABLE • {lab.entorno.toUpperCase()} • VALOR: {pesoPuntos} PTS
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              fontWeight: 700,
            }}
          >
            Dificultad: {lab.dificultad.toUpperCase()}
          </span>
        </div>

        <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.85rem', margin: '0 0 0.65rem' }}>
          {unitTitle}
        </h2>
        <p style={{ color: '#e2e8f0', lineHeight: 1.65, margin: '0 0 1rem' }}>
          {renderRichInline(lab.escenario)}
        </p>

        <div
          style={{
            padding: '1.1rem 1.3rem',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.32)',
            border: '1px solid rgba(255,255,255,0.09)',
            whiteSpace: 'pre-wrap',
            fontSize: '0.92rem',
            lineHeight: 1.65,
            color: '#cbd5e1',
          }}
        >
          <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
            Instrucciones de la Actividad:
          </strong>
          {renderRichInline(lab.instrucciones)}
        </div>

        {lab.repoBaseUrl && (
          <a
            href={lab.repoBaseUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              background: 'rgba(34,211,238,0.16)',
              border: '1px solid #22d3ee',
              color: '#67e8f9',
              fontWeight: 700,
              fontSize: '0.84rem',
              textDecoration: 'none',
            }}
          >
            Abrir Repositorio Plantilla <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Estado de Entrega / Calificación del Instructor */}
      {existingRecord && (
        <div
          style={{
            padding: '1.1rem 1.35rem',
            borderRadius: '14px',
            background:
              existingRecord.estado === 'aprobado'
                ? 'rgba(16,185,129,0.14)'
                : existingRecord.estado === 'pendiente_revision'
                ? 'rgba(245,158,11,0.14)'
                : 'rgba(239,68,68,0.14)',
            border: `1px solid ${
              existingRecord.estado === 'aprobado'
                ? '#10b981'
                : existingRecord.estado === 'pendiente_revision'
                ? '#f59e0b'
                : '#ef4444'
            }`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: '#ffffff' }}>
            {existingRecord.estado === 'aprobado' ? (
              <>
                <ShieldCheck size={20} color="#10b981" />
                Laboratorio Acreditado (+{pesoPuntos} pts sumados a tu progreso • Nota:{' '}
                {Math.round(Number(existingRecord.calificacion || 100))}%)
              </>
            ) : existingRecord.estado === 'pendiente_revision' ? (
              <>
                <Clock size={20} color="#fbbf24" />
                Entrega enviada — En espera de revisión del Instructor / Administrador
              </>
            ) : (
              <>
                <AlertTriangle size={20} color="#ef4444" />
                Entrega requiere ajustes antes de acreditar los puntos
              </>
            )}
          </div>
          {existingRecord.retroalimentacion && (
            <div style={{ marginTop: '0.55rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
              <strong>Retroalimentación del Instructor:</strong> {existingRecord.retroalimentacion}
            </div>
          )}
        </div>
      )}

      {/* Rúbrica */}
      {lab.rubrica && lab.rubrica.length > 0 && (
        <div
          style={{
            background: 'rgba(14,8,28,0.85)',
            border: '1px solid rgba(168,85,247,0.25)',
            borderRadius: '14px',
            padding: '1.2rem 1.4rem',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
            CRITERIOS DE EVALUACIÓN
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {lab.rubrica.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#cbd5e1' }}>
                <span>• {r.titulo}</span>
                <strong style={{ color: '#f43f5e' }}>{r.puntos}%</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de Trabajo y Entrega del Estudiante */}
      <div
        style={{
          background: '#080411',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
        }}
      >
        {lab.pideCodigo && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="cms-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Code2 size={14} color="#22d3ee" /> Editor de Solución ({lab.entorno})
              </label>
              <button
                type="button"
                onClick={() => setCode(lab.starterCode || '')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <RotateCcw size={12} /> Restaurar código inicial
              </button>
            </div>
            <textarea
              rows={11}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                background: '#040208',
                border: '1px solid rgba(34,211,238,0.35)',
                borderRadius: '12px',
                padding: '1.1rem',
                color: '#f8fafc',
                fontFamily: "'Fira Code', Consolas, monospace",
                fontSize: '0.86rem',
                lineHeight: 1.65,
                outline: 'none',
              }}
              placeholder="Escribe o pega tu código aquí..."
            />
          </div>
        )}

        {lab.pideRepoUrl && (
          <div>
            <label className="cms-label">Enlace a Repositorio GitHub / Despliegue</label>
            <input
              type="text"
              className="cms-input"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/tu-usuario/proyecto-lab"
            />
          </div>
        )}

        {lab.pideReporte && (
          <div>
            <label className="cms-label">Notas Técnicas / Explicación de tu Solución</label>
            <textarea
              rows={3}
              className="cms-textarea"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Describe brevemente tu arquitectura, comandos usados o decisiones técnicas..."
            />
          </div>
        )}

        {/* Consola de Resultados de Validación */}
        {validationFeedback && (
          <div
            style={{
              padding: '1rem 1.2rem',
              borderRadius: '12px',
              background: '#05080f',
              border: `1px solid ${validationFeedback.ok ? '#10b981' : '#ef4444'}`,
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            {validationFeedback.messages.map((m, i) => (
              <div key={i} style={{ color: m.startsWith('✔') ? '#6ee7b7' : '#fca5a5' }}>
                {m}
              </div>
            ))}
          </div>
        )}

        {lab.pista && (
          <div>
            <button
              type="button"
              onClick={() => setShowHint((h) => !h)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fbbf24',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: 0,
              }}
            >
              <Lightbulb size={14} /> {showHint ? 'Ocultar Pista' : 'Ver Pista Técnica'}
            </button>
            {showHint && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#fde68a' }}>
                {lab.pista}
              </div>
            )}
          </div>
        )}

        {/* Botones de Acción */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {lab.modoCalificacion !== 'manual' && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDeliver(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(90deg, #0891b2, #9333ea)',
                color: '#ffffff',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <Play size={15} />
              {submitting ? 'Validando...' : `Ejecutar Tests y Acreditar (+${pesoPuntos} pts)`}
            </button>
          )}

          {(lab.modoCalificacion === 'manual' || lab.modoCalificacion === 'ambos') && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDeliver(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.4rem',
                borderRadius: '10px',
                border: '1px solid #f43f5e',
                background:
                  lab.modoCalificacion === 'manual'
                    ? 'linear-gradient(90deg, #9333ea, #e11d48)'
                    : 'rgba(244, 63, 94, 0.14)',
                color: '#ffffff',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.98rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <Award size={15} />
              Enviar a Revisión del Instructor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

