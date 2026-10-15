---
id: 021
estado: hecha
ejecuta: claude
depende: [020]
rondas: 0
---
# Ajustes de la segunda revisión visual

## Objetivo
Corregir lo que el autor vio en la segunda revisión (capturas, 2026-10-15).

## Detalles
1. Las cifras del hero mostraban muchos decimales mientras contaban (`-77.2924455 %`, `6.936501`): ahora siempre enteras (`formatoReduccion`, `formatoFactor`).
2. Panel de detalle de la tarea: resumen (id, ámbito, rondas y nota/tokens de cada modo) y revisiones más cortas
   (ronda, solo el nombre del archivo con la ruta en el `title`, texto a 2 líneas; un clic lo despliega completo).
   Nota: el texto de las revisiones ya viene cortado en los reportes originales (data/raw).
3. Responsive: ningún bloque ensancha la página (`overflow-x: clip` en `html`; tabla con scroll propio; hijos de rejillas con
   `min-width: 0`; cifras del hero que pueden partirse en pantallas estrechas). Revisión visual por resoluciones pendiente.

## Criterios de aceptación
- [ ] `npm test` y `npm run build` pasan
- [ ] El autor lo verifica en el navegador en varias resoluciones

## Notas de revisión
Hecho por Claude. Pendiente la verificación visual del autor.
