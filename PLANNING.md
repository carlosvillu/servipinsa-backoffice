# PLANNING.md - Servipinsa Backoffice (Partes de Trabajo v1)

## Overview

Digitalización del flujo de partes de trabajo de Servipinsa, una empresa de instalaciones eléctricas. Reemplaza los formularios en papel con un backoffice web donde empleados crean partes y managers los validan. Construido sobre el template SaaS existente (React Router 7, Better Auth, Drizzle, PostgreSQL).

**Decisiones técnicas acordadas:**

- Roles: columna `role` (enum EMPLEADO/MANAGER) en la tabla `users` existente
- Signup público eliminado: solo un MANAGER puede crear usuarios
- Idioma: solo español (eliminar soporte inglés y sistema i18n)
- Auth: solo email/password (eliminar Google OAuth)
- DB: PostgreSQL puro en todos los entornos. Dev: contenedor Docker local (`DATABASE_URL`). Tests: TestContainers (`DB_TEST_URL`). Prod: PostgreSQL configurable por `DATABASE_URL`. Sin Neon ni drivers serverless.

---

## Prerrequisitos (trabajo manual)

Antes de empezar, necesitas tener configurado:

- [ ] Docker Desktop instalado y corriendo (necesario para DB de desarrollo Y para tests E2E)
- [ ] Contenedor PostgreSQL de desarrollo creado via `docker-compose.yml` (se creará en Phase 0)
- [ ] `DATABASE_URL` configurado en `.env.development` apuntando al contenedor Docker local
- [ ] `BETTER_AUTH_SECRET` configurado en `.env.development`
- [ ] Variables de entorno para el seed del MANAGER inicial (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) en `.env.development` y `.env.example`

---

## Phases

### Phase 0: Limpieza del template

**🔴 Antes:** Template genérico SaaS con i18n bilingüe, Google OAuth, signup público, landing page genérica y hooks/componentes placeholder del proyecto anterior.
**🟢 Después:** Template limpio con solo email/password, sin i18n, sin signup público, sin código legacy. Docker Compose configurado para Servipinsa. Base lista para construir.

#### Task 0.1: Configurar Docker Compose para desarrollo

- [x] Renombrar contenedor en `docker-compose.yml`: `container_name: servipinsa-db`, `POSTGRES_DB: servipinsa`
- [x] Actualizar `.env.example` con `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/servipinsa`
- [x] Documentar en `.env.example` que dev usa Docker local, prod usa PostgreSQL configurable por `DATABASE_URL`
- [x] Verificar que `docker compose up -d` levanta el contenedor correctamente
- [x] Verificar que `npm run db:migrate` aplica migraciones al contenedor local
- [x] Verificar que `npm run test:e2e` sigue usando TestContainers (no el contenedor de dev)

#### Task 0.2: Eliminar sistema i18n

- [x] Eliminar `app/locales/en.json` y `app/locales/es.json`
- [x] Eliminar `app/lib/i18n.ts` y `app/lib/i18n.client.ts`
- [x] Eliminar componente `LanguageSelector.tsx`
- [x] Eliminar la detección de idioma y cookie `lang` del loader de `root.tsx`
- [x] Reemplazar todas las llamadas `t('key')` por strings en español hardcodeados
- [x] Eliminar dependencias `react-i18next` e `i18next` del `package.json`
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan
- [x] Verificar que `npm run test:e2e` pasa

#### Task 0.3: Eliminar Google OAuth

- [x] Eliminar componente `GoogleAuthButton.tsx`
- [x] Eliminar la configuración del provider social de Google en `app/lib/auth.ts`
- [x] Eliminar referencias a `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` de `.env.example`
- [x] Limpiar los formularios de login/signup para no mostrar botón de Google
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan
- [x] Verificar que `npm run test:e2e` pasa

#### Task 0.4: Eliminar signup público

- [x] Eliminar la ruta `/auth/signup` de `app/routes.ts`
- [x] Eliminar el archivo `app/routes/auth.signup.tsx`
- [x] Eliminar el enlace "Crear cuenta" de la página de login
- [x] Actualizar tests E2E que usan signup flow (usar `createAuthSession` helper en su lugar)
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan
- [x] Verificar que `npm run test:e2e` pasa

