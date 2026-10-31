'use client';

import React, { useRef, useState } from 'react';
import {
  Type,
  Square,
  Circle as CircleIcon,
  Award,
  Minus,
  Image as ImageIcon,
  Trash2,
  Copy,
  RotateCcw,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Grid,
} from 'lucide-react';
import { CanvasElement, CanvasElementKind, CmsBlock } from './CmsBlockTypes';

interface FreeCanvasProps {
  block: CmsBlock;
  editable?: boolean;
  onUpdateBlock?: (patch: Partial<CmsBlock>) => void;
}

export default function CmsFreeCanvasBlock({
  block,
  editable = false,
  onUpdateBlock,
}: FreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedElId, setSelectedElId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const elements = block.canvasElements || [];
  const canvasHeight = block.canvasHeight || 380;
  const selectedEl = elements.find((el) => el.id === selectedElId) || null;

  const updateElements = (next: CanvasElement[]) => {
    onUpdateBlock?.({ canvasElements: next });
  };

  const patchElement = (id: string, patch: Partial<CanvasElement>) => {
    updateElements(elements.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  };

  const addElement = (kind: CanvasElementKind) => {
    const id = `cel_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex || 1), 1);

    let newEl: CanvasElement = {
      id,
      kind,
      x: 15,
      y: 20,
      w: 36,
      h: 70,
      rotation: 0,
      zIndex: maxZ + 1,
      text: 'Texto Libre',
      bg: 'transparent',
      color: '#ffffff',
      borderColor: 'transparent',
      borderRadius: 10,
      fontSize: 22,
      fontWeight: 700,
      textAlign: 'left',
    };

    if (kind === 'box') {
      newEl = {
        ...newEl,
        w: 34,
        h: 140,
        text: 'Tarjeta / Nodo\nEscribe detalles aquí.',
        bg: 'rgba(18, 9, 36, 0.9)',
        color: '#e2e8f0',
        borderColor: '#a855f7',
        borderRadius: 16,
        fontSize: 14,
        fontWeight: 500,
      };
    } else if (kind === 'badge') {
      newEl = {
        ...newEl,
        w: 28,
        h: 34,
        text: 'INSIGNIA PRO',
        bg: 'rgba(244, 63, 94, 0.22)',
        color: '#fda4af',
        borderColor: '#f43f5e',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        textAlign: 'center',
      };
    } else if (kind === 'circle') {
      newEl = {
        ...newEl,
        w: 22,
        h: 130,
        text: '',
        bg: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, transparent 72%)',
        borderColor: 'rgba(168, 85, 247, 0.35)',
        borderRadius: 999,
      };
    } else if (kind === 'line') {
      newEl = {
        ...newEl,
        w: 40,
        h: 4,
        text: '',
        bg: 'linear-gradient(90deg, #9333ea, #f43f5e)',
        borderRadius: 999,
      };
    } else if (kind === 'image') {
      const url =
        typeof window !== 'undefined'
          ? window.prompt(
              'Pega la URL de la imagen para colocar en el lienzo:',
              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
            )
          : null;
      if (!url) return;
      newEl = {
        ...newEl,
        w: 35,
        h: 160,
        text: '',
        imageUrl: url,
        bg: 'transparent',
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 14,
      };
    }

    updateElements([...elements, newEl]);
    setSelectedElId(id);
  };

  const handleDragStart = (e: React.MouseEvent, el: CanvasElement) => {
    if (!editable || editingTextId === el.id) return;
    e.stopPropagation();
    setSelectedElId(el.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;

    const onMove = (ev: MouseEvent) => {
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - startY) / rect.height) * 100;
      const nextX = Math.max(0, Math.min(94, Math.round((origX + dxPct) * 10) / 10));
      const nextY = Math.max(0, Math.min(92, Math.round((origY + dyPct) * 10) / 10));
      patchElement(el.id, { x: nextX, y: nextY });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, el: CanvasElement) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origW = el.w;
    const origH = el.h;

    const onMove = (ev: MouseEvent) => {
      const dwPct = ((ev.clientX - startX) / rect.width) * 100;
      const dhPx = ev.clientY - startY;
      const nextW = Math.max(6, Math.min(100 - el.x, Math.round((origW + dwPct) * 10) / 10));
      const nextH = Math.max(4, Math.round(origH + dhPx));
      patchElement(el.id, { w: nextW, h: nextH });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const duplicateSelected = () => {
    if (!selectedEl) return;
    const copy: CanvasElement = {
      ...selectedEl,
      id: `cel_${Date.now()}`,
      x: Math.min(90, selectedEl.x + 4),
      y: Math.min(88, selectedEl.y + 4),
      zIndex: (selectedEl.zIndex || 1) + 1,
    };
    updateElements([...elements, copy]);
    setSelectedElId(copy.id);
  };

  const deleteSelected = () => {
    if (!selectedEl) return;
    updateElements(elements.filter((e) => e.id !== selectedEl.id));
    setSelectedElId(null);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* BARRA DE HERRAMIENTAS DEL LIENZO LIBRE (SOLO EN EDICIÓN) */}
      {editable && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.45rem',
            padding: '0.55rem 0.75rem',
            marginBottom: '0.5rem',
            borderRadius: '10px',
            background: '#120824',
            border: '1px solid rgba(168, 85, 247, 0.35)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#f43f5e',
                marginRight: '0.3rem',
              }}
            >
              CANVA LIBRE:
            </span>
            <button type="button" onClick={() => addElement('text')} className="cms-pill-toggle" style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem' }}>
              <Type size={13} /> Texto
            </button>
            <button type="button" onClick={() => addElement('box')} className="cms-pill-toggle" style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem' }}>
              <Square size={13} /> Caja
            </button>
            <button type="button" onClick={() => addElement('badge')} className="cms-pill-toggle" style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem' }}>
              <Award size={13} /> Badge
            </button>
            <button type="button" onClick={() => addElement('circle')} className="cms-pill-toggle" style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem' }}>
              <CircleIcon size={13} /> Glow
            </button>
            <button type="button" onClick={() => addElement('line')} className="cms-pill-toggle" style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem' }}>
              <Minus size={13} /> Línea
            </button>
            <button type="button" onClick={() => addElement('image')} className="cms-pill-toggle" style={{ padding: '0.28rem 0.55rem', fontSize: '0.72rem' }}>
              <ImageIcon size={13} /> Imagen
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => onUpdateBlock?.({ canvasGrid: !block.canvasGrid })}
              className={`cms-pill-toggle ${block.canvasGrid ? 'preview-active' : ''}`}
              style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }}
              title="Mostrar/Ocultar cuadrícula"
            >
              <Grid size={12} /> Grid
            </button>
            <button
              type="button"
              onClick={() => onUpdateBlock?.({ canvasHeight: Math.max(220, canvasHeight - 60) })}
              className="cms-pill-toggle"
              style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }}
              title="Reducir altura del lienzo"
            >
              -Alto
            </button>
            <button
              type="button"
              onClick={() => onUpdateBlock?.({ canvasHeight: Math.min(900, canvasHeight + 60) })}
              className="cms-pill-toggle"
              style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }}
              title="Aumentar altura del lienzo"
            >
              +Alto
            </button>
          </div>
        </div>
      )}

      {/* CONTROLES RÁPIDOS DEL ELEMENTO FLOTANTE SELECCIONADO */}
      {editable && selectedEl && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.75rem',
            marginBottom: '0.5rem',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.09)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            fontSize: '0.73rem',
          }}
        >
          <span style={{ color: '#fda4af', fontWeight: 700 }}>Elemento:</span>

          {selectedEl.kind !== 'image' && selectedEl.kind !== 'line' && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              Texto
              <input
                type="color"
                value={selectedEl.color?.startsWith('#') ? selectedEl.color : '#ffffff'}
                onChange={(e) => patchElement(selectedEl.id, { color: e.target.value })}
                style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
            </label>
          )}

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            Fondo
            <input
              type="color"
              value={selectedEl.bg?.startsWith('#') ? selectedEl.bg : '#1e1b4b'}
              onChange={(e) => patchElement(selectedEl.id, { bg: e.target.value })}
              style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            Borde
            <input
              type="color"
              value={selectedEl.borderColor?.startsWith('#') ? selectedEl.borderColor : '#a855f7'}
              onChange={(e) => patchElement(selectedEl.id, { borderColor: e.target.value })}
              style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
          </label>

          {selectedEl.kind !== 'image' && selectedEl.kind !== 'line' && selectedEl.kind !== 'circle' && (
            <>
              <button
                type="button"
                className="cms-mini-icon-btn"
                onClick={() =>
                  patchElement(selectedEl.id, {
                    fontSize: Math.max(10, (selectedEl.fontSize || 16) - 2),
                  })
                }
                title="Reducir letra"
              >
                A-
              </button>
              <button
                type="button"
                className="cms-mini-icon-btn"
                onClick={() =>
                  patchElement(selectedEl.id, {
                    fontSize: Math.min(64, (selectedEl.fontSize || 16) + 2),
                  })
                }
                title="Aumentar letra"
              >
                A+
              </button>
            </>
          )}

          <button
            type="button"
            className="cms-mini-icon-btn"
            onClick={() => patchElement(selectedEl.id, { rotation: (selectedEl.rotation || 0) - 5 })}
            title="Rotar -5°"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            className="cms-mini-icon-btn"
            onClick={() => patchElement(selectedEl.id, { rotation: (selectedEl.rotation || 0) + 5 })}
            title="Rotar +5°"
          >
            <RotateCw size={13} />
          </button>

          <button
            type="button"
            className="cms-mini-icon-btn"
            onClick={() => patchElement(selectedEl.id, { zIndex: (selectedEl.zIndex || 1) + 1 })}
            title="Traer al frente"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            className="cms-mini-icon-btn"
            onClick={() =>
              patchElement(selectedEl.id, { zIndex: Math.max(1, (selectedEl.zIndex || 1) - 1) })
            }
            title="Enviar atrás"
          >
            <ArrowDown size={13} />
          </button>

          <button type="button" className="cms-mini-icon-btn" onClick={duplicateSelected} title="Duplicar elemento">
            <Copy size={13} />
          </button>
          <button type="button" className="cms-mini-icon-btn" onClick={deleteSelected} title="Eliminar elemento">
            <Trash2 size={13} color="#fb7185" />
          </button>
        </div>
      )}

      {/* ÁREA DEL LIENZO LIBRE */}
      <div
        ref={containerRef}
        onClick={() => {
          setSelectedElId(null);
          setEditingTextId(null);
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: canvasHeight,
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1px solid rgba(168, 85, 247, 0.32)',
          background:
            block.canvasBg ||
            'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.25), #080412 75%)',
          boxShadow: '0 18px 44px rgba(0,0,0,0.45)',
          userSelect: editable ? 'none' : 'auto',
        }}
      >
        {block.canvasGrid && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
            }}
          />
        )}

        {elements.map((el) => {
          const isSel = editable && selectedElId === el.id;
          const isEditing = editable && editingTextId === el.id;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleDragStart(e, el)}
              onClick={(e) => {
                if (!editable) return;
                e.stopPropagation();
                setSelectedElId(el.id);
              }}
              onDoubleClick={(e) => {
                if (!editable || el.kind === 'image' || el.kind === 'line' || el.kind === 'circle')
                  return;
                e.stopPropagation();
                setEditingTextId(el.id);
              }}
              style={{
                position: 'absolute',
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                height: el.h,
                zIndex: el.zIndex || 1,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                background: el.bg || 'transparent',
                color: el.color || '#ffffff',
                border:
                  el.borderColor && el.borderColor !== 'transparent'
                    ? `1.5px solid ${el.borderColor}`
                    : isSel
                    ? '1.5px dashed #f43f5e'
                    : 'none',
                borderRadius: el.borderRadius ?? 10,
                outline: isSel ? '2px solid #f43f5e' : 'none',
                outlineOffset: '2px',
                cursor: editable ? (isEditing ? 'text' : 'grab') : 'default',
                display: 'flex',
                alignItems: el.kind === 'badge' ? 'center' : 'flex-start',
                justifyContent:
                  el.textAlign === 'center'
                    ? 'center'
                    : el.textAlign === 'right'
                    ? 'flex-end'
                    : 'flex-start',
                padding:
                  el.kind === 'box'
                    ? '0.9rem 1rem'
                    : el.kind === 'badge'
                    ? '0.2rem 0.75rem'
                    : el.kind === 'text'
                    ? '0.2rem'
                    : 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {el.kind === 'image' && el.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={el.imageUrl}
                  alt=""
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : isEditing ? (
                <textarea
                  autoFocus
                  value={el.text || ''}
                  onChange={(e) => patchElement(el.id, { text: e.target.value })}
                  onBlur={() => setEditingTextId(null)}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    color: el.color || '#ffffff',
                    fontSize: el.fontSize || 16,
                    fontWeight: el.fontWeight || 600,
                    textAlign: el.textAlign || 'left',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    fontSize: el.fontSize || 16,
                    fontWeight: el.fontWeight || 600,
                    textAlign: el.textAlign || 'left',
                    lineHeight: 1.35,
                    whiteSpace: 'pre-wrap',
                    pointerEvents: 'none',
                  }}
                >
                  {el.text}
                </div>
              )}

              {/* Tirador de Redimensionamiento */}
              {isSel && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, el)}
                  title="Arrastra para redimensionar"
                  style={{
                    position: 'absolute',
                    right: 2,
                    bottom: 2,
                    width: 13,
                    height: 13,
                    borderRadius: '3px',
                    background: '#f43f5e',
                    border: '2px solid #ffffff',
                    cursor: 'nwse-resize',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

