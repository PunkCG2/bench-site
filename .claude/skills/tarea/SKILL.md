---
name: tarea
description: Ejecuta una tarea de docs/tasks/ delegando la implementación al modelo local (LM Studio) y revisando, corrigiendo y aprobando con Claude. Úsala cuando el usuario diga /tarea <archivo|siguiente> o pida ejecutar tareas pendientes.
---

# Ciclo: worker local → revisión de Claude

Entrada: ruta de una tarea o `siguiente` (la primera con `estado: pendiente` cuyas dependencias estén `hecha`).

## 1. Preparar
- Lee la tarea. Si le faltan alcance o criterios verificables, complétalos antes de delegar.
- `git status` debe estar limpio y en `main`. Si no lo está, detente y avisa.
- Cambia la tarea a `estado: en-curso`.
- Rama: `task/NNN-nombre`.

## 2. Delegar (si `ejecuta: local`, no implementes tú)
```
powershell -ExecutionPolicy Bypass -File scripts/delegar-local.ps1 -TaskFile docs/tasks/NNN-nombre.md -Branch task/NNN-nombre
```
Puede tardar varios minutos. Si `ejecuta: claude`, impleméntala tú en la rama y salta al paso 3.

## 3. Revisar (barato en tokens)
- Lee el resumen del worker en `docs/tasks/logs/`.
- `git diff main...task/NNN-nombre --stat` y luego el diff completo. No releas archivos enteros salvo que el diff no alcance.
- Ejecuta tú la validación de CLAUDE.md (`npm test`, `npm run build`). No confíes solo en lo que dice el worker.
- Revisa cada criterio de aceptación y anota si cumple o no.

## 4. Corregir (máx. 3 rondas)
Si algo falla, crea `docs/tasks/NNN-nombre.fix-K.md` con correcciones numeradas y concretas:
archivo, qué está mal y qué se espera (con fragmento o firma si ayuda). Nada de "mejora el código".
Vuelve al paso 2 con ese archivo y la misma rama.

Si falla la 3.ª ronda: corrige tú lo que quede si es pequeño. Si no, detente y explícale el bloqueo al usuario.

## 5. Aprobar
- `git switch main` y `git merge --squash task/NNN-nombre`, luego `git commit -m "NNN: <resumen>"`
- `git branch -D task/NNN-nombre`
- En la tarea: `estado: hecha` y `rondas: K`. Agrega 1–2 líneas en "Notas de revisión".
- Haz commit de ese cambio. Si el usuario pidió varias tareas, sigue con la siguiente.
