# Guardrails (bench-site)

<!-- Es del proyecto; /sync no lo toca. Solo la sección "Signs" se envía al worker local en cada petición, así que
     manténla corta (20 signs como máximo). Este archivo es un consejo: una regla que nunca debe romperse va en una
     comprobación o en [scope] protected de .harness/harness.toml, y aquí solo se enlaza. -->

## Enforced (no es consejo)
- Rutas protegidas y generadas: `[scope] protected` en `.harness/harness.toml`. El script del worker rechaza editarlas.
- Archivos fuera de "Archivos en alcance" de la tarea: los rechaza el control de alcance.
- Comprobaciones rápida y completa: `[gates]` en `.harness/harness.toml`. Si falla una, la tarea vuelve al worker.
- Herramientas que puede ejecutar el worker: salen de los comandos de las comprobaciones; el resto de permisos está en `.claude/settings.json`.

## Signs
<!-- Una viñeta por regla, escrita cuando algo salió mal y una regla lo habría evitado:
     - Cuando <situación>: <regla>. Evidencia: <archivo de tarea, salida de comprobación o test que mostró el problema>
     Claude propone un sign tras una ronda de corrección, una escalada o un fallo de /qa; el usuario lo aprueba antes de
     añadirlo. Sin evidencia, no hay sign. Fusiona o borra los que dejen de importar, o conviértelos en test o comprobación. -->
