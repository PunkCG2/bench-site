# QA del hito M6 (revisión a ojo del autor, 2026-10-16)

| id | ítem | tipo | severidad | qué se espera | tarea | estado |
|---|---|---|---|---|---|---|
| Q1 | Falta una sección que diga si vale la pena delegar | ajuste | media | tres semáforos (calidad, ahorro de Claude, tiempo) + una conclusión Sí/Depende/No, calculados en el sitio con umbrales documentados, bajo el hero | 033 (colores), 034, 035, 036, 037 | pendiente |
| Q2 | Header pequeño: el título pierde protagonismo | ajuste | baja | título más grande y header con más aire | 038 | pendiente |
| Q3 | Ancho máximo del contenido corto en pantallas anchas | ajuste | baja | 1280 px | 033 | pendiente |
| Q4 | Leyenda del footer pegada al borde | ajuste | baja | más margen arriba y abajo | 038 | pendiente |

Decisiones del autor (Q1): enfoque de semáforos por eje más veredicto global a un lado; umbrales fijados por Claude (en `src/lib/veredicto.js`, `UMBRALES`); ubicación justo debajo del hero.
