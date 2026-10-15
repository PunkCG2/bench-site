# Bench Site: mapa del harness

Este archivo es para ti, no para los modelos. Explica qué hace cada pieza. La versión reutilizable de este harness vive en
`E:\IA\harness-template` (ver su `docs/spec.md`).

## Las memorias del proyecto
El modelo no recuerda nada entre sesiones. Todo lo que necesita saber está en archivos:

| Memoria | Archivo | ¿Quién lo lee y cuándo? |
|---|---|---|
| Reglas permanentes | `CLAUDE.md` | Claude **y** el worker local, automáticamente, en cada sesión |
| Procedimientos | `.claude/skills/*/SKILL.md` | Solo Claude, con `/planificar`, `/tarea` o `/resume` |
| Roles | `.harness/roles/*.md` | El del implementador va como prompt de sistema del worker local |
| Estado del trabajo | `docs/` (tareas, `progress/progress.md`) | Quien lo necesite |
| Lo que falló del harness | `docs/harness-notes.md` | Claude lo escribe; `/harvest` en la plantilla lo recoge |

## Carpeta por carpeta
```
bench-site/
├─ LEEME.md              ← este archivo (solo para ti)
├─ CLAUDE.md             ← reglas. CORTO: el modelo local lo paga en cada tarea
├─ .claude/
│  ├─ settings.json      ← permisos
│  └─ skills/            ← planificar (spec → tareas e hitos), tarea (delegar → revisar → aprobar), resume
├─ .harness/roles/       ← implementer, reviewer, planner
├─ scripts/
│  ├─ delegar-local.ps1  ← lanza Claude Code apuntando al servidor local (proxy, rol, control de alcance)
│  ├─ lm-proxy.py        ← normaliza los mensajes system (y puede quitar thinking)
│  ├─ scope-guard.ps1    ← borra temporales y avisa de archivos fuera de alcance
│  ├─ parse-report.js, build-data.js, check-layout.mjs  ← datos del sitio y comprobación de layout
├─ docs/
│  ├─ spec.md, diseno.md ← qué y cómo se ve
│  ├─ progress/progress.md  ← hitos y estado
│  ├─ harness-notes.md   ← notas del harness
│  └─ tasks/             ← una por archivo (+ logs/ del worker)
├─ data/raw/             ← tus reportes originales (prohibido editarlos)
└─ src/, tests/, package.json
```

## Quién hace qué
- **Tú:** cierras la spec y el diseño, apruebas tareas e hitos y pruebas cada hito a mano.
- **Claude (tu suscripción):** planifica, revisa, ejecuta la validación, pide correcciones y aprueba.
- **Modelo local:** implementa cada tarea y cada corrección. Solo ve la tarea, `CLAUDE.md`, su rol y los archivos.

## Ciclo de una tarea
```
pendiente ─▶ en-curso ─▶ worker implementa en rama task/NNN ─▶ control de alcance
                                   │
                       Claude revisa resumen + npm test/build
                                   │
                 ¿cumple? ── no ──▶ NNN.fix-K.md ─▶ worker corrige (máx. 3)
                    │
                   sí ──▶ merge a main ─▶ hecha (rondas: K) ─▶ ¿era el último del hito? ─▶ parar y preguntar
```

## Cuando vuelvas al proyecto
`/resume` dice dónde quedó (hito, tarea a medias, notas sin subir) y retoma desde ahí.
