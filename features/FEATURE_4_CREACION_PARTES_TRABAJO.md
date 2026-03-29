# FEATURE_4 - Creación de Partes de Trabajo

## 1. Natural Language Description

### Estado actual
La aplicación tiene un dashboard funcional (`/`) que lista partes de trabajo con paginación y filtrado por rol. Existe un botón "Nuevo Parte de Trabajo" que enlaza a `/work-orders/new`, pero esa ruta no existe. El servicio `workOrders.server.ts` tiene funciones de listado (`listWorkOrders`) y detalle (`getWorkOrderById`), pero no de creación. El schema de DB está completo con las 5 tablas: `workOrders`, `workOrderTasks`, `workOrderLabor`, `workOrderMaterials`, `workOrderValidations`.

### Objetivo
Implementar el flujo completo de creación de partes de trabajo: un formulario con 4 secciones (datos generales, trabajos realizados, mano de obra, materiales) donde las 3 últimas son dinámicas (añadir/eliminar líneas). El formulario se valida con Zod en cliente. Tras crear el parte, se redirige al dashboard.

### Decisiones tomadas
- **Layout:** Página única con scroll (todas las secciones visibles)
- **Campos de hora:** Input `type="time"` nativo del navegador (HH:MM)
- **Materiales:** Schema actual sin cambios (units, description, project, supply)
- **Post-creación:** Redirect al dashboard (`/`)

---

## 2. Technical Description

### Enfoque
Se extiende el servicio existente `workOrders.server.ts` con una función `createWorkOrder` que inserta el parte y todos sus sub-registros en una transacción Drizzle. Se define un schema Zod para validar la entrada completa. Se crea una ruta `/work-orders/new` con un action que parsea el formulario, valida con Zod, llama al servicio y redirige.

El formulario usa `react-hook-form` con `zodResolver` (mismo patrón que `auth.login.tsx`) y un hook personalizado `useWorkOrderForm` para gestionar las secciones dinámicas (field arrays).

### Arquitectura
- **Servicio:** `createWorkOrder` en `workOrders.server.ts` — transacción DB, validación server-side
- **Schema Zod:** `workOrderFormSchema` en archivo separado `app/schemas/workOrder.ts` — compartido entre cliente y servidor
- **Hook:** `useWorkOrderForm` en `app/hooks/useWorkOrderForm.ts` — orquesta react-hook-form, field arrays, submit
- **Componentes:** Un componente contenedor `WorkOrderForm` + 3 secciones dinámicas
- **Ruta:** `work-orders.new.tsx` — loader (requireAuth) + action (parse, validate, create, redirect)

### Dependencias
- `react-hook-form` (ya instalado, usado en login)
- `@hookform/resolvers` (ya instalado, usado en login)
- `zod` (ya instalado)
- Componentes UI existentes: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Textarea`, `Button`, `Card`

---

## 2.1. Architecture Gate

- **Pages are puzzles:** `work-orders.new.tsx` solo compone `WorkOrderForm` y maneja loader/action. Sin UI propia más allá del layout mínimo (título + formulario).
- **Loaders/actions are thin:**
  - Loader: `requireAuth()` → devuelve usuario
  - Action: parsea FormData → valida con Zod → llama `createWorkOrder` → redirect `/`
- **Business logic is not in components:**
  - Validación de dominio (hora fin > hora inicio, mínimo 1 trabajo, mínimo 1 técnico) en schema Zod (`app/schemas/workOrder.ts`)
  - Inserción DB en servicio (`workOrders.server.ts`)
  - Orquestación de formulario en hook (`useWorkOrderForm.ts`)
  - Componentes solo renderizan campos y consumen el hook

### Route module `work-orders.new.tsx`:
- **Loader:** llama `requireAuth()`
- **Action:** llama `createWorkOrder` del servicio
- **Component:** compone `<WorkOrderForm>`

### Component `WorkOrderForm`:
- Usa hook `useWorkOrderForm`
- Renderiza secciones: datos generales (inline), `WorkOrderTasksSection`, `WorkOrderLaborSection`, `WorkOrderMaterialsSection`
- No contiene lógica de negocio

---

## 3. Files to Change/Create

### `app/schemas/workOrder.ts` (CREAR)
**Objective:** Definir el schema Zod para validación del formulario de partes de trabajo. Compartido entre cliente (react-hook-form resolver) y servidor (action validation).

**Pseudocode:**
```pseudocode
IMPORT z from 'zod'

