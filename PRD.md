# SERVIPINSA — Backoffice Partes de Trabajo

### Product Requirements Document (PRD)

|              |                        |
| ------------ | ---------------------- |
| **Producto** | Servipinsa Backoffice  |
| **Módulo**   | Partes de Trabajo (v1) |
| **Versión**  | 1.0                    |
| **Fecha**    | 28 de marzo de 2026    |
| **Estado**   | Borrador               |

---

## 1. Resumen Ejecutivo

Servipinsa es una empresa de instalaciones eléctricas con sede en Torremolinos, Málaga. Actualmente gestiona sus partes de trabajo mediante formularios en papel, lo que genera ineficiencias en el registro, seguimiento y validación de los trabajos realizados.

Este documento define los requisitos para el primer módulo del nuevo Backoffice: la gestión digital de Partes de Trabajo. El objetivo es digitalizar el flujo completo desde la creación del parte hasta su validación, eliminando el papel y centralizando la información.

| Aspecto           | Detalle                            |
| ----------------- | ---------------------------------- |
| Usuarios objetivo | Empleados y Managers de Servipinsa |
| Plataforma        | Aplicación web responsive          |

---

## 2. Objetivos

### 2.1 Objetivos de Negocio

- Eliminar los partes de trabajo en papel, reduciendo errores y pérdida de información.
- Centralizar el registro de trabajos realizados, mano de obra y materiales consumidos.
- Implementar un flujo de validación digital con trazabilidad completa.
- Proveer una base para futuros módulos del backoffice (facturación, inventario, etc.).

### 2.2 Objetivos de Producto

- Permitir a los empleados crear y editar sus propios partes de trabajo de forma rápida.
- Permitir a los managers supervisar, editar y validar todos los partes.
- Garantizar que un parte validado quede inmutable como registro oficial.
- Listar todos los partes en un dashboard ordenado cronológicamente.

---

## 3. Usuarios y Roles

Todo usuario nuevo se crea con rol **EMPLEADO** por defecto.

| Rol          | Crear Partes | Editar Partes              | Validar | Gestionar Usuarios                      |
| ------------ | ------------ | -------------------------- | ------- | --------------------------------------- |
| **EMPLEADO** | Sí (propios) | Sí (propios, no validados) | No      | No                                      |
| **MANAGER**  | Sí (todos)   | Sí (todos, no validados)   | Sí      | Sí (crear usuarios, promover a MANAGER) |

### 3.1 Reglas de Gestión de Usuarios

- La autenticación se realiza mediante usuario y contraseña.
- Todo nuevo usuario se crea con rol EMPLEADO.
- Solo un MANAGER puede promover a otro usuario a MANAGER.
- Solo un MANAGER puede crear nuevos usuarios.
- Se requiere un MANAGER inicial (seed) para arrancar el sistema.

---

## 4. Modelo de Datos — Parte de Trabajo

Cada parte de trabajo es una entidad compuesta por cuatro secciones: datos generales, trabajos realizados, mano de obra y materiales.

### 4.1 Datos Generales

| Campo             | Tipo                  | Obligatorio | Editable | Notas                         |
| ----------------- | --------------------- | ----------- | -------- | ----------------------------- |
| ID                | UUID / Auto-increment | Auto        | No       | Identificador único del parte |
| Fecha de creación | Datetime              | Auto        | No       | Se genera al crear. Inmutable |
| Creado por        | Referencia a Usuario  | Auto        | No       | Usuario que crea el parte     |
| Cliente           | Texto libre           | Sí          | Sí\*     | Nombre del cliente            |
| Dirección         | Texto libre           | Sí          | Sí\*     | Dirección del trabajo         |
| Número de Coche   | Texto libre           | No          | Sí\*     | Ej: RIFFTER 14                |
| Conductor Ida     | Texto libre           | No          | Sí\*     | Conductor de ida              |
| Conductor Vuelta  | Texto libre           | No          | Sí\*     | Conductor de vuelta           |

_\* Editable solo si el parte no ha sido validado._

### 4.2 Trabajos Realizados

Lista de descripciones de trabajos. **Mínimo 1 obligatorio.**

| Campo          | Tipo         | Obligatorio | Notas                             |
| -------------- | ------------ | ----------- | --------------------------------- |
| Descripción    | Texto libre  | Sí          | Descripción del trabajo realizado |
| Hora de inicio | Time (HH:mm) | Sí          | Hora en que comienza el trabajo   |
| Hora de fin    | Time (HH:mm) | Sí          | Hora en que finaliza el trabajo   |

- Se pueden añadir tantas líneas de trabajo como sean necesarias.
- No se puede guardar un parte sin al menos una línea de trabajo.
- La hora de fin debe ser posterior a la hora de inicio.

### 4.3 Mano de Obra

Lista de técnicos asignados. **Mínimo 1 obligatorio.**

