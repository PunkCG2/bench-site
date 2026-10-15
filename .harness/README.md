# .harness

Piezas del harness de este proyecto que no son scripts ni skills:

- `roles/implementer.md`: system prompt corto del worker local; lo lee `scripts/delegar-local.ps1`. Solo ASCII (PowerShell 5.1
  deforma los acentos al pasar el texto a un programa externo).
- `roles/reviewer.md`, `roles/planner.md`: guias para la revision y la planificacion de Claude.

La plantilla reutilizable vive en `E:\IA\harness-template` (ver su `docs/spec.md`). Las notas de lo que falle del harness van en
`docs/harness-notes.md`.
