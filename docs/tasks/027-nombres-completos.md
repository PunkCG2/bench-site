---
id: 027
status: done
runner: claude
depends: [025]
rounds: 0
---
# Nombre completo del modelo como etiqueta e id

## Objetivo
Evitar choques de nombres con modelos nuevos usando el nombre completo del reporte (decisión del autor, 2026-10-15).

## Detalles
- `nombre` y `etiqueta` (texto del selector): nombre del modelo sin la organización (`gemma-4-26b-a4b-qat`, `qwen3.8-27b`).
- `id`: `<organización/>nombre@cuantización` (`google/gemma-4-26b-a4b-qat@Q4_0`): único aunque el mismo modelo aparezca con otra cuantización.
- Si dos reportes tienen el mismo nombre (distinta cuantización), la etiqueta pasa a `nombre (cuantización)`.
- Se quitó la etiqueta abreviada de una palabra (`Gemma`, `Qwen`). Las pruebas localizan modelos por `id`.
- Header: los botones del selector no parten el nombre en varias líneas; el grupo hace scroll horizontal (`justify-content: safe center`).
- Efecto secundario: quien tenga guardado en `localStorage` el id anterior vuelve al primer modelo.

## Verificación
145 tests y build. Probado en Edge a 375 px con 4 nombres largos en el selector: una sola línea, el grupo hace scroll, el header mide 132 px.

## Notas de revisión
Hecho por Claude.
