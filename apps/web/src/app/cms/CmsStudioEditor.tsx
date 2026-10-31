'use client';

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Globe,
  Lock,
  Layers,
  BookOpen,
  Settings,
  Sparkles,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Columns,
  LayoutGrid,
  Megaphone,
  Code2,
  Image as ImageIcon,
  Video,
  ListChecks,
  Quote,
  HelpCircle,
  Minus,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  Upload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  BlockType,
  CmsBlock,
  CmsCourse,
  CmsLesson,
  CmsModule,
  TextAlign,
  createDefaultBlock,
} from './CmsBlockTypes';
import CmsBlockRenderer from './CmsBlockRenderer';
import './cms.css';

interface CmsStudioEditorProps {
  initialCourse: CmsCourse;
  onBack: () => void;
  onSaved: (savedId?: string) => void;
}

type DockTab = 'elements' | 'syllabus' | 'settings' | 'templates';

function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

async function compressImageToDataUrl(file: File, maxWidth = 1080, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const TEXT_COLOR_SWATCHES = [
  '#ffffff',
  '#e2e8f0',
  '#cbd5e1',
  '#f43f5e',
  '#c084fc',
  '#22d3ee',
  '#10b981',
  '#fbbf24',
];

const ACCENT_SWATCHES = [
  '#9333ea',
  '#e11d48',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#334155',
];

const BANNER_GRADIENTS = [
  { label: 'CodePulse', value: 'linear-gradient(135deg, #4c1d95 0%, #be123c 100%)' },
  { label: 'Cyber Neon', value: 'linear-gradient(135deg, #0f172a 0%, #0891b2 55%, #4f46e5 100%)' },
  { label: 'Crimson Dark', value: 'linear-gradient(135deg, #1f0614 0%, #9f1239 60%, #e11d48 100%)' },
  { label: 'Violet Matrix', value: 'linear-gradient(135deg, #1e1b4b 0%, #6d28d9 60%, #ec4899 100%)' },
  { label: 'Emerald Ops', value: 'linear-gradient(135deg, #022c22 0%, #059669 100%)' },
];

export default function CmsStudioEditor({
  initialCourse,
  onBack,
  onSaved,
}: CmsStudioEditorProps) {
  const [course, setCourse] = useState<CmsCourse>(() => {
    if (initialCourse.modulos && initialCourse.modulos.length > 0) {
      return initialCourse;
    }
    const firstLesson: CmsLesson = {
      id: `lec_${Date.now()}`,
      titulo: '1.1 Introducción y Arquitectura Base',
      orden: 1,
      tipo: 'lectura',
      duracion_estimada_minutos: 12,
      contenido_bloques: [
        createDefaultBlock('banner'),
        createDefaultBlock('paragraph'),
        createDefaultBlock('table'),
      ],
    };
    const firstMod: CmsModule = {
      id: `mod_${Date.now()}`,
      titulo: 'Módulo 1: Fundamentos Esenciales',
      orden: 1,
      lecciones: [firstLesson],
    };
    return {
      ...initialCourse,
      modulos: [firstMod],
    };
  });

  const [dockTab, setDockTab] = useState<DockTab>('elements');
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [activeLecIdx, setActiveLecIdx] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialCourse.id));

  const blockImageInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);

  const safeModIdx = Math.min(activeModIdx, Math.max(0, course.modulos.length - 1));
  const activeModule = course.modulos[safeModIdx];
  const safeLecIdx = activeModule
    ? Math.min(activeLecIdx, Math.max(0, activeModule.lecciones.length - 1))
    : 0;
  const activeLesson = activeModule?.lecciones[safeLecIdx] || null;

  const selectedBlock =
    activeLesson?.contenido_bloques.find((b) => b.id === selectedBlockId) || null;

  const updateActiveLesson = (updater: (lesson: CmsLesson) => CmsLesson) => {
    setCourse((prev) => {
      const modulos = prev.modulos.map((mod, mIdx) => {
        if (mIdx !== safeModIdx) return mod;
        const lecciones = mod.lecciones.map((lec, lIdx) => {
          if (lIdx !== safeLecIdx) return lec;
          return updater(lec);
        });
        return { ...mod, lecciones };
      });
      return { ...prev, modulos };
    });
  };

  const addBlock = (type: BlockType) => {
    if (!activeLesson) return;
    const newBlock = createDefaultBlock(type);
    updateActiveLesson((lec) => {
      const idx = selectedBlockId
        ? lec.contenido_bloques.findIndex((b) => b.id === selectedBlockId)
        : -1;
      const nextBlocks = [...lec.contenido_bloques];
      if (idx >= 0) {
        nextBlocks.splice(idx + 1, 0, newBlock);
      } else {
        nextBlocks.push(newBlock);
      }
      return { ...lec, contenido_bloques: nextBlocks };
    });
    setSelectedBlockId(newBlock.id);
    if (previewMode) setPreviewMode(false);
  };

  const applyLessonTemplate = (preset: 'theory-code' | 'comparison' | 'quiz-lab') => {
    if (!activeLesson) return;
    let blocks: CmsBlock[] = [];
    if (preset === 'theory-code') {
      blocks = [
        createDefaultBlock('banner'),
        createDefaultBlock('heading2'),
        createDefaultBlock('paragraph'),
        createDefaultBlock('callout'),
        createDefaultBlock('code'),
        createDefaultBlock('list'),
      ];
    } else if (preset === 'comparison') {
      blocks = [
        createDefaultBlock('heading1'),
        createDefaultBlock('paragraph'),
        createDefaultBlock('columns2'),
        createDefaultBlock('heading2'),
        createDefaultBlock('table'),
        createDefaultBlock('quote'),
      ];
    } else {
      blocks = [
        createDefaultBlock('heading1'),
        createDefaultBlock('callout'),
        createDefaultBlock('code'),
        createDefaultBlock('divider'),
        createDefaultBlock('quiz'),
      ];
    }
    updateActiveLesson((lec) => ({
      ...lec,
      contenido_bloques: [...lec.contenido_bloques, ...blocks],
    }));
    if (blocks[0]) setSelectedBlockId(blocks[0].id);
  };

  const updateSelectedBlock = (patch: Partial<CmsBlock>) => {
    if (!selectedBlockId) return;
    updateActiveLesson((lec) => ({
      ...lec,
      contenido_bloques: lec.contenido_bloques.map((b) =>
        b.id === selectedBlockId ? { ...b, ...patch } : b
      ),
    }));
  };

  const moveBlock = (blockId: string, dir: -1 | 1, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateActiveLesson((lec) => {
      const arr = [...lec.contenido_bloques];
      const idx = arr.findIndex((b) => b.id === blockId);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= arr.length) return lec;
      const [item] = arr.splice(idx, 1);
      arr.splice(target, 0, item);
      return { ...lec, contenido_bloques: arr };
    });
  };

  const duplicateBlock = (blockId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let newId = '';
    updateActiveLesson((lec) => {
      const idx = lec.contenido_bloques.findIndex((b) => b.id === blockId);
      if (idx < 0) return lec;
      const copy: CmsBlock = JSON.parse(JSON.stringify(lec.contenido_bloques[idx]));
      copy.id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      newId = copy.id;
      const arr = [...lec.contenido_bloques];
      arr.splice(idx + 1, 0, copy);
      return { ...lec, contenido_bloques: arr };
    });
    if (newId) setSelectedBlockId(newId);
  };

  const deleteBlock = (blockId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateActiveLesson((lec) => ({
      ...lec,
      contenido_bloques: lec.contenido_bloques.filter((b) => b.id !== blockId),
    }));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  // --- Gestión de Módulos y Lecciones ---
  const addModule = () => {
    const newMod: CmsModule = {
      id: `mod_${Date.now()}`,
      titulo: `Módulo ${course.modulos.length + 1}: Nuevo Tema`,
      orden: course.modulos.length + 1,
      lecciones: [
        {
          id: `lec_${Date.now()}_1`,
          titulo: 'Nueva Lección',
          orden: 1,
          tipo: 'lectura',
          duracion_estimada_minutos: 10,
          contenido_bloques: [createDefaultBlock('heading1'), createDefaultBlock('paragraph')],
        },
      ],
    };
    setCourse((prev) => ({ ...prev, modulos: [...prev.modulos, newMod] }));
    setActiveModIdx(course.modulos.length);
    setActiveLecIdx(0);
    setSelectedBlockId(null);
  };

  const deleteModule = (mIdx: number) => {
    if (course.modulos.length <= 1) return;
    setCourse((prev) => ({
      ...prev,
      modulos: prev.modulos.filter((_, idx) => idx !== mIdx),
    }));
    setActiveModIdx(0);
    setActiveLecIdx(0);
    setSelectedBlockId(null);
  };

  const addLessonToModule = (mIdx: number) => {
    const targetMod = course.modulos[mIdx];
    if (!targetMod) return;
    const newLec: CmsLesson = {
      id: `lec_${Date.now()}`,
      titulo: `Lección ${mIdx + 1}.${targetMod.lecciones.length + 1}`,
      orden: targetMod.lecciones.length + 1,
      tipo: 'lectura',
      duracion_estimada_minutos: 10,
      contenido_bloques: [createDefaultBlock('heading1'), createDefaultBlock('paragraph')],
    };
    setCourse((prev) => ({
      ...prev,
      modulos: prev.modulos.map((m, idx) =>
        idx === mIdx ? { ...m, lecciones: [...m.lecciones, newLec] } : m
      ),
    }));
    setActiveModIdx(mIdx);
    setActiveLecIdx(targetMod.lecciones.length);
    setSelectedBlockId(null);
  };

  const deleteLesson = (mIdx: number, lIdx: number) => {
    const mod = course.modulos[mIdx];
    if (!mod || mod.lecciones.length <= 1) return;
    setCourse((prev) => ({
      ...prev,
      modulos: prev.modulos.map((m, idx) =>
        idx === mIdx
          ? { ...m, lecciones: m.lecciones.filter((_, li) => li !== lIdx) }
          : m
      ),
    }));
    setActiveLecIdx(0);
    setSelectedBlockId(null);
  };

  const handleSaveCourse = async (overridePublished?: boolean) => {
    const finalTitle = course.titulo.trim() || 'Curso Sin Título';
    const finalSlug = slugifyText(course.slug || finalTitle) || `curso-${Date.now()}`;
    const finalPublished =
      typeof overridePublished === 'boolean' ? overridePublished : course.publicado;

    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/v1/cms/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          titulo: finalTitle,
          slug: finalSlug,
          publicado: finalPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'No se pudo guardar el curso.');
      }
      setCourse((prev) => ({
        ...prev,
        id: data.id || prev.id,
        titulo: finalTitle,
        slug: finalSlug,
        publicado: finalPublished,
      }));
      setSaveMessage({
        type: 'ok',
        text: finalPublished ? '¡Guardado y publicado en Cursos!' : 'Borrador guardado en Neon DB',
      });
      onSaved(data.id);
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      setSaveMessage({ type: 'err', text: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const imgBlock = createDefaultBlock('image');
      imgBlock.mediaUrl = dataUrl;
      imgBlock.caption = file.name.replace(/\.[^/.]+$/, '');
      updateActiveLesson((lec) => ({
        ...lec,
        contenido_bloques: [...lec.contenido_bloques, imgBlock],
      }));
      setSelectedBlockId(imgBlock.id);
    } catch {
      // ignore invalid drop
    }
  };

  const renderAlignControls = (current: TextAlign = 'left') => (
    <div className="cms-field-group">
      <label className="cms-label">Alineación</label>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {(
          [
            { val: 'left', icon: <AlignLeft size={15} /> },
            { val: 'center', icon: <AlignCenter size={15} /> },
            { val: 'right', icon: <AlignRight size={15} /> },
            { val: 'justify', icon: <AlignJustify size={15} /> },
          ] as { val: TextAlign; icon: React.ReactNode }[]
        ).map((item) => (
          <button
            key={item.val}
            type="button"
            onClick={() => updateSelectedBlock({ align: item.val })}
            className={`cms-pill-toggle ${current === item.val ? 'preview-active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', padding: '0.45rem' }}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="cms-studio-wrapper">
      {/* BARRA SUPERIOR ESTILO CANVA STUDIO */}
      <div className="cms-topbar">
        <div className="cms-topbar-left">
          <button type="button" onClick={onBack} className="cms-back-btn">
            <ArrowLeft size={15} /> Cursos
          </button>

          <input
            type="text"
            value={course.titulo}
            onChange={(e) => {
              const val = e.target.value;
              setCourse((prev) => ({
                ...prev,
                titulo: val,
                slug: slugTouched ? prev.slug : slugifyText(val),
              }));
            }}
            placeholder="Título del Curso..."
            className="cms-course-title-input"
          />

          {saveMessage && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.3rem 0.7rem',
                borderRadius: '999px',
                background:
                  saveMessage.type === 'ok'
                    ? 'rgba(16, 185, 129, 0.14)'
                    : 'rgba(239, 68, 68, 0.16)',
                color: saveMessage.type === 'ok' ? '#6ee7b7' : '#fca5a5',
                border: `1px solid ${
                  saveMessage.type === 'ok'
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(239, 68, 68, 0.4)'
                }`,
                whiteSpace: 'nowrap',
              }}
            >
              {saveMessage.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {saveMessage.text}
            </span>
          )}
        </div>

        <div className="cms-topbar-actions">
          <button
            type="button"
            onClick={() =>
              setCourse((prev) => ({ ...prev, publicado: !prev.publicado }))
            }
            className={`cms-pill-toggle ${course.publicado ? 'active' : ''}`}
            title="Define si el curso es visible para todos los estudiantes en /cursos"
          >
            {course.publicado ? <Globe size={14} /> : <Lock size={14} />}
            {course.publicado ? 'Publicado' : 'Borrador'}
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode((p) => !p)}
            className={`cms-pill-toggle ${previewMode ? 'preview-active' : ''}`}
          >
            {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
            {previewMode ? 'Volver a Editar' : 'Vista Previa'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveCourse()}
            className="cms-save-btn"
          >
            {saving ? <Loader2 size={16} /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar Curso'}
          </button>
        </div>
      </div>

      {/* ESPACIO DE TRABAJO 3 COLUMNAS */}
      <div className={`cms-workspace ${previewMode ? 'preview-mode' : ''}`}>
        {/* PANEL IZQUIERDO: DOCK + DRAWER */}
        <aside className="cms-left-panel">
          <div className="cms-dock">
            <button
              type="button"
              onClick={() => setDockTab('elements')}
              className={`cms-dock-btn ${dockTab === 'elements' ? 'active' : ''}`}
            >
              <Layers size={19} />
              Bloques
            </button>
            <button
              type="button"
              onClick={() => setDockTab('syllabus')}
              className={`cms-dock-btn ${dockTab === 'syllabus' ? 'active' : ''}`}
            >
              <BookOpen size={19} />
              Temario
            </button>
            <button
              type="button"
              onClick={() => setDockTab('templates')}
              className={`cms-dock-btn ${dockTab === 'templates' ? 'active' : ''}`}
            >
              <Sparkles size={19} />
              Plantillas
            </button>
            <button
              type="button"
              onClick={() => setDockTab('settings')}
              className={`cms-dock-btn ${dockTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={19} />
              Ajustes
            </button>
          </div>

          <div className="cms-drawer">
            {dockTab === 'elements' && (
              <>
                <div className="cms-drawer-section-title">Texto &amp; Tipografía</div>
                <div className="cms-tool-grid">
                  <button type="button" onClick={() => addBlock('heading1')} className="cms-tool-tile">
                    <Heading1 size={18} color="#c084fc" />
                    <span>Título H1</span>
                  </button>
                  <button type="button" onClick={() => addBlock('heading2')} className="cms-tool-tile">
                    <Heading2 size={18} color="#f43f5e" />
                    <span>Subtítulo H2</span>
                  </button>
                  <button type="button" onClick={() => addBlock('heading3')} className="cms-tool-tile">
                    <Heading3 size={18} color="#22d3ee" />
                    <span>Encabezado H3</span>
                  </button>
                  <button type="button" onClick={() => addBlock('paragraph')} className="cms-tool-tile">
                    <AlignLeft size={18} color="#cbd5e1" />
                    <span>Párrafo</span>
                  </button>
                  <button type="button" onClick={() => addBlock('list')} className="cms-tool-tile">
                    <ListChecks size={18} color="#10b981" />
                    <span>Lista / Checks</span>
                  </button>
                  <button type="button" onClick={() => addBlock('quote')} className="cms-tool-tile">
                    <Quote size={18} color="#fbbf24" />
                    <span>Cita Destacada</span>
                  </button>
                </div>

                <div className="cms-drawer-section-title">Diseño &amp; Tablas (Canva)</div>
                <div className="cms-tool-grid">
                  <button type="button" onClick={() => addBlock('table')} className="cms-tool-tile">
                    <TableIcon size={18} color="#c084fc" />
                    <span>Tabla Dinámica</span>
                  </button>
                  <button type="button" onClick={() => addBlock('banner')} className="cms-tool-tile">
                    <Megaphone size={18} color="#f43f5e" />
                    <span>Banner Hero</span>
                  </button>
                  <button type="button" onClick={() => addBlock('columns2')} className="cms-tool-tile">
                    <Columns size={18} color="#38bdf8" />
                    <span>2 Columnas</span>
                  </button>
                  <button type="button" onClick={() => addBlock('columns3')} className="cms-tool-tile">
                    <LayoutGrid size={18} color="#a855f7" />
                    <span>3 Tarjetas</span>
                  </button>
                  <button type="button" onClick={() => addBlock('callout')} className="cms-tool-tile">
                    <AlertCircle size={18} color="#fbbf24" />
                    <span>Nota / Alerta</span>
                  </button>
                  <button type="button" onClick={() => addBlock('divider')} className="cms-tool-tile">
                    <Minus size={18} color="#94a3b8" />
                    <span>Separador</span>
                  </button>
                </div>

                <div className="cms-drawer-section-title">Código, Media &amp; Quiz</div>
                <div className="cms-tool-grid">
                  <button type="button" onClick={() => addBlock('code')} className="cms-tool-tile">
                    <Code2 size={18} color="#22d3ee" />
                    <span>Código Fuente</span>
                  </button>
                  <button type="button" onClick={() => addBlock('image')} className="cms-tool-tile">
                    <ImageIcon size={18} color="#f43f5e" />
                    <span>Imagen / Subir</span>
                  </button>
                  <button type="button" onClick={() => addBlock('video')} className="cms-tool-tile">
                    <Video size={18} color="#c084fc" />
                    <span>Video / YouTube</span>
                  </button>
                  <button type="button" onClick={() => addBlock('quiz')} className="cms-tool-tile">
                    <HelpCircle size={18} color="#10b981" />
                    <span>Quiz Interactivo</span>
                  </button>
                </div>
              </>
            )}

            {dockTab === 'syllabus' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <span className="cms-drawer-section-title" style={{ margin: 0 }}>
                    Módulos del Curso
                  </span>
                  <button
                    type="button"
                    onClick={addModule}
                    className="cms-pill-toggle preview-active"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.73rem' }}
                  >
                    <Plus size={13} /> Módulo
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {course.modulos.map((mod, mIdx) => (
                    <div
                      key={mod.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem' }}>
                        <input
                          type="text"
                          value={mod.titulo}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCourse((prev) => ({
                              ...prev,
                              modulos: prev.modulos.map((m, i) =>
                                i === mIdx ? { ...m, titulo: val } : m
                              ),
                            }));
                          }}
                          className="cms-input"
                          style={{ padding: '0.38rem 0.55rem', fontSize: '0.8rem', fontWeight: 700 }}
                        />
                        {course.modulos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteModule(mIdx)}
                            className="cms-mini-icon-btn"
                            title="Eliminar módulo"
                          >
                            <Trash2 size={14} color="#fb7185" />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {mod.lecciones.map((lec, lIdx) => {
                          const isCurrent = mIdx === safeModIdx && lIdx === safeLecIdx;
                          return (
                            <div
                              key={lec.id}
                              onClick={() => {
                                setActiveModIdx(mIdx);
                                setActiveLecIdx(lIdx);
                                setSelectedBlockId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.4rem',
                                padding: '0.48rem 0.6rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: isCurrent
                                  ? 'linear-gradient(90deg, rgba(147,51,234,0.28), rgba(225,29,72,0.22))'
                                  : 'rgba(0,0,0,0.25)',
                                border: isCurrent
                                  ? '1px solid #f43f5e'
                                  : '1px solid rgba(255,255,255,0.06)',
                                fontSize: '0.78rem',
                                color: isCurrent ? '#ffffff' : '#cbd5e1',
                              }}
                            >
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontWeight: isCurrent ? 700 : 500,
                                }}
                              >
                                {lec.titulo}
                              </span>
                              {mod.lecciones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLesson(mIdx, lIdx);
                                  }}
                                  className="cms-mini-icon-btn"
                                  title="Eliminar lección"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => addLessonToModule(mIdx)}
                        style={{
                          marginTop: '0.55rem',
                          width: '100%',
                          padding: '0.4rem',
                          borderRadius: '7px',
                          border: '1px dashed rgba(168, 85, 247, 0.4)',
                          background: 'transparent',
                          color: '#c084fc',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Añadir Lección
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dockTab === 'templates' && (
              <div>
                <div className="cms-drawer-section-title">Diseños Rápidos (1 Clic)</div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 0, marginBottom: '0.9rem' }}>
                  Inserta una estructura profesional prediseñada en la lección actual:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('theory-code')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#f43f5e' }}>Lección de Ingeniería + Código</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Banner Hero + Subtítulo + Explicación + Consejo + Snippet de Código + Checklist.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('comparison')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#c084fc' }}>Comparativa de Arquitectura</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Título H1 + 2 Columnas Pros/Contras + Tabla Comparativa + Cita Técnica.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('quiz-lab')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#22d3ee' }}>Reto Práctico + Autoevaluación</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Encabezado + Nota de Laboratorio + Código Base + Quiz Interactivo.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {dockTab === 'settings' && (
              <div>
                <div className="cms-drawer-section-title">Configuración del Curso</div>

                <div className="cms-field-group">
                  <label className="cms-label">URL / Slug del Curso</label>
                  <input
                    type="text"
                    className="cms-input"
                    value={course.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setCourse((prev) => ({ ...prev, slug: slugifyText(e.target.value) }));
                    }}
                    placeholder="arquitectura-software-pro"
                  />
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Categoría</label>
                  <select
                    className="cms-select"
                    value={course.categoria}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, categoria: e.target.value }))
                    }
                  >
                    <option value="Desarrollo de Software">Desarrollo de Software</option>
                    <option value="Arquitectura de Software">Arquitectura de Software</option>
                    <option value="Ciberseguridad">Ciberseguridad</option>
                    <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Bases de Datos">Bases de Datos</option>
                  </select>
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Nivel Académico</label>
                  <select
                    className="cms-select"
                    value={course.nivel}
                    onChange={(e) =>
                      setCourse((prev) => ({
                        ...prev,
                        nivel: e.target.value as CmsCourse['nivel'],
                      }))
                    }
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Descripción de Catálogo</label>
                  <textarea
                    rows={4}
                    className="cms-textarea"
                    value={course.descripcion}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, descripcion: e.target.value }))
                    }
                    placeholder="Resumen atractivo que verán los estudiantes en /cursos..."
                  />
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Portada del Curso</label>
                  <input
                    type="text"
                    className="cms-input"
                    value={course.imagen_portada_url || ''}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, imagen_portada_url: e.target.value }))
                    }
                    placeholder="https://... o sube una imagen"
                  />
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const dataUrl = await compressImageToDataUrl(f, 960, 0.78);
                      setCourse((prev) => ({ ...prev, imagen_portada_url: dataUrl }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    className="cms-pill-toggle"
                    style={{ justifyContent: 'center', marginTop: '0.35rem' }}
                  >
                    <Upload size={14} /> Subir Portada desde PC
                  </button>
                  {course.imagen_portada_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.imagen_portada_url}
                      alt="Portada"
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        height: 110,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* LIENZO CENTRAL ESTILO PÁGINA CANVA / NOTION */}
        <div
          className="cms-canvas-scroll"
          onClick={() => setSelectedBlockId(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          {activeLesson ? (
            <div className="cms-page-sheet" onClick={(e) => e.stopPropagation()}>
              {/* Metadatos de la Lección Activa */}
              {!previewMode && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    paddingBottom: '1.15rem',
                    marginBottom: '1.5rem',
                    borderBottom: '1px dashed rgba(168, 85, 247, 0.28)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.72rem',
                        color: '#f43f5e',
                        letterSpacing: '0.12em',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {activeModule?.titulo?.toUpperCase()}
                    </span>
                    <input
                      type="text"
                      value={activeLesson.titulo}
                      onChange={(e) =>
                        updateActiveLesson((l) => ({ ...l, titulo: e.target.value }))
                      }
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        width: '100%',
                        outline: 'none',
                      }}
                      placeholder="Título de la lección..."
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      className="cms-select"
                      style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      value={activeLesson.tipo}
                      onChange={(e) =>
                        updateActiveLesson((l) => ({
                          ...l,
                          tipo: e.target.value as CmsLesson['tipo'],
                        }))
                      }
                    >
                      <option value="lectura">Lectura</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                      <option value="examen">Examen</option>
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={activeLesson.duracion_estimada_minutos}
                        onChange={(e) =>
                          updateActiveLesson((l) => ({
                            ...l,
                            duracion_estimada_minutos: Number(e.target.value) || 10,
                          }))
                        }
                        className="cms-input"
                        style={{ width: 64, padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>min</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloques de la Lección */}
              {activeLesson.contenido_bloques.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '4rem 1.5rem',
                    border: '1px dashed rgba(168, 85, 247, 0.35)',
                    borderRadius: '16px',
                  }}
                >
                  <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                    Esta lección está vacía. Elige elementos del panel izquierdo o arrastra imágenes aquí.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => addBlock('banner')} className="cms-pill-toggle preview-active">
                      + Banner Hero
                    </button>
                    <button type="button" onClick={() => addBlock('heading1')} className="cms-pill-toggle">
                      + Título H1
                    </button>
                    <button type="button" onClick={() => addBlock('table')} className="cms-pill-toggle">
                      + Tabla
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: previewMode ? '1.35rem' : '0.4rem' }}>
                  {activeLesson.contenido_bloques.map((block, bIdx) => {
                    if (previewMode) {
                      return <CmsBlockRenderer key={block.id} block={block} />;
                    }
                    const isSelected = selectedBlockId === block.id;
                    return (
                      <div
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        className={`cms-block-wrapper ${isSelected ? 'selected' : ''}`}
                      >
                        {isSelected && (
                          <div className="cms-block-toolbar">
                            <button
                              type="button"
                              onClick={(e) => moveBlock(block.id, -1, e)}
                              disabled={bIdx === 0}
                              className="cms-mini-icon-btn"
                              title="Subir bloque"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => moveBlock(block.id, 1, e)}
                              disabled={bIdx === activeLesson.contenido_bloques.length - 1}
                              className="cms-mini-icon-btn"
                              title="Bajar bloque"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => duplicateBlock(block.id, e)}
                              className="cms-mini-icon-btn"
                              title="Duplicar bloque"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => deleteBlock(block.id, e)}
                              className="cms-mini-icon-btn"
                              title="Eliminar bloque"
                            >
                              <Trash2 size={14} color="#fb7185" />
                            </button>
                          </div>
                        )}
                        <CmsBlockRenderer block={block} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* PANEL DERECHO: INSPECTOR DE PROPIEDADES CONTEXTUAL */}
        {!previewMode && (
          <aside className="cms-inspector">
            {!selectedBlock ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <div className="cms-drawer-section-title">Inspector de Diseño</div>
                <p>
                  Haz clic sobre cualquier bloque en el lienzo central para personalizar sus colores,
                  alineación, filas/columnas de tablas, código o contenido multimedia.
                </p>
                <div
                  style={{
                    marginTop: '1.2rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.22)',
                  }}
                >
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                    Tip Rápido:
                  </strong>
                  Puedes arrastrar y soltar imágenes desde tu computadora directamente sobre la hoja central.
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <span className="cms-drawer-section-title" style={{ margin: 0 }}>
                    Editar: {selectedBlock.type.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteBlock(selectedBlock.id)}
                    className="cms-mini-icon-btn"
                    title="Eliminar bloque"
                  >
                    <Trash2 size={15} color="#fb7185" />
                  </button>
                </div>

                {/* HEADINGS & PARAGRAPH */}
                {(selectedBlock.type === 'heading1' ||
                  selectedBlock.type === 'heading2' ||
                  selectedBlock.type === 'heading3' ||
                  selectedBlock.type === 'paragraph') && (
                  <>
                    {selectedBlock.type === 'heading3' && (
                      <div className="cms-field-group">
                        <label className="cms-label">Etiqueta Superior (Kicker)</label>
                        <input
                          type="text"
                          className="cms-input"
                          value={selectedBlock.subtitle || ''}
                          onChange={(e) => updateSelectedBlock({ subtitle: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="cms-field-group">
                      <label className="cms-label">Texto</label>
                      <textarea
                        rows={selectedBlock.type === 'paragraph' ? 6 : 3}
                        className="cms-textarea"
                        value={selectedBlock.text || ''}
                        onChange={(e) => updateSelectedBlock({ text: e.target.value })}
                      />
                    </div>

                    {renderAlignControls(selectedBlock.align)}

                    {selectedBlock.type === 'heading1' && (
                      <div className="cms-field-group">
                        <label className="cms-label">Efecto Degradado</label>
                        <select
                          className="cms-select"
                          value={selectedBlock.gradientText || 'none'}
                          onChange={(e) => updateSelectedBlock({ gradientText: e.target.value })}
                        >
                          <option value="none">Color Sólido</option>
                          <option value="purple-red">Púrpura → Rojo Carmesí</option>
                          <option value="cyan-blue">Cian → Índigo</option>
                          <option value="gold">Ámbar → Dorado</option>
                        </select>
                      </div>
                    )}

                    {selectedBlock.type === 'paragraph' && (
                      <>
                        <div className="cms-field-group">
                          <label className="cms-label">Tamaño de Letra</label>
                          <select
                            className="cms-select"
                            value={selectedBlock.fontSize || 'md'}
                            onChange={(e) =>
                              updateSelectedBlock({
                                fontSize: e.target.value as CmsBlock['fontSize'],
                              })
                            }
                          >
                            <option value="sm">Pequeño (Notas)</option>
                            <option value="md">Normal (Lectura)</option>
                            <option value="lg">Grande (Destacado)</option>
                            <option value="xl">Extra Grande (Intro)</option>
                          </select>
                        </div>

                        <div className="cms-field-group">
                          <label className="cms-label">Fondo de Tarjeta</label>
                          <select
                            className="cms-select"
                            value={selectedBlock.bgColor || 'transparent'}
                            onChange={(e) => updateSelectedBlock({ bgColor: e.target.value })}
                          >
                            <option value="transparent">Sin fondo</option>
                            <option value="rgba(168, 85, 247, 0.09)">Cristal Púrpura</option>
                            <option value="rgba(225, 29, 72, 0.09)">Cristal Carmesí</option>
                            <option value="rgba(15, 23, 42, 0.85)">Pizarra Oscura</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="cms-field-group">
                      <label className="cms-label">Color de Texto</label>
                      <div className="cms-swatch-row">
                        {TEXT_COLOR_SWATCHES.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() =>
                              updateSelectedBlock({ color: hex, gradientText: 'none' })
                            }
                            className={`cms-color-swatch ${
                              selectedBlock.color === hex ? 'active' : ''
                            }`}
                            style={{ background: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* BANNER HERO */}
                {selectedBlock.type === 'banner' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Insignia Superior</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.badgeText || ''}
                        onChange={(e) => updateSelectedBlock({ badgeText: e.target.value })}
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Título del Banner</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.text || ''}
                        onChange={(e) => updateSelectedBlock({ text: e.target.value })}
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Subtítulo</label>
                      <textarea
                        rows={3}
                        className="cms-textarea"
                        value={selectedBlock.subtitle || ''}
                        onChange={(e) => updateSelectedBlock({ subtitle: e.target.value })}
                      />
                    </div>
                    {renderAlignControls(selectedBlock.align)}
                    <div className="cms-field-group">
                      <label className="cms-label">Estilo de Fondo</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {BANNER_GRADIENTS.map((g) => (
                          <button
                            key={g.label}
                            type="button"
                            onClick={() => updateSelectedBlock({ bannerGradient: g.value })}
                            style={{
                              background: g.value,
                              border:
                                selectedBlock.bannerGradient === g.value
                                  ? '2px solid #ffffff'
                                  : '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              padding: '0.5rem 0.75rem',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Botón Opcional (Texto)</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.buttonText || ''}
                        onChange={(e) => updateSelectedBlock({ buttonText: e.target.value })}
                        placeholder="Ej. Ver Repositorio"
                      />
                    </div>
                    {selectedBlock.buttonText && (
                      <div className="cms-field-group">
                        <label className="cms-label">Enlace del Botón</label>
                        <input
                          type="text"
                          className="cms-input"
                          value={selectedBlock.buttonUrl || ''}
                          onChange={(e) => updateSelectedBlock({ buttonUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </>
                )}

                {/* TABLA DINÁMICA */}
                {selectedBlock.type === 'table' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Color de Cabecera</label>
                      <div className="cms-swatch-row">
                        {ACCENT_SWATCHES.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => updateSelectedBlock({ tableAccent: hex })}
                            className={`cms-color-swatch ${
                              selectedBlock.tableAccent === hex ? 'active' : ''
                            }`}
                            style={{ background: hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="cms-field-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.striped)}
                          onChange={(e) => updateSelectedBlock({ striped: e.target.checked })}
                        />
                        Alternar color en filas pares
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                      <button
                        type="button"
                        className="cms-pill-toggle"
                        onClick={() => {
                          const headers = [...(selectedBlock.headers || []), `Col ${(selectedBlock.headers?.length || 0) + 1}`];
                          const rows = (selectedBlock.rows || []).map((r) => [...r, '-']);
                          updateSelectedBlock({ headers, rows });
                        }}
                      >
                        + Columna
                      </button>
                      <button
                        type="button"
                        className="cms-pill-toggle"
                        onClick={() => {
                          if ((selectedBlock.headers?.length || 0) <= 1) return;
                          const headers = (selectedBlock.headers || []).slice(0, -1);
                          const rows = (selectedBlock.rows || []).map((r) => r.slice(0, -1));
                          updateSelectedBlock({ headers, rows });
                        }}
                      >
                        - Columna
                      </button>
                      <button
                        type="button"
                        className="cms-pill-toggle preview-active"
                        onClick={() => {
                          const cols = selectedBlock.headers?.length || 2;
                          const rows = [...(selectedBlock.rows || []), Array(cols).fill('Nuevo dato')];
                          updateSelectedBlock({ rows });
                        }}
                      >
                        + Fila
                      </button>
                      <button
                        type="button"
                        className="cms-pill-toggle"
                        onClick={() => {
                          if ((selectedBlock.rows?.length || 0) <= 1) return;
                          updateSelectedBlock({ rows: (selectedBlock.rows || []).slice(0, -1) });
                        }}
                      >
                        - Fila
                      </button>
                    </div>

                    <div className="cms-field-group">
                      <label className="cms-label">Encabezados de Columna</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {(selectedBlock.headers || []).map((h, hIdx) => (
                          <input
                            key={hIdx}
                            type="text"
                            className="cms-input"
                            value={h}
                            onChange={(e) => {
                              const next = [...(selectedBlock.headers || [])];
                              next[hIdx] = e.target.value;
                              updateSelectedBlock({ headers: next });
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="cms-field-group">
                      <label className="cms-label">Celdas por Fila</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {(selectedBlock.rows || []).map((row, rIdx) => (
                          <div
                            key={rIdx}
                            style={{
                              padding: '0.55rem',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem',
                            }}
                          >
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                              FILA {rIdx + 1}
                            </span>
                            {row.map((cell, cIdx) => (
                              <input
                                key={cIdx}
                                type="text"
                                className="cms-input"
                                style={{ padding: '0.4rem 0.55rem', fontSize: '0.8rem' }}
                                value={cell}
                                placeholder={selectedBlock.headers?.[cIdx] || `Col ${cIdx + 1}`}
                                onChange={(e) => {
                                  const nextRows = (selectedBlock.rows || []).map((r, ri) =>
                                    ri === rIdx
                                      ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                      : r
                                  );
                                  updateSelectedBlock({ rows: nextRows });
                                }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* COLUMNAS (2 O 3 TARJETAS) */}
                {(selectedBlock.type === 'columns2' || selectedBlock.type === 'columns3') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {(selectedBlock.columns || []).map((col, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(168,85,247,0.22)',
                        }}
                      >
                        <label className="cms-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                          Tarjeta {cIdx + 1}
                        </label>
                        <input
                          type="text"
                          className="cms-input"
                          style={{ marginBottom: '0.45rem' }}
                          value={col.title}
                          onChange={(e) => {
                            const cols = [...(selectedBlock.columns || [])];
                            cols[cIdx] = { ...cols[cIdx], title: e.target.value };
                            updateSelectedBlock({ columns: cols });
                          }}
                        />
                        <textarea
                          rows={3}
                          className="cms-textarea"
                          style={{ marginBottom: '0.45rem' }}
                          value={col.content}
                          onChange={(e) => {
                            const cols = [...(selectedBlock.columns || [])];
                            cols[cIdx] = { ...cols[cIdx], content: e.target.value };
                            updateSelectedBlock({ columns: cols });
                          }}
                        />
                        <div className="cms-swatch-row">
                          {TEXT_COLOR_SWATCHES.slice(3).map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => {
                                const cols = [...(selectedBlock.columns || [])];
                                cols[cIdx] = { ...cols[cIdx], accent: hex };
                                updateSelectedBlock({ columns: cols });
                              }}
                              className={`cms-color-swatch ${col.accent === hex ? 'active' : ''}`}
                              style={{ background: hex, width: 22, height: 22 }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CALLOUT / NOTA */}
                {selectedBlock.type === 'callout' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Tipo de Nota</label>
                      <select
                        className="cms-select"
                        value={selectedBlock.calloutVariant || 'tip'}
                        onChange={(e) =>
                          updateSelectedBlock({
                            calloutVariant: e.target.value as CmsBlock['calloutVariant'],
                          })
                        }
                      >
                        <option value="tip">Consejo / Tip (Púrpura)</option>
                        <option value="info">Información Técnica (Azul)</option>
                        <option value="warning">Advertencia (Ámbar)</option>
                        <option value="danger">Seguridad / Crítico (Rojo)</option>
                      </select>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Título</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.calloutTitle || ''}
                        onChange={(e) => updateSelectedBlock({ calloutTitle: e.target.value })}
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Mensaje</label>
                      <textarea
                        rows={4}
                        className="cms-textarea"
                        value={selectedBlock.text || ''}
                        onChange={(e) => updateSelectedBlock({ text: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* CÓDIGO FUENTE */}
                {selectedBlock.type === 'code' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Lenguaje</label>
                      <select
                        className="cms-select"
                        value={selectedBlock.language || 'python'}
                        onChange={(e) => updateSelectedBlock({ language: e.target.value })}
                      >
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript / Next.js</option>
                        <option value="javascript">JavaScript</option>
                        <option value="sql">SQL / PostgreSQL</option>
                        <option value="bash">Bash / Terminal</option>
                        <option value="dockerfile">Dockerfile</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Nombre de Archivo</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.filename || ''}
                        onChange={(e) => updateSelectedBlock({ filename: e.target.value })}
                        placeholder="app.py"
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Código</label>
                      <textarea
                        rows={10}
                        className="cms-textarea"
                        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                        value={selectedBlock.code || ''}
                        onChange={(e) => updateSelectedBlock({ code: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* IMAGEN */}
                {selectedBlock.type === 'image' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Subir desde tu Dispositivo</label>
                      <input
                        ref={blockImageInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const dataUrl = await compressImageToDataUrl(f);
                          updateSelectedBlock({ mediaUrl: dataUrl });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => blockImageInputRef.current?.click()}
                        className="cms-pill-toggle preview-active"
                        style={{ justifyContent: 'center' }}
                      >
                        <Upload size={14} /> Elegir Imagen Local
                      </button>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">O Pegar URL de Imagen</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.mediaUrl || ''}
                        onChange={(e) => updateSelectedBlock({ mediaUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Ancho ({selectedBlock.widthPercent || 100}%)</label>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[45, 65, 85, 100].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => updateSelectedBlock({ widthPercent: w })}
                            className={`cms-pill-toggle ${
                              (selectedBlock.widthPercent || 100) === w ? 'preview-active' : ''
                            }`}
                            style={{ flex: 1, justifyContent: 'center', padding: '0.35rem' }}
                          >
                            {w}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Pie de Imagen</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.caption || ''}
                        onChange={(e) => updateSelectedBlock({ caption: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* VIDEO */}
                {selectedBlock.type === 'video' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">URL de YouTube o MP4</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.mediaUrl || ''}
                        onChange={(e) => updateSelectedBlock({ mediaUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Descripción / Pie de Video</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.caption || ''}
                        onChange={(e) => updateSelectedBlock({ caption: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* LISTA / CHECKLIST */}
                {selectedBlock.type === 'list' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Estilo de Lista</label>
                      <select
                        className="cms-select"
                        value={selectedBlock.listStyle || 'check'}
                        onChange={(e) =>
                          updateSelectedBlock({
                            listStyle: e.target.value as CmsBlock['listStyle'],
                          })
                        }
                      >
                        <option value="check">Checklist con Íconos</option>
                        <option value="bullet">Viñetas Clásicas</option>
                        <option value="number">Lista Numerada (Pasos)</option>
                      </select>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Elementos</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(selectedBlock.items || []).map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.35rem' }}>
                            <input
                              type="text"
                              className="cms-input"
                              value={it}
                              onChange={(e) => {
                                const next = [...(selectedBlock.items || [])];
                                next[idx] = e.target.value;
                                updateSelectedBlock({ items: next });
                              }}
                            />
                            <button
                              type="button"
                              className="cms-mini-icon-btn"
                              onClick={() => {
                                const next = (selectedBlock.items || []).filter((_, i) => i !== idx);
                                updateSelectedBlock({ items: next });
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              items: [...(selectedBlock.items || []), 'Nuevo punto clave'],
                            })
                          }
                          className="cms-pill-toggle preview-active"
                          style={{ justifyContent: 'center', marginTop: '0.3rem' }}
                        >
                          + Añadir Punto
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* CITA */}
                {selectedBlock.type === 'quote' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Cita</label>
                      <textarea
                        rows={4}
                        className="cms-textarea"
                        value={selectedBlock.text || ''}
                        onChange={(e) => updateSelectedBlock({ text: e.target.value })}
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Autor / Fuente</label>
                      <input
                        type="text"
                        className="cms-input"
                        value={selectedBlock.author || ''}
                        onChange={(e) => updateSelectedBlock({ author: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* QUIZ INTERACTIVO */}
                {selectedBlock.type === 'quiz' && (
                  <>
                    <div className="cms-field-group">
                      <label className="cms-label">Pregunta</label>
                      <textarea
                        rows={3}
                        className="cms-textarea"
                        value={selectedBlock.question || ''}
                        onChange={(e) => updateSelectedBlock({ question: e.target.value })}
                      />
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Opciones (Marca la correcta)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {(selectedBlock.options || []).map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="radio"
                              name="quiz_correct_opt"
                              checked={(selectedBlock.correctIndex ?? 0) === idx}
                              onChange={() => updateSelectedBlock({ correctIndex: idx })}
                              title="Marcar como respuesta correcta"
                            />
                            <input
                              type="text"
                              className="cms-input"
                              value={opt}
                              onChange={(e) => {
                                const next = [...(selectedBlock.options || [])];
                                next[idx] = e.target.value;
                                updateSelectedBlock({ options: next });
                              }}
                            />
                            {(selectedBlock.options?.length || 0) > 2 && (
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() => {
                                  const next = (selectedBlock.options || []).filter((_, i) => i !== idx);
                                  updateSelectedBlock({ options: next, correctIndex: 0 });
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              options: [...(selectedBlock.options || []), 'Nueva opción'],
                            })
                          }
                          className="cms-pill-toggle"
                          style={{ justifyContent: 'center', marginTop: '0.3rem' }}
                        >
                          + Añadir Opción
                        </button>
                      </div>
                    </div>
                    <div className="cms-field-group">
                      <label className="cms-label">Explicación de retroalimentación</label>
                      <textarea
                        rows={3}
                        className="cms-textarea"
                        value={selectedBlock.explanation || ''}
                        onChange={(e) => updateSelectedBlock({ explanation: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* DIVIDER */}
                {selectedBlock.type === 'divider' && (
                  <div className="cms-field-group">
                    <label className="cms-label">Estilo de Separador</label>
                    <select
                      className="cms-select"
                      value={selectedBlock.dividerStyle || 'gradient'}
                      onChange={(e) =>
                        updateSelectedBlock({
                          dividerStyle: e.target.value as CmsBlock['dividerStyle'],
                        })
                      }
                    >
                      <option value="gradient">Línea Neón Púrpura-Carmesí</option>
                      <option value="line">Línea Sutil Clásica</option>
                      <option value="space">Espacio en Blanco</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

