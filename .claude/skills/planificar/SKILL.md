---
name: planificar
description: Convierte docs/spec.md y docs/diseno.md en archivos de tarea dentro de docs/tasks/. Úsala cuando el usuario diga /planificar o pida generar o regenerar las tareas del proyecto.
---

# Planificar: spec → tareas

1. Lee `docs/spec.md`, `docs/diseno.md` y `docs/tasks/_plantilla.md`.
   Si la spec tiene "Preguntas abiertas" sin responder, detente y pregúntaselas al usuario.

2. Divide el trabajo en tareas **pequeñas y verificables**:
   - Máximo ~3 archivos y ~200 líneas cambiadas por tarea (el modelo local rinde mejor así).
   - Cada criterio de aceptación debe comprobarse con un comando (`npm test`, `npm run build`)
     o con un hecho concreto ("el JSON tiene 13 tareas por modelo"). Nada de "que se vea bien".
   - Cuando una tarea necesite tests, inclúyelos en la misma tarea.
   - Marca `ejecuta: claude` solo cuando la tarea dependa de criterio de diseño difícil de
     especificar. El resto va con `ejecuta: local`.

3. Crea `docs/tasks/NNN-nombre-corto.md` siguiendo la plantilla, numerados en orden de dependencia.

4. Muestra al usuario una tabla con id, título, ejecuta y dependencias, y **espera su aprobación**.
   No ejecutes ninguna tarea desde esta skill.
