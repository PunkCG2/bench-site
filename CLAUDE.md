# Bench Site

Sitio web estatico que muestra los resultados de benchmarks: modelo local solo,
modelo local + revision de Claude (pareja) y Claude solo.

Stack: Vite + JavaScript vanilla, CSS sin frameworks, Vitest para tests.

## Donde esta cada cosa
- Que es el sitio: docs/spec.md
- Como se ve: docs/diseno.md
- Tareas: docs/tasks/ (una por archivo; el estado va en el frontmatter). Las que salen de una revisión a ojo (`/qa`) van en docs/tasks/qa/. Progreso e hitos: docs/progress/progress.md
- Roles del harness: .harness/roles/. Notas de lo que falle del harness: docs/harness-notes.md
- Reglas aprendidas de fallos ("signs"): docs/guardrails.md. El worker las recibe en cada tarea.

## Reglas
- Los datos salen solo de src/data/benchmarks.json, que se genera con `npm run data`. Nunca escribas cifras a mano.
- No modifiques nada dentro de data/raw/.
- Colores, tipografias y espaciados solo con las variables de src/styles/tokens.css.
- Las animaciones no dependen de `prefers-reduced-motion` (decision del autor): se muestran siempre, son cortas y ninguna va en bucle.
- Sin dependencias nuevas salvo que la tarea lo indique.
- Textos visibles del sitio en dos diccionarios (es por defecto, en). Nunca texto fijo en el codigo.
- Solo los archivos de "Archivos en alcance" de la tarea; nada de archivos temporales o de depuracion.
- Si el propio harness falla (worker en bucle, criterio malo, permiso), anota una entrada en docs/harness-notes.md.

- Playwright: al terminar cualquier prueba en el navegador, llama a `browser_close` (el navegador no debe quedar abierto).

## Validacion (antes de dar algo por terminado)
- `npm test`
- `npm run build`