| Campo              | Tipo         | Obligatorio | Notas                       |
| ------------------ | ------------ | ----------- | --------------------------- |
| Nombre del técnico | Texto libre  | Sí          | Nombre completo del técnico |
| Hora de entrada    | Time (HH:mm) | Sí          | Hora de inicio de jornada   |
| Hora de salida     | Time (HH:mm) | Sí          | Hora de fin de jornada      |

- Se pueden añadir tantos técnicos como sean necesarios.
- No se puede guardar un parte sin al menos un técnico.
- La hora de salida debe ser posterior a la hora de entrada.

### 4.4 Materiales (Opcional)

Lista de materiales utilizados. Esta sección es completamente opcional.

| Campo       | Tipo             | Obligatorio | Notas                           |
| ----------- | ---------------- | ----------- | ------------------------------- |
| Unidades    | Entero (integer) | Sí\*        | Cantidad consumida              |
| Descripción | Texto libre      | Sí\*        | Descripción del material        |
| Obra        | Texto libre      | No          | Referencia a obra (opcional)    |
| Suministro  | Texto libre      | No          | Proveedor/suministro (opcional) |

_\* Obligatorio solo si se añade una línea de material. La sección completa es opcional._

### 4.5 Validaciones

Registro acumulativo de validaciones sobre un parte de trabajo.

| Campo                 | Tipo                 | Obligatorio | Notas                      |
| --------------------- | -------------------- | ----------- | -------------------------- |
| Usuario validador     | Referencia a Usuario | Auto        | MANAGER que valida         |
| Fecha/hora validación | Datetime             | Auto        | Timestamp de la validación |

- Un parte puede acumular múltiples validaciones a lo largo del tiempo.
- Una vez que un parte recibe su primera validación, queda bloqueado para edición.
- Solo usuarios con rol MANAGER pueden validar.
- Se muestra el historial completo de validaciones en el detalle del parte.

---

## 5. Funcionalidades

### 5.1 Autenticación

- Login mediante usuario y contraseña.
- Sesión persistente con token (JWT o similar).
- Logout manual.
- Protección de todas las rutas del backoffice.

### 5.2 Dashboard — Listado de Partes

- Lista de todos los partes de trabajo ordenados por fecha de creación (más reciente primero).
- Cada fila muestra: fecha, cliente, dirección y número de validaciones.
- Click en una fila navega al detalle del parte.
- Botón "Nuevo Parte de Trabajo" para crear uno nuevo.
- EMPLEADO ve solo sus partes. MANAGER ve todos.
- Paginación para listas largas.

### 5.3 Creación de Parte de Trabajo

- Formulario con las cuatro secciones: Datos Generales, Trabajos, Mano de Obra, Materiales.
- La fecha de creación se asigna automáticamente y no es editable.
- Secciones dinámicas: botones para añadir/eliminar líneas en Trabajos, Mano de Obra y Materiales.
- Validación en cliente antes de enviar (campos obligatorios, mínimos, formato de horas).
- Al guardar, el parte aparece en el dashboard.

### 5.4 Edición de Parte de Trabajo

- Solo disponible si el parte NO ha sido validado.
- EMPLEADO: solo puede editar sus propios partes.
- MANAGER: puede editar cualquier parte no validado.
- Mismo formulario que creación, pre-rellenado con los datos existentes.

### 5.5 Detalle de Parte de Trabajo

- Vista de solo lectura con toda la información del parte organizada por secciones.
- Sección de validaciones: lista cronológica de todas las validaciones con nombre y fecha/hora.
- Botón "Validar Parte" visible solo para MANAGER.
- Botón "Editar" visible solo si el parte no está validado y el usuario tiene permisos.
- Indicador visual claro de estado: "Pendiente" vs "Validado".

### 5.6 Validación de Parte

- Acción exclusiva de MANAGER.
- Al validar se crea un registro con el nombre del usuario y timestamp.
- Tras la primera validación, el parte queda bloqueado para edición.
- Se pueden acumular validaciones adicionales (ej: segundo manager revisa).
- Confirmación antes de validar (acción irreversible respecto al bloqueo).

### 5.7 Gestión de Usuarios (solo MANAGER)

- Crear nuevos usuarios con usuario y contraseña (rol EMPLEADO por defecto).
- Promover EMPLEADO a MANAGER.
- Listado de usuarios con rol actual.

---

## 6. Reglas de Negocio

