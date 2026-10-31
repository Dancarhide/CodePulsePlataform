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
  | 'divider'
  // Nuevos bloques de libertad creativa e interactividad:
  | 'canvas_free'
  | 'tabs'
  | 'accordion'
  | 'steps'
  | 'stats'
  | 'terminal'
  | 'flashcards'
  | 'architecture'
  | 'badges'
  | 'cta_buttons'
  | 'embed'
  | 'code_challenge'
  | 'fill_blank';

export type UnitFormat = 'leccion' | 'examen' | 'laboratorio';

export type ExamQuestionKind = 'single' | 'multiple' | 'boolean' | 'command';

export interface ExamQuestion {
  id: string;
  kind: ExamQuestionKind;
  enunciado: string;
  codeSnippet?: string;
  puntos: number;
  options: string[];
  correctIndex?: number; // para single y boolean
  correctIndices?: number[]; // para multiple
  expectedCommand?: string; // para command / código corto
  explanation?: string;
}

export interface ExamUnitConfig {
  instrucciones: string;
  notaMinima: number; // ej. 70 u 80 (%)
  tiempoLimiteMinutos: number; // 0 = sin límite
  intentosMaximos: number; // 0 = ilimitados
  mostrarRespuestasAlFinal: boolean;
  preguntas: ExamQuestion[];
}

export interface LabCriterion {
  id: string;
  titulo: string;
  puntos: number;
}

export interface LabUnitConfig {
  escenario: string;
  instrucciones: string;
  entorno: string; // 'Python' | 'TypeScript' | 'SQL' | 'Bash / Linux' | 'Docker' | 'Full-Stack'
  dificultad: 'principiante' | 'intermedio' | 'avanzado';
  modoCalificacion: 'auto' | 'manual' | 'ambos'; // auto-validación + opción manual del admin
  repoBaseUrl?: string;
  starterCode?: string;
  pideCodigo: boolean;
  pideRepoUrl: boolean;
  pideReporte: boolean;
  tokensObligatorios: string[]; // palabras clave / comandos / código que valida automáticamente
  longitudMinimaCodigo?: number;
  pista: string;
  rubrica: LabCriterion[];
}

export interface UnitActivityConfig {
  exam?: ExamUnitConfig;
  lab?: LabUnitConfig;
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface ColumnItem {
  title: string;
  content: string;
  accent?: string;
}

export interface TabItem {
  label: string;
  title?: string;
  content: string;
  code?: string;
}

export interface AccordionItem {
  title: string;
  content: string;
}

export interface StepItem {
  badge: string;
  title: string;
  content: string;
}

export interface StatItem {
  value: string;
  label: string;
  accent?: string;
}

export interface TerminalLine {
  type: 'cmd' | 'out' | 'success' | 'warn';
  text: string;
}

export interface FlashcardItem {
  front: string;
  back: string;
  tag?: string;
}

export interface ArchNode {
  title: string;
  subtitle?: string;
  accent?: string;
}

export interface BadgeChip {
  label: string;
  color: string;
}

export interface CtaButtonItem {
  label: string;
  url: string;
  variant: 'gradient' | 'outline' | 'glass' | 'white';
}

export type CanvasElementKind = 'text' | 'box' | 'badge' | 'circle' | 'image' | 'line';

export interface CanvasElement {
  id: string;
  kind: CanvasElementKind;
  x: number; // % horizontal (0 - 95)
  y: number; // % vertical (0 - 92)
  w: number; // % width (8 - 100)
  h: number; // px height
  rotation?: number; // deg (-180 a 180)
  zIndex?: number;
  text?: string;
  bg?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: TextAlign;
  imageUrl?: string;
  opacity?: number;
}

export interface BlockBoxStyle {
  boxWidth?: 25 | 33 | 50 | 66 | 75 | 100;
  paddingY?: number;
  paddingX?: number;
  marginY?: number;
  bgCustom?: string;
  useGradientBg?: boolean;
  bgGradient2?: string;
  bgAngle?: number;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderColor?: string;
  borderRadius?: number;
  shadowPreset?: 'none' | 'soft' | 'deep' | 'glow-purple' | 'glow-red' | 'glow-cyan';
  fontFamily?: 'sans' | 'display' | 'mono' | 'serif';
  fontSizePx?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  entranceAnim?: 'none' | 'fade-up' | 'zoom' | 'slide-left';
}

export interface LessonPageSettings {
  maxWidth?: 'standard' | 'wide' | 'full'; // 840px | 1120px | 100%
  sheetBg?: string;
  pattern?: 'none' | 'grid' | 'dots';
  accentBorder?: string;
}

export interface CmsBlock {
  id: string;
  type: BlockType;
  style?: BlockBoxStyle;

