---
name: planificar
description: Convierte docs/spec.md y docs/diseno.md en archivos de tarea dentro de docs/tasks/ y propone hitos que el usuario pueda probar. Úsala cuando el usuario diga /planificar o pida generar o regenerar las tareas del proyecto.
---

# Planificar: spec → tareas e hitos

1. Lee `docs/spec.md`, `docs/diseno.md`, `docs/tasks/_plantilla.md` y `.harness/roles/planner.md`.
   Si la spec tiene "Preguntas abiertas" sin responder, detente y pregúntaselas al usuario.

2. Divide el trabajo en tareas **pequeñas y verificables** (presupuesto del worker local: máximo ~3 archivos y spec de ~15 líneas):
   - Las tareas de interfaz o de varios archivos se parten desde el principio en *textos y estilos*, *componente* y *pruebas*
     (el worker local se desborda con respuestas largas; ver `docs/harness-notes.md`).
   - Cada criterio de aceptación debe comprobarse con un comando (`npm test`, `npm run build`) o con un hecho concreto.
     Antes de escribirlo contrástalo con lo que el diseño ya garantiza (un criterio demasiado estricto genera fallos falsos).
   - Las pruebas van en la misma tarea que el código que cubren o en la siguiente del mismo hito.
   - Marca `runner: claude` solo cuando la tarea dependa de criterio de diseño difícil de especificar; `runner: claude-haiku` o `claude-sonnet` si se sabe que es demasiado pesada para el worker local. El resto va con `runner: local`.

3. Crea `docs/tasks/NNN-nombre-corto.md` siguiendo la plantilla (incluye `milestone:`), numerados en orden de dependencia.

4. **Propón hitos.** Un hito es un punto donde una funcionalidad queda completa y el usuario puede **probarla a mano**
   (por ejemplo en el navegador). Para cada uno: id, objetivo, tareas, **cómo probarlo** (pasos concretos) y criterio de
   terminado. Escríbelos en `docs/progress/progress.md`.

5. Muestra al usuario una tabla con id, título, runner, dependencias e hito, y los hitos, y **espera su aprobación**.
   No ejecutes ninguna tarea desde esta skill.
