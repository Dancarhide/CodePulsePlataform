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
} from 'lucide-react';
import { CmsBlock } from './CmsBlockTypes';

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

export default function CmsBlockRenderer({ block }: { block: CmsBlock }) {
  const [copied, setCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
    return {};
  };

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
            margin: '0.5rem 0',
            ...getGradientStyle(block.gradientText),
          }}
        >
          {block.text}
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
            margin: '0.4rem 0',
            paddingBottom: '0.45rem',
            borderBottom: '1px solid rgba(168, 85, 247, 0.22)',
          }}
        >
          {block.text}
        </h2>
      );

    case 'heading3':
      return (
        <div style={{ textAlign: block.align || 'left', margin: '0.35rem 0' }}>
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
            }}
          >
            {block.text}
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
          }}
        >
          {block.text}
        </p>
      );
    }

    case 'banner':
      return (
        <div
          style={{
            background: block.bannerGradient || 'linear-gradient(135deg, #4c1d95 0%, #be123c 100%)',
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
            }}
          >
            {block.text}
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
              {block.subtitle}
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
                      padding: '0.9rem 1.15rem',
                      color: '#ffffff',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {h}
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
                        padding: '0.85rem 1.15rem',
                        color: '#e2e8f0',
                      }}
                    >
                      {cell}
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
            gridTemplateColumns: `repeat(auto-fit, minmax(230px, 1fr))`,
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
                {col.title}
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
                {col.content}
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
                {block.calloutTitle}
              </div>
            )}
            <div style={{ fontSize: '0.93rem', lineHeight: 1.6, color: variantConfig.color }}>
              {block.text}
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
            alignItems: 'center',
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
              {block.caption}
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
              {block.caption}
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
              color: '#e2e8f0',
              fontSize: '0.98rem',
              lineHeight: 1.65,
            }}
          >
            {items.map((it, i) => (
              <li key={i}>{it}</li>
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
            color: '#e2e8f0',
            fontSize: '0.98rem',
            lineHeight: 1.65,
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
                <CheckCircle2 size={18} color="#f43f5e" style={{ marginTop: '4px', flexShrink: 0 }} />
              )}
              <span>{it}</span>
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
            padding: '1.25rem 1.6rem',
            borderLeft: '4px solid #f43f5e',
            background: 'rgba(168, 85, 247, 0.07)',
            borderRadius: '0 12px 12px 0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '1.12rem',
              fontStyle: 'italic',
              color: '#f1f5f9',
              lineHeight: 1.6,
            }}
          >
            &ldquo;{block.text}&rdquo;
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
            {block.question}
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
                  {opt}
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
              {block.explanation}
            </div>
          )}
        </div>
      );
    }

    case 'divider':
      if (block.dividerStyle === 'space') {
        return <div style={{ height: '2.2rem' }} />;
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
  }
}

