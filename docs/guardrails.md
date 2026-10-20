# Guardrails (bench-site)

<!-- Es del proyecto; /sync no lo toca. Solo la sección "Signs" se envía al worker local en cada petición, así que
     manténla corta (20 signs como máximo). Este archivo es un consejo: una regla que nunca debe romperse va en una
     comprobación o en [scope] protected de .harness/harness.toml, y aquí solo se enlaza. -->

## Enforced (no es consejo)
- Rutas protegidas y generadas: `[scope] protected` en `.harness/harness.toml`. Un intento que cambia una falla y vuelve
  al worker; no se revierte solo, así que si se agota la escalera Claude lo revierte en la rama de la tarea.
- Archivos fuera de "Archivos en alcance": el control de alcance los trata igual. Una tarea sin esa sección no tiene
  control de alcance (el resumen dice "scope unknown").
- Comprobaciones rápida y completa: `[gates]` en `.harness/harness.toml`. Si falla una, la tarea vuelve al worker; no se
  hace commit hasta que pasan.
- Comandos que puede ejecutar el worker: los de las comprobaciones (tal cual o con argumentos) y lo que permita
  `.claude/settings.json`; nunca `git`. Herramientas de archivos: Read, Edit, Write, Glob, Grep.

## Signs
<!-- Una viñeta por regla, escrita cuando algo salió mal y una regla lo habría evitado:
     - Cuando <situación>: <regla>. Evidencia: <archivo de tarea, salida de comprobación o test que mostró el problema>
     Claude propone un sign tras una ronda de corrección, una escalada o un fallo de /qa; el usuario lo aprueba antes de
     añadirlo. Sin evidencia, no hay sign. Fusiona o borra los que dejen de importar, o conviértelos en test o comprobación. -->