  // Text & Typography
  text?: string;
  subtitle?: string;
  align?: TextAlign;
  color?: string;
  bgColor?: string;
  gradientText?: string; // 'none' | 'purple-red' | 'cyan-blue' | 'gold' | 'emerald'
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
  widthPercent?: number;
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
  dividerStyle?: 'line' | 'gradient' | 'space' | 'dots';

  // --- Nuevos Bloques Avanzados ---
  // Lienzo Libre estilo Canva
  canvasHeight?: number;
  canvasBg?: string;
  canvasGrid?: boolean;
  canvasElements?: CanvasElement[];

  // Tabs
  tabs?: TabItem[];

  // Accordion
  accordions?: AccordionItem[];

  // Steps / Roadmap
  steps?: StepItem[];

  // Stats / KPIs
  stats?: StatItem[];

  // Terminal HUD
  terminalTitle?: string;
  terminalLines?: TerminalLine[];

  // Flashcards 3D
  flashcards?: FlashcardItem[];

  // Architecture Diagram
  archDirection?: 'horizontal' | 'vertical';
  archNodes?: ArchNode[];

  // Badges / Chips
  badges?: BadgeChip[];

  // CTA Buttons
  ctaButtons?: CtaButtonItem[];

  // Embed / Iframe
  embedUrl?: string;
  embedHeight?: number;

  // Reto de Código / Terminal Evaluable (Actividad en Lección)
  challengePrompt?: string;
  challengeStarter?: string;
  challengeLanguage?: string;
  challengeExpectedTokens?: string[];
  challengeHint?: string;
  challengeSuccessMsg?: string;

