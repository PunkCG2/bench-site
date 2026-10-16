# Diseño — Bench Site (BORRADOR, fase 0)

> Las tareas citan secciones de este archivo ("aplica §Color"). Cambiar algo aquí es más
> barato que corregirlo en el código.

## Concepto
"Cuaderno de laboratorio": fondo liso tipo grafito (tema oscuro) o papel cálido (tema claro),
sin cuadrícula ni texturas, con cifras grandes y etiquetas pequeñas en monoespaciada. Debe
sentirse sobrio y técnico.

## Header
- Estático (`position: sticky; top: 0`), siempre visible. Fondo opaco `--bg`, sin borde ni sombra.
- Tiene el `z-index` más alto de la página: ningún contenido (columnas, carrusel, gráficos,
  filas expandidas) se dibuja encima del header. Al hacer scroll, el contenido pasa por debajo.
  Los anclas internas usan `scroll-margin-top` igual a la altura del header.
- Tres zonas: izquierda el título del sitio ("Local + Claude", igual en es y en), **centro** el selector de modelo (nombre completo del modelo, sin la organización)
  y **derecha** el botón de idioma (ES / EN) y el botón de tema (oscuro / claro), en ese orden.
- El selector de modelo es un grupo de botones segmentado. El modelo activo se marca con
  `aria-pressed` y un estilo distinto del resto. Se prevén de 2 a 5 modelos: si no caben, el
  grupo hace scroll horizontal sin desbordar el header.
- El selector de modelo vive solo aquí. Al cambiarlo se actualizan las tres columnas
  (modelo local solo, pareja, Claude solo) y todo lo de abajo. No hay otro selector en la página.
- Los botones de idioma y tema son botones de alternancia con `aria-pressed` y etiqueta de
  texto o `aria-label` (nunca solo un icono).
- En móvil (< 900 px) el header ocupa dos filas: arriba el título y a su derecha los botones
  de idioma y tema; abajo el selector de modelo, centrado.
- Preferencias: idioma y tema se guardan en `localStorage`. Sin valor guardado, el tema sigue
  `prefers-color-scheme` y el idioma es español.

## Columnas comparativas
Sección "Tres modos" de la spec. Son tres columnas, una por modo, para el modelo elegido en el header.
- Cada columna usa el color de su modo: verde para modelo local solo, azul para pareja y rojo
  para Claude solo (`--c-local`, `--c-pareja`, `--c-claude`). El color se aplica al encabezado
  de la columna y a un borde superior de 3 px en sus tarjetas.
- La columna lleva siempre su etiqueta de texto en el encabezado (ver regla de color).
- Cada elemento de datos es una tarjeta (`--surface`, radio 10 px) dentro de su columna. Son
  cuatro, en este orden: **precisión** (nota), **velocidad** (tiempo por tarea), **tokens de
  Claude por tarea** y **costo API equivalente**. Las tres columnas tienen las mismas tarjetas en
  el mismo orden, para poder leerlas en horizontal.
- Lo que importa es la diferencia entre modos de un mismo modelo. Por eso, en las columnas
  local y pareja, cada tarjeta lleva una línea pequeña con la diferencia frente a Claude solo
  (puntos en la nota; porcentaje en tiempo, tokens y costo). La columna Claude solo muestra
  "referencia". Si no hay diferencia, la línea lo dice ("sin diferencia"); nunca se oculta.
- El costo se muestra con su valor real (tres decimales, `0.005 $`) y una nota corta: es un
  equivalente por API, no un gasto real.
- ≥ 900 px: tres columnas visibles a la vez.
- < 900 px: carrusel horizontal con una columna visible. Se cambia de columna:
  - en pantallas táctiles, con swipe;
  - en PC con ventana estrecha (disposición vertical), arrastrando con el mouse;
  - con indicador de tres puntos (cada uno con la etiqueta de su modo) y con las flechas
    izquierda/derecha del teclado.
