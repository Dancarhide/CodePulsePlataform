# CodePulse Platform - Cascarón de Microservicios

Bienvenido a la estructura base vacía de **CodePulse Platform**. Este proyecto está organizado como un **Monorepo** gestionado con **Turborepo** y **NPM Workspaces**, diseñado para escalar con una arquitectura de microservicios robusta y limpia. 

Toda la lógica de negocio y las interfaces han sido limpiadas para dejar un cascarón listo para tu propia implementación.

---

## 🚀 Arquitectura y Tecnologías

El stack de tecnología principal y su infraestructura asociada:

1. **Frontend (Web)**: Next.js (App Router, React 18, TypeScript) con estilos en Vanilla CSS premium.
2. **API Gateway**: Proxy inverso basado en Express para unificar los endpoints bajo un solo puerto.
3. **Backend Services**:
   - Servicios de lógica principal en **Node.js + Express** (TypeScript).
   - Servicios de alto rendimiento o sandboxing en **Python + FastAPI**.
4. **Base de Datos**: PostgreSQL con **Prisma ORM** como cliente de acceso unificado.
5. **Caché y Sesiones**: Redis.
6. **Mensajería Asíncrona (Broker)**: RabbitMQ (usando protocolo AMQP) para comunicación orientada a eventos.

---

## 📂 Estructura de Directorios

La raíz del proyecto está dividida en dos carpetas clave: `apps/` (aplicaciones y microservicios independientes) y `libs/` (librerías compartidas publicadas localmente).

```text
CodePulsePlataform/
├── apps/
│   ├── web/                    # Frontend en Next.js (Puerto 3000)
│   ├── api-gateway/            # Proxy Router de Express (Puerto 8000)
│   ├── auth-service/           # Microservicio de Autenticación en FastAPI/Python (Puerto 8001)
│   ├── course-service/         # Microservicio de Cursos en Express/TS (Puerto 8002)
│   ├── forum-service/          # Microservicio de Foro en Express/TS (Puerto 8003)
│   ├── lab-service/            # Microservicio de Código/Sandbox en FastAPI/Python (Puerto 8004)
│   ├── tournament-service/     # Microservicio de Torneos en FastAPI/Python (Puerto 8005)
│   └── achievement-service/    # Microservicio de Logros/Gamificación en Express/TS (Puerto 8006)
├── libs/
│   ├── database/               # Esquema de Prisma y cliente centralizado de PostgreSQL
│   ├── shared-dtos/            # Interfaces de TypeScript y DTOs compartidos (Frontend <-> Backend TS)
│   ├── event-contracts/        # Contratos de eventos para la mensajería en RabbitMQ
│   └── core-logger/            # Utilidad de logging estandarizada para servicios TS
├── docker-compose.yml          # Orquestación de Postgres, Redis, RabbitMQ y contenedores
├── package.json                # Configuración de workspaces NPM y dependencias del monorepo
├── turbo.json                  # Configuración de la canalización de Turborepo
└── README.md                   # Esta guía arquitectónica
```

---

## 🛠️ Detalle de las Librerías (`libs/`)

Las librerías en `libs/` son consumidas por los diferentes servicios dentro de `apps/` usando enlaces de workspaces locales (ej. `"@codepulse/database": "*"`):

* **`database`**: Contiene el archivo `prisma/schema.prisma` que define la estructura declarativa de PostgreSQL. El cliente instanciado se exporta en `src/index.ts` para que cualquier microservicio TS o Next.js lo consuma.
* **`shared-dtos`**: Declara las interfaces puras de TypeScript (como `UserDto`, `CourseDto`, `LabDto`). Asegura que el frontend y los backend TS compartan los mismos contratos de datos sin duplicar archivos.
* **`event-contracts`**: Contiene la definición de los eventos del broker de mensajería (ej. `UserRegisteredEvent`, `LabCompletedEvent`).
* **`core-logger`**: Un envoltorio de consola para dar formato estandarizado a los logs (`[TIMESTAMP] [LEVEL] [SERVICE] - MESSAGE`).

---

## 🔧 Levantamiento del Proyecto

### 1. Requisitos Previos
Asegúrate de tener instalado:
* **Node.js** (v18+)
* **Python** (v3.10+)
* **Docker y Docker Compose**

### 2. Instalación de Dependencias del Root
Instala todos los paquetes de Node.js a lo largo del monorepo con un solo comando en la raíz:
```bash
npm install
```

### 3. Levantar la Infraestructura (Base de Datos, Caché, Broker)
Levanta los contenedores necesarios en segundo plano:
```bash
docker compose up -d postgres redis rabbitmq
```

### 4. Migrar la Base de Datos (Prisma)
Una vez que PostgreSQL esté activo, ejecuta las migraciones para crear las tablas correspondientes al esquema declarativo de Prisma:
```bash
npm run db:migrate
```
*Nota: Este comando aplicará las migraciones y autogenerará el cliente de Prisma (`prisma generate`).*

### 5. Modo de Desarrollo
Inicia todos los servicios de forma concurrente con recarga en caliente utilizando Turborepo:
```bash
npm run dev
```

---

## 💡 Guía para Desarrollar e Implementar Código

Cuando estés listo para escribir la lógica de negocio, sigue estas pautas para colocar tu código en el lugar ideal:

1. **Si vas a agregar un nuevo endpoint REST**:
   - En **TypeScript (Express)** (ej. `course-service`): Declara tus rutas en `src/` utilizando controladores y conéctalas al enrutador principal en `src/index.ts`. Consume `prisma` de `@codepulse/database` para persistir datos.
   - En **Python (FastAPI)** (ej. `auth-service`): Define tus rutas en `main.py` utilizando decoradores `@app.post()` o `@app.get()`.
   - **Gateway**: El archivo `apps/api-gateway/src/index.ts` ya tiene configurados los proxies. Cualquier sub-ruta de un servicio (ej. `GET http://localhost:8002/all`) se expone automáticamente a través de la gateway en `http://localhost:8000/api/v1/courses/all`.

2. **Si vas a publicar o escuchar eventos**:
   - Revisa `libs/event-contracts/src/index.ts` para estructurar la interfaz de tu evento.
   - En servicios TypeScript, utiliza el canal de `amqplib` para publicar el evento en el exchange correspondiente.
   - En `achievement-service/src/index.ts`, tienes el cascarón de un consumidor de RabbitMQ (`startEventConsumer`) que escucha la cola de logros. Agrega tu lógica dentro de la función de callback.

3. **Si necesitas modificar las tablas de la base de datos**:
   - Edita `libs/database/prisma/schema.prisma` agregando o modificando campos y modelos.
   - Ejecuta `npm run db:migrate` en la raíz para generar la migración SQL y actualizar el cliente de Prisma.
   - Ejecuta `npm run db:generate` si solo requieres refrescar los tipos estáticos en tus microservicios de Node.
