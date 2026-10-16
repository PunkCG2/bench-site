---
name: resume
description: Informa dónde quedó el proyecto y lo retoma desde ahí. Úsala cuando el usuario diga /resume o abra el proyecto y pida continuar.
---

# Resume: retomar donde quedó

1. Lee `docs/progress/progress.md`, el `estado` de cada tarea en `docs/tasks/` y `docs/tasks/qa/` (con los registros `qa-<hito>.md`), `git status`, `git branch` y `docs/harness-notes.md`.
2. Informa en pocas líneas:
   - el último hito terminado y si el usuario ya lo probó;
   - el hito actual: tareas hechas y pendientes;
   - una tarea a medias (rama `task/NNN-*` o árbol sucio): ofrece **continuar** o **descartar** (nunca descartes sin preguntar);
   - cuántas notas del harness siguen sin subir a la plantilla (`E:\IA\harness-template`) y si conviene `/harvest` allí.
3. Pregunta si continuamos. Si sí, retoma con `/tarea siguiente` desde la primera tarea pendiente del hito actual. Si el hito
   anterior nunca se confirmó como probado, pregunta eso primero.
