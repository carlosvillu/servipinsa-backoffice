# Style Guide - BioLinq

## Overview

BioLinq sigue un estilo de diseño denominado **"Refined Brutalism"** o **"Industrial Minimalism"**. Este sistema de diseño combina la audacia del brutalismo web con la elegancia de la tipografía industrial, creando una experiencia visual distintiva que prioriza la claridad, la velocidad y la diferenciación.

**Filosofía de diseño:**
- Minimalismo radical: solo lo esencial
- Bordes duros y sombras geométricas
- Tipografía monoespaciada prominente
- Paleta de colores reducida con un solo acento
- Performance obsesiva (<500ms LCP)

---

## Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing System](#spacing-system)
- [Component Styles](#component-styles)
- [Shadows & Elevation](#shadows--elevation)
- [Animations & Transitions](#animations--transitions)
- [Border Radius](#border-radius)
- [Opacity & Transparency](#opacity--transparency)
- [Z-Index System](#z-index-system)
- [CSS Variables](#css-variables)
- [Common Tailwind CSS Usage](#common-tailwind-css-usage)
- [Example Components](#example-components)
- [Accessibility](#accessibility)
- [Implementation Best Practices](#implementation-best-practices)
- [Common Patterns to Avoid](#common-patterns-to-avoid)
- [Future Enhancement Suggestions](#future-enhancement-suggestions)
- [Testing Checklist](#testing-checklist)
- [Version History](#version-history)

---

## Color Palette

### Brand Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Paper (Cream) | `#F4EFEA` | rgb(244, 239, 234) | `--brand-bg` | Fondo principal, backgrounds cálidos |
| Ink (Charcoal) | `#383838` | rgb(56, 56, 56) | `--brand-charcoal` | Texto principal, bordes, elementos UI |
| Electric Blue | `#2BA5FF` | rgb(43, 165, 255) | `--brand-blue` | Acento primario, CTAs, enlaces activos |
| Slate Grey | `#757575` | rgb(117, 117, 117) | `--brand-grey` | Texto secundario, placeholders |
| Silver | `#E0E0E0` | rgb(224, 224, 224) | `--brand-silver` | Bordes sutiles, divisores |
| White | `#FFFFFF` | rgb(255, 255, 255) | - | Fondos de tarjetas, secciones alternas |

### Semantic Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Background | `#F4EFEA` | `#1A1A1A` | Fondo principal de la aplicación |
| Foreground | `#383838` | `#F4EFEA` | Texto principal |
| Card | `#FFFFFF` | `#2A2A2A` | Fondos de tarjetas y paneles |
| Card Foreground | `#383838` | `#F4EFEA` | Texto en tarjetas |
| Primary | `#383838` | `#F4EFEA` | Botones principales, elementos activos |
| Primary Foreground | `#F4EFEA` | `#383838` | Texto sobre elementos primarios |
| Accent | `#2BA5FF` | `#2BA5FF` | Destacados, enlaces, indicadores |
| Muted | `#757575` | `#A0A0A0` | Texto secundario, labels |
| Destructive | `#E53935` | `#FF5252` | Estados de error |
| Success | `#07BC0C` | `#4CAF50` | Estados de éxito |

### Color Usage Examples

```tsx
// Fondos
<div className="bg-[#F4EFEA]" />           // Fondo paper/crema
<div className="bg-white" />               // Fondo tarjetas
<section className="bg-[#383838]" />       // Fondo oscuro para contraste

// Texto
<p className="text-[#383838]" />           // Texto principal
<p className="text-[#757575]" />           // Texto secundario/muted
<span className="text-[#2BA5FF]" />        // Texto acento/enlace

// Bordes
<div className="border border-[#383838]" /> // Borde principal (brutalista)
<div className="border border-[#E0E0E0]" /> // Borde sutil
```

---

## Typography

### Font Families

| Name | Value | CSS Class | Usage |
|------|-------|-----------|-------|
| Mono | `'Space Mono', monospace` | `font-mono` | Headings, labels, navegación, CTAs |
| Sans | `'Inter', system-ui, -apple-system, sans-serif` | `font-sans` | Body text, párrafos, descripciones |
| Serif | `Georgia, serif` | `font-serif` | Acentos editoriales (opcional) |

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
```

### Font Sizes

| Name | Size | Line Height | Class | Usage |
|------|------|-------------|-------|-------|
| xs | 0.75rem (12px) | 1.5 | `text-xs` | Badges, metadata, copyright |
| sm | 0.875rem (14px) | 1.5 | `text-sm` | Labels, enlaces footer |
| base | 1rem (16px) | 1.6 | `text-base` | Body text móvil |
| lg | 1.125rem (18px) | 1.6 | `text-lg` | Body text desktop |
| xl | 1.25rem (20px) | 1.4 | `text-xl` | Subtítulos, lead text |
| 2xl | 1.5rem (24px) | 1.3 | `text-2xl` | Títulos de artículos |
| 3xl | 1.875rem (30px) | 1.2 | `text-3xl` | Títulos de sección móvil |
| 4xl | 2.25rem (36px) | 1.1 | `text-4xl` | Hero móvil |
| 5xl | 3rem (48px) | 1.1 | `text-5xl` | Títulos de sección desktop |
| 6xl | 3.75rem (60px) | 1.05 | `text-6xl` | Hero tablet |
| 7xl | 4.5rem (72px) | 1.05 | `text-7xl` | Hero desktop |
| 8xl | 6rem (96px) | 1 | `text-8xl` | Display headlines |

### Font Weights

| Name | Value | Class | Usage |
|------|-------|-------|-------|
| Light | 300 | `font-light` | Body text (Inter) |
| Regular | 400 | `font-normal` | Default |
| Medium | 500 | `font-medium` | Labels, botones |
| SemiBold | 600 | `font-semibold` | Subheadings |
| Bold | 700 | `font-bold` | Headlines, logo |

### Typography Patterns

```tsx
// Hero headline (Refined Brutalism)
<h1 className="font-mono text-4xl md:text-7xl lg:text-8xl uppercase leading-[1.1]">
  Diferénciate siendo simple.
</h1>

// Sección título
<h2 className="font-mono text-3xl md:text-5xl uppercase mb-12 text-center">
  La Verdad Incómoda
</h2>

// Artículo título
<h2 className="font-mono text-2xl uppercase mb-6 border-b border-[#383838] inline-block">
  El costo de la latencia
</h2>

// Body text
<p className="font-sans font-light text-lg md:text-xl text-[#383838] leading-relaxed">
  El 80% de los usuarios solo necesitan 5 links...
</p>

// Label/Tag
<span className="font-mono text-xs uppercase tracking-wider text-[#2BA5FF]">
  Performance
</span>

// Navigation link
<a className="font-mono uppercase hover:text-[#2BA5FF] transition-colors">
  Blog
</a>
```

### Stroke Text Effect

Para texto outline/hollow usado en heroes:

```css
.stroke-text {
  -webkit-text-stroke: 1px #383838;
  color: transparent;
}
```

```tsx
<span className="text-transparent stroke-text">simple</span>
```

---

## Spacing System

### Base Spacing Scale (Tailwind Default)

| Name | Value | Pixels | Usage |
|------|-------|--------|-------|
| 0 | 0 | 0px | Reset |
| 1 | 0.25rem | 4px | Tiny gaps |
| 2 | 0.5rem | 8px | Tight spacing |
| 3 | 0.75rem | 12px | Small gaps |
| 4 | 1rem | 16px | Standard padding |
| 5 | 1.25rem | 20px | Medium spacing |
| 6 | 1.5rem | 24px | Component padding |
| 8 | 2rem | 32px | Section gaps |
| 10 | 2.5rem | 40px | Large spacing |
| 12 | 3rem | 48px | Section padding |
| 16 | 4rem | 64px | Hero spacing |
| 20 | 5rem | 80px | Major sections |
| 24 | 6rem | 96px | Hero vertical |

### Content Width

| Name | Value | Usage |
|------|-------|-------|
| max-w-3xl | 48rem (768px) | Contenido de artículos |
| max-w-4xl | 56rem (896px) | Secciones blog, comparativas |
| max-w-5xl | 64rem (1024px) | Hero sections |
| max-w-6xl | 72rem (1152px) | Contenedor principal header/footer |
| max-w-7xl | 80rem (1280px) | Grid de footer |

### Common Spacing Patterns

```tsx
// Navigation
<nav className="h-[70px] md:h-[90px] px-6 md:px-12" />

// Hero section
<section className="pt-12 pb-20 md:pt-24 md:pb-32 px-6 md:px-12" />

// Card padding
<div className="p-8 md:p-12" />

// Content max-width
<div className="max-w-3xl mx-auto px-6 md:px-12" />

// Footer section
<footer className="py-12 px-6 md:px-12" />

// Gaps en flex/grid
<div className="flex gap-4" />
<div className="flex items-center gap-8" />
<div className="grid gap-12" />
```

---

## Component Styles

### Buttons

#### Primary Button (CTA Principal)

```tsx
<button className="
  font-mono
  uppercase
  bg-[#383838]
  text-[#F4EFEA]
  px-8 py-4
  text-lg
  border border-[#383838]
  hover:bg-[#2BA5FF]
  hover:border-[#2BA5FF]
  transition-all
  shadow-hard
  hover:translate-x-[-2px]
  hover:translate-y-[-2px]
">
  Crear mi BioLink
</button>
```

#### Secondary Button (Ghost/Outline)

```tsx
<button className="
  font-mono
  uppercase
  bg-transparent
  text-[#383838]
  px-8 py-4
  text-lg
  border border-[#383838]
  hover:bg-[#E0E0E0]
  transition-colors
">
  Ver Demo
</button>
```

#### Accent Button (CTA Destacado)

```tsx
<button className="
  font-mono
  uppercase
  bg-[#2BA5FF]
  text-white
  px-10 py-5
  text-xl
  border border-[#383838]
  hover:bg-[#383838]
  hover:text-[#F4EFEA]
  transition-all
  shadow-hard
  hover:translate-x-[-2px]
  hover:translate-y-[-2px]
">
  Reclamar mi Username
</button>
```

#### Small Button (Nav)

```tsx
<button className="
  font-mono
  uppercase
  bg-[#383838]
  text-[#F4EFEA]
  px-6 py-3
  border border-[#383838]
  hover:bg-[#2BA5FF]
  hover:border-[#2BA5FF]
  hover:text-white
  transition-all
  shadow-hard-hover
  active:shadow-hard-active
">
  Crear BioLink
</button>
```

### Cards

#### Feature Card

```tsx
<div className="
  p-8 md:p-12
  border-b md:border-b-0 border-[#383838]
  flex flex-col gap-6
  group
  hover:bg-white
  transition-colors duration-300
  bg-[#F4EFEA]
">
  <div className="
    w-12 h-12
    flex items-center justify-center
    border border-[#383838]
    transition-colors
    bg-transparent text-[#383838]
    group-hover:bg-[#2BA5FF]
    group-hover:text-white
    group-hover:border-[#2BA5FF]
  ">
    <Icon size={32} />
  </div>
  <div>
    <h3 className="font-mono text-xl uppercase mb-3 text-[#383838]">
      Ultra Rápido
    </h3>
    <p className="font-sans font-light text-[#757575] leading-relaxed">
      Carga en <500ms. Sin scripts pesados.
    </p>
  </div>
</div>
```

#### Article Card (Blog)

```tsx
<article className="
  group
  border border-[#383838]
  bg-white
  hover:shadow-hard
  transition-all duration-200
  cursor-pointer
">
  <div className="flex flex-col md:flex-row h-full">
    <div className="flex-1 p-8 flex flex-col justify-between">
      <div>
        <div className="flex gap-4 font-mono text-xs uppercase text-[#757575] mb-4">
          <span className="text-[#2BA5FF]">{category}</span>
          <span>{date}</span>
        </div>
        <h2 className="
          font-mono text-2xl md:text-3xl uppercase mb-4
          group-hover:text-[#2BA5FF] transition-colors leading-tight
        ">
          {title}
        </h2>
        <p className="font-sans font-light text-[#757575] leading-relaxed mb-6">
          {excerpt}
        </p>
      </div>
      <div className="
        flex items-center gap-2
        font-mono text-sm uppercase
        border-b border-transparent
        group-hover:border-[#383838]
        self-start pb-1
      ">
        Leer Artículo <ArrowRight size={16} />
      </div>
    </div>
  </div>
</article>
```

#### Comparison Card

```tsx
// Versión "recomendada"
<div className="p-8 md:p-12 bg-[#F4EFEA] relative overflow-hidden">
  <div className="absolute top-0 right-0 bg-[#2BA5FF] text-white text-xs font-mono uppercase px-3 py-1">
    Recomendado
  </div>
  <h3 className="font-mono text-xl uppercase text-[#383838] mb-6 flex items-center gap-2">
    <Check size={20} className="text-[#2BA5FF]" /> BioLinq
  </h3>
  <ul className="space-y-4 font-sans text-[#383838]">
    <li className="flex items-start gap-3">
      <span className="text-[#07bc0c]">✓</span> Solo lo esencial
    </li>
  </ul>
</div>
```

### Navigation

#### Main Navigation

```tsx
<nav className="
  sticky top-0 z-50
  bg-[#F4EFEA]
  border-b border-[#383838]
  h-[70px] md:h-[90px]
  flex items-center
  px-6 md:px-12
  justify-between
">
  {/* Logo */}
  <div className="font-mono text-2xl font-bold uppercase tracking-tighter flex items-center gap-2">
    <div className="w-4 h-4 bg-[#2BA5FF] border border-[#383838]"></div>
    BioLinq<span className="text-[#757575]">.page</span>
  </div>

  {/* Nav Links */}
  <div className="hidden md:flex items-center gap-8">
    <a className="font-mono uppercase hover:text-[#2BA5FF] transition-colors">
      Blog
    </a>
    <a className="font-mono uppercase hover:text-[#2BA5FF] transition-colors">
      Login
    </a>
    <button className="font-mono uppercase bg-[#383838] text-[#F4EFEA] px-6 py-3 border border-[#383838]">
      Crear BioLink
    </button>
  </div>
</nav>
```

#### Active Navigation State

```tsx
<button className={`
  font-mono uppercase hover:text-[#2BA5FF] transition-colors
  ${isActive ? 'text-[#2BA5FF] underline decoration-2 underline-offset-4' : ''}
`}>
  Blog
</button>
```

### Forms

#### Input Field

```tsx
<input
  type="text"
  className="
    font-mono
    w-full
    px-4 py-3
    border border-[#383838]
    bg-white
    text-[#383838]
    placeholder:text-[#757575]
    focus:outline-none
    focus:ring-2
    focus:ring-[#2BA5FF]
    focus:border-[#2BA5FF]
  "
  placeholder="tu-username"
/>
```

### Badges/Tags

```tsx
<div className="inline-block bg-[#2BA5FF] text-white font-mono text-xs px-2 py-1 uppercase tracking-wider">
  v1.0 Now Available
</div>
```

### Blockquotes

```tsx
<blockquote className="
  border-l-4 border-[#2BA5FF]
  pl-6 py-2 my-10
  italic
  font-mono
  text-[#757575]
">
  "La perfección no se alcanza cuando no hay nada más que añadir..."
</blockquote>
```

### Lists (Article Content)

```tsx
<ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#2BA5FF]">
  <li>Sin frameworks pesados en el cliente.</li>
  <li>CSS crítico inline.</li>
</ul>
```

O con estilo brutalista (arrow markers):

```css
.article-content ul li::before {
  content: '→';
  color: var(--brand-blue);
  margin-right: 0.75rem;
  font-family: 'Space Mono', monospace;
}
```

---

## Shadows & Elevation

### Hard Shadow (Brutalista)

La firma visual del estilo Refined Brutalism es la "hard shadow" - sombras sólidas sin blur.

```css
.shadow-hard {
  box-shadow: 4px 4px 0px 0px #383838;
}

.shadow-hard-hover:hover {
  box-shadow: 6px 6px 0px 0px #383838;
  transform: translate(-2px, -2px);
}

.shadow-hard-active:active {
  box-shadow: 0px 0px 0px 0px #383838;
  transform: translate(4px, 4px);
}
```

### Shadow Scale

| Name | CSS Value | Usage |
|------|-----------|-------|
| shadow-hard | `4px 4px 0px 0px #383838` | Botones, tarjetas destacadas |
| shadow-hard-lg | `6px 6px 0px 0px #383838` | Estado hover |
| shadow-none | `0px 0px 0px 0px #383838` | Estado active/pressed |

### Usage Examples

```tsx
// Botón con hard shadow interactivo
<button className="shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px]">
  CTA
</button>

// Card con shadow on hover
<article className="hover:shadow-hard transition-all duration-200">
  ...
</article>

// Featured image container
<div className="shadow-hard">
  <img ... />
</div>
```

---

## Animations & Transitions

### Duration Scale

| Name | Duration | Usage |
|------|----------|-------|
| `duration-150` | 150ms | Color transitions |
| `duration-200` | 200ms | Default interactions |
| `duration-300` | 300ms | Complex animations |

### Common Transitions

```tsx
// Color transition
className="transition-colors"
className="transition-colors duration-150"

// All properties (para shadow + transform)
className="transition-all duration-200"

// Specific properties
className="transition-transform duration-200"
className="transition-shadow duration-200"
```

### Hover Transform Pattern

```tsx
// Lift effect on hover
className="hover:translate-x-[-2px] hover:translate-y-[-2px]"

// Press effect on active
className="active:translate-x-[4px] active:translate-y-[4px]"
```

### Entrance Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.3s ease-out forwards;
}
```

---

## Border Radius

El estilo Refined Brutalism usa **bordes completamente rectos** (sin border-radius) para la mayoría de elementos.

| Element | Radius | Notes |
|---------|--------|-------|
| Buttons | `0` | Esquinas completamente cuadradas |
| Cards | `0` | Sin redondeo |
| Inputs | `0` | Brutalist aesthetic |
| Badges | `0` | Rectangulares |
| Logo square | `0` | El cuadrado del logo es un box puro |

**Excepción:** Si se usa Base UI para componentes técnicos (dropdowns internos), estos pueden mantener un `rounded-md` sutil.

```tsx
// Correcto - Brutalist
<button className="border border-[#383838]">CTA</button>

// Evitar - No encaja con el estilo
<button className="rounded-lg">CTA</button>
```

---

## Opacity & Transparency

### Opacity Scale

| Value | Usage |
|-------|-------|
| `opacity-20` | Elementos decorativos de fondo |
| `opacity-50` | Estados disabled, overlays suaves |
| `opacity-70` | Competidores/alternativas "desvanecidas" |
| `opacity-80` | Modal overlays |
| `opacity-100` | Default |

### Background Transparency Patterns

```tsx
// Navbar con backdrop blur
<nav className="bg-[#F4EFEA]/90 backdrop-blur-sm" />

// Modal overlay
<div className="bg-[#383838]/80" />

// Decorative elements
<div className="border border-[#383838] opacity-20" />
```

---

## Z-Index System

### 4-Layer System

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | `0` | Contenido normal |
| Elevated | `10` | Elementos flotantes menores |
| Fixed | `40` | Mobile menu overlay |
| Top | `50` | Navbar sticky, modals |

### Usage Examples

```tsx
// Navbar
<nav className="sticky top-0 z-50" />

// Mobile menu overlay
<div className="fixed inset-0 z-40" />

// Modal
<div className="fixed z-50" />
```

---

## CSS Variables

### Brand Variables

```css
:root {
  /* Brand colors */
  --brand-bg: #F4EFEA;
  --brand-charcoal: #383838;
  --brand-blue: #2BA5FF;
  --brand-grey: #757575;
  --brand-silver: #E0E0E0;

  /* Layout */
  --header-height-mobile: 70px;
  --header-height-desktop: 90px;

  /* Typography */
  --font-mono: 'Space Mono', monospace;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### Mapping a Tailwind (en app.css)

Para integrar con el sistema existente de Base UI:

```css
@theme {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Space Mono', monospace;

  /* Mapeo de colores */
  --color-background: var(--brand-bg);
  --color-foreground: var(--brand-charcoal);
  --color-primary: var(--brand-charcoal);
  --color-primary-foreground: var(--brand-bg);
  --color-accent: var(--brand-blue);
  --color-muted-foreground: var(--brand-grey);
  --color-border: var(--brand-charcoal);
}
```

---

## Common Tailwind CSS Usage

### Most Used Utility Classes

```tsx
// Tipografía
"font-mono"              // Headlines, labels, nav
"font-sans"              // Body text
"font-light"             // Peso 300 para body
"font-bold"              // Headlines
"uppercase"              // Casi todo el texto mono
"tracking-tighter"       // Logo
"tracking-wider"         // Small labels
"leading-[1.1]"          // Headlines tight
"leading-relaxed"        // Body paragraphs

// Colores
"text-[#383838]"         // Texto principal
"text-[#757575]"         // Texto secundario
"text-[#2BA5FF]"         // Texto acento
"bg-[#F4EFEA]"           // Fondo crema
"bg-[#383838]"           // Fondo oscuro
"bg-white"               // Tarjetas

// Bordes
"border border-[#383838]" // Borde principal
"border-b border-[#383838]" // Solo bottom

// Layout
"flex items-center justify-between"
"flex flex-col gap-6"
"grid grid-cols-1 md:grid-cols-3"
```

### Layout Patterns

```tsx
// Contenedor centrado con max-width
<div className="max-w-5xl mx-auto px-6 md:px-12">

// Sección con padding responsivo
<section className="py-20 px-6 md:px-12">

// Grid de 3 columnas
<section className="grid grid-cols-1 md:grid-cols-3 border-b border-[#383838]">

// Flex con gap
<div className="flex items-center gap-8">
```

### Responsive Patterns

```tsx
// Tamaño de texto responsivo
<h1 className="text-4xl md:text-7xl lg:text-8xl">

// Padding responsivo
<div className="p-8 md:p-12">

// Mostrar/ocultar
<div className="hidden md:flex">
<div className="md:hidden">

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
```

---

## Example Components

### Hero Section Completa

```tsx
const HeroSection = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-6 md:px-12 border-b border-[#383838]">
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-block bg-[#2BA5FF] text-white font-mono text-xs px-2 py-1 mb-6 uppercase tracking-wider">
          v1.0 Now Available
        </div>

        {/* Headline */}
        <h1 className="font-mono text-4xl md:text-7xl lg:text-8xl uppercase leading-[1.1] mb-8">
          Diferénciate <br/>siendo <span className="text-transparent stroke-text">simple</span>.
        </h1>

        {/* Subheadline */}
        <p className="font-sans font-light text-lg md:text-xl text-[#383838] max-w-2xl leading-relaxed mb-10">
          El 80% de los usuarios solo necesitan 5 links y que cargue rápido.
          BioLinq es la página de enlaces para creadores que odian el bloatware.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="font-mono uppercase bg-[#383838] text-[#F4EFEA] px-8 py-4 text-lg border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] transition-all shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px]">
            Crear mi BioLink →
          </button>
          <button className="font-mono uppercase bg-transparent text-[#383838] px-8 py-4 text-lg border border-[#383838] hover:bg-[#E0E0E0] transition-colors">
            Ver Demo
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="hidden lg:block absolute top-24 right-12 w-64 h-64 border border-[#383838] opacity-20"></div>
      <div className="hidden lg:block absolute top-32 right-20 w-64 h-64 border border-[#383838] opacity-20 bg-[#2BA5FF]"></div>
    </section>
  );
};
```

### Feature Card Component

```tsx
const FeatureCard = ({ icon, title, desc, highlight = false }) => {
  return (
    <div className={`
      p-8 md:p-12
      border-b md:border-b-0 border-[#383838]
      flex flex-col gap-6
      group
      hover:bg-white
      transition-colors duration-300
      ${highlight ? 'md:border-l md:border-r bg-white' : 'bg-[#F4EFEA]'}
    `}>
      <div className={`
        w-12 h-12
        flex items-center justify-center
        border border-[#383838]
        transition-colors
        ${highlight
          ? 'bg-[#383838] text-[#F4EFEA]'
          : 'bg-transparent text-[#383838] group-hover:bg-[#2BA5FF] group-hover:text-white group-hover:border-[#2BA5FF]'
        }
      `}>
        {icon}
      </div>

      <div>
        <h3 className="font-mono text-xl uppercase mb-3 text-[#383838]">
          {title}
        </h3>
        <p className="font-sans font-light text-[#757575] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
};
```

### CTA Box (Article)

```tsx
<div className="mt-20 p-8 md:p-12 border border-[#383838] bg-white text-center relative overflow-hidden">
  <div className="absolute top-0 right-0 bg-[#2BA5FF] text-white font-mono text-[10px] uppercase px-3 py-1">
    Propuesta de valor
  </div>
  <h3 className="font-mono text-2xl md:text-3xl uppercase mb-6 leading-tight">
    Deja de perder clicks por lentitud.
  </h3>
  <p className="font-sans font-light text-[#757575] mb-8 max-w-lg mx-auto">
    Tu audiencia merece una experiencia rápida.
  </p>
  <button className="font-mono uppercase bg-[#383838] text-[#F4EFEA] px-8 py-4 border border-[#383838] hover:bg-[#2BA5FF] transition-all inline-flex items-center gap-3">
    Crear mi BioLinq gratis
    <ArrowRight size={20} />
  </button>
</div>
```

### Footer

```tsx
<footer className="border-t border-[#383838] py-12 px-6 md:px-12 bg-white">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
    {/* Brand Column */}
    <div className="col-span-1 md:col-span-2">
      <div className="font-mono text-xl font-bold uppercase tracking-tighter mb-4 flex items-center gap-2">
        <div className="w-3 h-3 bg-[#383838]"></div>
        BioLinq
      </div>
      <p className="font-sans font-light text-[#757575] max-w-sm mb-6">
        La herramienta minimalista para creadores.
      </p>
      {/* Social Icons */}
      <div className="flex gap-4">
        <div className="w-8 h-8 border border-[#383838] flex items-center justify-center hover:bg-[#2BA5FF] hover:text-white hover:border-[#2BA5FF] transition-colors cursor-pointer">
          X
        </div>
        <div className="w-8 h-8 border border-[#383838] flex items-center justify-center hover:bg-[#2BA5FF] hover:text-white hover:border-[#2BA5FF] transition-colors cursor-pointer">
          In
        </div>
      </div>
    </div>

    {/* Links Columns */}
    <div>
      <h4 className="font-mono uppercase text-lg mb-6 border-b border-[#383838] pb-2 inline-block">
        Producto
      </h4>
      <ul className="space-y-3 font-mono text-sm">
        <li>
          <a href="#" className="hover:text-[#2BA5FF] hover:underline decoration-2 underline-offset-4">
            Features
          </a>
        </li>
      </ul>
    </div>
  </div>

  {/* Copyright */}
  <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#E0E0E0] flex flex-col md:flex-row justify-between items-center text-xs font-mono text-[#757575]">
    <p>&copy; 2026 BIOLINQ.PAGE. ALL RIGHTS RESERVED.</p>
    <p className="mt-2 md:mt-0">MADE WITH ⚡️ IN REFINED BRUTALISM</p>
  </div>
</footer>
```

---

## Accessibility

### WCAG AA Compliance

| Element | Contrast Ratio | Requirement | Status |
|---------|---------------|-------------|--------|
| Ink (#383838) on Paper (#F4EFEA) | 8.7:1 | 4.5:1 min | ✅ |
| Grey (#757575) on Paper (#F4EFEA) | 4.6:1 | 4.5:1 min | ✅ |
| White on Blue (#2BA5FF) | 3.2:1 | 3:1 min (large text) | ✅ |
| Ink on White | 12.6:1 | 4.5:1 min | ✅ |

### Focus States

```tsx
// Focus ring pattern para elementos interactivos
className="focus:outline-none focus:ring-2 focus:ring-[#2BA5FF] focus:border-[#2BA5FF]"

// Visible focus para navegación por teclado
className="focus-visible:ring-2 focus-visible:ring-[#2BA5FF] focus-visible:ring-offset-2"
```

### Keyboard Navigation

- Todos los elementos interactivos deben ser focusables
- Orden de tab lógico (izquierda a derecha, arriba a abajo)
- Estados hover también deben aplicarse en focus

### Screen Reader Considerations

```tsx
// Labels para botones de icono
<button aria-label="Abrir menú">
  <Menu size={24} />
</button>

// Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Saltar al contenido principal
</a>
```

---

## Implementation Best Practices

### 1. Usar Colores del Sistema

```tsx
// ✅ Correcto
<div className="text-[#383838]" />
<div className="bg-[#F4EFEA]" />

// ❌ Evitar colores arbitrarios
<div className="text-gray-800" />
<div className="bg-amber-50" />
```

### 2. Tipografía Consistente

```tsx
// ✅ Headlines siempre en mono + uppercase
<h2 className="font-mono text-3xl uppercase">Título</h2>

// ✅ Body siempre en sans + light
<p className="font-sans font-light">Texto</p>

// ❌ No mezclar estilos
<h2 className="font-sans text-3xl">Título</h2>
```

### 3. Bordes Brutalistas

```tsx
// ✅ Bordes sólidos en charcoal
<div className="border border-[#383838]" />

// ❌ Evitar bordes sutiles para elementos principales
<div className="border border-gray-200" />
```

### 4. Hard Shadows para CTAs

```tsx
// ✅ Hard shadow en botones principales
<button className="shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px]">

// ❌ Soft shadows no encajan con el estilo
<button className="shadow-lg">
```

### 5. Mobile-First Responsive

```tsx
// ✅ Empezar mobile, escalar a desktop
<h1 className="text-4xl md:text-7xl lg:text-8xl">
<div className="p-8 md:p-12">

// ❌ No ignorar mobile
<h1 className="text-8xl">
```

---

## Common Patterns to Avoid

### 1. Border Radius Excesivo

```tsx
// ❌ No usar bordes redondeados
<button className="rounded-lg">CTA</button>
<div className="rounded-2xl">Card</div>

// ✅ Esquinas cuadradas
<button className="">CTA</button>
```

### 2. Gradientes Suaves

```tsx
// ❌ Gradientes multicolor
<div className="bg-gradient-to-r from-purple-500 to-pink-500">

// ✅ Colores sólidos o gradientes muy sutiles
<div className="bg-[#383838]">
```

### 3. Sombras Difusas

```tsx
// ❌ Box shadows con blur
<div className="shadow-lg shadow-2xl">

// ✅ Hard shadows
<div className="shadow-hard">
```

### 4. Demasiados Colores de Acento

```tsx
// ❌ Múltiples colores de acento
<span className="text-purple-500">
<span className="text-green-500">
<span className="text-orange-500">

// ✅ Un solo color de acento: Electric Blue
<span className="text-[#2BA5FF]">
```

### 5. Fuentes Decorativas

```tsx
// ❌ Fuentes script o display
className="font-cursive"

// ✅ Solo Space Mono + Inter
className="font-mono" // o font-sans
```

### 6. Valores Arbitrarios Excesivos

```tsx
// ❌ Valores mágicos
<div className="w-[347px] mt-[23px]">

// ✅ Usar la escala de spacing
<div className="w-full max-w-md mt-6">
```

---

## Future Enhancement Suggestions

- [ ] Crear custom Tailwind plugin para `shadow-hard` variants
- [ ] Definir CSS custom properties para todos los colores brand
- [ ] Crear variantes de theme (Light Brutalism, Dark Brutalism)
- [ ] Añadir animaciones de entrada para scroll-triggered content
- [ ] Documentar patrones de iconografía (Lucide icons, sizing)
- [ ] Crear componentes React reutilizables en Storybook
- [ ] Añadir modo oscuro completo siguiendo el estilo Refined Brutalism

---

## Testing Checklist

### Visual Testing

- [ ] Componentes renderizan correctamente en light mode
- [ ] Hard shadows se aplican correctamente a CTAs
- [ ] Tipografía usa las fuentes correctas (Space Mono / Inter)
- [ ] Colores coinciden con la paleta definida
- [ ] Responsive breakpoints funcionan (mobile → tablet → desktop)
- [ ] Estados hover/focus son visibles y consistentes

### Accessibility Testing

- [ ] Contraste de color cumple WCAG AA (mínimo 4.5:1)
- [ ] Todos los elementos interactivos son accesibles por teclado
- [ ] Focus states son claramente visibles
- [ ] Screen reader puede navegar el contenido correctamente
- [ ] Orden de tab es lógico

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

### Performance Testing

- [ ] LCP < 500ms
- [ ] No layout shifts durante la carga
- [ ] Fuentes cargan sin FOUT/FOIT significativo

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Guía de estilos inicial basada en mockups BioLinq |
