# FEATURE_6 — Validación de Partes de Trabajo

## 1. Natural Language Description

**Estado actual:** Los partes de trabajo se pueden crear, ver y editar. El botón "Validar Parte" existe en la vista de detalle pero está `disabled` y no tiene funcionalidad. No hay action en la ruta de detalle. El servicio `workOrders.server.ts` no tiene funciones de validación. La tabla `work_order_validations` ya existe en la DB, y los seeders de test ya pueden insertar validaciones.

**Estado esperado:** Un MANAGER puede validar un parte desde la vista de detalle. Al hacer click en "Validar Parte", se abre un AlertDialog de confirmación. Tras confirmar, se crea un registro en `work_order_validations`. El parte queda bloqueado para edición (el botón "Editar" desaparece). Se pueden acumular validaciones de distintos MANAGERs (una por MANAGER). El botón "Validar Parte" sigue visible para MANAGERs que aún no han validado ese parte.

**Reglas de negocio:**
- Solo usuarios con role `MANAGER` pueden validar.
- Cada MANAGER solo puede validar un parte una vez (unicidad `workOrderId + validatedBy`).
- Tras la primera validación, el parte se bloquea para edición (`canEditWorkOrder` ya implementa esto).
- El botón "Validar Parte" es visible para cualquier MANAGER que no haya validado ya ese parte.
- Un EMPLEADO nunca ve el botón "Validar Parte".

---

## 2. Technical Description

La implementación se divide en dos tareas:

**Task 6.1 — Servicio:** Añadir dos funciones al servicio existente `workOrders.server.ts`:
- `validateWorkOrder(workOrderId, managerId)` — inserta un registro en `work_order_validations` tras verificar que el MANAGER no haya validado ya ese parte.
- `isWorkOrderValidated(workOrderId)` — consulta si el parte tiene al menos una validación (ya se puede deducir de `getWorkOrderById`, pero tener un helper explícito simplifica la lógica).

**Task 6.2 — UI:** Modificar la ruta de detalle (`work-orders.$id.tsx`) para:
- Añadir un `action` que procese el intent `"validate"`.
- Crear un componente `ValidateWorkOrderDialog.tsx` que use el AlertDialog existente.
- Cambiar el flag `isManager` del loader por `canValidate` (que indica si el MANAGER actual ya validó o no ese parte).
- Eliminar el `disabled` del botón y conectarlo al dialog.

No se requieren cambios en DB (la tabla ya existe). No se requieren migraciones.

### 2.1. Architecture Gate

- **Pages are puzzles:** `work-orders.$id.tsx` compone `WorkOrderDetail`, `WorkOrderValidations` y `ValidateWorkOrderDialog`. No tiene UI propia significativa.
- **Loaders/actions are thin:** El loader llama a `getWorkOrderById` y computa flags. El action parsea el intent, llama a `validateWorkOrder` y retorna redirect/revalidation.
- **Business logic is not in components:** La validación de permisos y la inserción en DB están en `app/services/workOrders.server.ts`. El componente `ValidateWorkOrderDialog` solo renderiza el dialog y emite un form submit.

**Para cada route module:**
- `work-orders.$id.tsx`:
  - **Loader:** llama a `getWorkOrderById`, `canEditWorkOrder`. Computa `canValidate`.
  - **Action:** parsea intent `"validate"`, llama a `validateWorkOrder`.
  - **Component:** compone `WorkOrderDetail`, `WorkOrderValidations`, `ValidateWorkOrderDialog`, `Button` (Editar).

**Para cada component:**
- `ValidateWorkOrderDialog`: usa AlertDialog UI primitives. No contiene business logic. Emite un `<form>` con intent `"validate"`.

---

## 3. Files to Change/Create

### `app/services/workOrders.server.ts`
**Objective:** Añadir funciones de validación al servicio existente.

**Pseudocode:**
```pseudocode
FUNCTION validateWorkOrder(workOrderId: string, managerId: string): Promise<string>
  INPUT: workOrderId, managerId
  PROCESS:
    - Check if this manager already validated this work order
      (SELECT from work_order_validations WHERE workOrderId AND validatedBy = managerId)
    - If already validated: throw Response 409 "Ya has validado este parte"
    - INSERT into work_order_validations { workOrderId, validatedBy: managerId }
    - Return inserted validation id
  OUTPUT: validation id (string)
END

FUNCTION isWorkOrderValidated(workOrderId: string): Promise<boolean>
  INPUT: workOrderId
  PROCESS:
    - SELECT count from work_order_validations WHERE workOrderId
    - Return count > 0
  OUTPUT: boolean
END

FUNCTION hasManagerValidated(workOrderId: string, managerId: string): Promise<boolean>
  INPUT: workOrderId, managerId
  PROCESS:
    - SELECT from work_order_validations WHERE workOrderId AND validatedBy = managerId
    - Return exists
  OUTPUT: boolean
END
```

