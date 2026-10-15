---
id: 024
estado: hecha
ejecuta: claude
depende: [023]
rondas: 0
---
# Arrastre del carrusel tolerante a punteros sin captura (hallado en Firefox)

## Detalles
`setPointerCapture` lanzaba `NotFoundError: Invalid pointer id` con eventos de puntero simulados y podía interrumpir el arrastre.
Ahora va en `try/catch`.

## Notas de revisión
Revisado en Opera GX, Edge y Firefox (1280 y 375 px): mismo resultado de layout, sin desbordes, carrusel con flechas y arrastre, paneles de detalle ocultos.
