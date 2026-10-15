---
id: 028
estado: hecha
ejecuta: claude
depende: [027]
hito: M5
rondas: 0
---
# Actualizar el harness de este proyecto con roles, hitos, progreso y control de alcance

## Objetivo
Aplicar a bench-site lo acordado para la plantilla reutilizable (`E:\IA\harness-template`), en lo que ya es posible
sin el worker unificado en Python (fase 2 de la plantilla).

## Hecho
- `.harness/roles/` (implementador, revisor, planificador); `delegar-local.ps1` lee el rol del implementador.
- `scripts/scope-guard.ps1` (borra temporales sin seguimiento y avisa de lo que sale del alcance); lo llama `delegar-local.ps1`.
- `lm-proxy.py` + `-QuitarThinking`: quita `thinking`, `output_config` y `context_management` (prueba pendiente).
- `docs/harness-notes.md` con las lecciones y `docs/progress/progress.md` con hitos M1 a M5.
- Skills: `tarea` actualizada (alcance, notas, parada de hito), `planificar` con hitos y presupuesto de tarea, `resume` nueva.
- `docs/tasks/_plantilla.md` con `hito:`; reglas nuevas en `CLAUDE.md`; `LEEME.md` actualizado.

## Pendiente (fase 2 de la plantilla)
Worker unificado en Python (descubrimiento de modelos, escalera, ciclo interno, calibración de tiempos), `/harvest` y `/sync` probados.

## Notas de revisión
Probado: `scope-guard.ps1` con archivos sueltos de prueba, análisis de sintaxis de los `.ps1`, comprobación de solo ASCII, y el
proxy con y sin `LM_STRIP_THINKING`. No se probó una delegación real (el servidor local está ocupado con los benchmarks).
