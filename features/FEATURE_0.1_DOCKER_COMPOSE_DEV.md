# FEATURE 0.1 — Configurar Docker Compose para desarrollo

## 1. Natural Language Description

**Estado actual:** El proyecto hereda un `docker-compose.yml` del template SaaS genérico con nombres genéricos (`saas-template-db`, base de datos `saas_template`). El `.env.example` referencia estos nombres genéricos y contiene secciones de Google OAuth que no aplican a Servipinsa.

**Estado esperado:** Docker Compose configurado con nombres de Servipinsa (`servipinsa-db`, base de datos `servipinsa`). El `.env.example` documenta claramente los 3 entornos de DB (dev Docker local, tests TestContainers, prod configurable). Todo sigue funcionando: migraciones, dev server y tests E2E.

## 2. Technical Description

Tarea de configuración pura. No hay cambios de código de la aplicación, ni lógica de negocio, ni componentes UI. Solo se modifican archivos de infraestructura/configuración.

La infraestructura de DB del proyecto ya está correctamente configurada:
- `app/db/index.ts` usa `pg` (node-postgres) y prioriza `DB_TEST_URL` sobre `DATABASE_URL`
- `drizzle.config.ts` usa `DB_ENV` para seleccionar el archivo `.env`
- Los tests E2E usan TestContainers con `DB_TEST_URL` (independiente del contenedor de dev)
- Ya existe el script `npm run db:up` que ejecuta `docker compose up -d`

No se necesitan cambios en el código de la app ni en la infraestructura de tests.

### 2.1. Architecture Gate

No aplica — esta task no modifica rutas, componentes, servicios ni hooks. Solo archivos de configuración de infraestructura.

## 3. Files to Change/Create

### `docker-compose.yml`

**Objetivo:** Renombrar el contenedor y la base de datos de nombres genéricos a nombres de Servipinsa.

**Pseudocode:**
```pseudocode
CAMBIAR container_name: "saas-template-db" → "servipinsa-db"
CAMBIAR POSTGRES_DB: "saas_template" → "servipinsa"
MANTENER todo lo demás igual (postgres:16-alpine, user, password, ports, volumes)
```

**Archivo actual:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: saas-template-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: saas_template
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Archivo final:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: servipinsa-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: servipinsa
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### `.env.example`

**Objetivo:** Documentar claramente la configuración de DB para los 3 entornos y eliminar la referencia a Google OAuth (que se eliminará formalmente en Task 0.3).

**Archivo final:**
```bash
# =============================================================================
# Database
# =============================================================================
# PostgreSQL connection string
#
# - Development: Docker local (npm run db:up)
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/servipinsa
#
# - Production: PostgreSQL configurable
#   DATABASE_URL=postgresql://user:password@host:5432/servipinsa
#
# - Tests E2E: TestContainers (automático, no necesita configuración)
#   Usa DB_TEST_URL internamente (ver docs/TESTING.md)
#
DATABASE_URL=

# =============================================================================
# Better Auth
# =============================================================================
# Generate secret with: openssl rand -base64 32
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:2025
```

**Nota:** Se elimina la sección de Google OAuth. Aunque la eliminación formal del código es Task 0.3, no tiene sentido documentar variables de entorno que ya se decidió eliminar.

## 4. E2E Test Plan

No se necesitan tests nuevos. Esta task se verifica ejecutando los tests existentes:

### Verificación: Tests E2E siguen usando TestContainers

- **Precondiciones:** Docker Desktop corriendo. Contenedor de dev puede estar up o down (no importa).
- **Pasos:** Ejecutar `npm run test:e2e`
- **Resultado esperado:** Todos los tests pasan. Los tests crean sus propios contenedores TestContainers y NO usan el contenedor `servipinsa-db` de desarrollo.

### Verificación: Migraciones aplican al contenedor de dev

- **Precondiciones:** Docker Desktop corriendo.
- **Pasos:**
  1. Si existe contenedor viejo: `docker compose down -v`
  2. `npm run db:up` (levanta contenedor `servipinsa-db`)
  3. Configurar `.env.development` con `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/servipinsa`
  4. `npm run db:migrate`
- **Resultado esperado:** Migraciones aplican sin errores.

### Verificación: Typecheck y lint

- **Pasos:** `npm run typecheck && npm run lint`
- **Resultado esperado:** Sin errores (no se modificó código TypeScript).
