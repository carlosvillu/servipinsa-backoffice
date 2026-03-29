# FEATURE_8_NAVEGACION_Y_POLISH

## 1. Natural Language Description

### Estado actual
- El Header ya muestra el logo "Servipinsa", y un `UserDropdown` con enlaces a Dashboard/Usuarios (solo MANAGER) + logout. No hay navegación visible en mobile (no hay hamburger menu).
- No hay ThemeToggle ni LanguageSelector (ya fueron eliminados en fases anteriores).
- Sonner ya está instalado y configurado en `app/components/ui/sonner.tsx` con el estilo Refined Brutalism. El `<Toaster />` ya se renderiza en `app/root.tsx`. Pero **ninguna acción** dispara toasts todavía.
- Las acciones de crear/editar partes usan `throw redirect()`, mientras que validar parte y crear/promover usuario devuelven `data({ ok: true })` sin redirect.
- El estado vacío del dashboard es un simple texto "No hay partes de trabajo." dentro de un box con borde.
- Los formularios no deshabilitan el botón de envío mientras se procesan.

### Estado esperado
- Header con navegación responsive: en desktop se mantiene el dropdown actual; en mobile aparece un botón hamburguesa que abre un sidebar lateral con los enlaces de navegación.
- Toasts de feedback en todas las acciones CRUD: parte creado, parte editado, parte validado, usuario creado, usuario promovido.
- Estado vacío mejorado en el dashboard con mensaje e icono más descriptivo.
- Botones de formulario deshabilitados durante el envío (loading state).
- Responsive verificado en viewports móvil (320-400px) y tablet.

---

## 2. Technical Description

### Task 8.1: Navegación principal

**Enfoque:** Mantener la estructura actual del Header y UserDropdown. Añadir un sidebar mobile que se desliza desde la izquierda, activado por un botón hamburguesa visible solo en mobile. El sidebar contiene los mismos enlaces que el dropdown (adaptados por rol).

- El sidebar se implementará como un componente `MobileSidebar.tsx` que recibe `user`, `onLogout`, y un `open`/`onClose` state.
- El Header gestionará el estado open/close del sidebar via un hook `useState`.
- No se necesita un hook custom — es un simple toggle de estado booleano.

### Task 8.2: Feedback visual y estados vacíos

**Enfoque para toasts:**
- **Rutas con redirect** (`work-orders.new.tsx`, `work-orders.$id.edit.tsx`): Pasar un query param `?toast=created` / `?toast=updated` en el redirect. La página destino (dashboard / detalle) lee el param y dispara el toast.
- **Rutas sin redirect** (`work-orders.$id.tsx`, `users.tsx`): Usar `useEffect` sobre `actionData` para disparar el toast cuando `actionData.ok === true`.
- Hook `useToastFromSearchParams` en `app/hooks/useToastFromSearchParams.ts` para centralizar la lógica de toasts por query param.

**Enfoque para estados vacíos:** Mejorar el empty state existente en `WorkOrderList.tsx` con un icono y un texto más descriptivo + un CTA para crear el primer parte.

**Enfoque para loading states:** Usar `useNavigation()` de React Router para detectar submission state y deshabilitar botones.

---

## 2.1. Architecture Gate

- **Pages are puzzles:** Las rutas (`home.tsx`, `work-orders.$id.tsx`, `users.tsx`) solo componen componentes existentes y añaden el hook de toasts. No contienen UI nueva significativa.
- **Loaders/actions are thin:** Los actions no cambian — solo se modifica el string del redirect para añadir query params. La lógica de toast queda en hooks/componentes.
- **Business logic is not in components:** No hay lógica de dominio nueva. Los toasts son pura UI. El sidebar es pura UI. El loading state usa `useNavigation()` de React Router (framework, no dominio).

### Route modules:
- `home.tsx`: compone `WorkOrderList`, `Pagination`. Usa `useToastFromSearchParams` para mostrar toast de "Parte creado".
- `work-orders.$id.tsx`: compone `WorkOrderDetail`, `WorkOrderValidations`, `ValidateWorkOrderDialog`. Usa `useToastFromSearchParams` para "Parte editado" + useEffect sobre actionData para "Parte validado".
- `users.tsx`: compone `UserList`, `CreateUserDialog`, `PromoteUserDialog`. Usa useEffect sobre actionData para "Usuario creado" / "Usuario promovido".

### Components:
- `MobileSidebar.tsx`: renderiza overlay + sidebar panel. Recibe props, no hooks de dominio.
- `Header.tsx`: añade botón hamburguesa y controla open/close del sidebar con useState.
- `WorkOrderList.tsx`: mejora empty state con icono y CTA.
- `WorkOrderForm.tsx`: usa `useNavigation()` para deshabilitar botón submit.

