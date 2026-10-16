# Bench Site: mapa del harness

[← Volver al README](../README.md)

Este archivo es para ti, no para los modelos. Explica qué hace cada pieza. La versión reutilizable de este harness vive en
un repositorio aparte, `harness-template` (en el equipo del autor: `E:\IA\harness-template`, ver su `docs/spec.md`).

## Las memorias del proyecto
El modelo no recuerda nada entre sesiones. Todo lo que necesita saber está en archivos:

| Memoria | Archivo | ¿Quién lo lee y cuándo? |
|---|---|---|
| Reglas permanentes | `CLAUDE.md` | Claude **y** el worker local, automáticamente, en cada sesión |
| Procedimientos | `.claude/skills/*/SKILL.md` | Solo Claude, con `/planificar`, `/tarea`, `/qa` o `/resume` |
| Roles | `.harness/roles/*.md` | El del implementador va como prompt de sistema del worker local |
| Estado del trabajo | `docs/` (tareas, `progress/progress.md`) | Quien lo necesite |
| Lo que falló del harness | `docs/harness-notes.md` | Claude lo escribe; `/harvest` en la plantilla lo recoge |

## Carpeta por carpeta
```
bench-site/
├─ README.md, README.en.md ← portada para GitHub (el mapa del harness está en docs/harness-mapa.md)
├─ CLAUDE.md             ← reglas. CORTO: el modelo local lo paga en cada tarea
├─ .claude/
│  ├─ settings.json      ← permisos
│  └─ skills/            ← planificar (spec → tareas e hitos), tarea (delegar → revisar → aprobar), qa (revisión a ojo → tareas), resume
├─ .harness/
│  ├─ run_worker.py      ← worker unificado: proxy, escalera local→Haiku→Sonnet→Claude, control de alcance, pruebas rápidas
│  ├─ harness.toml       ← configuración (servidor, modelo, intentos, strip_thinking_attempts, comprobaciones)
│  ├─ roles/             ← implementer, reviewer, planner
│  └─ state/             ← estado por máquina (ignorado por git)
├─ scripts/
│  ├─ delegar-local.ps1, lm-proxy.py, scope-guard.ps1  ← versión anterior del worker (respaldo)
│  ├─ parse-report.js, build-data.js, check-layout.mjs  ← datos del sitio y comprobación de layout
├─ docs/
│  ├─ spec.md, diseno.md ← qué y cómo se ve
│  ├─ progress/progress.md  ← hitos y estado
│  ├─ harness-notes.md   ← notas del harness
│  └─ tasks/             ← una por archivo (+ qa/ con las tareas de la revisión a ojo y logs/ del worker)
├─ data/raw/             ← tus reportes originales (prohibido editarlos)
└─ src/, tests/, package.json
```

## Quién hace qué
- **Tú:** cierras la spec y el diseño, apruebas tareas e hitos y pruebas cada hito a mano.
- **Claude (tu suscripción):** planifica, revisa, ejecuta la validación, pide correcciones y aprueba.
- **Modelo local:** implementa cada tarea y cada corrección. Solo ve la tarea, `CLAUDE.md`, su rol y los archivos.
- **`/qa`:** convierte lo que ves al probar un hito en tareas con su comprobación (carpeta `docs/tasks/qa/`).

## Ciclo de una tarea
```
pendiente ─▶ en-curso ─▶ worker (local x3, Haiku x2, Sonnet x1) en rama task/NNN ─▶ control de alcance
                                   │
                       Claude revisa resumen + npm test/build
                                   │
                 ¿cumple? ── no ──▶ NNN.fix-K.md ─▶ worker corrige (máx. 3)
                    │
                   sí ──▶ merge a main ─▶ hecha (rondas: K) ─▶ ¿era el último del hito? ─▶ parar y preguntar
```

## Cuando vuelvas al proyecto
`/resume` dice dónde quedó (hito, tarea a medias, notas sin subir) y retoma desde ahí.
