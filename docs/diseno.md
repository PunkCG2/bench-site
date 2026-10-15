# Diseño — Bench Site (BORRADOR, fase 0)

> Las tareas citan secciones de este archivo ("aplica §Color"). Cambiar algo aquí es más
> barato que corregirlo en el código.

## Concepto
"Cuaderno de laboratorio": un fondo oscuro tipo grafito con una cuadrícula muy sutil, cifras
grandes y etiquetas pequeñas en monoespaciada. Debe sentirse sobrio y técnico.

## Color
Tres colores fijos, uno por modo. Se usan igual en tarjetas, gráfico y tabla:

| Token | Uso | Valor tentativo |
|---|---|---|
| `--c-local`  | Modelo local solo | ámbar  `#E8A33D` |
| `--c-pareja` | Local + revisión  | verde  `#3DD68C` |
| `--c-claude` | Claude solo       | coral  `#E07A5F` |
| `--bg`       | Fondo             | `#14161A` |
| `--surface`  | Tarjetas          | `#1C1F24` |
| `--text`     | Texto principal   | `#E8E6E1` |
| `--muted`    | Texto secundario  | `#8A8F98` |

Un modo nunca se identifica solo por color: siempre va con su etiqueta.

## Tipografía
- Títulos: Space Grotesk (Google Fonts), 600.
- Texto: Inter, 400.
- Cifras, ids de tarea (T-101) y código: JetBrains Mono.
- Escala: 14 / 16 / 20 / 28 / 44 / 72 px (la de 72 solo para las cifras del hero).

## Espaciado y forma
- Escala de 4 px: 4, 8, 12, 16, 24, 32, 48, 64.
- Radio de borde: 10 px en tarjetas y 6 px en botones y chips.
- Ancho máximo del contenido: 1100 px. En móvil, margen lateral de 16 px.

## Animación
- Contadores de 0 al valor final en 900 ms, ease-out, al entrar en pantalla.
- Barras del gráfico que crecen desde 0 en 700 ms, con 80 ms de retraso entre barras.
- Tarjetas que aparecen con fade + 12 px hacia arriba, escalonadas.
- Cambio de modelo: los números transicionan sin recargar la página.
- Nada en bucle. Con `prefers-reduced-motion`, todo aparece en su estado final.
- Implementación: IntersectionObserver + CSS transitions. Sin librerías de animación.

## Responsive
- ≥ 900 px: tarjetas en 3 columnas.
- < 900 px: 1 columna. La tabla de detalle pasa a tarjetas apiladas.
