---
name: tarea
description: Ejecuta una tarea de docs/tasks/ delegando la implementacion al modelo local y revisando, corrigiendo y aprobando con Claude. Úsala cuando el usuario diga /tarea <archivo|siguiente> o pida ejecutar tareas pendientes.
---

# Ciclo: worker local → comprobaciones → revisión de Claude

Entrada: ruta de una tarea o `siguiente` (la primera con `estado: pendiente` cuyas dependencias estén `hecha`, por orden de hito; busca en `docs/tasks/` y en `docs/tasks/qa/`).

## 1. Preparar
- Lee la tarea. Si le faltan alcance o criterios verificables, complétalos antes de delegar.
- `git status` debe estar limpio y en `main`. Si no lo está, detente y avisa.
- Cambia la tarea a `estado: en-curso`, rama `task/NNN-nombre`, y anota la tarea actual en `docs/progress/progress.md`.

## 2. Delegar (si `ejecuta: local`, no implementes tú)
```
python .harness/run_worker.py docs/tasks/NNN-nombre.md
```
El script usa el rol de `.harness/roles/implementer.md`, arranca el proxy y, al terminar, corre `scripts/scope-guard.ps1`
(borra temporales evidentes y avisa de archivos fuera de "Archivos en alcance"; su resultado queda al final del log).
Crea la rama `task/NNN-nombre`, corre el worker local (3 intentos, luego escala), el control de alcance y `npm test`, y termina con un `REVIEW BRIEF`. Puede tardar varios minutos: lanzalo en segundo plano y no toques el arbol mientras corre. Si no hay modelo cargado (codigo 3) pregunta al usuario cual y relanza con `--model`. `scripts/delegar-local.ps1` queda como respaldo. Si el worker se desbordó o no dejó archivos, no repitas la misma tarea: **pártela** en
rondas `NNN-nombre.fix-K.md` (código y estilos primero, pruebas después, un archivo por llamada).
Si `ejecuta: claude`, impleméntala tú en la rama y salta al paso 3.

## 3. Revisar (barato en tokens)
- Lee el resumen del worker y el resultado del control de alcance en `docs/tasks/logs/`.
- `git status` (sin archivos sueltos) y `git diff main...task/NNN-nombre --stat`; el diff completo solo donde las comprobaciones no ven.
- Ejecuta tú `npm test` y `npm run build`. Si el worker llegó a `max turns` o dio error, juzga por los archivos y las
  comprobaciones, no por el estado de salida.
- Revisa cada criterio de aceptación. Si un criterio fallido en realidad estaba mal planteado, corrígelo y anótalo.

## 4. Corregir (máx. 3 rondas)
Si algo falla, crea `NNN-nombre.fix-K.md` junto a la tarea (misma carpeta) con correcciones numeradas y concretas (archivo, qué está mal, qué se
espera). Nada de "mejora el código". Vuelve al paso 2 con ese archivo y la misma rama. Tras la 3.ª ronda corrige tú lo
pequeño o explícale el bloqueo al usuario.

## 5. Aprobar
- `git switch main`, `git merge --squash task/NNN-nombre`, `git commit -m "NNN: <resumen>"`, `git branch -D task/NNN-nombre`.
- Con el dev server abierto, toca los archivos que cambiaron para que Vite no sirva CSS/JS viejo: `git diff --name-only HEAD~1 HEAD | xargs touch` (si algun archivo fue borrado, ignora el error).
- En la tarea: `estado: hecha`, `rondas: K` y 1–2 líneas en "Notas de revisión". Commit.
- **Notas del harness:** si la tarea necesitó más de una ronda, o algo del propio harness falló (worker en bucle, criterio
  malo, permiso, pregunta que faltaba), añade una entrada a `docs/harness-notes.md`.
- Actualiza `docs/progress/progress.md`.

## 6. Fin de hito
Si era la última tarea de un hito: detente, resume lo que ya funciona, repite su **cómo probarlo** y pregunta al usuario si
seguimos con el siguiente hito o lo dejamos aquí. No arranques el siguiente hito por tu cuenta. Si hay 5 o más notas sin
subir a la plantilla, menciónalo una vez. Para varias tareas del mismo hito, sigue con la siguiente sin preguntar.