#### Task 0.5: Limpiar código legacy

- [x] Eliminar hooks placeholder del proyecto anterior (`useConversationDeletion`, `useChatAutoScroll`, `useCheckoutProcessingToast`, `useEpisodeSelection`)
- [x] Eliminar componentes de landing page que no se usarán (`HeroSection`, `Footer`, `EditorialDivider`, landing/index.ts)
- [x] Limpiar `app/routes/home.tsx` para que sea un redirect al dashboard (o placeholder temporal)
- [x] Eliminar `app/welcome/` si existe
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan
- [x] Verificar que `npm run test:e2e` pasa

---

### Phase 1: Modelo de datos y roles

**🔴 Antes:** Solo tablas de Better Auth (users, accounts, sessions, verifications). Sin roles. Sin tablas de partes de trabajo.
**🟢 Después:** Campo `role` en users, tablas para partes de trabajo (work_orders, work_order_tasks, work_order_labor, work_order_materials, work_order_validations), migraciones generadas y aplicadas, seed de MANAGER inicial.

#### Task 1.1: Añadir campo role a users

- [x] Añadir columna `role` (text, default 'EMPLEADO') al schema de users en `app/db/schema/users.ts`
- [x] Generar migración con `npm run db:generate`
- [x] Aplicar migración con `npm run db:migrate`
- [x] Actualizar los types/helpers de auth si es necesario para exponer `role` en la sesión
- [x] Verificar que `npm run typecheck` pasa
- [x] Verificar que `npm run test:e2e` pasa

#### Task 1.2: Schema de partes de trabajo

- [x] Crear `app/db/schema/work-orders.ts` con todas las tablas del dominio (work_orders, work_order_tasks, work_order_labor, work_order_materials, work_order_validations)
- [x] Añadir relaciones en `app/db/schema/relations.ts`
- [x] Exportar todo desde `app/db/schema/index.ts`
- [x] Generar migración con `npm run db:generate`
- [x] Aplicar migración con `npm run db:migrate`
- [x] Verificar que `npm run typecheck` pasa

#### Task 1.3: Seed del MANAGER inicial