### Hooks:
- `useToastFromSearchParams.ts`: lee search params, dispara toast, limpia el param.

---

## 3. Files to Change/Create

### `app/hooks/useToastFromSearchParams.ts` (CREAR)
**Objective:** Hook que lee un query param `toast` de la URL, muestra el toast correspondiente, y elimina el param de la URL para que no se repita al recargar.

**Pseudocode:**
```pseudocode
HOOK useToastFromSearchParams
  INPUT: map de toast keys a mensajes { created: "Parte creado", updated: "Parte actualizado", ... }
  PROCESS:
    searchParams = useSearchParams()
    toastKey = searchParams.get("toast")
    useEffect:
      IF toastKey AND map[toastKey]:
        toast.success(map[toastKey])
        // Limpiar el param de la URL sin navegación
        newParams = new URLSearchParams(searchParams)
        newParams.delete("toast")
        window.history.replaceState({}, "", pathname + (newParams.toString() ? "?" + newParams.toString() : ""))
  OUTPUT: void (side effect only)
END
```

### `app/components/MobileSidebar.tsx` (CREAR)
**Objective:** Sidebar lateral para navegación mobile. Se desliza desde la izquierda con overlay.

**Pseudocode:**
```pseudocode
COMPONENT MobileSidebar
  PROPS: open: boolean, onClose: () => void, user: { email, role }, onLogout: () => void
  HOOKS: ninguno de dominio
  RENDER:
    IF NOT open: return null
    // Overlay (fixed inset-0, bg oscuro, onClick=onClose)
    // Panel (fixed left-0, w-64, bg-[#F4EFEA], border-r, z-50, transición slide-in)
    //   Header con logo "Servipinsa" + botón cerrar (X)
    //   Nav links:
    //     "Partes" -> Link to="/"
    //     IF user.role === 'MANAGER': "Usuarios" -> Link to="/users"
    //   Separador
    //   Email del usuario (texto muted)
    //   "Cerrar sesión" -> onClick=onLogout
END
```

### `app/components/Header.tsx` (MODIFICAR)
**Objective:** Añadir botón hamburguesa visible solo en mobile (md:hidden) y renderizar MobileSidebar.

**Pseudocode:**
```pseudocode
COMPONENT Header (modificado)
  PROPS: session, user (sin cambios)
  STATE: sidebarOpen (boolean, default false)
  PROCESS:
    // Añadir antes del div de auth section:
    //   Botón hamburguesa (md:hidden) con icono HamburgerIcon
    //   onClick: setSidebarOpen(true)
    // Después del header tag:
    //   <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={handleLogout} />
    // El botón hamburguesa solo se muestra si hay sesión (si no hay sesión, solo se ve "Iniciar sesión")
  OUTPUT: header + MobileSidebar condicional
END
```

### `app/routes/work-orders.new.tsx` (MODIFICAR)
**Objective:** Añadir `?toast=created` al redirect tras crear un parte.

**Pseudocode:**
```pseudocode
ACTION (modificado)
  BEFORE: throw redirect('/')
  AFTER: throw redirect('/?toast=created')
END
```

### `app/routes/home.tsx` (MODIFICAR)
**Objective:** Añadir hook `useToastFromSearchParams` para mostrar toast de "Parte creado".

**Pseudocode:**
```pseudocode
COMPONENT HomePage (modificado)
  HOOKS:
    useToastFromSearchParams({ created: "Parte de trabajo creado correctamente" })
    // ... resto del componente sin cambios
END
```

### `app/routes/work-orders.$id.edit.tsx` (MODIFICAR)
**Objective:** Añadir `?toast=updated` al redirect tras editar un parte.

**Pseudocode:**
```pseudocode
ACTION (modificado)
  BEFORE: throw redirect(`/work-orders/${params.id}`)
  AFTER: throw redirect(`/work-orders/${params.id}?toast=updated`)
END
```

### `app/routes/work-orders.$id.tsx` (MODIFICAR)
**Objective:** Añadir toast para "Parte editado" (via search param) y "Parte validado" (via actionData).

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderDetailPage (modificado)
  HOOKS:
    useToastFromSearchParams({ updated: "Parte de trabajo actualizado correctamente" })
    actionData = useActionData()
    useEffect:
      IF actionData?.ok:
        toast.success("Parte de trabajo validado correctamente")
  // ... resto sin cambios
END
```

### `app/routes/users.tsx` (MODIFICAR)
**Objective:** Añadir toasts para "Usuario creado" y "Usuario promovido" via actionData.

**Pseudocode:**
```pseudocode
COMPONENT UsersPage (modificado)
  HOOKS:
    actionData = useActionData()
    useEffect:
      IF actionData?.ok AND actionData?.intent === "create":
        toast.success("Usuario creado correctamente")
      IF actionData?.ok AND actionData?.intent === "promote":
        toast.success("Usuario promovido a Manager correctamente")
  // ... resto sin cambios

