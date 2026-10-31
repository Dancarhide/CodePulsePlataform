export type BlockType =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'paragraph'
  | 'banner'
  | 'table'
  | 'columns2'
  | 'columns3'
  | 'callout'
  | 'code'
  | 'image'
  | 'video'
  | 'list'
  | 'quote'
  | 'quiz'
  | 'divider';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface ColumnItem {
  title: string;
  content: string;
  accent?: string;
}

export interface CmsBlock {
  id: string;
  type: BlockType;
  // Text & Typography
  text?: string;
  subtitle?: string;
  align?: TextAlign;
  color?: string;
  bgColor?: string;
  gradientText?: string; // 'none' | 'purple-red' | 'cyan-blue' | 'gold'
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  // Banner (Canva Card)
  bannerGradient?: string;
  badgeText?: string;
  buttonText?: string;
  buttonUrl?: string;
  // Table
  headers?: string[];
  rows?: string[][];
  tableAccent?: string;
  striped?: boolean;
  // Columns
  columns?: ColumnItem[];
  // Callout
  calloutVariant?: 'info' | 'tip' | 'warning' | 'danger';
  calloutTitle?: string;
  // Code
  language?: string;
  filename?: string;
  code?: string;
  // Image / Video
  mediaUrl?: string;
  caption?: string;
  widthPercent?: number; // 40, 65, 85, 100
  rounded?: boolean;
  // List
  listStyle?: 'bullet' | 'number' | 'check';
  items?: string[];
  // Quote
  author?: string;
  // Quiz
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  // Divider
  dividerStyle?: 'line' | 'gradient' | 'space';
}

export interface CmsLesson {
  id: string;
  titulo: string;
  orden: number;
  tipo: 'lectura' | 'video' | 'quiz' | 'examen';
  duracion_estimada_minutos: number;
  contenido_bloques: CmsBlock[];
}

export interface CmsModule {
  id: string;
  titulo: string;
  orden: number;
  lecciones: CmsLesson[];
}

export interface CmsCourse {
  id?: string;
  titulo: string;
  slug: string;
  descripcion: string;
  categoria: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  imagen_portada_url: string;
  publicado: boolean;
  total_modulos?: number;
  total_lecciones?: number;
  modulos: CmsModule[];
}

export function createDefaultBlock(type: BlockType): CmsBlock {
  const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  switch (type) {
    case 'heading1':
      return {
        id,
        type,
        text: 'Título Principal de la Lección',
        align: 'left',
        color: '#ffffff',
        gradientText: 'none',
      };
    case 'heading2':
      return {
        id,
        type,
        text: 'Subtítulo de Sección',
        align: 'left',
        color: '#f43f5e',
      };
    case 'heading3':
      return {
        id,
        type,
        subtitle: '// CONCEPTO CLAVE',
        text: 'Encabezado Técnico',
        align: 'left',
        color: '#e2e8f0',
      };
    case 'paragraph':
      return {
        id,
        type,
        text: 'Escribe aquí el contenido explicativo de tu lección. Puedes detallar conceptos teóricos, ejemplos del mundo real y pasos prácticos para el estudiante.',
        align: 'left',
        color: '#cbd5e1',
        fontSize: 'md',
        bgColor: 'transparent',
      };
    case 'banner':
      return {
        id,
        type,
        badgeText: 'MÓDULO DESTACADO',
        text: 'Domina la Arquitectura en Producción',
        subtitle: 'Aprende paso a paso con ejemplos reales y buenas prácticas de la industria.',
        bannerGradient: 'linear-gradient(135deg, #4c1d95 0%, #be123c 100%)',
        align: 'left',
        buttonText: '',
        buttonUrl: '',
      };
    case 'table':
      return {
        id,
        type,
        tableAccent: '#9333ea',
        striped: true,
        headers: ['Tecnología', 'Capa / Uso', 'Complejidad'],
        rows: [
          ['Next.js 14', 'Frontend & SSR', 'Intermedia'],
          ['FastAPI', 'Microservicios Backend', 'Baja'],
          ['PostgreSQL', 'Base de Datos Relacional', 'Intermedia'],
        ],
      };
    case 'columns2':
      return {
        id,
        type,
        columns: [
          {
            title: 'Columna 01 // Ventajas',
            content: 'Explica los puntos fuertes, rendimiento o casos donde conviene aplicar este patrón.',
            accent: '#a855f7',
          },
          {
            title: 'Columna 02 // Consideraciones',
            content: 'Detalla los requisitos técnicos, límites o cuidados importantes en producción.',
            accent: '#f43f5e',
          },
        ],
      };
    case 'columns3':
      return {
        id,
        type,
        columns: [
          {
            title: '01. Entrada',
            content: 'Validación de esquemas y sanitización de datos del cliente.',
            accent: '#a855f7',
          },
          {
            title: '02. Procesamiento',
            content: 'Lógica de negocio desacoplada y servicios asíncronos.',
            accent: '#f43f5e',
          },
          {
            title: '03. Persistencia',
            content: 'Almacenamiento transaccional seguro con índices optimizados.',
            accent: '#22d3ee',
          },
        ],
      };
    case 'callout':
      return {
        id,
        type,
        calloutVariant: 'tip',
        calloutTitle: 'Consejo de Ingeniería',
        text: 'Nunca almacenes contraseñas en texto plano ni expongas llaves privadas en variables públicas del cliente.',
      };
    case 'code':
      return {
        id,
        type,
        language: 'python',
        filename: 'server.py',
        code: `from fastapi import FastAPI\n\napp = FastAPI(title="CodePulse Service")\n\n@app.get("/health")\ndef health_check():\n    return {"status": "online", "region": "LATAM"}`,
      };
    case 'image':
      return {
        id,
        type,
        mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Diagrama ilustrativo de arquitectura de software moderna.',
        widthPercent: 100,
        rounded: true,
      };
    case 'video':
      return {
        id,
        type,
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        caption: 'Video explicativo de la sesión.',
      };
    case 'list':
      return {
        id,
        type,
        listStyle: 'check',
        items: [
          'Comprender el flujo completo de una petición HTTP segura.',
          'Diseñar esquemas escalables en PostgreSQL.',
          'Desplegar servicios listos para producción.',
        ],
      };
    case 'quote':
      return {
        id,
        type,
        text: 'Primero resuelve el problema; después escribe el código.',
        author: 'John Johnson',
      };
    case 'quiz':
      return {
        id,
        type,
        question: '¿Qué código de estado HTTP indica que un recurso fue creado exitosamente?',
        options: ['200 OK', '201 Created', '204 No Content', '401 Unauthorized'],
        correctIndex: 1,
        explanation: 'El código 201 Created confirma que la petición tuvo éxito y se creó un nuevo recurso en el servidor.',
      };
    case 'divider':
      return {
        id,
        type,
        dividerStyle: 'gradient',
      };
  }
}

