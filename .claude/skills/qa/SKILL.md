---
name: qa
description: Convierte la revisión a ojo del usuario en ítems, tareas y pruebas. Úsala cuando el usuario diga /qa o describa cosas que vio al probar un hito y quiera corregirlas.
---

# QA: revisión humana → ítems → tareas

Entrada: lo que el usuario vio al probar (texto libre, capturas), normalmente al cerrar un hito.

1. **Ítems.** Separa lo que dijo en ítems independientes. Un ítem = un síntoma o un cambio pedido. Si un ítem es ambiguo
   (qué navegador, qué ancho, qué se esperaba), pregunta antes de seguir; no adivines. Distingue **fallo** (algo roto) de
   **ajuste** (preferencia del autor) y anota la severidad: alta / media / baja.
2. **Registro.** Escribe `docs/tasks/qa/qa-<hito>.md` (crea la carpeta si no existe; créalo o añade): tabla `id | ítem | tipo | severidad | qué se espera
   | tarea | estado`. Las capturas del usuario se describen en una línea; no se copian.
3. **Tareas.** Por ítem (o por grupo si tocan el mismo archivo) crea `docs/tasks/qa/NNN-nombre.md` con la plantilla (`docs/tasks/_plantilla.md`; la numeración sigue la de todo el proyecto), siguiendo
   las reglas de `/planificar`: máximo ~3 archivos, criterio verificable, `ejecuta: local` salvo que dependa de criterio de
   diseño. Usa el hito en curso.
4. **Pruebas.** Cada tarea lleva su comprobación:
   - automatizable (lógica, texto, estilo con valor medible) → un test en `tests/` dentro del alcance de la tarea;
   - solo visual (scroll, hover, arrastre) → un criterio "verificado en Edge/Firefox a <ancho> px" que ejecutas tú con
     Playwright, y llamas `browser_close` al terminar.
5. **Aprobación.** Muestra la tabla (id, ítem, severidad, tarea, ejecuta) y **espera el visto bueno**. No ejecutes nada desde aquí.
6. **Después.** Con el visto bueno, `/tarea` sobre cada una. Al terminar pide al usuario la prueba a ojo de lo corregido:
   el hito no se da por cerrado mientras queden ítems abiertos en `docs/tasks/qa/qa-<hito>.md`.
7. Por cada **fallo** que una regla corta habría evitado, propón un sign para `docs/guardrails.md` (formato en ese archivo;
   necesita evidencia y el usuario lo aprueba antes de añadirlo).
8. Si un ítem revela un fallo del harness o del stack (no del proyecto), añade una entrada en `docs/harness-notes.md`.
