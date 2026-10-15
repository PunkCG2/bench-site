# Bench Site

Sitio web estatico que muestra los resultados de benchmarks: modelo local solo,
modelo local + revision de Claude (pareja) y Claude solo.

Stack: Vite + JavaScript vanilla, CSS sin frameworks, Vitest para tests.

## Donde esta cada cosa
- Que es el sitio: docs/spec.md
- Como se ve: docs/diseno.md
- Tareas: docs/tasks/ (una por archivo; el estado va en el frontmatter)

## Reglas
- Los datos salen solo de src/data/benchmarks.json, que se genera con `npm run data`. Nunca escribas cifras a mano.
- No modifiques nada dentro de data/raw/.
- Colores, tipografias y espaciados solo con las variables de src/styles/tokens.css.
- Toda animacion respeta `prefers-reduced-motion`.
- Sin dependencias nuevas salvo que la tarea lo indique.
- Textos visibles del sitio en espanol.

## Validacion (antes de dar algo por terminado)
- `npm test`
- `npm run build`
