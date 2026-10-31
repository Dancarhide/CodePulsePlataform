'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Undo2,
  Redo2,
  Move,
  Terminal as TerminalIcon,
  FolderKanban,
  ChevronDown,
  GitBranch,
  BarChart3,
  RotateCw,
  Tag,
  MousePointerClick,
  MonitorPlay,
  Sliders,
  Download,
  FileUp,
  Search,
  Maximize2,
  FileQuestion,
  FlaskConical,
  Puzzle,
} from 'lucide-react';
import {
  BlockBoxStyle,
  BlockType,
  CmsBlock,
  CmsCourse,
  CmsLesson,
  CmsModule,
  LessonPageSettings,
  TextAlign,
  UnitFormat,
  createDefaultBlock,
  createDefaultExamConfig,
  createDefaultLabConfig,
} from './CmsBlockTypes';
import CmsBlockRenderer from './CmsBlockRenderer';
import {
  CmsExamBuilder,
  CmsLabBuilder,
  StudentExamRunner,
  StudentLabWorkspace,
} from './CmsExamAndLabBuilders';
import './cms.css';

interface CmsStudioEditorProps {
  initialCourse: CmsCourse;
  onBack: () => void;
  onSaved: (savedId?: string) => void;
}

type DockTab = 'elements' | 'syllabus' | 'page' | 'templates' | 'settings';
type InspectorTab = 'content' | 'style';

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

interface CatalogTool {
  type: BlockType;
  label: string;
  category: 'canva' | 'text' | 'structure' | 'code_media' | 'interactive';
  icon: React.ReactNode;
}

