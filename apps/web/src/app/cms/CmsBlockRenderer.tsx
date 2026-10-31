'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  RotateCw,
  ArrowRight,
  ArrowDown,
  Terminal as TerminalIcon,
  ExternalLink,
} from 'lucide-react';
import { BlockBoxStyle, CmsBlock } from './CmsBlockTypes';
import CmsFreeCanvasBlock from './CmsFreeCanvasBlock';

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/embed/')) return url;
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  } catch {
    return null;
  }
  return null;
}

/**
 * Renderiza formato enriquecido inline:
 * **negrita**, *cursiva*, __subrayado__, ==resaltado==, `código`, [texto](url)
 */
export function renderRichInline(text?: string): React.ReactNode {
  if (!text) return null;

  const tokenRegex =
    /(\*\*[^*]+\*\*|==[^=]+==|__[^_]+__|`[^`]+`|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} style={{ fontWeight: 800, color: '#ffffff' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
      return (
        <mark
          key={idx}
          style={{
            background: 'linear-gradient(90deg, rgba(168,85,247,0.35), rgba(244,63,94,0.35))',
            color: '#ffffff',
            padding: '0.08rem 0.38rem',
            borderRadius: '4px',
          }}
        >
          {part.slice(2, -2)}
        </mark>
      );
    }
    if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
      return (
        <span
          key={idx}
          style={{ textDecoration: 'underline', textDecorationColor: '#f43f5e', textUnderlineOffset: '3px' }}
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          style={{
            fontFamily: "'Fira Code', Consolas, monospace",
            fontSize: '0.88em',
            background: 'rgba(168, 85, 247, 0.18)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            color: '#f0abfc',
            padding: '0.1rem 0.4rem',
            borderRadius: '5px',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#38bdf8',
            textDecoration: 'underline',
            fontWeight: 600,
          }}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function getFontFamilyCss(ff?: BlockBoxStyle['fontFamily']): string | undefined {
  if (!ff) return undefined;
  switch (ff) {
    case 'display':
      return "'Rajdhani', sans-serif";
    case 'mono':
      return "'Fira Code', Consolas, Monaco, monospace";
    case 'serif':
      return "Georgia, 'Times New Roman', serif";
    case 'sans':
      return "'Inter', system-ui, sans-serif";
  }
}

function getShadowCss(preset?: BlockBoxStyle['shadowPreset']): string | undefined {
  switch (preset) {
    case 'soft':
      return '0 10px 28px rgba(0,0,0,0.35)';
    case 'deep':
      return '0 22px 54px rgba(0,0,0,0.68)';
    case 'glow-purple':
      return '0 0 32px rgba(168, 85, 247, 0.38)';
    case 'glow-red':
      return '0 0 32px rgba(244, 63, 94, 0.38)';
    case 'glow-cyan':
      return '0 0 32px rgba(34, 211, 238, 0.35)';
    default:
      return undefined;
  }
}

export default function CmsBlockRenderer({
  block,
  editable = false,
  onUpdateBlock,
}: {
  block: CmsBlock;
  editable?: boolean;
  onUpdateBlock?: (patch: Partial<CmsBlock>) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [openAccMap, setOpenAccMap] = useState<Record<number, boolean>>({ 0: true });
  const [flippedMap, setFlippedMap] = useState<Record<number, boolean>>({});

  const st = block.style || {};

  const getGradientStyle = (grad?: string): React.CSSProperties => {
    if (grad === 'purple-red') {
      return {
        background: 'linear-gradient(90deg, #c084fc 0%, #f43f5e 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    }
    if (grad === 'cyan-blue') {
      return {
        background: 'linear-gradient(90deg, #22d3ee 0%, #818cf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    }
    if (grad === 'gold') {
      return {
        background: 'linear-gradient(90deg, #fde047 0%, #f97316 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    }
    if (grad === 'emerald') {
      return {
        background: 'linear-gradient(90deg, #34d399 0%, #22d3ee 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    }
    return {};
  };

  const typographyOverrides: React.CSSProperties = {
    ...(st.fontFamily ? { fontFamily: getFontFamilyCss(st.fontFamily) } : {}),
    ...(st.fontSizePx ? { fontSize: `${st.fontSizePx}px` } : {}),
    ...(st.fontWeight ? { fontWeight: st.fontWeight } : {}),
    ...(typeof st.letterSpacing === 'number' ? { letterSpacing: `${st.letterSpacing}px` } : {}),
    ...(typeof st.lineHeight === 'number' ? { lineHeight: st.lineHeight } : {}),
    ...(st.textTransform && st.textTransform !== 'none'
      ? { textTransform: st.textTransform }
      : {}),
  };

  const hasBoxWrapper =
    st.paddingY !== undefined ||
    st.paddingX !== undefined ||
    st.marginY !== undefined ||
    st.bgCustom ||
    st.useGradientBg ||
    (st.borderWidth && st.borderWidth > 0) ||
    (st.shadowPreset && st.shadowPreset !== 'none');

  const wrapperStyle: React.CSSProperties = hasBoxWrapper
    ? {
        padding: `${st.paddingY ?? 0}px ${st.paddingX ?? 0}px`,
        margin: `${st.marginY ?? 0}px 0`,
        background: st.useGradientBg
          ? `linear-gradient(${st.bgAngle ?? 135}deg, ${st.bgCustom || '#4c1d95'}, ${
              st.bgGradient2 || '#be123c'
            })`
          : st.bgCustom || 'transparent',
        border:
          st.borderWidth && st.borderWidth > 0
            ? `${st.borderWidth}px ${st.borderStyle || 'solid'} ${
                st.borderColor || 'rgba(168,85,247,0.45)'
              }`
            : undefined,
        borderRadius: st.borderRadius !== undefined ? `${st.borderRadius}px` : undefined,
        boxShadow: getShadowCss(st.shadowPreset),
      }
    : {};

  const renderInner = (): React.ReactNode => {
    switch (block.type) {
      case 'heading1':
        return (
          <h1
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 'clamp(2rem, 3.6vw, 2.85rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              textAlign: block.align || 'left',
              color: block.color || '#ffffff',
              margin: '0.35rem 0',
              ...typographyOverrides,
              ...getGradientStyle(block.gradientText),
            }}
          >
            {renderRichInline(block.text)}
          </h1>
        );

      case 'heading2':
        return (
          <h2
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 'clamp(1.5rem, 2.6vw, 2.05rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: block.align || 'left',
              color: block.color || '#f43f5e',
              margin: '0.35rem 0',
              paddingBottom: '0.45rem',
              borderBottom: '1px solid rgba(168, 85, 247, 0.22)',
              ...typographyOverrides,
            }}
          >
            {renderRichInline(block.text)}
          </h2>
        );

      case 'heading3':
        return (
          <div style={{ textAlign: block.align || 'left', margin: '0.3rem 0' }}>
            {block.subtitle && (
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: '#c084fc',
                  marginBottom: '0.25rem',
                }}
              >
                {block.subtitle}
              </div>
            )}
            <h3
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: block.color || '#f1f5f9',
                margin: 0,
                ...typographyOverrides,
              }}
            >
              {renderRichInline(block.text)}
            </h3>
          </div>
        );

      case 'paragraph': {
        const sizeMap = { sm: '0.9rem', md: '1.02rem', lg: '1.16rem', xl: '1.32rem' };
        const hasBg = block.bgColor && block.bgColor !== 'transparent';
        return (
          <p
            style={{
              fontSize: sizeMap[block.fontSize || 'md'],
              lineHeight: 1.75,
              textAlign: block.align || 'left',
              color: block.color || '#cbd5e1',
              backgroundColor: hasBg ? block.bgColor : 'transparent',
              padding: hasBg ? '1.25rem 1.5rem' : 0,
              borderRadius: hasBg ? '12px' : 0,
              border: hasBg ? '1px solid rgba(255,255,255,0.08)' : 'none',
              whiteSpace: 'pre-wrap',
              margin: 0,
              ...typographyOverrides,
            }}
          >
            {renderRichInline(block.text)}
          </p>
        );
      }

      case 'banner':
        return (
          <div
            style={{
              background:
                block.bannerGradient || 'linear-gradient(135deg, #4c1d95 0%, #be123c 100%)',
              borderRadius: '18px',
              padding: '2.4rem 2.2rem',
              textAlign: block.align || 'left',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
            }}
          >
            {block.badgeText && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#ffffff',
                  marginBottom: '0.85rem',
                  textTransform: 'uppercase',
                }}
              >
                {block.badgeText}
              </span>
            )}
            <h2
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 'clamp(1.75rem, 3vw, 2.4rem)',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 0.6rem 0',
                ...typographyOverrides,
              }}
            >
              {renderRichInline(block.text)}
            </h2>
            {block.subtitle && (
              <p
                style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {renderRichInline(block.subtitle)}
              </p>
            )}
            {block.buttonText && (
              <a
                href={block.buttonUrl || '#'}
                target={block.buttonUrl?.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '1.25rem',
                  padding: '0.6rem 1.35rem',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#090414',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                {block.buttonText}
              </a>
            )}
          </div>
        );

      case 'table': {
        const headers = block.headers || [];
        const rows = block.rows || [];
        const accent = block.tableAccent || '#9333ea';
        return (
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              background: '#0a0514',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.93rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ background: accent }}>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '0.85rem 1.1rem',
                        color: '#ffffff',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.02rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {editable ? (
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const next = [...headers];
                            next[i] = e.target.value;
                            onUpdateBlock?.({ headers: next });
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            fontWeight: 'inherit',
                            textTransform: 'uppercase',
                            width: '100%',
                            outline: 'none',
                          }}
                        />
                      ) : (
                        renderRichInline(h)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      background:
                        block.striped && rIdx % 2 === 1
                          ? 'rgba(168, 85, 247, 0.06)'
                          : 'transparent',
                      borderBottom:
                        rIdx < rows.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          padding: '0.8rem 1.1rem',
                          color: '#e2e8f0',
                        }}
                      >
                        {editable ? (
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const nextRows = rows.map((r, ri) =>
                                ri === rIdx
                                  ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                  : r
                              );
                              onUpdateBlock?.({ rows: nextRows });
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e2e8f0',
                              fontFamily: 'inherit',
                              fontSize: 'inherit',
                              width: '100%',
                              outline: 'none',
                            }}
                          />
                        ) : (
                          renderRichInline(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'columns2':
      case 'columns3': {
        const cols = block.columns || [];
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
              gap: '1.15rem',
            }}
          >
            {cols.map((col, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(14, 8, 26, 0.9)',
                  border: `1px solid ${col.accent || 'rgba(168, 85, 247, 0.35)'}`,
                  borderRadius: '14px',
                  padding: '1.4rem',
                }}
              >
                <h4
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '1.22rem',
                    fontWeight: 700,
                    color: col.accent || '#c084fc',
                    margin: '0 0 0.55rem 0',
                  }}
                >
                  {renderRichInline(col.title)}
                </h4>
                <p
                  style={{
                    fontSize: '0.94rem',
                    lineHeight: 1.6,
                    color: '#cbd5e1',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {renderRichInline(col.content)}
                </p>
              </div>
            ))}
          </div>
        );
      }

      case 'callout': {
        const variantConfig = {
          info: {
            bg: 'rgba(59, 130, 246, 0.1)',
            border: 'rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            icon: <Info size={20} color="#60a5fa" />,
          },
          tip: {
            bg: 'rgba(168, 85, 247, 0.11)',
            border: 'rgba(168, 85, 247, 0.45)',
            color: '#e9d5ff',
            icon: <Lightbulb size={20} color="#c084fc" />,
          },
          warning: {
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.45)',
            color: '#fde68a',
            icon: <AlertTriangle size={20} color="#fbbf24" />,
          },
          danger: {
            bg: 'rgba(225, 29, 72, 0.11)',
            border: 'rgba(225, 29, 72, 0.45)',
            color: '#fecdd3',
            icon: <ShieldAlert size={20} color="#fb7185" />,
          },
        }[block.calloutVariant || 'tip'];

        return (
          <div
            style={{
              background: variantConfig.bg,
              border: `1px solid ${variantConfig.border}`,
              borderRadius: '14px',
              padding: '1.2rem 1.4rem',
              display: 'flex',
              gap: '0.9rem',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>{variantConfig.icon}</div>
            <div>
              {block.calloutTitle && (
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    color: '#ffffff',
                    marginBottom: '0.3rem',
                  }}
                >
                  {renderRichInline(block.calloutTitle)}
                </div>
              )}
              <div style={{ fontSize: '0.93rem', lineHeight: 1.6, color: variantConfig.color }}>
                {renderRichInline(block.text)}
              </div>
            </div>
          </div>
        );
      }

      case 'code': {
        const handleCopy = () => {
          navigator.clipboard.writeText(block.code || '');
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        };

        return (
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              background: '#07040e',
              boxShadow: '0 14px 32px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1.1rem',
                background: '#110921',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#c084fc',
                  }}
                >
                  {block.filename || `snippet.${block.language || 'txt'}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <pre
              style={{
                margin: 0,
                padding: '1.25rem 1.4rem',
                overflowX: 'auto',
                fontFamily: "'Fira Code', Consolas, Monaco, monospace",
                fontSize: '0.88rem',
                lineHeight: 1.65,
                color: '#f8fafc',
              }}
            >
              <code>{block.code}</code>
            </pre>
          </div>
        );
      }

      case 'image':
        return (
          <figure
            style={{
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems:
                block.align === 'left'
                  ? 'flex-start'
                  : block.align === 'right'
                  ? 'flex-end'
                  : 'center',
            }}
          >
            {block.mediaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.mediaUrl}
                alt={block.caption || 'Imagen de la lección'}
                style={{
                  width: `${block.widthPercent || 100}%`,
                  maxWidth: '100%',
                  borderRadius: block.rounded !== false ? '16px' : '4px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 14px 36px rgba(0,0,0,0.45)',
                }}
              />
            )}
            {block.caption && (
              <figcaption
                style={{
                  marginTop: '0.65rem',
                  fontSize: '0.84rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                {renderRichInline(block.caption)}
              </figcaption>
            )}
          </figure>
        );

      case 'video': {
        const ytUrl = getYoutubeEmbedUrl(block.mediaUrl || '');
        return (
          <div style={{ width: '100%' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                background: '#05020a',
              }}
            >
              {ytUrl ? (
                <iframe
                  src={ytUrl}
                  title={block.caption || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : (
                <video
                  src={block.mediaUrl}
                  controls
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
            </div>
            {block.caption && (
              <div
                style={{
                  marginTop: '0.6rem',
                  fontSize: '0.84rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                {renderRichInline(block.caption)}
              </div>
            )}
          </div>
        );
      }

      case 'list': {
        const items = block.items || [];
        if (block.listStyle === 'number') {
          return (
            <ol
              style={{
                margin: 0,
                paddingLeft: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                color: block.color || '#e2e8f0',
                fontSize: '0.98rem',
                lineHeight: 1.65,
                ...typographyOverrides,
              }}
            >
              {items.map((it, i) => (
                <li key={i}>{renderRichInline(it)}</li>
              ))}
            </ol>
          );
        }

        return (
          <ul
            style={{
              listStyle: block.listStyle === 'check' ? 'none' : 'disc',
              paddingLeft: block.listStyle === 'check' ? 0 : '1.4rem',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              color: block.color || '#e2e8f0',
              fontSize: '0.98rem',
              lineHeight: 1.65,
              ...typographyOverrides,
            }}
          >
            {items.map((it, i) => (
              <li
                key={i}
                style={{
                  display: block.listStyle === 'check' ? 'flex' : 'list-item',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                }}
              >
                {block.listStyle === 'check' && (
                  <CheckCircle2
                    size={18}
                    color="#f43f5e"
                    style={{ marginTop: '4px', flexShrink: 0 }}
                  />
                )}
                <span>{renderRichInline(it)}</span>
              </li>
            ))}
          </ul>
        );
      }

      case 'quote':
        return (
          <blockquote
            style={{
              margin: 0,
              padding: '1.35rem 1.6rem',
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.28)',
              borderRadius: '14px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '1.12rem',
                fontStyle: 'italic',
                color: block.color || '#f1f5f9',
                lineHeight: 1.6,
                ...typographyOverrides,
              }}
            >
              &ldquo;{renderRichInline(block.text)}&rdquo;
            </p>
            {block.author && (
              <footer
                style={{
                  marginTop: '0.55rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#c084fc',
                }}
              >
                — {block.author}
              </footer>
            )}
          </blockquote>
        );

      case 'quiz': {
        const opts = block.options || [];
        const isAnswered = selectedOption !== null;
        const isCorrect = selectedOption === (block.correctIndex ?? 0);

        return (
          <div
            style={{
              background: 'rgba(15, 8, 28, 0.92)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#f43f5e',
                letterSpacing: '0.14em',
                marginBottom: '0.65rem',
              }}
            >
              <HelpCircle size={15} /> AUTOEVALUACIÓN INTERACTIVA
            </div>
            <h4
              style={{
                fontSize: '1.12rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 1rem 0',
              }}
            >
              {renderRichInline(block.question)}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {opts.map((opt, idx) => {
                const chosen = selectedOption === idx;
                const right = idx === (block.correctIndex ?? 0);
                let border = 'rgba(255,255,255,0.12)';
                let bg = 'rgba(255,255,255,0.03)';
                if (isAnswered) {
                  if (right) {
                    border = '#10b981';
                    bg = 'rgba(16, 185, 129, 0.14)';
                  } else if (chosen) {
                    border = '#ef4444';
                    bg = 'rgba(239, 68, 68, 0.14)';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOption(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: `1px solid ${border}`,
                      background: bg,
                      color: '#f1f5f9',
                      fontSize: '0.93rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {renderRichInline(opt)}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: isCorrect ? '#6ee7b7' : '#fca5a5',
                  fontSize: '0.88rem',
                }}
              >
                <strong>{isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta.'}</strong>{' '}
                {renderRichInline(block.explanation)}
              </div>
            )}
          </div>
        );
      }

      case 'divider':
        if (block.dividerStyle === 'space') {
          return <div style={{ height: '2.4rem' }} />;
        }
        if (block.dividerStyle === 'dots') {
          return (
            <div style={{ textAlign: 'center', letterSpacing: '0.6rem', color: '#c084fc', margin: '0.8rem 0' }}>
              • • •
            </div>
          );
        }
        if (block.dividerStyle === 'gradient') {
          return (
            <div
              style={{
                height: '2px',
                width: '100%',
                background: 'linear-gradient(90deg, transparent, #9333ea, #e11d48, transparent)',
                margin: '0.75rem 0',
              }}
            />
          );
        }
        return (
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              margin: '0.75rem 0',
            }}
          />
        );

      // ======================================================
      // NUEVOS BLOQUES DE ALTA LIBERTAD CREATIVA E INTERACCIÓN
      // ======================================================

      case 'canvas_free':
        return (
          <CmsFreeCanvasBlock
            block={block}
            editable={editable}
            onUpdateBlock={onUpdateBlock}
          />
        );

      case 'tabs': {
        const tabs = block.tabs || [];
        const safeIdx = Math.min(activeTabIdx, Math.max(0, tabs.length - 1));
        const activeTab = tabs[safeIdx];
        return (
          <div
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              background: 'rgba(12, 6, 24, 0.92)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem',
                padding: '0.6rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tabs.map((t, idx) => {
                const isAct = idx === safeIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTabIdx(idx)}
                    style={{
                      padding: '0.48rem 1rem',
                      borderRadius: '9px',
                      border: isAct ? '1px solid #f43f5e' : '1px solid transparent',
                      background: isAct
                        ? 'linear-gradient(90deg, rgba(147,51,234,0.32), rgba(225,29,72,0.28))'
                        : 'transparent',
                      color: isAct ? '#ffffff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            {activeTab && (
              <div style={{ padding: '1.4rem 1.5rem' }}>
                {activeTab.title && (
                  <h4
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '0 0 0.55rem 0',
                    }}
                  >
                    {renderRichInline(activeTab.title)}
                  </h4>
                )}
                <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {renderRichInline(activeTab.content)}
                </p>
                {activeTab.code && (
                  <pre
                    style={{
                      marginTop: '1rem',
                      marginBottom: 0,
                      padding: '1rem 1.2rem',
                      borderRadius: '10px',
                      background: '#07040e',
                      border: '1px solid rgba(168,85,247,0.28)',
                      overflowX: 'auto',
                      fontFamily: "'Fira Code', Consolas, monospace",
                      fontSize: '0.84rem',
                      color: '#f8fafc',
                    }}
                  >
                    <code>{activeTab.code}</code>
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'accordion': {
        const items = block.accordions || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {items.map((acc, idx) => {
              const isOpen = Boolean(openAccMap[idx]);
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid rgba(168, 85, 247, 0.28)',
                    background: 'rgba(14, 8, 26, 0.85)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccMap((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.95rem 1.2rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{renderRichInline(acc.title)}</span>
                    {isOpen ? (
                      <ChevronDown size={18} color="#f43f5e" />
                    ) : (
                      <ChevronRight size={18} color="#c084fc" />
                    )}
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.2rem 1.1rem',
                        color: '#cbd5e1',
                        fontSize: '0.92rem',
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {renderRichInline(acc.content)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'steps': {
        const steps = block.steps || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'stretch',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9333ea, #e11d48)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: '#ffffff',
                    }}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        width: 2,
                        background: 'rgba(168, 85, 247, 0.3)',
                        marginTop: '0.35rem',
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    background: 'rgba(14, 8, 26, 0.85)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    borderRadius: '14px',
                    padding: '1.1rem 1.35rem',
                  }}
                >
                  {step.badge && (
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        color: '#f43f5e',
                      }}
                    >
                      {step.badge}
                    </span>
                  )}
                  <h4
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '0.2rem 0 0.4rem 0',
                    }}
                  >
                    {renderRichInline(step.title)}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {renderRichInline(step.content)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'stats': {
        const stats = block.stats || [];
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
            }}
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(14, 8, 26, 0.92)',
                  border: `1px solid ${s.accent || 'rgba(168, 85, 247, 0.35)'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.2rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: s.accent || '#c084fc',
                    lineHeight: 1.05,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    marginTop: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'terminal': {
        const lines = block.terminalLines || [];
        return (
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(34, 211, 238, 0.35)',
              background: '#050608',
              boxShadow: '0 16px 38px rgba(0,0,0,0.55)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.6rem 1rem',
                background: '#0c1117',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#22d3ee',
              }}
            >
              <TerminalIcon size={14} />
              <span>{block.terminalTitle || 'root@codepulse:~'}</span>
            </div>
            <div
              style={{
                padding: '1.15rem 1.3rem',
                fontFamily: "'Fira Code', Consolas, monospace",
                fontSize: '0.85rem',
                lineHeight: 1.7,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {lines.map((ln, idx) => {
                const colorMap = {
                  cmd: '#f8fafc',
                  out: '#94a3b8',
                  success: '#34d399',
                  warn: '#fbbf24',
                };
                return (
                  <div key={idx} style={{ color: colorMap[ln.type || 'out'] }}>
                    {ln.type === 'cmd' && (
                      <span style={{ color: '#22d3ee', marginRight: '0.5rem', fontWeight: 700 }}>
                        $
                      </span>
                    )}
                    {ln.text}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'flashcards': {
        const cards = block.flashcards || [];
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {cards.map((card, idx) => {
              const isFlipped = Boolean(flippedMap[idx]);
              return (
                <div
                  key={idx}
                  onClick={() =>
                    setFlippedMap((prev) => ({ ...prev, [idx]: !prev[idx] }))
                  }
                  style={{
                    cursor: 'pointer',
                    minHeight: 175,
                    borderRadius: '16px',
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: isFlipped
                      ? 'linear-gradient(135deg, rgba(147,51,234,0.28), rgba(225,29,72,0.25))'
                      : 'rgba(14, 8, 26, 0.92)',
                    border: isFlipped
                      ? '1px solid #f43f5e'
                      : '1px solid rgba(168, 85, 247, 0.35)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        color: isFlipped ? '#fda4af' : '#c084fc',
                      }}
                    >
                      {isFlipped ? 'RESPUESTA' : card.tag || 'CONCEPTO'}
                    </span>
                    <RotateCw size={14} color="#94a3b8" />
                  </div>

                  <div
                    style={{
                      margin: '0.85rem 0',
                      fontSize: isFlipped ? '0.93rem' : '1.05rem',
                      fontWeight: isFlipped ? 500 : 700,
                      color: '#ffffff',
                      lineHeight: 1.55,
                    }}
                  >
                    {renderRichInline(isFlipped ? card.back : card.front)}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Haz clic para voltear tarjeta
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      case 'architecture': {
        const nodes = block.archNodes || [];
        const isVert = block.archDirection === 'vertical';
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: isVert ? 'column' : 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1.5rem',
              borderRadius: '16px',
              background: 'rgba(10, 5, 20, 0.9)',
              border: '1px solid rgba(168, 85, 247, 0.28)',
            }}
          >
            {nodes.map((node, idx) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    minWidth: 165,
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(20, 11, 38, 0.95)',
                    border: `1.5px solid ${node.accent || '#a855f7'}`,
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                    }}
                  >
                    {node.title}
                  </div>
                  {node.subtitle && (
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: node.accent || '#c084fc',
                        marginTop: '0.2rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {node.subtitle}
                    </div>
                  )}
                </div>
                {idx < nodes.length - 1 &&
                  (isVert ? (
                    <ArrowDown size={20} color="#f43f5e" />
                  ) : (
                    <ArrowRight size={20} color="#f43f5e" />
                  ))}
              </React.Fragment>
            ))}
          </div>
        );
      }

      case 'badges': {
        const chips = block.badges || [];
        return (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent:
                block.align === 'center'
                  ? 'center'
                  : block.align === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            }}
          >
            {chips.map((chip, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.32rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#ffffff',
                  background: `${chip.color || '#a855f7'}26`,
                  border: `1px solid ${chip.color || '#a855f7'}`,
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        );
      }

      case 'cta_buttons': {
        const btns = block.ctaButtons || [];
        return (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent:
                block.align === 'center'
                  ? 'center'
                  : block.align === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            }}
          >
            {btns.map((btn, idx) => {
              const styleByVariant: Record<string, React.CSSProperties> = {
                gradient: {
                  background: 'linear-gradient(90deg, #9333ea, #e11d48)',
                  color: '#ffffff',
                  border: 'none',
                },
                outline: {
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid #f43f5e',
                },
                glass: {
                  background: 'rgba(168, 85, 247, 0.16)',
                  color: '#e9d5ff',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                },
                white: {
                  background: '#ffffff',
                  color: '#090414',
                  border: 'none',
                },
              };
              return (
                <a
                  key={idx}
                  href={btn.url || '#'}
                  target={btn.url?.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.7rem 1.35rem',
                    borderRadius: '10px',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    ...styleByVariant[btn.variant || 'gradient'],
                  }}
                >
                  {btn.label}
                  <ExternalLink size={14} />
                </a>
              );
            })}
          </div>
        );
      }

      case 'embed':
        return (
          <div style={{ width: '100%' }}>
            <div
              style={{
                width: '100%',
                height: block.embedHeight || 420,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                background: '#05020a',
              }}
            >
              {block.embedUrl ? (
                <iframe
                  src={block.embedUrl}
                  title={block.caption || 'Contenido embebido'}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
              ) : null}
            </div>
            {block.caption && (
              <div
                style={{
                  marginTop: '0.55rem',
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                {renderRichInline(block.caption)}
              </div>
            )}
          </div>
        );
    }
  };

  if (hasBoxWrapper) {
    return <div style={wrapperStyle}>{renderInner()}</div>;
  }

  return <>{renderInner()}</>;
}