| ID    | Regla                                | Consecuencia                                          |
| ----- | ------------------------------------ | ----------------------------------------------------- |
| RN-01 | La fecha de creación es inmutable    | Se genera al crear y nunca se modifica                |
| RN-02 | Mínimo 1 trabajo realizado por parte | No se puede guardar sin al menos una línea de trabajo |
| RN-03 | Mínimo 1 técnico en mano de obra     | No se puede guardar sin al menos un técnico           |
| RN-04 | Materiales son opcionales            | Un parte puede tener 0 líneas de material             |
| RN-05 | Parte validado = bloqueado           | Tras la primera validación no se permite edición      |
| RN-06 | Solo MANAGER valida                  | Un EMPLEADO no puede validar ningún parte             |
| RN-07 | Los partes nunca se eliminan         | No existe funcionalidad de borrado                    |
| RN-08 | EMPLEADO ve solo sus partes          | El dashboard filtra por usuario creador               |
| RN-09 | MANAGER ve todos los partes          | Sin filtro de propietario                             |
| RN-10 | Nuevo usuario = EMPLEADO             | Rol por defecto al crear cuenta                       |
| RN-11 | Solo MANAGER promueve roles          | Un EMPLEADO no puede cambiar roles                    |
| RN-12 | Hora fin > Hora inicio               | Validación en trabajos y mano de obra                 |

---

## 7. Requisitos No Funcionales

### 7.1 Rendimiento

- El dashboard debe cargar en menos de 2 segundos.
- La creación/edición de un parte debe responder en menos de 1 segundo.

### 7.2 Seguridad

- Contraseñas almacenadas con hash seguro (bcrypt o similar).
- Tokens de sesión con expiración configurable.
- Validación de permisos en cada endpoint del servidor (no solo en cliente).
- Protección contra inyección SQL y XSS.

### 7.3 Usabilidad

- Diseño responsive: debe funcionar en móvil y tablet (los técnicos pueden rellenar desde obra).
- Interfaz clara y sencilla, orientada a usuarios no técnicos.
- Feedback visual inmediato en validaciones de formulario.

### 7.4 Disponibilidad

- Disponibilidad objetivo: 99.5% uptime.
- Backups automáticos diarios de base de datos.

### 7.5 Mantenibilidad

- Código limpio, principio KISS.
- Stack recomendado: TypeScript tanto en frontend como en backend.
- Base de datos relacional (PostgreSQL recomendado).

---

## 8. Flujos de Usuario

### 8.1 Flujo Principal — Creación y Validación

Login → Dashboard → Nuevo Parte → Rellenar formulario → Guardar → El parte aparece en el listado como "Pendiente" → Un MANAGER accede al detalle → Pulsa "Validar" → El parte queda bloqueado y marcado como "Validado".

### 8.2 Flujo de Edición

Dashboard → Click en parte (no validado) → Detalle → Botón "Editar" → Formulario pre-rellenado → Modificar → Guardar.

### 8.3 Flujo de Gestión de Usuarios (MANAGER)

Menú → Usuarios → Crear nuevo usuario (usuario + contraseña) → Se crea como EMPLEADO → Opcionalmente promover a MANAGER.

---

## 9. Estructura de Pantallas

| Pantalla      | Ruta sugerida        | Acceso        | Descripción                    |
| ------------- | -------------------- | ------------- | ------------------------------ |
| Login         | `/login`             | Pública       | Formulario de autenticación    |
| Dashboard     | `/`                  | Autenticado   | Listado de partes de trabajo   |
| Nuevo Parte   | `/partes/nuevo`      | Autenticado   | Formulario de creación         |
| Detalle Parte | `/partes/:id`        | Autenticado   | Vista detallada + validaciones |
| Editar Parte  | `/partes/:id/editar` | Autenticado\* | Formulario de edición          |
| Usuarios      | `/usuarios`          | MANAGER       | Gestión de usuarios            |

_\* Solo accesible si el parte no está validado y el usuario tiene permisos._

---

## 10. Setup Inicial

Para arrancar el sistema es necesario crear un usuario MANAGER inicial (seed).

| Configuración   | Valor sugerido      | Notas                                |
| --------------- | ------------------- | ------------------------------------ |
| Usuario seed    | `admin`             | Configurable en variables de entorno |
| Contraseña seed | Variable de entorno | Nunca hardcodeada en código          |
| Rol seed        | MANAGER             | Necesario para crear otros usuarios  |

---

## 11. Fuera de Alcance (v1)

- Exportación a PDF del parte de trabajo.
- Notificaciones por email o push.
- Gestión de flota de vehículos (selección predefinida).
- Gestión de catálogo de materiales.
- Firma digital o captura de firma en el parte.
- Integración con sistemas de facturación.
- Búsqueda avanzada y filtros en el dashboard.
- Gestión de clientes como entidad propia.
- App nativa móvil (se cubre con responsive web).
- Auditoría de cambios (historial de ediciones).

---

## 12. Glosario

| Término              | Definición                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| **Parte de Trabajo** | Documento que registra los trabajos realizados, mano de obra y materiales utilizados en una intervención. |
| **Validación**       | Acción de un MANAGER que aprueba un parte, bloqueándolo para edición.                                     |
| **EMPLEADO**         | Rol base. Puede crear y editar sus propios partes.                                                        |
| **MANAGER**          | Rol superior. Puede gestionar todos los partes, validar y administrar usuarios.                           |
| **Seed**             | Usuario inicial creado automáticamente para arrancar el sistema.                                          |