- [x] Crear script `app/db/seed.ts` que cree un usuario MANAGER usando variables de entorno (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`)
- [x] El script debe usar Better Auth API para crear el usuario (no inserción directa) y luego actualizar el role a MANAGER
- [x] Añadir comando `npm run db:seed` en `package.json`
- [x] Documentar en `.env.example` las variables necesarias
- [x] Verificar que el seed crea el usuario correctamente

#### Task 1.4: Actualizar fixtures de test

- [x] Añadir fixtures de datos para partes de trabajo en `tests/fixtures/data.ts`
- [x] Crear seeders para work_orders, work_order_tasks, work_order_labor, work_order_materials, work_order_validations en `tests/fixtures/seeders.ts`
- [x] Crear helper para crear usuario con rol específico (MANAGER/EMPLEADO) para tests
- [x] Actualizar `resetDatabase` si es necesario para incluir nuevas tablas
- [x] Verificar que `npm run test:e2e` pasa

---

### Phase 2: Autenticación y autorización

**🔴 Antes:** Login funcional pero sin concepto de roles. Cualquier usuario autenticado tiene el mismo acceso. Sin protección por rol.
**🟢 Después:** Login funcional con roles. Helpers de autorización (`requireManager()`) disponibles. Middleware de permisos por rol en server-side.

#### Task 2.1: Helpers de autorización por rol

- [x] Crear `app/lib/authorization.server.ts` con helpers: `requireManager(request)` (lanza redirect/403 si no es MANAGER), `getUserRole(request)` (devuelve el rol del usuario autenticado)
- [x] Los helpers deben usar `requireAuth()` internamente y luego consultar el rol del usuario
- [x] Crear servicio `app/services/users.server.ts` con funciones para consultar/actualizar roles
- [x] Verificar que `npm run typecheck` pasa
- [x] Verificar que `npm run test:e2e` pasa (tests básicos de auth siguen funcionando)

#### Task 2.2: Página de login adaptada

- [x] Actualizar `app/routes/auth.login.tsx` con textos en español
- [x] Eliminar cualquier referencia a signup o Google OAuth
- [x] Asegurar que el redirect post-login lleva al dashboard (`/`)
- [x] Test E2E: login con credenciales válidas redirige al dashboard
- [x] Test E2E: login con credenciales inválidas muestra error
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan

---

### Phase 3: Dashboard — Listado de partes

**🔴 Antes:** La ruta `/` es un placeholder. No hay listado de partes de trabajo.
**🟢 Después:** Dashboard funcional con listado de partes ordenados cronológicamente. EMPLEADO ve solo los suyos. MANAGER ve todos. Paginación. Botón para crear nuevo parte.

#### Task 3.1: Servicio de partes de trabajo

- [x] Crear `app/services/workOrders.server.ts` con funciones:
  - `listWorkOrders({ userId, role, page, pageSize })` — lista partes con paginación (EMPLEADO: solo propios, MANAGER: todos)
  - `getWorkOrderById(id)` — obtiene un parte con todas sus relaciones (tasks, labor, materials, validations)
- [x] Las queries deben incluir conteo de validaciones para mostrar en el listado
- [x] Verificar que `npm run typecheck` pasa

#### Task 3.2: Página de dashboard

- [x] Crear componente `app/components/WorkOrderList.tsx` — tabla/lista de partes (fecha, cliente, dirección, nº validaciones, estado)
- [x] Crear componente `app/components/Pagination.tsx` — controles de paginación
- [x] Crear ruta `/` en `app/routes/home.tsx` con loader que llame al servicio `listWorkOrders`
- [x] Loader usa `requireAuth()` y pasa `userId` y `role` al servicio
- [x] Click en fila navega a `/work-orders/:id`
- [x] Botón "Nuevo Parte de Trabajo" navega a `/work-orders/new`
- [x] Indicador visual de estado: "Pendiente" vs "Validado"
- [x] Test E2E: EMPLEADO autenticado ve solo sus partes
- [x] Test E2E: MANAGER autenticado ve todos los partes
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan

---

### Phase 4: Creación de partes de trabajo

**🔴 Antes:** No existe formulario de creación. No se pueden crear partes.
**🟢 Después:** Formulario completo para crear un parte de trabajo con las 4 secciones (datos generales, trabajos, mano de obra, materiales). Validación client-side con Zod. El parte se guarda y aparece en el dashboard.

#### Task 4.1: Servicio de creación de partes

- [x] Añadir a `app/services/workOrders.server.ts`:
  - `createWorkOrder(data)` — crea un parte con todos sus sub-registros (tasks, labor, materials) en una transacción
- [x] Definir schemas Zod para validación del formulario en `app/services/workOrders.server.ts` o archivo separado
- [x] Validaciones: campos obligatorios, mínimo 1 trabajo, mínimo 1 técnico, hora fin > hora inicio
- [x] Verificar que `npm run typecheck` pasa

#### Task 4.2: Formulario de creación

- [x] Crear hook `app/hooks/useWorkOrderForm.ts` para gestionar el estado del formulario (secciones dinámicas: añadir/eliminar líneas de trabajos, mano de obra, materiales)
- [x] Crear componente `app/components/WorkOrderForm.tsx` — formulario con las 4 secciones
- [x] Crear componentes para cada sección dinámica: `WorkOrderTasksSection.tsx`, `WorkOrderLaborSection.tsx`, `WorkOrderMaterialsSection.tsx`
- [x] Usar Base UI form components con react-hook-form y Zod resolver
- [x] Botones para añadir/eliminar líneas en cada sección dinámica
- [x] Validación en cliente antes de enviar
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan

#### Task 4.3: Ruta de creación

- [x] Crear `app/routes/work-orders.new.tsx` con loader (`requireAuth`) y action (parsear form, llamar servicio, redirect a dashboard)
- [x] Registrar ruta `/work-orders/new` en `app/routes.ts`
- [x] La fecha de creación se asigna automáticamente en server
- [x] El `createdBy` se asigna desde la sesión del usuario
- [x] Tras crear, redirect al dashboard con mensaje de éxito
- [x] Test E2E: crear un parte completo con datos generales, 1 trabajo, 1 técnico y verificar que aparece en el dashboard
- [x] Test E2E: validación client-side muestra errores si faltan campos obligatorios
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan

---

### Phase 5: Detalle y edición de partes

**🔴 Antes:** No existe vista de detalle ni edición de partes.
**🟢 Después:** Vista de detalle completa con todas las secciones. Edición disponible para partes no validados (EMPLEADO: solo propios, MANAGER: todos). Indicador visual de estado.

#### Task 5.1: Servicio de edición

- [x] Añadir a `app/services/workOrders.server.ts`:
  - `updateWorkOrder(id, data, userId, role)` — actualiza un parte (verifica que no esté validado y que el usuario tenga permisos)
  - `canEditWorkOrder(workOrder, userId, role)` — helper que devuelve boolean
- [x] La actualización reemplaza las sub-entidades (tasks, labor, materials) en una transacción
- [x] Verificar que `npm run typecheck` pasa

#### Task 5.2: Página de detalle

- [x] Crear componente `app/components/WorkOrderDetail.tsx` — vista de solo lectura organizada por secciones
- [x] Crear componente `app/components/WorkOrderValidations.tsx` — lista cronológica de validaciones (nombre + fecha/hora)
- [x] Crear `app/routes/work-orders.$id.tsx` con loader que llame a `getWorkOrderById`
- [x] Registrar ruta `/work-orders/:id` en `app/routes.ts`
- [x] Mostrar botón "Editar" solo si el parte no está validado y el usuario tiene permisos
- [x] Mostrar botón "Validar Parte" solo si el usuario es MANAGER
- [x] Indicador visual claro de estado: "Pendiente" vs "Validado"
- [x] Test E2E: ver detalle de un parte con todos sus datos
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan

#### Task 5.3: Página de edición

- [x] Crear `app/routes/work-orders.$id.edit.tsx` con loader (verificar permisos, cargar parte) y action (validar, actualizar, redirect a detalle)
- [x] Registrar ruta `/work-orders/:id/edit` en `app/routes.ts`
- [x] Reutilizar `WorkOrderForm.tsx` con datos pre-rellenados
- [x] Si el parte está validado, redirect al detalle (no permitir edición)
- [x] EMPLEADO solo puede editar sus propios partes (verificar en loader y action)
- [x] MANAGER puede editar cualquier parte no validado
- [x] Test E2E: editar un parte existente y verificar los cambios
- [x] Test E2E: intentar editar un parte validado redirige al detalle
- [ ] Verificar que `npm run typecheck` y `npm run lint` pasan

---

### Phase 6: Validación de partes

**🔴 Antes:** No existe flujo de validación. Los partes no se pueden marcar como validados.
**🟢 Después:** Un MANAGER puede validar un parte desde el detalle. Tras la primera validación, el parte queda bloqueado para edición. Se pueden acumular validaciones. Confirmación antes de validar.

#### Task 6.1: Servicio de validación

- [x] Añadir a `app/services/workOrders.server.ts`:
  - `validateWorkOrder(workOrderId, managerId)` — crea un registro de validación
  - `isWorkOrderValidated(workOrderId)` — devuelve si el parte tiene al menos una validación
- [x] Solo usuarios con role MANAGER pueden validar
- [x] Verificar que `npm run typecheck` pasa

#### Task 6.2: UI de validación

- [x] Añadir action de validación en `app/routes/work-orders.$id.tsx` (intent: "validate")
- [x] Crear componente `app/components/ValidateWorkOrderDialog.tsx` — AlertDialog de confirmación ("Esta acción bloqueará el parte para edición")
- [x] El botón "Validar Parte" abre el diálogo de confirmación
- [x] Tras validar, la página se recarga mostrando la nueva validación en el historial
- [x] El botón "Editar" desaparece tras la primera validación
- [x] Test E2E: MANAGER valida un parte → el parte aparece como "Validado" → botón editar desaparece
- [x] Test E2E: EMPLEADO no ve botón "Validar"
- [x] Verificar que `npm run typecheck` y `npm run lint` pasan

---

### Phase 7: Gestión de usuarios

**🔴 Antes:** No hay interfaz de gestión de usuarios. No se pueden crear nuevos usuarios desde la app.
**🟢 Después:** MANAGER puede ver lista de usuarios, crear nuevos usuarios (como EMPLEADO) y promover a MANAGER. Ruta protegida solo para MANAGER.

#### Task 7.1: Servicio de gestión de usuarios

- [ ] Añadir a `app/services/users.server.ts`:
  - `listUsers()` — lista todos los usuarios con su rol
  - `createUser(email, password, name)` — crea usuario con rol EMPLEADO usando Better Auth API
  - `promoteToManager(userId)` — actualiza rol a MANAGER
- [ ] Verificar que `npm run typecheck` pasa

#### Task 7.2: Página de gestión de usuarios

- [ ] Crear componente `app/components/UserList.tsx` — tabla de usuarios (nombre, email, rol)
- [ ] Crear componente `app/components/CreateUserDialog.tsx` — formulario modal para crear usuario (email, contraseña, nombre)
- [ ] Crear componente `app/components/PromoteUserDialog.tsx` — confirmación para promover a MANAGER
- [ ] Crear `app/routes/users.tsx` con loader (`requireManager`) y actions (crear usuario, promover)
- [ ] Registrar ruta `/users` en `app/routes.ts`
- [ ] Añadir enlace "Usuarios" en la navegación, visible solo para MANAGER
- [ ] Test E2E: MANAGER crea un nuevo usuario → aparece en la lista como EMPLEADO
- [ ] Test E2E: MANAGER promueve usuario a MANAGER → rol actualizado en la lista
- [ ] Test E2E: EMPLEADO no puede acceder a `/users` (redirect o 403)
- [ ] Verificar que `npm run typecheck` y `npm run lint` pasan

---

### Phase 8: Navegación y polish

**🔴 Antes:** Header genérico del template. Sin navegación contextual. Sin feedback visual en acciones.
**🟢 Después:** Navegación adaptada a Servipinsa con enlaces contextuales por rol. Toasts de feedback en acciones. Responsive en móvil/tablet.

#### Task 8.1: Navegación principal

- [ ] Actualizar `app/components/Header.tsx` con navegación de Servipinsa: logo/nombre, enlace "Partes" (dashboard), enlace "Usuarios" (solo MANAGER), menú de usuario con logout
- [ ] Eliminar `ThemeToggle` y `LanguageSelector` del header (ya no aplican)
- [ ] La navegación debe ser responsive (hamburger menu en móvil)
- [ ] Verificar que `npm run typecheck` y `npm run lint` pasan
- [ ] Verificar que `npm run test:e2e` pasa

#### Task 8.2: Feedback visual y estados vacíos

- [ ] Añadir toasts (sonner) para acciones exitosas: parte creado, parte editado, parte validado, usuario creado
- [ ] Añadir estados vacíos en el dashboard ("No hay partes de trabajo. Crea el primero.")
- [ ] Añadir estados de carga en formularios (botón deshabilitado mientras envía)
- [ ] Verificar responsive en viewports móvil (320-400px) y tablet
- [ ] Verificar que `npm run typecheck` y `npm run lint` pasan
- [ ] Verificar que `npm run test:e2e` pasa

---

## Implementation Order

1. Task 0.1 - Configurar Docker Compose para desarrollo
2. Task 0.2 - Eliminar sistema i18n
3. Task 0.3 - Eliminar Google OAuth
4. Task 0.4 - Eliminar signup público
5. Task 0.5 - Limpiar código legacy
6. Task 1.1 - Añadir campo role a users
6. Task 1.2 - Schema de partes de trabajo
7. Task 1.3 - Seed del MANAGER inicial
8. Task 1.4 - Actualizar fixtures de test
9. Task 2.1 - Helpers de autorización por rol
10. Task 2.2 - Página de login adaptada
11. Task 3.1 - Servicio de partes de trabajo
12. Task 3.2 - Página de dashboard
13. Task 4.1 - Servicio de creación de partes
14. Task 4.2 - Formulario de creación
15. Task 4.3 - Ruta de creación
16. Task 5.1 - Servicio de edición
17. Task 5.2 - Página de detalle
18. Task 5.3 - Página de edición
19. Task 6.1 - Servicio de validación
20. Task 6.2 - UI de validación
21. Task 7.1 - Servicio de gestión de usuarios
22. Task 7.2 - Página de gestión de usuarios
23. Task 8.1 - Navegación principal
24. Task 8.2 - Feedback visual y estados vacíos

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Better Auth no expone `role` en la sesión fácilmente | Alto | Investigar plugins de Better Auth o hacer query adicional al campo role en cada request |
| Eliminar i18n rompe muchos componentes a la vez | Medio | Hacer Task 0.1 primero y en aislamiento. Reemplazar `t()` calls uno por uno |
| Formularios dinámicos (añadir/eliminar líneas) complejos | Medio | Usar `useFieldArray` de react-hook-form, bien probado con Base UI |
| Transacciones de DB al crear/editar partes con sub-entidades | Medio | Usar transacciones de Drizzle. Testear con E2E que rollback funciona en caso de error |
| Crear usuarios via Better Auth API desde server (sin signup público) | Medio | Investigar `auth.api.signUpEmail` de Better Auth para crear usuarios server-side |

---

## Open Questions

- [ ] ¿El campo "Número de Coche" es suficiente como texto libre o se necesitará un catálogo de vehículos en el futuro?
- [ ] ¿Se necesita algún mecanismo de "olvidé mi contraseña" o el MANAGER resetea las contraseñas?
- [ ] ¿Qué pasa si un MANAGER se elimina a sí mismo el rol? ¿Debe haber protección para que siempre exista al menos un MANAGER?

---

## Progress Tracker

| Phase | Task | Status | Notes |
|-------|------|--------|-------|
| 0 | 0.1 Docker Compose dev | ✅ Complete | |
| 0 | 0.2 Eliminar i18n | ✅ Complete | Tests signup/login fallaban antes de esta tarea |
| 0 | 0.3 Eliminar Google OAuth | ✅ Complete | |
| 0 | 0.4 Eliminar signup público | ✅ Complete | |
| 0 | 0.5 Limpiar código legacy | ✅ Complete | |
| 1 | 1.1 Añadir role a users | ✅ Complete | additionalFields en Better Auth para exponer role en sesión |
| 1 | 1.2 Schema partes de trabajo | ✅ Complete | 5 tablas en un solo archivo work-orders.ts |
| 1 | 1.3 Seed MANAGER inicial | ✅ Complete | npm run db:seed, idempotente |
| 1 | 1.4 Actualizar fixtures test | ✅ Complete | Seeders + createAuthSessionWithRole |
| 2 | 2.1 Helpers autorización | ✅ Complete | requireManager + getUserRole + users.server.ts |
| 2 | 2.2 Login adaptado | ✅ Complete | Textos español, sin signup/OAuth, tests E2E |
| 3 | 3.1 Servicio listado partes | ✅ Complete | listWorkOrders + getWorkOrderById |
| 3 | 3.2 Página dashboard | ✅ Complete | WorkOrderList, Pagination, StatusBadge, 6 tests E2E |
| 4 | 4.1 Servicio creación partes | ✅ Complete | createWorkOrder con transacción Drizzle, schema Zod en app/schemas/workOrder.ts |
| 4 | 4.2 Formulario creación | ✅ Complete | WorkOrderForm + 3 secciones dinámicas + useWorkOrderForm hook |
| 4 | 4.3 Ruta de creación | ✅ Complete | work-orders.new.tsx, 6 tests E2E, PR #2 |
| 5 | 5.1 Servicio edición | ✅ Complete | canEditWorkOrder, updateWorkOrder, dateToTimeString |
| 5 | 5.2 Página detalle | ✅ Complete | WorkOrderDetail, WorkOrderValidations, 4 tests E2E |
| 5 | 5.3 Página edición | ✅ Complete | Reutiliza WorkOrderForm con defaultValues, 4 tests E2E |
| 6 | 6.1 Servicio validación | ✅ Complete | validateWorkOrder + hasManagerValidated |
| 6 | 6.2 UI validación | ✅ Complete | ValidateWorkOrderDialog + action + 2 tests E2E |
| 7 | 7.1 Servicio gestión usuarios | ⬜ Not Started | |
| 7 | 7.2 Página gestión usuarios | ⬜ Not Started | |
| 8 | 8.1 Navegación principal | ⬜ Not Started | |
| 8 | 8.2 Feedback y polish | ⬜ Not Started | |

**Status Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Complete | ⏸️ Blocked
