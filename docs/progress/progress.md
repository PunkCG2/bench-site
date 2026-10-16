# Progreso — bench-site

Ultima actualizacion: 2026-10-15
Hito actual: ninguno pendiente (M6 hecho; falta tu prueba a ojo)
Tarea actual: ninguna

Hitos reconstruidos a posteriori (el proyecto empezo antes de que existieran los hitos). Desde ahora `/planificar` los propone al planificar.

## Hitos

| id | objetivo | tareas | estado | como probarlo |
|---|---|---|---|---|
| M1 | Base: proyecto, estilos, datos, metricas, i18n, estado, animaciones | 001-008 | hecho (probado) | `npm test` y `npm run build`; `src/data/benchmarks.json` tiene 2 modelos |
| M2 | Secciones: header, hero, columnas, carrusel, grafico, tabla, hallazgos | 009-016 | hecho (probado) | `npm run dev`, abrir la pagina y revisar cada seccion y el selector de modelo |
| M3 | Pagina ensamblada y auditoria | 017-018 | hecho (probado) | pagina completa en `npm run dev`; `npm test` incluye contraste y reglas |
| M4 | Ajustes tras revision visual y responsive | 019-027 | hecho (probado en Opera GX, Edge y Firefox) | `npm run check:layout` con `npm run dev` activo: 14 OK |
| M5 | Segunda tanda de benchmarks (3 modelos nuevos) | 028-029 | hecho (revisado en Edge y Firefox; falta tu prueba a ojo) | `npm run dev`: recorrer los 5 selectores en escritorio y móvil |
| M6 | Selector: arrastre con mouse y scrollbar sutil; primer uso de run_worker.py | 030-031 | hecho (verificado en Edge) | `npm run dev` en escritorio con ventana estrecha: arrastrar la tira de modelos; la barra solo aparece al pasar el puntero |
| M7 | QA del M6: veredicto de delegar, header/footer, ancho 1280 | 033-038 | pendiente (a la espera de tu visto bueno) | `npm run dev`: sección de veredicto bajo el hero con 5 modelos; header mayor; contenido a 1280 px en pantalla ancha |

## Decisiones
- 2026-10-15: las animaciones no dependen de `prefers-reduced-motion`.
- 2026-10-15: etiquetas e ids de modelo usan el nombre completo (`org/nombre@cuantizacion` como id).
- 2026-10-15: la plantilla reutilizable del harness vive en `E:\IA\harness-template`.

## Puntos abiertos
- Borrar la regla redundante `Write(data/raw/**)` de `.claude/settings.json` (decision del autor).
- Probar `-QuitarThinking` en `delegar-local.ps1` cuando el servidor local este libre.