ACTION (modificado)
  // Añadir intent al return data para distinguir create vs promote
  BEFORE: return data({ ok: true })
  AFTER: return data({ ok: true, intent: "create" }) // o "promote" según el caso
END
```

### `app/components/WorkOrderList.tsx` (MODIFICAR)
**Objective:** Mejorar el estado vacío con icono y CTA para crear el primer parte.

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderList (modificado, solo empty state)
  // Cuando workOrders.length === 0:
  BEFORE: texto simple "No hay partes de trabajo."
  AFTER:
    // Contenedor centrado con borde
    // Icono ClipboardList de lucide-react (tamaño 48, color muted)
    // Título: "No hay partes de trabajo"
    // Subtítulo: "Crea tu primer parte de trabajo para empezar."
    // Botón CTA: Link to="/work-orders/new" -> "Crear Parte de Trabajo"
END
```

### `app/components/WorkOrderForm.tsx` (MODIFICAR)
**Objective:** Deshabilitar botón de envío durante el procesamiento del formulario.

**Pseudocode:**
```pseudocode
COMPONENT WorkOrderForm (modificado, solo botón submit)
  HOOKS:
    navigation = useNavigation()
    isSubmitting = navigation.state === "submitting"
  RENDER:
    // Botón submit:
    //   disabled={isSubmitting}
    //   Texto: isSubmitting ? "Guardando..." : (defaultValues ? "Guardar Cambios" : "Crear Parte")
    //   className: añadir opacity-50 cursor-not-allowed cuando disabled
END
```

### `app/components/CreateUserDialog.tsx` (MODIFICAR)
**Objective:** Deshabilitar botón de envío durante el procesamiento.

**Pseudocode:**
```pseudocode
COMPONENT CreateUserDialog (modificado, solo botón submit)
  HOOKS:
    navigation = useNavigation()
    isSubmitting = navigation.state === "submitting"
  RENDER:
    // Botón submit: disabled={isSubmitting}
    // Texto: isSubmitting ? "Creando..." : "Crear Usuario"
END
```

---

## 4. E2E Test Plan

### Test: Navegación mobile muestra sidebar con enlaces
- **Preconditions:** Usuario MANAGER autenticado. Viewport mobile (375px).
- **Steps:**
  1. Navegar al dashboard `/`
  2. Hacer click en el botón hamburguesa
  3. Verificar que aparece el sidebar con enlaces "Partes" y "Usuarios"
  4. Hacer click en "Usuarios"
  5. Verificar que navega a `/users`
- **Expected:** El sidebar se abre con los enlaces correctos y la navegación funciona.

### Test: Sidebar mobile oculta enlace Usuarios para EMPLEADO
- **Preconditions:** Usuario EMPLEADO autenticado. Viewport mobile (375px).
- **Steps:**
  1. Navegar al dashboard `/`
  2. Hacer click en el botón hamburguesa
  3. Verificar que aparece "Partes" pero NO "Usuarios"
- **Expected:** El enlace "Usuarios" no es visible para EMPLEADO.

### Test: Toast aparece al crear un parte de trabajo
- **Preconditions:** Usuario autenticado.
- **Steps:**
  1. Navegar a `/work-orders/new`
  2. Rellenar el formulario con datos válidos
  3. Enviar el formulario
  4. Esperar redirect al dashboard
- **Expected:** Toast "Parte de trabajo creado correctamente" visible en el dashboard.

### Test: Toast aparece al validar un parte de trabajo
- **Preconditions:** Usuario MANAGER autenticado. Existe un parte sin validar.
- **Steps:**
  1. Navegar al detalle del parte `/work-orders/:id`
  2. Hacer click en "Validar Parte"
  3. Confirmar en el diálogo
- **Expected:** Toast "Parte de trabajo validado correctamente" visible en la página de detalle.

### Test: Estado vacío del dashboard muestra CTA
- **Preconditions:** Usuario autenticado. No existen partes de trabajo.
- **Steps:**
  1. Navegar al dashboard `/`
  2. Verificar que aparece el mensaje vacío con el botón "Crear Parte de Trabajo"
  3. Hacer click en el botón
- **Expected:** Se navega a `/work-orders/new`.

### Test: Botón submit se deshabilita mientras envía el formulario
- **Preconditions:** Usuario autenticado.
- **Steps:**
  1. Navegar a `/work-orders/new`
  2. Rellenar formulario con datos válidos
  3. Hacer click en "Crear Parte"
  4. Verificar que el botón muestra "Guardando..." y está deshabilitado
- **Expected:** El botón se deshabilita durante el envío y muestra texto de loading.