- Implementación: `scroll-snap-type: x mandatory` y eventos de puntero para el arrastre con
  mouse. Sin librerías. El cambio de columna es siempre suave (no depende de `prefers-reduced-motion`).
- Al cambiar de modelo, la columna visible se mantiene.

## Gráfico
Cuatro gráficos pequeños de barras para el modelo activo: precisión, velocidad, tokens de
Claude por tarea y costo equivalente. Cada uno tiene tres barras, una por modo, con su color y su
etiqueta de texto y el valor al lado. No hay gráficos que comparen modelos entre sí. Si dos
barras valen lo mismo, se dibujan iguales: no se exagera ni se oculta la diferencia (las barras
parten de 0). Animación según §Animación.

## Footer
- Pequeño y discreto: una línea centrada, 14 px, color `--muted`, sin enlaces ni iconos.
- Texto: "Hecho con Claude Code y SDD" (es) y "Made with Claude Code and SDD" (en), desde los
  diccionarios.
- Sin posición fija: va al final del contenido, separado por 48 px de la última sección.

## Color
Tres colores por modo, uno por cada identidad. Se usan igual en tarjetas, gráfico y tabla.
Cada token tiene un valor por tema. El tema se aplica con `data-theme="dark|light"` en `<html>`
y los valores viven en `src/styles/tokens.css`.

| Token | Uso | Oscuro | Claro |
|---|---|---|---|
| `--c-local`  | Modelo local solo | verde `#3DD68C` | verde oscuro `#1E9E63` |
| `--c-pareja` | Local + revisión  | azul `#4DA3FF` | azul oscuro `#1F6FD1` |
| `--c-claude` | Claude solo       | rojo `#E5534B` | rojo oscuro `#C0392B` |
| `--bg`       | Fondo             | `#14161A` | `#F4F2EE` |
| `--surface`  | Tarjetas          | `#1C1F24` | `#FFFFFF` |
| `--text`     | Texto principal   | `#E8E6E1` | `#1C1F24` |
| `--muted`    | Texto secundario  | `#8A8F98` | `#5C626B` |

Valores tentativos. Los tokens de modo se oscurecen en el tema claro para mantener contraste
sobre fondo claro. Hay que revisar el contraste (WCAG AA) de texto y cifras en ambos temas.

Un modo nunca se identifica solo por color: siempre va con su etiqueta.
Colores de estado (semáforo): `--c-ok`, `--c-aviso`, `--c-mal`; nunca solos: siempre con texto.

## Tipografía
- Títulos: Space Grotesk (Google Fonts), 600.
- Texto: Inter, 400.
- Cifras, ids de tarea (T-101) y código: JetBrains Mono.
- Escala: 14 / 16 / 20 / 28 / 44 / 72 px (la de 72 solo para las cifras del hero).

## Espaciado y forma
- Escala de 4 px: 4, 8, 12, 16, 24, 32, 48, 64.
- Radio de borde: 10 px en tarjetas y 6 px en botones y chips.
- Ancho máximo del contenido: 1280 px. En móvil, margen lateral de 16 px.

## Animación
- Contadores de 0 al valor final en 900 ms, ease-out, al entrar en pantalla.
- Barras del gráfico que crecen desde 0 en 700 ms, con 80 ms de retraso entre barras.
- Tarjetas que aparecen con fade + 12 px hacia arriba, escalonadas.
- Cambio de modelo: los números transicionan sin recargar la página.
- Cambio de tema: los colores transicionan en 200 ms. No depende de `prefers-reduced-motion`.
- Nada en bucle. Las animaciones se muestran siempre, sin depender de `prefers-reduced-motion` (decisión del autor, 2026-10-15).
- Implementación: IntersectionObserver + CSS transitions. Sin librerías de animación.

## Responsive
- ≥ 900 px: columnas comparativas en 3 columnas.
- < 900 px: carrusel de una columna (ver Columnas comparativas). La tabla de detalle pasa a tarjetas apiladas. El header pasa a dos filas.