const TOOL_CATALOG: CatalogTool[] = [
  // Libertad Visual (Canva)
  { type: 'canvas_free', label: 'Lienzo Libre', category: 'canva', icon: <Move size={18} color="#f43f5e" /> },
  { type: 'banner', label: 'Banner Hero', category: 'canva', icon: <Megaphone size={18} color="#c084fc" /> },
  { type: 'columns2', label: '2 Columnas', category: 'canva', icon: <Columns size={18} color="#38bdf8" /> },
  { type: 'columns3', label: '3 Tarjetas', category: 'canva', icon: <LayoutGrid size={18} color="#a855f7" /> },
  { type: 'stats', label: 'Métricas KPI', category: 'canva', icon: <BarChart3 size={18} color="#10b981" /> },
  { type: 'badges', label: 'Chips / Stack', category: 'canva', icon: <Tag size={18} color="#fbbf24" /> },
  { type: 'cta_buttons', label: 'Botones CTA', category: 'canva', icon: <MousePointerClick size={18} color="#f43f5e" /> },
  { type: 'divider', label: 'Separador', category: 'canva', icon: <Minus size={18} color="#94a3b8" /> },

  // Texto y Editorial
  { type: 'heading1', label: 'Título H1', category: 'text', icon: <Heading1 size={18} color="#c084fc" /> },
  { type: 'heading2', label: 'Subtítulo H2', category: 'text', icon: <Heading2 size={18} color="#f43f5e" /> },
  { type: 'heading3', label: 'Encabezado H3', category: 'text', icon: <Heading3 size={18} color="#22d3ee" /> },
  { type: 'paragraph', label: 'Párrafo Rico', category: 'text', icon: <AlignLeft size={18} color="#cbd5e1" /> },
  { type: 'list', label: 'Lista / Checks', category: 'text', icon: <ListChecks size={18} color="#10b981" /> },
  { type: 'quote', label: 'Cita Destacada', category: 'text', icon: <Quote size={18} color="#fbbf24" /> },
  { type: 'callout', label: 'Nota / Alerta', category: 'text', icon: <AlertCircle size={18} color="#fb7185" /> },

  // Tablas y Estructuras
  { type: 'table', label: 'Tabla Dinámica', category: 'structure', icon: <TableIcon size={18} color="#c084fc" /> },
  { type: 'tabs', label: 'Pestañas (Tabs)', category: 'structure', icon: <FolderKanban size={18} color="#38bdf8" /> },
  { type: 'accordion', label: 'Acordeón FAQ', category: 'structure', icon: <ChevronDown size={18} color="#f43f5e" /> },
  { type: 'steps', label: 'Pasos / Roadmap', category: 'structure', icon: <GitBranch size={18} color="#10b981" /> },
  { type: 'architecture', label: 'Diagrama Nodos', category: 'structure', icon: <Sliders size={18} color="#a855f7" /> },

  // Código, Terminal y Multimedia
  { type: 'code', label: 'Código Fuente', category: 'code_media', icon: <Code2 size={18} color="#22d3ee" /> },
  { type: 'terminal', label: 'Terminal HUD', category: 'code_media', icon: <TerminalIcon size={18} color="#34d399" /> },
  { type: 'image', label: 'Imagen / Subir', category: 'code_media', icon: <ImageIcon size={18} color="#f43f5e" /> },
  { type: 'video', label: 'Video / YouTube', category: 'code_media', icon: <Video size={18} color="#c084fc" /> },
  { type: 'embed', label: 'Embed / Iframe', category: 'code_media', icon: <MonitorPlay size={18} color="#fbbf24" /> },

  // Interactividad & Evaluación
  { type: 'quiz', label: 'Quiz Evaluable', category: 'interactive', icon: <HelpCircle size={18} color="#10b981" /> },
  { type: 'code_challenge', label: 'Reto Código/CLI', category: 'interactive', icon: <TerminalIcon size={18} color="#22d3ee" /> },
  { type: 'fill_blank', label: 'Completar Huecos', category: 'interactive', icon: <Puzzle size={18} color="#c084fc" /> },
  { type: 'flashcards', label: 'Flashcards 3D', category: 'interactive', icon: <RotateCw size={18} color="#f43f5e" /> },
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
      configuracion_pagina: {
        maxWidth: 'standard',
        sheetBg: '#0b0617',
        pattern: 'grid',
      },
      contenido_bloques: [
        createDefaultBlock('canvas_free'),
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

  // Historial Undo / Redo
  const [past, setPast] = useState<CmsCourse[]>([]);
  const [future, setFuture] = useState<CmsCourse[]>([]);

  const commitCourseChange = useCallback((updater: (prev: CmsCourse) => CmsCourse) => {
    setCourse((prev) => {
      const next = updater(prev);
      setPast((h) => [...h.slice(-24), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setPast((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setCourse((curr) => {
        setFuture((f) => [curr, ...f.slice(0, 24)]);
        return previous;
      });
      return h.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const nextState = f[0];
      setCourse((curr) => {
        setPast((h) => [...h.slice(-24), curr]);
        return nextState;
      });
      return f.slice(1);
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const [dockTab, setDockTab] = useState<DockTab>('elements');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [toolSearch, setToolSearch] = useState('');
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [activeLecIdx, setActiveLecIdx] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialCourse.id));

  const blockImageInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const importJsonInputRef = useRef<HTMLInputElement | null>(null);

  const safeModIdx = Math.min(activeModIdx, Math.max(0, course.modulos.length - 1));
  const activeModule = course.modulos[safeModIdx];
  const safeLecIdx = activeModule
    ? Math.min(activeLecIdx, Math.max(0, activeModule.lecciones.length - 1))
    : 0;
  const activeLesson = activeModule?.lecciones[safeLecIdx] || null;
  const pageConfig: LessonPageSettings = activeLesson?.configuracion_pagina || {
    maxWidth: 'standard',
    sheetBg: '#0b0617',
    pattern: 'none',
  };

  const selectedBlock =
    activeLesson?.contenido_bloques.find((b) => b.id === selectedBlockId) || null;

  const updateActiveLesson = (updater: (lesson: CmsLesson) => CmsLesson) => {
    commitCourseChange((prev) => {
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

  const updatePageConfig = (patch: Partial<LessonPageSettings>) => {
    updateActiveLesson((lec) => ({
      ...lec,
      configuracion_pagina: {
        ...(lec.configuracion_pagina || {}),
        ...patch,
      },
    }));
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
    setInspectorTab('content');
    if (previewMode) setPreviewMode(false);
  };

  const applyLessonTemplate = (
    preset: 'canva-showcase' | 'cyber-lab' | 'split-50-50' | 'cloud-arch' | 'study-deck'
  ) => {
    if (!activeLesson) return;
    let blocks: CmsBlock[] = [];
    if (preset === 'canva-showcase') {
      blocks = [
        createDefaultBlock('canvas_free'),
        createDefaultBlock('badges'),
        createDefaultBlock('paragraph'),
        createDefaultBlock('cta_buttons'),
      ];
    } else if (preset === 'cyber-lab') {
      blocks = [
        createDefaultBlock('banner'),
        createDefaultBlock('terminal'),
        createDefaultBlock('callout'),
        createDefaultBlock('code'),
        createDefaultBlock('steps'),
      ];
    } else if (preset === 'split-50-50') {
      const leftText = createDefaultBlock('paragraph');
      leftText.text =
        '**Diseño Lado a Lado (50% / 50%)**\n\nCualquier bloque en CodePulse Studio puede ajustarse a `25%`, `33%`, `50%`, `66%` o `100%` de ancho para armar composiciones libres tipo revista o dashboard.';
      leftText.style = { boxWidth: 50, paddingY: 20, paddingX: 20, bgCustom: '#130a26', borderRadius: 16, borderWidth: 1, borderColor: '#9333ea' };
      const rightCode = createDefaultBlock('code');
      rightCode.style = { boxWidth: 50 };
      blocks = [createDefaultBlock('heading1'), leftText, rightCode, createDefaultBlock('table')];
    } else if (preset === 'cloud-arch') {
      blocks = [
        createDefaultBlock('heading1'),
        createDefaultBlock('stats'),
        createDefaultBlock('architecture'),
        createDefaultBlock('tabs'),
      ];
    } else {
      blocks = [
        createDefaultBlock('heading2'),
        createDefaultBlock('flashcards'),
        createDefaultBlock('accordion'),
        createDefaultBlock('quiz'),
      ];
    }
    updateActiveLesson((lec) => ({
      ...lec,
      contenido_bloques: [...lec.contenido_bloques, ...blocks],
    }));
    if (blocks[0]) setSelectedBlockId(blocks[0].id);
  };

  const updateBlockById = (blockId: string, patch: Partial<CmsBlock>) => {
    updateActiveLesson((lec) => ({
      ...lec,
      contenido_bloques: lec.contenido_bloques.map((b) =>
        b.id === blockId ? { ...b, ...patch } : b
      ),
    }));
  };

  const updateSelectedBlock = (patch: Partial<CmsBlock>) => {
    if (!selectedBlockId) return;
    updateBlockById(selectedBlockId, patch);
  };

  const updateSelectedStyle = (stylePatch: Partial<BlockBoxStyle>) => {
    if (!selectedBlock) return;
    updateSelectedBlock({
      style: {
        ...(selectedBlock.style || {}),
        ...stylePatch,
      },
    });
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

  const reorderBlockByIndex = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    updateActiveLesson((lec) => {
      const arr = [...lec.contenido_bloques];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
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
    commitCourseChange((prev) => ({ ...prev, modulos: [...prev.modulos, newMod] }));
    setActiveModIdx(course.modulos.length);
    setActiveLecIdx(0);
    setSelectedBlockId(null);
  };

  const deleteModule = (mIdx: number) => {
    if (course.modulos.length <= 1) return;
    commitCourseChange((prev) => ({
      ...prev,
      modulos: prev.modulos.filter((_, idx) => idx !== mIdx),
    }));
    setActiveModIdx(0);
    setActiveLecIdx(0);
    setSelectedBlockId(null);
  };

  const addUnitToModule = (mIdx: number, format: UnitFormat = 'leccion') => {
    const targetMod = course.modulos[mIdx];
    if (!targetMod) return;
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const nextNum = `${mIdx + 1}.${targetMod.lecciones.length + 1}`;

    let newUnit: CmsLesson = {
      id: `lec_${stamp}`,
      clave_estable: `unit_${stamp}`,
      titulo: `Lección ${nextNum}`,
      orden: targetMod.lecciones.length + 1,
      tipo: 'lectura',
      formato_unidad: 'leccion',
      peso_puntos: 10,
      duracion_estimada_minutos: 12,
      contenido_bloques: [createDefaultBlock('heading1'), createDefaultBlock('paragraph')],
    };

    if (format === 'examen') {
      newUnit = {
        id: `ex_${stamp}`,
        clave_estable: `exam_${stamp}`,
        titulo: `Examen Evaluable ${nextNum}`,
        orden: targetMod.lecciones.length + 1,
        tipo: 'examen',
        formato_unidad: 'examen',
        peso_puntos: 50,
        duracion_estimada_minutos: 20,
        contenido_bloques: [],
        configuracion_actividad: {
          exam: createDefaultExamConfig(),
        },
      };
    } else if (format === 'laboratorio') {
      newUnit = {
        id: `lab_${stamp}`,
        clave_estable: `lab_${stamp}`,
        titulo: `Laboratorio Práctico ${nextNum}`,
        orden: targetMod.lecciones.length + 1,
        tipo: 'lectura',
        formato_unidad: 'laboratorio',
        peso_puntos: 30,
        duracion_estimada_minutos: 35,
        contenido_bloques: [],
        configuracion_actividad: {
          lab: createDefaultLabConfig(),
        },
      };
    }

    commitCourseChange((prev) => ({
      ...prev,
      modulos: prev.modulos.map((m, idx) =>
        idx === mIdx ? { ...m, lecciones: [...m.lecciones, newUnit] } : m
      ),
    }));
    setActiveModIdx(mIdx);
    setActiveLecIdx(targetMod.lecciones.length);
    setSelectedBlockId(null);
  };

  const duplicateLesson = (mIdx: number, lIdx: number) => {
    const mod = course.modulos[mIdx];
    const source = mod?.lecciones[lIdx];
    if (!mod || !source) return;
    const copy: CmsLesson = JSON.parse(JSON.stringify(source));
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    copy.id = `lec_${stamp}`;
    copy.clave_estable = `unit_${stamp}`;
    copy.titulo = `${source.titulo} (Copia)`;
    commitCourseChange((prev) => ({
      ...prev,
      modulos: prev.modulos.map((m, idx) => {
        if (idx !== mIdx) return m;
        const arr = [...m.lecciones];
        arr.splice(lIdx + 1, 0, copy);
        return { ...m, lecciones: arr };
      }),
    }));
    setActiveModIdx(mIdx);
    setActiveLecIdx(lIdx + 1);
  };

  const deleteLesson = (mIdx: number, lIdx: number) => {
    const mod = course.modulos[mIdx];
    if (!mod || mod.lecciones.length <= 1) return;
    commitCourseChange((prev) => ({
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

  // Exportar / Importar JSON del Curso
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.slug || 'curso-codepulse'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (file: File) => {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.modulos)) {
        commitCourseChange((prev) => ({
          ...parsed,
          id: prev.id,
        }));
        setSaveMessage({ type: 'ok', text: 'Diseño JSON importado con éxito' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch {
      setSaveMessage({ type: 'err', text: 'Archivo JSON inválido' });
    }
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

  const appendRichSyntax = (token: string) => {
    if (!selectedBlock) return;
    const curr = selectedBlock.text || '';
    updateSelectedBlock({ text: curr ? `${curr} ${token}` : token });
  };

  const renderRichToolbar = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.35rem' }}>
      {[
        { label: 'B', title: 'Negrita', token: '**texto**' },
        { label: 'I', title: 'Cursiva', token: '*cursiva*' },
        { label: 'U', title: 'Subrayado', token: '__subrayado__' },
        { label: 'Resaltar', title: 'Resaltador Neón', token: '==importante==' },
        { label: '`Code`', title: 'Código Inline', token: '`variable`' },
        { label: 'Link', title: 'Enlace', token: '[Ver recurso](https://)' },
      ].map((btn) => (
        <button
          key={btn.label}
          type="button"
          title={btn.title}
          onClick={() => appendRichSyntax(btn.token)}
          style={{
            padding: '0.2rem 0.48rem',
            borderRadius: '5px',
            border: '1px solid rgba(168,85,247,0.35)',
            background: 'rgba(168,85,247,0.12)',
            color: '#e9d5ff',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );

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

  const filteredTools = TOOL_CATALOG.filter((t) =>
    t.label.toLowerCase().includes(toolSearch.trim().toLowerCase())
  );

  return (
    <div className="cms-studio-wrapper">
      {/* BARRA SUPERIOR PRO STUDIO */}
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
              commitCourseChange((prev) => ({
                ...prev,
                titulo: val,
                slug: slugTouched ? prev.slug : slugifyText(val),
              }));
            }}
            placeholder="Título del Curso..."
            className="cms-course-title-input"
          />

          {/* Undo / Redo */}
          <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={handleUndo}
              disabled={past.length === 0}
              className="cms-pill-toggle"
              style={{ padding: '0.42rem 0.55rem', opacity: past.length === 0 ? 0.35 : 1 }}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={future.length === 0}
              className="cms-pill-toggle"
              style={{ padding: '0.42rem 0.55rem', opacity: future.length === 0 ? 0.35 : 1 }}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {saveMessage && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
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
          <input
            ref={importJsonInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportJson(f);
            }}
          />
          <button
            type="button"
            onClick={handleExportJson}
            className="cms-pill-toggle"
            title="Exportar Curso completo en JSON"
          >
            <Download size={14} /> JSON
          </button>
          <button
            type="button"
            onClick={() => importJsonInputRef.current?.click()}
            className="cms-pill-toggle"
            title="Importar estructura desde JSON"
          >
            <FileUp size={14} />
          </button>

          <button
            type="button"
            onClick={() =>
              commitCourseChange((prev) => ({ ...prev, publicado: !prev.publicado }))
            }
            className={`cms-pill-toggle ${course.publicado ? 'active' : ''}`}
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
            {previewMode ? 'Editar' : 'Vista Previa'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveCourse()}
            className="cms-save-btn"
          >
            {saving ? <Loader2 size={16} /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* ESPACIO DE TRABAJO 3 COLUMNAS */}
      <div
        className={`cms-workspace ${
          previewMode ||
          activeLesson?.formato_unidad === 'examen' ||
          activeLesson?.formato_unidad === 'laboratorio'
            ? 'preview-mode'
            : ''
        }`}
      >
        {/* PANEL IZQUIERDO: CANVA DOCK + DRAWER */}
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
              onClick={() => setDockTab('page')}
              className={`cms-dock-btn ${dockTab === 'page' ? 'active' : ''}`}
            >
              <Maximize2 size={19} />
              Lienzo
            </button>
            <button
              type="button"
              onClick={() => setDockTab('templates')}
              className={`cms-dock-btn ${dockTab === 'templates' ? 'active' : ''}`}
            >
              <Sparkles size={19} />
              Diseños
            </button>
            <button
              type="button"
              onClick={() => setDockTab('settings')}
              className={`cms-dock-btn ${dockTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={19} />
              Curso
            </button>
          </div>

          <div className="cms-drawer">
            {dockTab === 'elements' && (
              <>
                <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                  <Search
                    size={14}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    placeholder="Buscar entre 27 bloques..."
                    className="cms-input"
                    style={{ paddingLeft: '2rem', fontSize: '0.78rem' }}
                  />
                </div>

                {(
                  [
                    { key: 'canva', title: 'Libertad Visual (Canva)' },
                    { key: 'text', title: 'Texto & Editorial Rico' },
                    { key: 'structure', title: 'Tablas, Pestañas & Diagramas' },
                    { key: 'code_media', title: 'Código, Terminal & Media' },
                    { key: 'interactive', title: 'Retos & Flashcards 3D' },
                  ] as const
                ).map((cat) => {
                  const items = filteredTools.filter((t) => t.category === cat.key);
                  if (items.length === 0) return null;
                  return (
                    <React.Fragment key={cat.key}>
                      <div className="cms-drawer-section-title">{cat.title}</div>
                      <div className="cms-tool-grid">
                        {items.map((tool) => (
                          <button
                            key={tool.type}
                            type="button"
                            onClick={() => addBlock(tool.type)}
                            className="cms-tool-tile"
                          >
                            {tool.icon}
                            <span>{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </React.Fragment>
                  );
                })}
              </>
            )}

            {dockTab === 'syllabus' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span className="cms-drawer-section-title" style={{ margin: 0 }}>
                    Estructura Académica
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

                <div
                  style={{
                    fontSize: '0.73rem',
                    color: '#94a3b8',
                    marginBottom: '0.85rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    background: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  Peso total del curso:{' '}
                  <strong style={{ color: '#ffffff' }}>
                    {course.modulos.reduce(
                      (acc, m) =>
                        acc +
                        m.lecciones.reduce(
                          (s, l) =>
                            s +
                            (Number(l.peso_puntos) ||
                              (l.formato_unidad === 'examen'
                                ? 50
                                : l.formato_unidad === 'laboratorio'
                                ? 30
                                : 10)),
                          0
                        ),
                      0
                    )}{' '}
                    pts
                  </strong>
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
                            commitCourseChange((prev) => ({
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
                          const uFmt = lec.formato_unidad || (lec.tipo === 'examen' ? 'examen' : 'leccion');
                          const badgeCfg =
                            uFmt === 'examen'
                              ? { text: 'EXAM', color: '#fda4af', bg: 'rgba(244,63,94,0.22)' }
                              : uFmt === 'laboratorio'
                              ? { text: 'LAB', color: '#67e8f9', bg: 'rgba(34,211,238,0.2)' }
                              : { text: 'LEC', color: '#d8b4fe', bg: 'rgba(168,85,247,0.2)' };
                          const pts =
                            Number(lec.peso_puntos) ||
                            (uFmt === 'examen' ? 50 : uFmt === 'laboratorio' ? 30 : 10);

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
                                gap: '0.35rem',
                                padding: '0.48rem 0.55rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: isCurrent
                                  ? 'linear-gradient(90deg, rgba(147,51,234,0.28), rgba(225,29,72,0.22))'
                                  : 'rgba(0,0,0,0.25)',
                                border: isCurrent
                                  ? '1px solid #f43f5e'
                                  : '1px solid rgba(255,255,255,0.06)',
                                fontSize: '0.76rem',
                                color: isCurrent ? '#ffffff' : '#cbd5e1',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                                <span
                                  style={{
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '4px',
                                    background: badgeCfg.bg,
                                    color: badgeCfg.color,
                                    fontFamily: 'monospace',
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    flexShrink: 0,
                                  }}
                                >
                                  {badgeCfg.text}
                                </span>
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
                              </div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{pts}p</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateLesson(mIdx, lIdx);
                                  }}
                                  className="cms-mini-icon-btn"
                                  title="Duplicar"
                                >
                                  <Copy size={11} />
                                </button>
                                {mod.lecciones.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteLesson(mIdx, lIdx);
                                    }}
                                    className="cms-mini-icon-btn"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={11} color="#fb7185" />
                                  </button>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* 3 Botones dedicados para agregar Lección, Examen o Laboratorio */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '0.3rem',
                          marginTop: '0.6rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => addUnitToModule(mIdx, 'leccion')}
                          style={{
                            padding: '0.38rem 0.25rem',
                            borderRadius: '7px',
                            border: '1px dashed rgba(168, 85, 247, 0.5)',
                            background: 'rgba(168, 85, 247, 0.08)',
                            color: '#d8b4fe',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Agregar Lección con Lienzo Libre"
                        >
                          + Lección
                        </button>
                        <button
                          type="button"
                          onClick={() => addUnitToModule(mIdx, 'examen')}
                          style={{
                            padding: '0.38rem 0.25rem',
                            borderRadius: '7px',
                            border: '1px dashed rgba(244, 63, 94, 0.55)',
                            background: 'rgba(244, 63, 94, 0.1)',
                            color: '#fda4af',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Agregar Plantilla Exclusiva de Examen"
                        >
                          + Examen
                        </button>
                        <button
                          type="button"
                          onClick={() => addUnitToModule(mIdx, 'laboratorio')}
                          style={{
                            padding: '0.38rem 0.25rem',
                            borderRadius: '7px',
                            border: '1px dashed rgba(34, 211, 238, 0.55)',
                            background: 'rgba(34, 211, 238, 0.1)',
                            color: '#67e8f9',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Agregar Plantilla Exclusiva de Laboratorio Práctico"
                        >
                          + Lab
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dockTab === 'page' && (
              <div>
                <div className="cms-drawer-section-title">Estilo de la Hoja / Lienzo</div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 0, marginBottom: '1rem' }}>
                  Personaliza las dimensiones, textura y atmósfera de esta lección:
                </p>

                <div className="cms-field-group">
                  <label className="cms-label">Ancho del Lienzo</label>
                  <select
                    className="cms-select"
                    value={pageConfig.maxWidth || 'standard'}
                    onChange={(e) =>
                      updatePageConfig({
                        maxWidth: e.target.value as LessonPageSettings['maxWidth'],
                      })
                    }
                  >
                    <option value="standard">Estándar Lectura (860px)</option>
                    <option value="wide">Amplio Dashboard (1140px)</option>
                    <option value="full">Lienzo Completo (100%)</option>
                  </select>
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Textura Técnica de Fondo</label>
                  <select
                    className="cms-select"
                    value={pageConfig.pattern || 'none'}
                    onChange={(e) =>
                      updatePageConfig({
                        pattern: e.target.value as LessonPageSettings['pattern'],
                      })
                    }
                  >
                    <option value="none">Liso Minimalista</option>
                    <option value="grid">Cuadrícula HUD (Grid)</option>
                    <option value="dots">Matriz de Puntos (Dots)</option>
                  </select>
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Color de Fondo de la Hoja</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={pageConfig.sheetBg || '#0b0617'}
                      onChange={(e) => updatePageConfig({ sheetBg: e.target.value })}
                      style={{ width: 38, height: 34, border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="cms-input"
                      value={pageConfig.sheetBg || '#0b0617'}
                      onChange={(e) => updatePageConfig({ sheetBg: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Color del Marco de Hoja</label>
                  <div className="cms-swatch-row">
                    {['rgba(168, 85, 247, 0.25)', '#f43f5e', '#22d3ee', '#10b981', '#334155'].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updatePageConfig({ accentBorder: c })}
                          className="cms-color-swatch"
                          style={{ background: c }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {dockTab === 'templates' && (
              <div>
                <div className="cms-drawer-section-title">Composiciones Pro (1 Clic)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('canva-showcase')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#f43f5e' }}>Portada Lienzo Libre (Canva)</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Lienzo arrastrable libre + Chips de Tecnologías + Introducción + Botones CTA.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('split-50-50')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#38bdf8' }}>Diseño Lado a Lado (50% / 50%)</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Explicación en columna izquierda + Código en columna derecha + Tabla inferior.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('cyber-lab')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#34d399' }}>Laboratorio &amp; Terminal HUD</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Banner + Consola Linux + Alerta de Seguridad + Código + Roadmap Paso a Paso.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('cloud-arch')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#c084fc' }}>Arquitectura Cloud &amp; KPIs</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Título + Tarjetas de Métricas + Diagrama de Nodos + Pestañas Interactivas.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyLessonTemplate('study-deck')}
                    className="cms-tool-tile"
                    style={{ width: '100%' }}
                  >
                    <strong style={{ color: '#fbbf24' }}>Mazo de Estudio Activo</strong>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                      Flashcards 3D Giratorias + Acordeón de Preguntas + Quiz Autocalificable.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {dockTab === 'settings' && (
              <div>
                <div className="cms-drawer-section-title">Ajustes del Curso</div>

                <div className="cms-field-group">
                  <label className="cms-label">URL / Slug del Curso</label>
                  <input
                    type="text"
                    className="cms-input"
                    value={course.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      commitCourseChange((prev) => ({
                        ...prev,
                        slug: slugifyText(e.target.value),
                      }));
                    }}
                  />
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Categoría (Editable Libre)</label>
                  <input
                    type="text"
                    list="cms-categories-datalist"
                    className="cms-input"
                    value={course.categoria}
                    onChange={(e) =>
                      commitCourseChange((prev) => ({ ...prev, categoria: e.target.value }))
                    }
                    placeholder="Ej. Arquitectura de Software"
                  />
                  <datalist id="cms-categories-datalist">
                    <option value="Desarrollo de Software" />
                    <option value="Arquitectura de Software" />
                    <option value="Ciberseguridad" />
                    <option value="Cloud & DevOps" />
                    <option value="Inteligencia Artificial" />
                    <option value="Bases de Datos" />
                  </datalist>
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Nivel</label>
                  <select
                    className="cms-select"
                    value={course.nivel}
                    onChange={(e) =>
                      commitCourseChange((prev) => ({
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
                      commitCourseChange((prev) => ({ ...prev, descripcion: e.target.value }))
                    }
                  />
                </div>

                <div className="cms-field-group">
                  <label className="cms-label">Portada del Curso</label>
                  <input
                    type="text"
                    className="cms-input"
                    value={course.imagen_portada_url || ''}
                    onChange={(e) =>
                      commitCourseChange((prev) => ({
                        ...prev,
                        imagen_portada_url: e.target.value,
                      }))
                    }
                    placeholder="https://... o sube desde PC"
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
                      commitCourseChange((prev) => ({ ...prev, imagen_portada_url: dataUrl }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    className="cms-pill-toggle"
                    style={{ justifyContent: 'center', marginTop: '0.35rem' }}
                  >
                    <Upload size={14} /> Subir Portada Local
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

        {/* LIENZO CENTRAL CON PLANTILLAS DEDICADAS (LECCIÓN / EXAMEN / LABORATORIO) */}
        <div
          className="cms-canvas-scroll"
          onClick={() => setSelectedBlockId(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          {activeLesson?.formato_unidad === 'examen' ? (
            previewMode ? (
              <div className="cms-page-sheet">
                <StudentExamRunner
                  unitTitle={activeLesson.titulo}
                  pesoPuntos={activeLesson.peso_puntos || 50}
                  config={activeLesson.configuracion_actividad?.exam}
                  onSubmitExam={async () => {}}
                />
              </div>
            ) : (
              <CmsExamBuilder
                title={activeLesson.titulo}
                pesoPuntos={activeLesson.peso_puntos || 50}
                config={activeLesson.configuracion_actividad?.exam}
                onChangeMeta={(patch) => updateActiveLesson((l) => ({ ...l, ...patch }))}
                onChangeConfig={(exam) =>
                  updateActiveLesson((l) => ({
                    ...l,
                    configuracion_actividad: { ...(l.configuracion_actividad || {}), exam },
                  }))
                }
              />
            )
          ) : activeLesson?.formato_unidad === 'laboratorio' ? (
            previewMode ? (
              <div className="cms-page-sheet">
                <StudentLabWorkspace
                  unitTitle={activeLesson.titulo}
                  pesoPuntos={activeLesson.peso_puntos || 30}
                  config={activeLesson.configuracion_actividad?.lab}
                  onSubmitLab={async () => {}}
                />
              </div>
            ) : (
              <CmsLabBuilder
                title={activeLesson.titulo}
                pesoPuntos={activeLesson.peso_puntos || 30}
                config={activeLesson.configuracion_actividad?.lab}
                onChangeMeta={(patch) => updateActiveLesson((l) => ({ ...l, ...patch }))}
                onChangeConfig={(lab) =>
                  updateActiveLesson((l) => ({
                    ...l,
                    configuracion_actividad: { ...(l.configuracion_actividad || {}), lab },
                  }))
                }
              />
            )
          ) : activeLesson ? (
            <div
              className={`cms-page-sheet ${
                pageConfig.maxWidth === 'wide'
                  ? 'wide'
                  : pageConfig.maxWidth === 'full'
                  ? 'full'
                  : ''
              } ${
                pageConfig.pattern === 'grid'
                  ? 'pattern-grid'
                  : pageConfig.pattern === 'dots'
                  ? 'pattern-dots'
                  : ''
              }`}
              style={{
                backgroundColor: pageConfig.sheetBg || '#0b0617',
                borderColor: pageConfig.accentBorder || 'rgba(168, 85, 247, 0.22)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera Editable de la Lección */}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      title="Peso en puntos de esta lección en el progreso general del curso"
                    >
                      <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>
                        Peso:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={activeLesson.peso_puntos ?? 10}
                        onChange={(e) =>
                          updateActiveLesson((l) => ({
                            ...l,
                            peso_puntos: Math.max(1, Number(e.target.value) || 10),
                          }))
                        }
                        className="cms-input"
                        style={{ width: 58, padding: '0.35rem 0.45rem', fontSize: '0.78rem' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>pts</span>
                    </div>

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
                      <option value="quiz">Práctica</option>
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
                        style={{ width: 60, padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>min</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloques con soporte Multi-Columna Libre */}
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
                    Hoja vacía. Elige cualquiera de los 27 bloques, un Lienzo Libre Canva o arrastra imágenes aquí.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => addBlock('canvas_free')} className="cms-pill-toggle preview-active">
                      + Lienzo Libre (Canva)
                    </button>
                    <button type="button" onClick={() => addBlock('banner')} className="cms-pill-toggle">
                      + Banner Hero
                    </button>
                    <button type="button" onClick={() => addBlock('table')} className="cms-pill-toggle">
                      + Tabla Dinámica
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cms-blocks-flow">
                  {activeLesson.contenido_bloques.map((block, bIdx) => {
                    const widthVal = block.style?.boxWidth || 100;
                    if (previewMode) {
                      return (
                        <div key={block.id} className={`cms-flow-w-${widthVal}`}>
                          <CmsBlockRenderer block={block} />
                        </div>
                      );
                    }
                    const isSelected = selectedBlockId === block.id;
                    return (
                      <div
                        key={block.id}
                        draggable={block.type !== 'canvas_free'}
                        onDragStart={() => setDraggedBlockIdx(bIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation();
                          if (draggedBlockIdx !== null && draggedBlockIdx !== bIdx) {
                            reorderBlockByIndex(draggedBlockIdx, bIdx);
                          }
                          setDraggedBlockIdx(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        className={`cms-block-wrapper cms-flow-w-${widthVal} ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        {isSelected && (
                          <div className="cms-block-toolbar">
                            {/* Selector rápido de ancho lado a lado */}
                            {([100, 50, 33] as const).map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateBlockById(block.id, {
                                    style: { ...(block.style || {}), boxWidth: w },
                                  });
                                }}
                                className="cms-mini-icon-btn"
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  color: widthVal === w ? '#f43f5e' : '#94a3b8',
                                  padding: '0.15rem 0.32rem',
                                }}
                                title={`Ancho del bloque: ${w}%`}
                              >
                                {w}%
                              </button>
                            ))}

                            <button
                              type="button"
                              onClick={(e) => moveBlock(block.id, -1, e)}
                              disabled={bIdx === 0}
                              className="cms-mini-icon-btn"
                              title="Subir"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => moveBlock(block.id, 1, e)}
                              disabled={bIdx === activeLesson.contenido_bloques.length - 1}
                              className="cms-mini-icon-btn"
                              title="Bajar"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => duplicateBlock(block.id, e)}
                              className="cms-mini-icon-btn"
                              title="Duplicar"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => deleteBlock(block.id, e)}
                              className="cms-mini-icon-btn"
                              title="Eliminar"
                            >
                              <Trash2 size={14} color="#fb7185" />
                            </button>
                          </div>
                        )}
                        <CmsBlockRenderer
                          block={block}
                          editable={!previewMode}
                          onUpdateBlock={(patch) => updateBlockById(block.id, patch)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* PANEL DERECHO: INSPECTOR DUAL (SOLO EN LECCIONES NORMALES) */}
        {!previewMode &&
          activeLesson?.formato_unidad !== 'examen' &&
          activeLesson?.formato_unidad !== 'laboratorio' && (
          <aside className="cms-inspector">
            {!selectedBlock ? (
              <div style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.65 }}>
                <div className="cms-drawer-section-title">Studio Pro Inspector</div>
                <p>
                  Selecciona cualquier bloque en el lienzo central para abrir sus **2 pestañas de control total**:
                </p>
                <ul style={{ paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>
                    <strong style={{ color: '#ffffff' }}>Contenido Rico:</strong> Usa `**negrita**`, `==resaltado==`, `` `código` `` o edita tablas y lienzos libres directamente sobre la hoja.
                  </li>
                  <li>
                    <strong style={{ color: '#f43f5e' }}>Diseño &amp; Caja Libre:</strong> Ajusta ancho (`25%` a `100%` para poner bloques lado a lado), tamaño exacto en `px`, fuentes, paddings, degradados con ángulo y bordes con glow neón.
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span className="cms-drawer-section-title" style={{ margin: 0 }}>
                    {selectedBlock.type.toUpperCase()}
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

                {/* PESTAÑAS DEL INSPECTOR */}
                <div className="cms-inspector-tabs">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('content')}
                    className={`cms-inspector-tab ${inspectorTab === 'content' ? 'active' : ''}`}
                  >
                    1. Contenido
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('style')}
                    className={`cms-inspector-tab ${inspectorTab === 'style' ? 'active' : ''}`}
                  >
                    2. Estilo &amp; Caja Libre
                  </button>
                </div>

                {/* =================================================
                    PESTAÑA 2: DISEÑO & CAJA LIBRE UNIVERSAL
                   ================================================= */}
                {inspectorTab === 'style' && (
                  <div>
                    <div className="cms-field-group">
                      <label className="cms-label">
                        Ancho en Fila ({selectedBlock.style?.boxWidth || 100}%)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                        {([25, 33, 50, 66, 75, 100] as const).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => updateSelectedStyle({ boxWidth: w })}
                            className={`cms-pill-toggle ${
                              (selectedBlock.style?.boxWidth || 100) === w ? 'preview-active' : ''
                            }`}
                            style={{ justifyContent: 'center', padding: '0.38rem' }}
                          >
                            {w}%
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Dos bloques al 50% o tres al 33% se colocan automáticamente lado a lado.
                      </span>
                    </div>

                    <div className="cms-drawer-section-title">Tipografía Libre</div>

                    <div className="cms-field-group">
                      <label className="cms-label">Familia Tipográfica</label>
                      <select
                        className="cms-select"
                        value={selectedBlock.style?.fontFamily || ''}
                        onChange={(e) =>
                          updateSelectedStyle({
                            fontFamily: (e.target.value || undefined) as BlockBoxStyle['fontFamily'],
                          })
                        }
                      >
                        <option value="">Predeterminada del Bloque</option>
                        <option value="sans">Inter / Moderna Sans</option>
                        <option value="display">Rajdhani / Táctica Tech</option>
                        <option value="mono">Fira Code / Monoespaciada</option>
                        <option value="serif">Georgia / Editorial Clásica</option>
                      </select>
                    </div>

                    <div className="cms-field-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="cms-label">
                          Tamaño Exacto ({selectedBlock.style?.fontSizePx || 'Auto'}
                          {selectedBlock.style?.fontSizePx ? 'px' : ''})
                        </label>
                        {selectedBlock.style?.fontSizePx && (
                          <button
                            type="button"
                            onClick={() => updateSelectedStyle({ fontSizePx: undefined })}
                            style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            Auto
                          </button>
                        )}
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={68}
                        value={selectedBlock.style?.fontSizePx || 18}
                        onChange={(e) =>
                          updateSelectedStyle({ fontSizePx: Number(e.target.value) })
                        }
                        className="cms-range"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="cms-field-group">
                        <label className="cms-label">Peso (Grosor)</label>
                        <select
                          className="cms-select"
                          value={selectedBlock.style?.fontWeight || ''}
                          onChange={(e) =>
                            updateSelectedStyle({
                              fontWeight: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                        >
                          <option value="">Auto</option>
                          <option value="300">300 Light</option>
                          <option value="400">400 Normal</option>
                          <option value="600">600 SemiBold</option>
                          <option value="700">700 Bold</option>
                          <option value="800">800 ExtraBold</option>
                        </select>
                      </div>

                      <div className="cms-field-group">
                        <label className="cms-label">Transformar</label>
                        <select
                          className="cms-select"
                          value={selectedBlock.style?.textTransform || 'none'}
                          onChange={(e) =>
                            updateSelectedStyle({
                              textTransform: e.target.value as BlockBoxStyle['textTransform'],
                            })
                          }
                        >
                          <option value="none">Normal</option>
                          <option value="uppercase">MAYÚSCULAS</option>
                          <option value="capitalize">Capitalizar</option>
                        </select>
                      </div>
                    </div>

                    <div className="cms-drawer-section-title">Caja, Fondo &amp; Degradado</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="cms-field-group">
                        <label className="cms-label">
                          Padding Y ({selectedBlock.style?.paddingY ?? 0}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={64}
                          value={selectedBlock.style?.paddingY ?? 0}
                          onChange={(e) =>
                            updateSelectedStyle({ paddingY: Number(e.target.value) })
                          }
                          className="cms-range"
                        />
                      </div>
                      <div className="cms-field-group">
                        <label className="cms-label">
                          Padding X ({selectedBlock.style?.paddingX ?? 0}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={64}
                          value={selectedBlock.style?.paddingX ?? 0}
                          onChange={(e) =>
                            updateSelectedStyle({ paddingX: Number(e.target.value) })
                          }
                          className="cms-range"
                        />
                      </div>
                    </div>

                    <div className="cms-field-group">
                      <label className="cms-label">Color de Fondo de Caja</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="color"
                          value={selectedBlock.style?.bgCustom || '#120924'}
                          onChange={(e) => updateSelectedStyle({ bgCustom: e.target.value })}
                          style={{ width: 38, height: 32, border: 'none', background: 'transparent', cursor: 'pointer' }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedStyle({ bgCustom: undefined, useGradientBg: false })
                          }
                          className="cms-pill-toggle"
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                        >
                          Transparente
                        </button>
                      </div>
                    </div>

                    <div className="cms-field-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.style?.useGradientBg)}
                          onChange={(e) =>
                            updateSelectedStyle({
                              useGradientBg: e.target.checked,
                              bgCustom: selectedBlock.style?.bgCustom || '#4c1d95',
                              bgGradient2: selectedBlock.style?.bgGradient2 || '#be123c',
                            })
                          }
                        />
                        Usar Degradado de 2 Colores
                      </label>
                    </div>

                    {selectedBlock.style?.useGradientBg && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="cms-field-group">
                          <label className="cms-label">Color 2</label>
                          <input
                            type="color"
                            value={selectedBlock.style?.bgGradient2 || '#be123c'}
                            onChange={(e) => updateSelectedStyle({ bgGradient2: e.target.value })}
                            style={{ width: '100%', height: 34, border: 'none', background: 'transparent', cursor: 'pointer' }}
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">
                            Ángulo ({selectedBlock.style?.bgAngle ?? 135}°)
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={360}
                            value={selectedBlock.style?.bgAngle ?? 135}
                            onChange={(e) =>
                              updateSelectedStyle({ bgAngle: Number(e.target.value) })
                            }
                            className="cms-range"
                          />
                        </div>
                      </div>
                    )}

                    <div className="cms-drawer-section-title">Bordes &amp; Glow Neón</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="cms-field-group">
                        <label className="cms-label">
                          Grosor Borde ({selectedBlock.style?.borderWidth ?? 0}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={6}
                          value={selectedBlock.style?.borderWidth ?? 0}
                          onChange={(e) =>
                            updateSelectedStyle({ borderWidth: Number(e.target.value) })
                          }
                          className="cms-range"
                        />
                      </div>
                      <div className="cms-field-group">
                        <label className="cms-label">
                          Redondeo ({selectedBlock.style?.borderRadius ?? 12}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          value={selectedBlock.style?.borderRadius ?? 12}
                          onChange={(e) =>
                            updateSelectedStyle({ borderRadius: Number(e.target.value) })
                          }
                          className="cms-range"
                        />
                      </div>
                    </div>

                    {(selectedBlock.style?.borderWidth || 0) > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="cms-field-group">
                          <label className="cms-label">Estilo</label>
                          <select
                            className="cms-select"
                            value={selectedBlock.style?.borderStyle || 'solid'}
                            onChange={(e) =>
                              updateSelectedStyle({
                                borderStyle: e.target.value as BlockBoxStyle['borderStyle'],
                              })
                            }
                          >
                            <option value="solid">Sólido</option>
                            <option value="dashed">Guiones</option>
                            <option value="dotted">Punteado</option>
                          </select>
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Color Borde</label>
                          <input
                            type="color"
                            value={
                              selectedBlock.style?.borderColor?.startsWith('#')
                                ? selectedBlock.style.borderColor
                                : '#a855f7'
                            }
                            onChange={(e) => updateSelectedStyle({ borderColor: e.target.value })}
                            style={{ width: '100%', height: 36, border: 'none', background: 'transparent', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="cms-field-group">
                      <label className="cms-label">Sombra / Efecto Glow</label>
                      <select
                        className="cms-select"
                        value={selectedBlock.style?.shadowPreset || 'none'}
                        onChange={(e) =>
                          updateSelectedStyle({
                            shadowPreset: e.target.value as BlockBoxStyle['shadowPreset'],
                          })
                        }
                      >
                        <option value="none">Ninguna</option>
                        <option value="soft">Sombra Suave</option>
                        <option value="deep">Sombra Profunda</option>
                        <option value="glow-purple">Glow Neón Púrpura</option>
                        <option value="glow-red">Glow Neón Carmesí</option>
                        <option value="glow-cyan">Glow Neón Cian</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateSelectedBlock({ style: undefined })}
                      className="cms-pill-toggle"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                    >
                      Restablecer Estilo de Caja
                    </button>
                  </div>
                )}

                {/* =================================================
                    PESTAÑA 1: CONTENIDO ESPECÍFICO DEL BLOQUE
                   ================================================= */}
                {inspectorTab === 'content' && (
                  <>
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
                          <label className="cms-label">Texto Enriquecido</label>
                          {renderRichToolbar()}
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
                            <label className="cms-label">Degradado de Letras</label>
                            <select
                              className="cms-select"
                              value={selectedBlock.gradientText || 'none'}
                              onChange={(e) =>
                                updateSelectedBlock({ gradientText: e.target.value })
                              }
                            >
                              <option value="none">Color Sólido</option>
                              <option value="purple-red">Púrpura → Rojo Carmesí</option>
                              <option value="cyan-blue">Cian → Índigo</option>
                              <option value="emerald">Esmeralda → Cian</option>
                              <option value="gold">Ámbar → Dorado</option>
                            </select>
                          </div>
                        )}

                        {selectedBlock.type === 'paragraph' && (
                          <>
                            <div className="cms-field-group">
                              <label className="cms-label">Escala Rápida</label>
                              <select
                                className="cms-select"
                                value={selectedBlock.fontSize || 'md'}
                                onChange={(e) =>
                                  updateSelectedBlock({
                                    fontSize: e.target.value as CmsBlock['fontSize'],
                                  })
                                }
                              >
                                <option value="sm">Pequeño</option>
                                <option value="md">Normal</option>
                                <option value="lg">Grande</option>
                                <option value="xl">Extra Grande</option>
                              </select>
                            </div>

                            <div className="cms-field-group">
                              <label className="cms-label">Fondo Rápido de Párrafo</label>
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
                          <label className="cms-label">Color Libre de Texto</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <input
                              type="color"
                              value={
                                selectedBlock.color?.startsWith('#')
                                  ? selectedBlock.color
                                  : '#ffffff'
                              }
                              onChange={(e) =>
                                updateSelectedBlock({ color: e.target.value, gradientText: 'none' })
                              }
                              style={{ width: 36, height: 30, border: 'none', background: 'transparent', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              Selector RGB o paleta:
                            </span>
                          </div>
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

                    {/* LIENZO LIBRE CANVA */}
                    {selectedBlock.type === 'canvas_free' && (
                      <>
                        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.55, marginTop: 0 }}>
                          Usa la barra superior del propio lienzo para **agregar textos, cajas, badges, luces o imágenes**, arrastrarlos con el mouse, redimensionarlos desde su esquina inferior derecha o hacer **doble clic** para escribir en ellos.
                        </p>
                        <div className="cms-field-group">
                          <label className="cms-label">
                            Altura del Lienzo ({selectedBlock.canvasHeight || 380}px)
                          </label>
                          <input
                            type="range"
                            min={220}
                            max={850}
                            value={selectedBlock.canvasHeight || 380}
                            onChange={(e) =>
                              updateSelectedBlock({ canvasHeight: Number(e.target.value) })
                            }
                            className="cms-range"
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Atmósfera de Fondo del Lienzo</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[
                              {
                                label: 'Nebulosa CodePulse',
                                val: 'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.28), #080412 75%)',
                              },
                              {
                                label: 'Consola Táctica Cian',
                                val: 'radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.22), #050608 75%)',
                              },
                              {
                                label: 'Carmesí Nocturno',
                                val: 'linear-gradient(135deg, #1a0510 0%, #080412 100%)',
                              },
                            ].map((p) => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateSelectedBlock({ canvasBg: p.val })}
                                className="cms-pill-toggle"
                                style={{ justifyContent: 'flex-start' }}
                              >
                                {p.label}
                              </button>
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
                        <p style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 0 }}>
                          Tip: Puedes escribir directamente sobre las celdas en el lienzo central o ajustar estructura aquí.
                        </p>
                        <div className="cms-field-group">
                          <label className="cms-label">Color de Cabecera</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <input
                              type="color"
                              value={selectedBlock.tableAccent || '#9333ea'}
                              onChange={(e) => updateSelectedBlock({ tableAccent: e.target.value })}
                              style={{ width: 34, height: 28, border: 'none', background: 'transparent', cursor: 'pointer' }}
                            />
                            <div className="cms-swatch-row">
                              {ACCENT_SWATCHES.map((hex) => (
                                <button
                                  key={hex}
                                  type="button"
                                  onClick={() => updateSelectedBlock({ tableAccent: hex })}
                                  className={`cms-color-swatch ${
                                    selectedBlock.tableAccent === hex ? 'active' : ''
                                  }`}
                                  style={{ background: hex, width: 22, height: 22 }}
                                />
                              ))}
                            </div>
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

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="cms-pill-toggle"
                            onClick={() => {
                              const headers = [
                                ...(selectedBlock.headers || []),
                                `Col ${(selectedBlock.headers?.length || 0) + 1}`,
                              ];
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
                              const rows = [
                                ...(selectedBlock.rows || []),
                                Array(cols).fill('Nuevo dato'),
                              ];
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
                              updateSelectedBlock({
                                rows: (selectedBlock.rows || []).slice(0, -1),
                              });
                            }}
                          >
                            - Fila
                          </button>
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
                            <input
                              type="color"
                              value={col.accent || '#a855f7'}
                              onChange={(e) => {
                                const cols = [...(selectedBlock.columns || [])];
                                cols[cIdx] = { ...cols[cIdx], accent: e.target.value };
                                updateSelectedBlock({ columns: cols });
                              }}
                              style={{ width: 32, height: 26, border: 'none', background: 'transparent', cursor: 'pointer' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PESTAÑAS (TABS) */}
                    {selectedBlock.type === 'tabs' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(selectedBlock.tabs || []).map((t, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.7rem',
                              borderRadius: '10px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(168,85,247,0.22)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <span className="cms-label">Pestaña {idx + 1}</span>
                              {(selectedBlock.tabs?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  className="cms-mini-icon-btn"
                                  onClick={() =>
                                    updateSelectedBlock({
                                      tabs: (selectedBlock.tabs || []).filter((_, i) => i !== idx),
                                    })
                                  }
                                >
                                  <Trash2 size={13} color="#fb7185" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              className="cms-input"
                              style={{ marginBottom: '0.35rem' }}
                              placeholder="Etiqueta del botón"
                              value={t.label}
                              onChange={(e) => {
                                const next = [...(selectedBlock.tabs || [])];
                                next[idx] = { ...next[idx], label: e.target.value };
                                updateSelectedBlock({ tabs: next });
                              }}
                            />
                            <input
                              type="text"
                              className="cms-input"
                              style={{ marginBottom: '0.35rem' }}
                              placeholder="Título interno (opcional)"
                              value={t.title || ''}
                              onChange={(e) => {
                                const next = [...(selectedBlock.tabs || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                updateSelectedBlock({ tabs: next });
                              }}
                            />
                            <textarea
                              rows={3}
                              className="cms-textarea"
                              style={{ marginBottom: '0.35rem' }}
                              placeholder="Explicación..."
                              value={t.content}
                              onChange={(e) => {
                                const next = [...(selectedBlock.tabs || [])];
                                next[idx] = { ...next[idx], content: e.target.value };
                                updateSelectedBlock({ tabs: next });
                              }}
                            />
                            <textarea
                              rows={2}
                              className="cms-textarea"
                              style={{ fontFamily: 'monospace', fontSize: '0.76rem' }}
                              placeholder="Código opcional..."
                              value={t.code || ''}
                              onChange={(e) => {
                                const next = [...(selectedBlock.tabs || [])];
                                next[idx] = { ...next[idx], code: e.target.value };
                                updateSelectedBlock({ tabs: next });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              tabs: [
                                ...(selectedBlock.tabs || []),
                                { label: 'Nueva Pestaña', title: 'Detalle', content: 'Contenido...' },
                              ],
                            })
                          }
                          className="cms-pill-toggle preview-active"
                          style={{ justifyContent: 'center' }}
                        >
                          + Añadir Pestaña
                        </button>
                      </div>
                    )}

                    {/* ACORDEÓN FAQ */}
                    {selectedBlock.type === 'accordion' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {(selectedBlock.accordions || []).map((acc, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.7rem',
                              borderRadius: '10px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(168,85,247,0.22)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span className="cms-label">Desplegable {idx + 1}</span>
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() =>
                                  updateSelectedBlock({
                                    accordions: (selectedBlock.accordions || []).filter(
                                      (_, i) => i !== idx
                                    ),
                                  })
                                }
                              >
                                <Trash2 size={13} color="#fb7185" />
                              </button>
                            </div>
                            <input
                              type="text"
                              className="cms-input"
                              style={{ marginBottom: '0.35rem' }}
                              value={acc.title}
                              onChange={(e) => {
                                const next = [...(selectedBlock.accordions || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                updateSelectedBlock({ accordions: next });
                              }}
                            />
                            <textarea
                              rows={3}
                              className="cms-textarea"
                              value={acc.content}
                              onChange={(e) => {
                                const next = [...(selectedBlock.accordions || [])];
                                next[idx] = { ...next[idx], content: e.target.value };
                                updateSelectedBlock({ accordions: next });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              accordions: [
                                ...(selectedBlock.accordions || []),
                                { title: 'Nueva Pregunta o Pista', content: 'Respuesta detallada...' },
                              ],
                            })
                          }
                          className="cms-pill-toggle preview-active"
                          style={{ justifyContent: 'center' }}
                        >
                          + Añadir Desplegable
                        </button>
                      </div>
                    )}

                    {/* ROADMAP / PASOS */}
                    {selectedBlock.type === 'steps' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {(selectedBlock.steps || []).map((st, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.7rem',
                              borderRadius: '10px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(168,85,247,0.22)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span className="cms-label">Paso {idx + 1}</span>
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() =>
                                  updateSelectedBlock({
                                    steps: (selectedBlock.steps || []).filter((_, i) => i !== idx),
                                  })
                                }
                              >
                                <Trash2 size={13} color="#fb7185" />
                              </button>
                            </div>
                            <input
                              type="text"
                              className="cms-input"
                              style={{ marginBottom: '0.35rem' }}
                              placeholder="FASE 01"
                              value={st.badge}
                              onChange={(e) => {
                                const next = [...(selectedBlock.steps || [])];
                                next[idx] = { ...next[idx], badge: e.target.value };
                                updateSelectedBlock({ steps: next });
                              }}
                            />
                            <input
                              type="text"
                              className="cms-input"
                              style={{ marginBottom: '0.35rem' }}
                              value={st.title}
                              onChange={(e) => {
                                const next = [...(selectedBlock.steps || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                updateSelectedBlock({ steps: next });
                              }}
                            />
                            <textarea
                              rows={2}
                              className="cms-textarea"
                              value={st.content}
                              onChange={(e) => {
                                const next = [...(selectedBlock.steps || [])];
                                next[idx] = { ...next[idx], content: e.target.value };
                                updateSelectedBlock({ steps: next });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              steps: [
                                ...(selectedBlock.steps || []),
                                {
                                  badge: `FASE 0${(selectedBlock.steps?.length || 0) + 1}`,
                                  title: 'Siguiente Etapa',
                                  content: 'Descripción del paso...',
                                },
                              ],
                            })
                          }
                          className="cms-pill-toggle preview-active"
                          style={{ justifyContent: 'center' }}
                        >
                          + Añadir Paso
                        </button>
                      </div>
                    )}

                    {/* MÉTRICAS KPI (STATS) */}
                    {selectedBlock.type === 'stats' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {(selectedBlock.stats || []).map((s, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.65rem',
                              borderRadius: '10px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(168,85,247,0.22)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                className="cms-input"
                                value={s.value}
                                placeholder="99.9%"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.stats || [])];
                                  next[idx] = { ...next[idx], value: e.target.value };
                                  updateSelectedBlock({ stats: next });
                                }}
                              />
                              <input
                                type="color"
                                value={s.accent || '#c084fc'}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.stats || [])];
                                  next[idx] = { ...next[idx], accent: e.target.value };
                                  updateSelectedBlock({ stats: next });
                                }}
                                style={{ width: 34, height: 32, border: 'none', background: 'transparent' }}
                              />
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() =>
                                  updateSelectedBlock({
                                    stats: (selectedBlock.stats || []).filter((_, i) => i !== idx),
                                  })
                                }
                              >
                                <Trash2 size={13} color="#fb7185" />
                              </button>
                            </div>
                            <input
                              type="text"
                              className="cms-input"
                              value={s.label}
                              placeholder="Etiqueta de métrica"
                              onChange={(e) => {
                                const next = [...(selectedBlock.stats || [])];
                                next[idx] = { ...next[idx], label: e.target.value };
                                updateSelectedBlock({ stats: next });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              stats: [
                                ...(selectedBlock.stats || []),
                                { value: '10x', label: 'Nueva Métrica', accent: '#22d3ee' },
                              ],
                            })
                          }
                          className="cms-pill-toggle preview-active"
                          style={{ justifyContent: 'center' }}
                        >
                          + Añadir Métrica KPI
                        </button>
                      </div>
                    )}

                    {/* TERMINAL HUD */}
                    {selectedBlock.type === 'terminal' && (
                      <>
                        <div className="cms-field-group">
                          <label className="cms-label">Título de Consola</label>
                          <input
                            type="text"
                            className="cms-input"
                            value={selectedBlock.terminalTitle || ''}
                            onChange={(e) =>
                              updateSelectedBlock({ terminalTitle: e.target.value })
                            }
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {(selectedBlock.terminalLines || []).map((ln, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.3rem' }}>
                              <select
                                className="cms-select"
                                style={{ width: 92, padding: '0.35rem' }}
                                value={ln.type}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.terminalLines || [])];
                                  next[idx] = { ...next[idx], type: e.target.value as any };
                                  updateSelectedBlock({ terminalLines: next });
                                }}
                              >
                                <option value="cmd">$ Cmd</option>
                                <option value="out">Salida</option>
                                <option value="success">✔ OK</option>
                                <option value="warn">⚠ Warn</option>
                              </select>
                              <input
                                type="text"
                                className="cms-input"
                                style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                                value={ln.text}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.terminalLines || [])];
                                  next[idx] = { ...next[idx], text: e.target.value };
                                  updateSelectedBlock({ terminalLines: next });
                                }}
                              />
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() =>
                                  updateSelectedBlock({
                                    terminalLines: (selectedBlock.terminalLines || []).filter(
                                      (_, i) => i !== idx
                                    ),
                                  })
                                }
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedBlock({
                                terminalLines: [
                                  ...(selectedBlock.terminalLines || []),
                                  { type: 'cmd', text: 'npm run build' },
                                ],
                              })
                            }
                            className="cms-pill-toggle preview-active"
                            style={{ justifyContent: 'center', marginTop: '0.3rem' }}
                          >
                            + Añadir Línea de Terminal
                          </button>
                        </div>
                      </>
                    )}

                    {/* FLASHCARDS 3D */}
                    {selectedBlock.type === 'flashcards' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {(selectedBlock.flashcards || []).map((fc, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.7rem',
                              borderRadius: '10px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(168,85,247,0.22)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="cms-label">Tarjeta {idx + 1}</span>
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() =>
                                  updateSelectedBlock({
                                    flashcards: (selectedBlock.flashcards || []).filter(
                                      (_, i) => i !== idx
                                    ),
                                  })
                                }
                              >
                                <Trash2 size={13} color="#fb7185" />
                              </button>
                            </div>
                            <input
                              type="text"
                              className="cms-input"
                              placeholder="Categoría (ej. SEGURIDAD)"
                              value={fc.tag || ''}
                              onChange={(e) => {
                                const next = [...(selectedBlock.flashcards || [])];
                                next[idx] = { ...next[idx], tag: e.target.value };
                                updateSelectedBlock({ flashcards: next });
                              }}
                            />
                            <textarea
                              rows={2}
                              className="cms-textarea"
                              placeholder="Frente (Pregunta o Concepto)"
                              value={fc.front}
                              onChange={(e) => {
                                const next = [...(selectedBlock.flashcards || [])];
                                next[idx] = { ...next[idx], front: e.target.value };
                                updateSelectedBlock({ flashcards: next });
                              }}
                            />
                            <textarea
                              rows={3}
                              className="cms-textarea"
                              placeholder="Reverso (Definición al voltear)"
                              value={fc.back}
                              onChange={(e) => {
                                const next = [...(selectedBlock.flashcards || [])];
                                next[idx] = { ...next[idx], back: e.target.value };
                                updateSelectedBlock({ flashcards: next });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedBlock({
                              flashcards: [
                                ...(selectedBlock.flashcards || []),
                                {
                                  tag: 'CONCEPTO',
                                  front: 'Nueva pregunta clave',
                                  back: 'Explicación al girar la tarjeta.',
                                },
                              ],
                            })
                          }
                          className="cms-pill-toggle preview-active"
                          style={{ justifyContent: 'center' }}
                        >
                          + Añadir Flashcard
                        </button>
                      </div>
                    )}

                    {/* DIAGRAMA DE ARQUITECTURA */}
                    {selectedBlock.type === 'architecture' && (
                      <>
                        <div className="cms-field-group">
                          <label className="cms-label">Dirección del Flujo</label>
                          <select
                            className="cms-select"
                            value={selectedBlock.archDirection || 'horizontal'}
                            onChange={(e) =>
                              updateSelectedBlock({
                                archDirection: e.target.value as 'horizontal' | 'vertical',
                              })
                            }
                          >
                            <option value="horizontal">Horizontal (→)</option>
                            <option value="vertical">Vertical (↓)</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                          {(selectedBlock.archNodes || []).map((nd, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.6rem',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(168,85,247,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.3rem',
                              }}
                            >
                              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="cms-input"
                                  placeholder="Servicio / Nodo"
                                  value={nd.title}
                                  onChange={(e) => {
                                    const next = [...(selectedBlock.archNodes || [])];
                                    next[idx] = { ...next[idx], title: e.target.value };
                                    updateSelectedBlock({ archNodes: next });
                                  }}
                                />
                                <input
                                  type="color"
                                  value={nd.accent || '#a855f7'}
                                  onChange={(e) => {
                                    const next = [...(selectedBlock.archNodes || [])];
                                    next[idx] = { ...next[idx], accent: e.target.value };
                                    updateSelectedBlock({ archNodes: next });
                                  }}
                                  style={{ width: 32, height: 30, border: 'none', background: 'transparent' }}
                                />
                                <button
                                  type="button"
                                  className="cms-mini-icon-btn"
                                  onClick={() =>
                                    updateSelectedBlock({
                                      archNodes: (selectedBlock.archNodes || []).filter(
                                        (_, i) => i !== idx
                                      ),
                                    })
                                  }
                                >
                                  <Trash2 size={13} color="#fb7185" />
                                </button>
                              </div>
                              <input
                                type="text"
                                className="cms-input"
                                placeholder="Subtítulo / Tecnología"
                                value={nd.subtitle || ''}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.archNodes || [])];
                                  next[idx] = { ...next[idx], subtitle: e.target.value };
                                  updateSelectedBlock({ archNodes: next });
                                }}
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedBlock({
                                archNodes: [
                                  ...(selectedBlock.archNodes || []),
                                  { title: 'Nuevo Nodo', subtitle: 'Microservicio', accent: '#f43f5e' },
                                ],
                              })
                            }
                            className="cms-pill-toggle preview-active"
                            style={{ justifyContent: 'center' }}
                          >
                            + Añadir Nodo al Diagrama
                          </button>
                        </div>
                      </>
                    )}

                    {/* CHIPS / BADGES */}
                    {selectedBlock.type === 'badges' && (
                      <>
                        {renderAlignControls(selectedBlock.align)}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {(selectedBlock.badges || []).map((b, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <input
                                type="color"
                                value={b.color || '#c084fc'}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.badges || [])];
                                  next[idx] = { ...next[idx], color: e.target.value };
                                  updateSelectedBlock({ badges: next });
                                }}
                                style={{ width: 32, height: 30, border: 'none', background: 'transparent' }}
                              />
                              <input
                                type="text"
                                className="cms-input"
                                value={b.label}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.badges || [])];
                                  next[idx] = { ...next[idx], label: e.target.value };
                                  updateSelectedBlock({ badges: next });
                                }}
                              />
                              <button
                                type="button"
                                className="cms-mini-icon-btn"
                                onClick={() =>
                                  updateSelectedBlock({
                                    badges: (selectedBlock.badges || []).filter((_, i) => i !== idx),
                                  })
                                }
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedBlock({
                                badges: [
                                  ...(selectedBlock.badges || []),
                                  { label: 'Docker', color: '#22d3ee' },
                                ],
                              })
                            }
                            className="cms-pill-toggle preview-active"
                            style={{ justifyContent: 'center' }}
                          >
                            + Añadir Chip
                          </button>
                        </div>
                      </>
                    )}

                    {/* BOTONES CTA */}
                    {selectedBlock.type === 'cta_buttons' && (
                      <>
                        {renderAlignControls(selectedBlock.align)}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {(selectedBlock.ctaButtons || []).map((btn, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.65rem',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(168,85,247,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="cms-label">Botón {idx + 1}</span>
                                <button
                                  type="button"
                                  className="cms-mini-icon-btn"
                                  onClick={() =>
                                    updateSelectedBlock({
                                      ctaButtons: (selectedBlock.ctaButtons || []).filter(
                                        (_, i) => i !== idx
                                      ),
                                    })
                                  }
                                >
                                  <Trash2 size={13} color="#fb7185" />
                                </button>
                              </div>
                              <input
                                type="text"
                                className="cms-input"
                                placeholder="Texto del botón"
                                value={btn.label}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.ctaButtons || [])];
                                  next[idx] = { ...next[idx], label: e.target.value };
                                  updateSelectedBlock({ ctaButtons: next });
                                }}
                              />
                              <input
                                type="text"
                                className="cms-input"
                                placeholder="https://..."
                                value={btn.url}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.ctaButtons || [])];
                                  next[idx] = { ...next[idx], url: e.target.value };
                                  updateSelectedBlock({ ctaButtons: next });
                                }}
                              />
                              <select
                                className="cms-select"
                                value={btn.variant}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.ctaButtons || [])];
                                  next[idx] = { ...next[idx], variant: e.target.value as any };
                                  updateSelectedBlock({ ctaButtons: next });
                                }}
                              >
                                <option value="gradient">Degradado CodePulse</option>
                                <option value="outline">Borde Carmesí</option>
                                <option value="glass">Cristal Púrpura</option>
                                <option value="white">Blanco Alto Contraste</option>
                              </select>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedBlock({
                                ctaButtons: [
                                  ...(selectedBlock.ctaButtons || []),
                                  { label: 'Nuevo Enlace', url: 'https://', variant: 'gradient' },
                                ],
                              })
                            }
                            className="cms-pill-toggle preview-active"
                            style={{ justifyContent: 'center' }}
                          >
                            + Añadir Botón
                          </button>
                        </div>
                      </>
                    )}

                    {/* EMBED / IFRAME */}
                    {selectedBlock.type === 'embed' && (
                      <>
                        <div className="cms-field-group">
                          <label className="cms-label">URL Embebida (StackBlitz, CodePen, Figma...)</label>
                          <input
                            type="text"
                            className="cms-input"
                            value={selectedBlock.embedUrl || ''}
                            onChange={(e) => updateSelectedBlock({ embedUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">
                            Altura ({selectedBlock.embedHeight || 420}px)
                          </label>
                          <input
                            type="range"
                            min={240}
                            max={800}
                            value={selectedBlock.embedHeight || 420}
                            onChange={(e) =>
                              updateSelectedBlock({ embedHeight: Number(e.target.value) })
                            }
                            className="cms-range"
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Pie descriptivo</label>
                          <input
                            type="text"
                            className="cms-input"
                            value={selectedBlock.caption || ''}
                            onChange={(e) => updateSelectedBlock({ caption: e.target.value })}
                          />
                        </div>
                      </>
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
                          {renderRichToolbar()}
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
                            <option value="rust">Rust / Go / C++</option>
                            <option value="json">JSON / YAML</option>
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
                          <label className="cms-label">
                            Escala de Imagen ({selectedBlock.widthPercent || 100}%)
                          </label>
                          <input
                            type="range"
                            min={20}
                            max={100}
                            value={selectedBlock.widthPercent || 100}
                            onChange={(e) =>
                              updateSelectedBlock({ widthPercent: Number(e.target.value) })
                            }
                            className="cms-range"
                          />
                        </div>
                        {renderAlignControls(selectedBlock.align || 'center')}
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
                          <label className="cms-label">Elementos (Soporta **negrita** y `código`)</label>
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
                                    const next = (selectedBlock.items || []).filter(
                                      (_, i) => i !== idx
                                    );
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
                              <div
                                key={idx}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                              >
                                <input
                                  type="radio"
                                  name="quiz_correct_opt"
                                  checked={(selectedBlock.correctIndex ?? 0) === idx}
                                  onChange={() => updateSelectedBlock({ correctIndex: idx })}
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
                                      const next = (selectedBlock.options || []).filter(
                                        (_, i) => i !== idx
                                      );
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

                    {/* RETO DE CÓDIGO / TERMINAL */}
                    {selectedBlock.type === 'code_challenge' && (
                      <>
                        <div className="cms-field-group">
                          <label className="cms-label">Lenguaje / Entorno</label>
                          <select
                            className="cms-select"
                            value={selectedBlock.challengeLanguage || 'sql'}
                            onChange={(e) =>
                              updateSelectedBlock({ challengeLanguage: e.target.value })
                            }
                          >
                            <option value="sql">SQL</option>
                            <option value="python">Python</option>
                            <option value="typescript">TypeScript / JS</option>
                            <option value="bash">Bash / Terminal</option>
                            <option value="docker">Docker</option>
                          </select>
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Consigna del Reto</label>
                          <textarea
                            rows={3}
                            className="cms-textarea"
                            value={selectedBlock.challengePrompt || ''}
                            onChange={(e) =>
                              updateSelectedBlock({ challengePrompt: e.target.value })
                            }
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Código Inicial</label>
                          <textarea
                            rows={3}
                            className="cms-textarea"
                            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                            value={selectedBlock.challengeStarter || ''}
                            onChange={(e) =>
                              updateSelectedBlock({ challengeStarter: e.target.value })
                            }
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">
                            Palabras / Comandos Esperados (separados por coma)
                          </label>
                          <input
                            type="text"
                            className="cms-input"
                            style={{ fontFamily: 'monospace' }}
                            value={(selectedBlock.challengeExpectedTokens || []).join(', ')}
                            onChange={(e) =>
                              updateSelectedBlock({
                                challengeExpectedTokens: e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="SELECT, WHERE, ORDER BY"
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Pista (Opcional)</label>
                          <input
                            type="text"
                            className="cms-input"
                            value={selectedBlock.challengeHint || ''}
                            onChange={(e) =>
                              updateSelectedBlock({ challengeHint: e.target.value })
                            }
                          />
                        </div>
                      </>
                    )}

                    {/* COMPLETAR HUECOS / CÓDIGO */}
                    {selectedBlock.type === 'fill_blank' && (
                      <>
                        <div className="cms-field-group">
                          <label className="cms-label">Instrucción</label>
                          <input
                            type="text"
                            className="cms-input"
                            value={selectedBlock.question || ''}
                            onChange={(e) => updateSelectedBlock({ question: e.target.value })}
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">
                            Oración con Huecos (encierra cada respuesta entre [[dobles corchetes]])
                          </label>
                          <textarea
                            rows={4}
                            className="cms-textarea"
                            value={selectedBlock.blankSentence || ''}
                            onChange={(e) =>
                              updateSelectedBlock({ blankSentence: e.target.value })
                            }
                            placeholder="Ejemplo: Para iniciar un contenedor usamos docker [[run]] -p [[8080:80]] nginx"
                          />
                        </div>
                        <div className="cms-field-group">
                          <label className="cms-label">Explicación al acertar</label>
                          <textarea
                            rows={2}
                            className="cms-textarea"
                            value={selectedBlock.blankExplanation || ''}
                            onChange={(e) =>
                              updateSelectedBlock({ blankExplanation: e.target.value })
                            }
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
                          <option value="dots">Tres Puntos Editoriales (• • •)</option>
                          <option value="space">Espacio en Blanco</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