  // Actividad Completar Código / Espacios (Fill in the blank)
  blankSentence?: string; // Usa [[respuesta]] para marcar huecos interactivos
  blankExplanation?: string;
}

export interface CmsLesson {
  id: string;
  clave_estable?: string;
  titulo: string;
  orden: number;
  tipo: 'lectura' | 'video' | 'quiz' | 'examen';
  formato_unidad?: UnitFormat;
  peso_puntos?: number;
  duracion_estimada_minutos: number;
  contenido_bloques: CmsBlock[];
  configuracion_pagina?: LessonPageSettings;
  configuracion_actividad?: UnitActivityConfig;
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
        text: 'Escribe aquí el contenido explicativo de tu lección. Puedes usar **negritas**, *cursivas*, ==resaltados==, `código inline` o [enlaces](https://codepulseplataform.dev) libremente.',
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
        mediaUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
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
          'Comprender el flujo completo de una petición **HTTP segura**.',
          'Diseñar esquemas escalables en `PostgreSQL`.',
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
        explanation:
          'El código 201 Created confirma que la petición tuvo éxito y se creó un nuevo recurso en el servidor.',
      };
    case 'divider':
      return {
        id,
        type,
        dividerStyle: 'gradient',
      };
    case 'canvas_free':
      return {
        id,
        type,
        canvasHeight: 380,
        canvasBg: 'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.25), #080412 75%)',
        canvasGrid: true,
        canvasElements: [
          {
            id: 'el_1',
            kind: 'badge',
            x: 6,
            y: 10,
            w: 34,
            h: 34,
            zIndex: 3,
            text: 'DISEÑO LIBRE // CANVA MODE',
            bg: 'rgba(244, 63, 94, 0.22)',
            color: '#fda4af',
            borderColor: '#f43f5e',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            textAlign: 'center',
          },
          {
            id: 'el_2',
            kind: 'text',
            x: 6,
            y: 26,
            w: 58,
            h: 90,
            zIndex: 4,
            text: 'Arrastra, rota y diseña elementos donde quieras',
            bg: 'transparent',
            color: '#ffffff',
            borderColor: 'transparent',
            borderRadius: 8,
            fontSize: 28,
            fontWeight: 800,
            textAlign: 'left',
          },
          {
            id: 'el_3',
            kind: 'box',
            x: 62,
            y: 22,
            w: 32,
            h: 170,
            rotation: -3,
            zIndex: 2,
            text: 'Tarjeta Flotante\n\nColoca diagramas, notas visuales, insignias o imágenes con total libertad.',
            bg: 'rgba(18, 9, 36, 0.88)',
            color: '#e2e8f0',
            borderColor: '#a855f7',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 500,
            textAlign: 'left',
          },
          {
            id: 'el_4',
            kind: 'circle',
            x: 72,
            y: 55,
            w: 20,
            h: 110,
            zIndex: 1,
            text: '',
            bg: 'radial-gradient(circle, rgba(244,63,94,0.45) 0%, transparent 70%)',
            color: '#ffffff',
            borderColor: 'transparent',
            borderRadius: 999,
          },
        ],
      };
    case 'tabs':
      return {
        id,
        type,
        tabs: [
          {
            label: 'Concepto',
            title: '¿Cómo funciona internamente?',
            content:
              'Divide información densa en pestañas limpias para que el estudiante explore cada enfoque sin saturar la pantalla.',
          },
          {
            label: 'Implementación',
            title: 'Ejemplo en Producción',
            content: 'Puedes acompañar cada pestaña con código fuente opcional:',
            code: `export async function handler(req: Request) {\n  return Response.json({ ok: true });\n}`,
          },
          {
            label: 'Buenas Prácticas',
            title: 'Recomendaciones de Seguridad',
            content:
              'Valida siempre los headers de entrada, aplica rate-limiting y registra trazas de auditoría.',
          },
        ],
      };
    case 'accordion':
      return {
        id,
        type,
        accordions: [
          {
            title: '¿Cuándo conviene usar arquitectura de microservicios?',
            content:
              'Cuando distintos dominios del sistema requieren escalar, desplegarse o evolucionar de manera independiente.',
          },
          {
            title: '¿Cómo proteger credenciales y secretos en la nube?',
            content:
              'Utiliza gestores de secretos cifrados, rotación periódica de llaves y variables de entorno de servidor.',
          },
        ],
      };
    case 'steps':
      return {
        id,
        type,
        steps: [
          {
            badge: 'FASE 01',
            title: 'Modelado de Dominio y Base de Datos',
            content: 'Define entidades, relaciones, llaves foráneas e índices estratégicos.',
          },
          {
            badge: 'FASE 02',
            title: 'Construcción de Endpoints y Seguridad JWT',
            content: 'Implementa rutas autenticadas, control de roles (RBAC) y validación de payloads.',
          },
          {
            badge: 'FASE 03',
            title: 'Despliegue Continuo (CI/CD)',
            content: 'Automatiza pruebas, compilación y publicación en la nube con cero tiempo de caída.',
          },
        ],
      };
    case 'stats':
      return {
        id,
        type,
        stats: [
          { value: '99.99%', label: 'Disponibilidad SLA', accent: '#c084fc' },
          { value: '< 18ms', label: 'Latencia P95 en API', accent: '#f43f5e' },
          { value: 'AES-256', label: 'Estándar de Cifrado', accent: '#22d3ee' },
        ],
      };
    case 'terminal':
      return {
        id,
        type,
        terminalTitle: 'root@codepulse-prod:~',
        terminalLines: [
          { type: 'cmd', text: 'docker compose up -d --build api-gateway' },
          { type: 'out', text: '[+] Building 2.4s (12/12) FINISHED' },
          { type: 'success', text: '✔ Container codepulse-gateway-1  Started  0.4s' },
          { type: 'cmd', text: 'curl -I https://codepulseplataform.dev/api/health' },
          { type: 'success', text: 'HTTP/2 200 OK — latency: 14ms' },
        ],
      };
    case 'flashcards':
      return {
        id,
        type,
        flashcards: [
          {
            tag: 'ARQUITECTURA',
            front: '¿Qué significa Idempotencia en una API REST?',
            back: 'Que realizar múltiples peticiones idénticas produce exactamente el mismo efecto en el estado del servidor que hacer una sola (ej. GET, PUT, DELETE).',
          },
          {
            tag: 'CIBERSEGURIDAD',
            front: '¿Qué previene el hashing con Bcrypt + Salt?',
            back: 'Impide ataques de diccionario y Rainbow Tables, asegurando que dos contraseñas iguales generen hashes completamente distintos.',
          },
        ],
      };
    case 'architecture':
      return {
        id,
        type,
        archDirection: 'horizontal',
        archNodes: [
          { title: 'Cliente Web', subtitle: 'Next.js 14 App', accent: '#c084fc' },
          { title: 'API Serverless', subtitle: 'Auth & RBAC JWT', accent: '#f43f5e' },
          { title: 'Neon Cloud DB', subtitle: 'PostgreSQL + JSONB', accent: '#22d3ee' },
        ],
      };
    case 'badges':
      return {
        id,
        type,
        align: 'left',
        badges: [
          { label: 'TypeScript 5', color: '#38bdf8' },
          { label: 'Next.js 14', color: '#c084fc' },
          { label: 'PostgreSQL', color: '#10b981' },
          { label: 'OWASP Top 10', color: '#f43f5e' },
        ],
      };
    case 'cta_buttons':
      return {
        id,
        type,
        align: 'left',
        ctaButtons: [
          {
            label: 'Abrir Repositorio Base',
            url: 'https://github.com',
            variant: 'gradient',
          },
          {
            label: 'Descargar Guía PDF',
            url: '#',
            variant: 'outline',
          },
        ],
      };
    case 'embed':
      return {
        id,
        type,
        embedUrl: 'https://stackblitz.com/edit/nextjs?embed=1&view=preview',
        embedHeight: 420,
        caption: 'Laboratorio interactivo embebido (StackBlitz / CodePen / Figma).',
      };
    case 'code_challenge':
      return {
        id,
        type,
        challengeLanguage: 'sql',
        challengePrompt:
          'Escribe una consulta SQL que seleccione todas las columnas de los usuarios activos ordenados por fecha de registro:',
        challengeStarter: 'SELECT * FROM usuarios\nWHERE ...',
        challengeExpectedTokens: ['SELECT', 'FROM usuarios', 'WHERE', 'activo'],
        challengeHint: 'Recuerda filtrar con WHERE estado = \'activo\' y usar ORDER BY.',
        challengeSuccessMsg: '¡Excelente! Tu consulta cumple con todos los criterios técnicos.',
      };
    case 'fill_blank':
      return {
        id,
        type,
        question: 'Completa el comando de despliegue en contenedores:',
        blankSentence:
          'Para levantar los servicios en segundo plano ejecutamos docker [[compose]] up [[-d]] en la terminal.',
        blankExplanation:
          'El subcomando compose orquesta múltiples contenedores y la bandera -d (detached) los mantiene corriendo en background.',
      };
  }
}