DEFINE workOrderTaskSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  startTime: z.string().min(1, 'La hora de inicio es obligatoria'),  // HH:MM format
  endTime: z.string().min(1, 'La hora de fin es obligatoria'),       // HH:MM format
})
  .refine(startTime < endTime, 'La hora de fin debe ser posterior a la de inicio')

DEFINE workOrderLaborSchema = z.object({
  technicianName: z.string().min(1, 'El nombre del técnico es obligatorio'),
  entryTime: z.string().min(1, 'La hora de entrada es obligatoria'),
  exitTime: z.string().min(1, 'La hora de salida es obligatoria'),
})
  .refine(entryTime < exitTime, 'La hora de salida debe ser posterior a la de entrada')

DEFINE workOrderMaterialSchema = z.object({
  units: z.coerce.number().int().min(1, 'Mínimo 1 unidad'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  project: z.string().optional().default(''),
  supply: z.string().optional().default(''),
})

DEFINE workOrderFormSchema = z.object({
  client: z.string().min(1, 'El cliente es obligatorio'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  carNumber: z.string().optional().default(''),
  driverOut: z.string().optional().default(''),
  driverReturn: z.string().optional().default(''),
  tasks: z.array(workOrderTaskSchema).min(1, 'Debe haber al menos 1 trabajo'),
  labor: z.array(workOrderLaborSchema).min(1, 'Debe haber al menos 1 técnico'),
  materials: z.array(workOrderMaterialSchema),  // Materiales opcionales
})

EXPORT workOrderFormSchema, type WorkOrderFormData = z.infer<typeof workOrderFormSchema>
```

---

### `app/services/workOrders.server.ts` (MODIFICAR)
**Objective:** Añadir función `createWorkOrder` que inserta un parte con todos sus sub-registros en una transacción.

**Pseudocode:**
```pseudocode
IMPORT WorkOrderFormData from schemas/workOrder
IMPORT db, schema tables

FUNCTION createWorkOrder(data: WorkOrderFormData, createdBy: string): Promise<string>
  INPUT: validated form data + userId
  PROCESS:
    TRANSACTION(db) {
      INSERT INTO workOrders { client, address, carNumber, driverOut, driverReturn, createdBy }
        RETURNING id AS workOrderId

      FOR EACH task IN data.tasks:
        INSERT INTO workOrderTasks { workOrderId, description, startTime, endTime }

      FOR EACH entry IN data.labor:
        INSERT INTO workOrderLabor { workOrderId, technicianName, entryTime, exitTime }

      FOR EACH material IN data.materials:
        INSERT INTO workOrderMaterials { workOrderId, units, description, project, supply }
    }
  OUTPUT: workOrderId (string)
  ERROR: Si la transacción falla, se hace rollback automático. Lanzar error.
END
```

---

### `app/hooks/useWorkOrderForm.ts` (CREAR)
**Objective:** Hook que orquesta react-hook-form con field arrays para las secciones dinámicas. Gestiona submit via useFetcher de React Router.

**Pseudocode:**
```pseudocode
IMPORT useForm, useFieldArray from react-hook-form
IMPORT zodResolver from @hookform/resolvers/zod
IMPORT workOrderFormSchema from schemas/workOrder
IMPORT useFetcher from react-router

FUNCTION useWorkOrderForm():
  STATE:
    form = useForm({
      resolver: zodResolver(workOrderFormSchema),
      defaultValues: {
        client: '', address: '', carNumber: '', driverOut: '', driverReturn: '',
        tasks: [{ description: '', startTime: '', endTime: '' }],
        labor: [{ technicianName: '', entryTime: '', exitTime: '' }],
        materials: [],
      }
    })

    tasksFieldArray = useFieldArray({ control: form.control, name: 'tasks' })
    laborFieldArray = useFieldArray({ control: form.control, name: 'labor' })
    materialsFieldArray = useFieldArray({ control: form.control, name: 'materials' })

    fetcher = useFetcher()

  FUNCTION onSubmit(data):
    // Serialize form data as JSON in a hidden field, submit via fetcher
    fetcher.submit({ _json: JSON.stringify(data) }, { method: 'POST' })

  RETURN {
    form,
    tasksFieldArray,
    laborFieldArray,
    materialsFieldArray,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: fetcher.state !== 'idle',
  }
END
```

---

### `app/components/WorkOrderForm.tsx` (CREAR)
**Objective:** Formulario contenedor que compone las 4 secciones. Consume `useWorkOrderForm` hook.

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderForm:
  HOOKS:
    { form, tasksFieldArray, laborFieldArray, materialsFieldArray, onSubmit, isSubmitting } = useWorkOrderForm()

  RENDER:
    <Form {...form}>
      <form onSubmit={onSubmit}>

        // === Sección 1: Datos Generales ===
        <Card>
          <CardHeader><CardTitle>Datos Generales</CardTitle></CardHeader>
          <CardContent>
            FormField: client (Input, required)
            FormField: address (Input, required)
            FormField: carNumber (Input, optional)
            FormField: driverOut (Input, optional)
            FormField: driverReturn (Input, optional)
          </CardContent>
        </Card>

        // === Sección 2: Trabajos Realizados ===
        <WorkOrderTasksSection fieldsArray={tasksFieldArray} control={form.control} />

        // === Sección 3: Mano de Obra ===
        <WorkOrderLaborSection fieldsArray={laborFieldArray} control={form.control} />

        // === Sección 4: Materiales ===
        <WorkOrderMaterialsSection fieldsArray={materialsFieldArray} control={form.control} />

        // === Botón Submit ===
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Crear Parte de Trabajo'}
        </Button>
      </form>
    </Form>
END
```

---

### `app/components/WorkOrderTasksSection.tsx` (CREAR)
**Objective:** Sección dinámica de trabajos realizados. Permite añadir/eliminar líneas.

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderTasksSection:
  PROPS: fieldsArray (UseFieldArrayReturn), control (Control)

  RENDER:
    <Card>
      <CardHeader>
        <CardTitle>Trabajos Realizados</CardTitle>
        // Mostrar error de array si existe (min 1)
      </CardHeader>
      <CardContent>
        FOR EACH field IN fieldsArray.fields (with index):
          <div className="flex gap-4 items-start">
            FormField: tasks.{index}.description (Input, "Descripción del trabajo")
            FormField: tasks.{index}.startTime (Input type="time", "Hora inicio")
            FormField: tasks.{index}.endTime (Input type="time", "Hora fin")
            IF fieldsArray.fields.length > 1:
              <Button variant="destructive" onClick={() => fieldsArray.remove(index)}>Eliminar</Button>
          </div>

        <Button variant="outline" onClick={() => fieldsArray.append({ description: '', startTime: '', endTime: '' })}>
          + Añadir Trabajo
        </Button>
      </CardContent>
    </Card>
END
```

---

### `app/components/WorkOrderLaborSection.tsx` (CREAR)
**Objective:** Sección dinámica de mano de obra. Misma estructura que tasks.

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderLaborSection:
  PROPS: fieldsArray (UseFieldArrayReturn), control (Control)

  RENDER:
    <Card>
      <CardHeader>
        <CardTitle>Mano de Obra</CardTitle>
      </CardHeader>
      <CardContent>
        FOR EACH field IN fieldsArray.fields (with index):
          <div className="flex gap-4 items-start">
            FormField: labor.{index}.technicianName (Input, "Nombre del técnico")
            FormField: labor.{index}.entryTime (Input type="time", "Hora entrada")
            FormField: labor.{index}.exitTime (Input type="time", "Hora salida")
            IF fieldsArray.fields.length > 1:
              <Button variant="destructive" onClick={() => fieldsArray.remove(index)}>Eliminar</Button>
          </div>

        <Button variant="outline" onClick={() => fieldsArray.append({ technicianName: '', entryTime: '', exitTime: '' })}>
          + Añadir Técnico
        </Button>
      </CardContent>
    </Card>
END
```

---

### `app/components/WorkOrderMaterialsSection.tsx` (CREAR)
**Objective:** Sección dinámica de materiales. Empieza vacía (materiales son opcionales).

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderMaterialsSection:
  PROPS: fieldsArray (UseFieldArrayReturn), control (Control)

  RENDER:
    <Card>
      <CardHeader>
        <CardTitle>Materiales</CardTitle>
      </CardHeader>
      <CardContent>
        IF fieldsArray.fields.length === 0:
          <p className="text-muted">No hay materiales añadidos.</p>

        FOR EACH field IN fieldsArray.fields (with index):
          <div className="flex gap-4 items-start">
            FormField: materials.{index}.units (Input type="number", "Unidades")
            FormField: materials.{index}.description (Input, "Descripción")
            FormField: materials.{index}.project (Input, "Proyecto")
            FormField: materials.{index}.supply (Input, "Suministro")
            <Button variant="destructive" onClick={() => fieldsArray.remove(index)}>Eliminar</Button>
          </div>

        <Button variant="outline" onClick={() => fieldsArray.append({ units: 1, description: '', project: '', supply: '' })}>
          + Añadir Material
        </Button>
      </CardContent>
    </Card>
END
```

---

### `app/routes/work-orders.new.tsx` (CREAR)
**Objective:** Ruta de creación de partes. Loader protege con auth. Action parsea, valida y crea.

**Pseudocode:**
```pseudocode
LOADER(request):
  user = await requireAuth(request)
  RETURN { user }

ACTION(request):
  user = await requireAuth(request)
  formData = await request.formData()
  jsonString = formData.get('_json')
  parsed = workOrderFormSchema.safeParse(JSON.parse(jsonString))

  IF NOT parsed.success:
    RETURN json({ errors: parsed.error.flatten() }, { status: 400 })

  workOrderId = await createWorkOrder(parsed.data, user.id)
  RETURN redirect('/')

COMPONENT WorkOrderNewPage:
  RENDER:
    <div className="container max-w-4xl mx-auto py-8">
      <h1>Nuevo Parte de Trabajo</h1>
      <WorkOrderForm />
    </div>
END
```

---

### `app/routes.ts` (MODIFICAR)
**Objective:** Registrar la nueva ruta `/work-orders/new`.

**Pseudocode:**
```pseudocode
// Añadir a las rutas existentes:
route('work-orders/new', 'routes/work-orders.new.tsx')
```

---

## 4. E2E Test Plan

### Test: EMPLEADO crea un parte completo y aparece en el dashboard
- **Preconditions:** Usuario EMPLEADO autenticado, DB limpia
- **Steps:**
  1. Navegar a `/work-orders/new`
  2. Rellenar datos generales: cliente "Empresa Test", dirección "Calle Falsa 123"
  3. Rellenar 1 trabajo: descripción "Instalación eléctrica", hora inicio "08:00", hora fin "12:00"
  4. Verificar que ya hay 1 técnico por defecto, rellenar: nombre "Juan García", entrada "08:00", salida "12:00"
  5. Añadir 1 material: 5 unidades, descripción "Cable 2.5mm"
  6. Click "Crear Parte de Trabajo"
- **Expected:** Redirect al dashboard. El parte aparece en la lista con cliente "Empresa Test" y estado "Pendiente".

### Test: Validación muestra errores si faltan campos obligatorios
- **Preconditions:** Usuario autenticado, navegar a `/work-orders/new`
- **Steps:**
  1. Sin rellenar nada, click "Crear Parte de Trabajo"
- **Expected:** Se muestran mensajes de error en los campos obligatorios (cliente, dirección, descripción del trabajo, nombre del técnico). El formulario NO se envía.

### Test: Se puede añadir y eliminar líneas dinámicas
- **Preconditions:** Usuario autenticado, navegar a `/work-orders/new`
- **Steps:**
  1. Click "+ Añadir Trabajo" → aparece segunda línea de trabajo
  2. Click "Eliminar" en la segunda línea → desaparece
  3. Click "+ Añadir Material" → aparece primera línea de material
  4. Click "Eliminar" en la línea de material → desaparece, muestra "No hay materiales añadidos"
- **Expected:** Las secciones dinámicas responden correctamente. El botón eliminar no aparece si solo queda 1 línea en trabajos/mano de obra.

### Test: Hora fin debe ser posterior a hora inicio
- **Preconditions:** Usuario autenticado, navegar a `/work-orders/new`
- **Steps:**
  1. Rellenar todos los campos obligatorios
  2. En trabajo: hora inicio "14:00", hora fin "08:00"
  3. Click "Crear Parte de Trabajo"
- **Expected:** Se muestra error "La hora de fin debe ser posterior a la de inicio". El formulario NO se envía.

### Test: MANAGER puede crear partes
- **Preconditions:** Usuario MANAGER autenticado, DB limpia
- **Steps:**
  1. Navegar a `/work-orders/new`
  2. Rellenar datos mínimos: cliente, dirección, 1 trabajo con horas, 1 técnico con horas
  3. Click "Crear Parte de Trabajo"
- **Expected:** Redirect al dashboard. El parte aparece en la lista.

### Test: Usuario no autenticado es redirigido al login
- **Preconditions:** No hay sesión activa
- **Steps:**
  1. Navegar directamente a `/work-orders/new`
- **Expected:** Redirect a `/auth/login`
