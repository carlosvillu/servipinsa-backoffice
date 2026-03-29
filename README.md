# Servipinsa

Aplicacion de gestion de partes de trabajo para Servipinsa. Permite crear, editar y validar partes de trabajo con detalle de tareas realizadas, mano de obra y materiales utilizados.

## Tech Stack

- **Framework:** React Router 7 + React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4 + Base UI
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Auth:** Better Auth (email/password + Google OAuth)
- **Testing:** Playwright E2E + TestContainers
- **Deployment:** Netlify

## Funcionalidades

- **Partes de trabajo:** Crear, editar, visualizar y validar partes con tareas, mano de obra y materiales
- **Validaciones:** Los managers pueden validar partes, lo que los bloquea para edicion
- **Gestion de usuarios:** Crear empleados, promover a manager
- **Control de acceso por rol:** MANAGER (acceso completo) y EMPLEADO (solo sus partes)
- **Autenticacion:** Email/password y Google OAuth
- **Responsive:** Diseno mobile-first con estetica Refined Brutalism

## Requisitos

- Node.js 20+
- npm 10+
- Docker (para tests E2E y base de datos local)

## Inicio rapido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.development
```

Variables requeridas:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/servipinsa
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:2025
SEED_ADMIN_EMAIL=tu@email.com
SEED_ADMIN_PASSWORD=tupassword
```

### 3. Base de datos

```bash
npm run db:up          # Levantar PostgreSQL con Docker
npm run db:migrate     # Aplicar migraciones
npm run db:seed        # Crear usuario admin (MANAGER)
```

### 4. Servidor de desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:2025`

## Scripts

### Desarrollo

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 2025) |
| `npm run build` | Build de produccion |
| `npm run start` | Arrancar servidor de produccion |

### Calidad de codigo

| Comando | Descripcion |
|---------|-------------|
| `npm run typecheck` | Verificacion de tipos TypeScript |
| `npm run lint` | Linting con ESLint |
| `npm run format` | Formateo con Prettier |

### Testing

| Comando | Descripcion |
|---------|-------------|
| `npm run test:e2e` | Tests E2E con Playwright |

### Base de datos

| Comando | Descripcion |
|---------|-------------|
| `npm run db:up` | Levantar PostgreSQL (Docker) |
| `npm run db:down` | Parar PostgreSQL |
| `npm run db:reset` | Resetear base de datos (borra volumenes) |
| `npm run db:generate` | Generar migraciones desde schema |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:seed` | Seed del usuario admin |

### Deploy

| Comando | Descripcion |
|---------|-------------|
| `npm run deploy` | Deploy a produccion (Netlify) |
| `npm run deploy:preview` | Deploy preview |
| `npm run db:migrate:prod` | Migraciones en produccion |

## Estructura del proyecto

```
app/
├── routes/              # Rutas (registro manual en routes.ts)
├── components/          # Componentes React
│   └── ui/             # Componentes base (Base UI)
├── db/                  # Conexion y schema de base de datos
│   └── schema/         # Definiciones de tablas (Drizzle)
├── services/            # Logica de negocio (CRUD, validaciones)
├── hooks/               # Hooks React (formularios, toasts)
├── schemas/             # Schemas de validacion (Zod)
├── lib/                 # Utilidades (auth, fechas, etc.)
└── root.tsx             # Layout raiz

tests/
├── e2e/                 # Tests E2E (Playwright)
├── fixtures/            # Fixtures de test
└── helpers/             # Helpers (TestContainers, auth, DB)

docs/                    # Documentacion del proyecto
drizzle/                 # Migraciones generadas
```

## Modelo de datos

- **Users** — Usuarios con roles (MANAGER / EMPLEADO)
- **Work Orders** — Partes de trabajo (cliente, direccion, conductor)
- **Work Order Tasks** — Tareas realizadas (descripcion, hora inicio/fin)
- **Work Order Labor** — Mano de obra (tecnico, hora entrada/salida)
- **Work Order Materials** — Materiales (unidades, descripcion, proyecto, suministro)
- **Work Order Validations** — Validaciones de managers

## Documentacion

- **[AUTH.md](docs/AUTH.md)** — Autenticacion, helpers servidor/cliente, proteccion de rutas
- **[DATABASE.md](docs/DATABASE.md)** — Setup de base de datos y convenciones Drizzle
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Configuracion de deploy y variables de entorno
- **[TESTING.md](docs/TESTING.md)** — Testing E2E con Playwright y TestContainers
- **[STYLE_GUIDE.md](docs/STYLE_GUIDE.md)** — Sistema de diseno y guia de componentes
- **[FRONTEND_DESIGN.md](docs/FRONTEND_DESIGN.md)** — Guia de diseno frontend
- **[KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md)** — Problemas conocidos y soluciones
- **[TASK_PLANNING.md](docs/TASK_PLANNING.md)** — Metodologia de planificacion de tareas

## Arquitectura

- **Rutas finas:** Loaders/actions parsean requests y delegan a servicios
- **Componentes presentacionales:** Renderizan UI y orquestan hooks
- **Logica de negocio en servicios:** `app/services/` contiene operaciones de dominio
- **Orquestacion en hooks:** `app/hooks/` para logica React-specific
- **Un componente por archivo**, responsabilidad unica
- **Registro manual de rutas** en `app/routes.ts` (sin file-based routing)
- **Validacion con Zod** en formularios y actions

## Deploy en produccion

La app esta desplegada en:

- **App:** https://servipinsa.netlify.app
- **Base de datos:** Neon PostgreSQL

Para deployar cambios:

```bash
# Si hay cambios de schema, migrar primero
DB_ENV=production npm run db:migrate

# Deploy
npm run deploy
```

Ver [DEPLOYMENT.md](docs/DEPLOYMENT.md) para mas detalles.

## Licencia

MIT