export function createDefaultExamConfig(): ExamUnitConfig {
  return {
    instrucciones:
      'Lee cuidadosamente cada reactivo antes de responder. Para acreditar el peso de este examen en tu progreso general debes alcanzar al menos la calificación mínima aprobatoria.',
    notaMinima: 70,
    tiempoLimiteMinutos: 20,
    intentosMaximos: 0,
    mostrarRespuestasAlFinal: true,
    preguntas: [
      {
        id: `q_${Date.now()}_1`,
        kind: 'single',
        enunciado:
          '¿Cuál es la responsabilidad principal de un API Gateway dentro de una arquitectura de microservicios?',
        puntos: 10,
        options: [
          'Almacenar directamente las tablas relacionales del sistema',
          'Centralizar el enrutamiento, autenticación, rate-limiting y observabilidad de entrada',
          'Reemplazar el motor de renderizado CSS del navegador',
          'Compilar binarios del kernel del sistema operativo',
        ],
        correctIndex: 1,
        explanation:
          'El API Gateway actúa como punto único de entrada para enrutar peticiones, validar seguridad y controlar tráfico.',
      },
      {
        id: `q_${Date.now()}_2`,
        kind: 'boolean',
        enunciado:
          '¿Es seguro almacenar contraseñas de usuarios utilizando únicamente codificación Base64 sin hashing criptográfico?',
        puntos: 10,
        options: ['Verdadero', 'Falso'],
        correctIndex: 1,
        explanation:
          'Base64 es reversible de forma trivial; siempre debe emplearse hashing lento con salt como Bcrypt o Argon2id.',
      },
      {
        id: `q_${Date.now()}_3`,
        kind: 'command',
        enunciado:
          'Escribe el verbo HTTP estándar utilizado para actualizar parcialmente un recurso existente en una API REST:',
        puntos: 10,
        options: [],
        expectedCommand: 'PATCH',
        explanation:
          'PATCH aplica modificaciones parciales a un recurso, mientras que PUT reemplaza la representación completa.',
      },
    ],
  };
}

export function createDefaultLabConfig(): LabUnitConfig {
  return {
    escenario:
      'El equipo de ingeniería necesita un endpoint seguro de verificación de salud y validación de entrada para el microservicio de pagos en producción.',
    instrucciones:
      '1. Implementa la función o script solicitado partiendo del código base.\n2. Asegúrate de incluir manejo de errores y validación.\n3. Ejecuta el validador automático o adjunta el enlace a tu repositorio para revisión.',
    entorno: 'Python',
    dificultad: 'intermedio',
    modoCalificacion: 'ambos',
    repoBaseUrl: '',
    starterCode: `from fastapi import FastAPI, HTTPException\n\napp = FastAPI()\n\n# TODO: Implementa el endpoint /health que retorne {"status": "ok"}\n`,
    pideCodigo: true,
    pideRepoUrl: true,
    pideReporte: true,
    tokensObligatorios: ['FastAPI', '@app.get', '/health', 'return'],
    longitudMinimaCodigo: 40,
    pista: 'Usa el decorador @app.get("/health") y retorna un diccionario JSON con la clave status.',
    rubrica: [
      { id: 'rub_1', titulo: 'Definición correcta de ruta y método HTTP', puntos: 40 },
      { id: 'rub_2', titulo: 'Estructura JSON de respuesta y buenas prácticas', puntos: 40 },
      { id: 'rub_3', titulo: 'Documentación breve o repositorio limpio', puntos: 20 },
    ],
  };
}
