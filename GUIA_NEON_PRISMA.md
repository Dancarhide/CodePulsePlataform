# Guía de Uso: Prisma + Neon Postgres

En este documento encontrarás ejemplos y buenas prácticas sobre cómo interactuar con tu base de datos Neon utilizando Prisma ORM desde las aplicaciones en tu monorepo (como la aplicación Web en Next.js o los microservicios en Node.js/TypeScript).

---

## 1. ¿Cómo funciona la conexión?
Tu conexión a la base de datos Neon ya está completamente configurada mediante la variable de entorno `DATABASE_URL` ubicada en el archivo `.env` de tu proyecto.

El cliente de Prisma ya ha sido instanciado de manera segura (para evitar agotar conexiones en desarrollo) y se exporta desde la librería interna **`database`**.

## 2. Importar el cliente de Prisma
Para usar Prisma en cualquier archivo de tu aplicación (`apps/web`, `apps/api-gateway`, etc.), **siempre debes importarlo desde la librería de base de datos** del monorepo, y NO instanciar `new PrismaClient()` directamente.

```typescript
// ✅ FORMA CORRECTA
import { prisma } from 'database'; 

// ❌ FORMA INCORRECTA (No hagas esto)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

> **Nota:** Asegúrate de que el paquete (`apps/web` o el servicio en Node) tenga la dependencia `"database": "workspace:*"` en su `package.json`.

---

## 3. Ejemplos de Consultas y Operaciones (CRUD)

A continuación te dejo ejemplos concretos usando los modelos que creamos en el esquema DBML.

### A. Crear un nuevo registro (Insert / Mandar cosas a Neon)
Este ejemplo crea un nuevo `usuario`.

```typescript
import { prisma } from 'database';

async function crearEstudiante() {
  const nuevoUsuario = await prisma.usuarios.create({
    data: {
      nombres: 'Juan',
      apellido1: 'Pérez',
      nombre_usuario: 'juanperez99',
      correo: 'juan@ejemplo.com',
      password_hash: 'hash_super_seguro',
      rol: 'estudiante',
      // Los campos con @default no son obligatorios, Neon los auto-llenará.
    },
  });
  
  console.log("Usuario creado:", nuevoUsuario.id);
  return nuevoUsuario;
}
```

### B. Leer registros (Select / Recibir cosas de Neon)
Prisma te permite hacer búsquedas simples, filtradas y con paginación.

```typescript
import { prisma } from 'database';

// 1. Obtener todos los usuarios activos
async function obtenerUsuariosActivos() {
  const usuarios = await prisma.usuarios.findMany({
    where: {
      estado: 'activo',
    },
    orderBy: {
      fecha_registro: 'desc',
    },
  });
  return usuarios;
}

// 2. Obtener un usuario por ID o correo (usando findUnique)
async function obtenerUsuarioPorCorreo(correo: string) {
  const usuario = await prisma.usuarios.findUnique({
    where: { correo },
    // Con 'include' puedes traer información relacionada en la misma consulta (JOIN)
    include: {
      inscripciones: true, 
      logros_usuario: true,
    }
  });
  return usuario;
}
```

### C. Actualizar registros (Update)
Útil para actualizar progresos, niveles de XP, o modificar datos de un usuario.

```typescript
import { prisma } from 'database';

async function sumarExperiencia(usuarioId: string, xpGanado: number) {
  const usuarioActualizado = await prisma.usuarios.update({
    where: { id: usuarioId },
    data: {
      xp: { increment: xpGanado }, // Suma puntos a los existentes
    },
  });
  
  console.log(`Nueva experiencia: ${usuarioActualizado.xp}`);
}
```

### D. Operaciones Relacionales (Crear Anidado)
Prisma facilita mucho crear registros dependientes en una sola operación a la base de datos (Ejemplo: Un usuario se inscribe en un curso).

```typescript
import { prisma } from 'database';

async function inscribirUsuarioEnCurso(usuarioId: string, cursoId: string) {
  const inscripcion = await prisma.inscripciones.create({
    data: {
      id_usuario: usuarioId,
      id_curso: cursoId,
      progreso_porcentaje: 0,
      completado: false,
    }
  });
  return inscripcion;
}
```

---

## 4. ¿Qué hacer cuando modificas la base de datos?
Si en el futuro agregas nuevas columnas o cambias las tablas en `libs/database/prisma/schema.prisma`, **siempre** debes ejecutar el siguiente comando para impactar los cambios en Neon y actualizar el cliente TypeScript:

```bash
# Entra a la carpeta de la base de datos
cd libs/database

# Genera la migración y súbela a Neon
npx prisma migrate dev --name un_nombre_descriptivo
```

## 5. Resumen de Ventajas de Neon con Prisma
- **Serverless:** Neon maneja la conexión eficientemente. Prisma en tu servidor hablará directamente con la URL proporcionada.
- **TypeScript Seguro:** Todos los resultados que obtengas de estas funciones ya tienen autocompletado nativo. Si escribes `usuario.`, el editor te sugerirá `.nombres`, `.correo`, etc.
