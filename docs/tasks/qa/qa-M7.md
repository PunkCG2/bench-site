# QA del hito M7 (revisión a ojo del autor, 2026-10-16)

| id | ítem | tipo | severidad | qué se espera | tarea | estado |
|---|---|---|---|---|---|---|
| R1 | El título del header no cambió de tamaño en escritorio | fallo aparente | media | título a 28 px | — | causa: CSS viejo en el dev server tras el merge (con CSS fresco mide 28 px). Confirmado por el autor |
| R2 | El footer sigue pegado abajo | fallo aparente | media | 64 px arriba y 48 px abajo | — | misma causa que R1. Confirmado por el autor |
| R3 | El título se parte en varias líneas entre ~930 y ~1100 px | fallo | alta | el título siempre en una línea; el selector cede el espacio (hace scroll) | 039 | hecho |

Causa de R1/R2: Vite no vio los archivos reescritos por git al volver a `main` (nota L-015/L-021). Corregido en el flujo: `/tarea` toca los archivos tras el merge.