---

### `app/components/ValidateWorkOrderDialog.tsx`
**Objective:** AlertDialog de confirmación para validar un parte. Componente puramente presentacional que emite un form submit.

**Pseudocode:**
```pseudocode
COMPONENT ValidateWorkOrderDialog
  PROPS: none (self-contained trigger + dialog)

  RENDER:
    AlertDialog root
      AlertDialogTrigger -> Button "Validar Parte"
      AlertDialogContent:
        AlertDialogHeader:
          AlertDialogTitle: "Validar Parte"
          AlertDialogDescription: "Esta acción bloqueará el parte para edición. Las validaciones no se pueden deshacer. ¿Deseas continuar?"
        AlertDialogFooter:
          AlertDialogCancel: "Cancelar"
          AlertDialogAction: wraps a <Form method="post"> with hidden input name="_intent" value="validate"
            Button text: "Confirmar Validación"

  HOOKS: none (no business logic)
  BUSINESS LOGIC NOT IN COMPONENT: validation permissions and DB insert handled by route action + service
END
```

---

### `app/routes/work-orders.$id.tsx`
**Objective:** Añadir action para validar y ajustar loader para incluir `canValidate`.

**Pseudocode:**
```pseudocode
LOADER (existing, modified):
  - requireAuth(request) -> authSession
  - getWorkOrderById(params.id) -> workOrder
  - Authorization checks (existing)
  - canEdit = canEditWorkOrder(workOrder, userId, role)
  - isManager = role === 'MANAGER'
  - canValidate = isManager AND user has NOT already validated this work order
    (check workOrder.validations array for authSession.user.id)
  - Return { workOrder, canEdit, canValidate }

ACTION (new):
  - requireAuth(request) -> authSession
  - role = authSession.user.role
  - IF role !== 'MANAGER': throw 403
  - formData = await request.formData()
  - intent = formData.get('_intent')
  - IF intent === 'validate':
    - validateWorkOrder(params.id, authSession.user.id)
    - Return redirect to same page (revalidation) or data({ ok: true })
  - ELSE: throw 400

COMPONENT (modified):
  - Destructure { workOrder, canEdit, canValidate } from loaderData
  - Replace disabled Button with: IF canValidate -> render <ValidateWorkOrderDialog />
  - Remove isManager from destructuring (replaced by canValidate)
END
```

---

## 4. E2E Test Plan

Los tests se añaden al archivo existente `tests/e2e/work-order-detail.spec.ts`.

### Test: MANAGER valida un parte → aparece como "Validado" → botón editar desaparece

- **Preconditions:** DB reseteada. Un EMPLEADO con un parte pendiente (con task y labor). Un MANAGER autenticado.
- **Steps:**
  1. Navegar a `/work-orders/:id` como MANAGER
  2. Verificar que el badge muestra "Pendiente"
  3. Verificar que el botón "Editar" es visible
  4. Click en botón "Validar Parte"
  5. Verificar que aparece el dialog de confirmación con texto "Esta acción bloqueará el parte para edición"
  6. Click en "Confirmar Validación"
  7. Esperar a que la página se recargue
- **Expected:**
  - El badge cambia a "Validado"
  - El botón "Editar" desaparece
  - La validación aparece en la sección de Validaciones con el nombre del MANAGER
  - El botón "Validar Parte" desaparece (porque este MANAGER ya validó)

### Test: EMPLEADO no ve botón "Validar Parte"

- **Preconditions:** DB reseteada. Un EMPLEADO con un parte pendiente. Autenticado como ese EMPLEADO.
- **Steps:**
  1. Navegar a `/work-orders/:id` como EMPLEADO
- **Expected:**
  - El botón "Validar Parte" no es visible
  - El botón "Editar" sí es visible (parte sin validaciones, es su propio parte)

> **Nota:** Este test ya existe parcialmente en `work-order-detail.spec.ts` ("MANAGER ve boton Validar Parte en parte pendiente"). El test existente verifica que el MANAGER ve el botón. Los tests nuevos verifican el **flujo completo de validación** y que el **EMPLEADO no ve el botón**.
