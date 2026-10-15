# Bench Site: mapa del harness

Este archivo es para ti, no para los modelos. Explica qué hace cada pieza.

## Las tres memorias del proyecto
El modelo no recuerda nada entre sesiones. Todo lo que necesita saber está en archivos:

| Memoria | Archivo | ¿Quién lo lee y cuándo? |
|---|---|---|
| Reglas permanentes | `CLAUDE.md` | Claude **y** el worker local, automáticamente, en cada sesión |
| Procedimientos | `.claude/skills/*/SKILL.md` | Solo Claude, cuando invocas `/planificar` o `/tarea` |
| Estado del trabajo | `docs/` | Quien lo necesite, cuando lo necesite |

## Carpeta por carpeta
```
bench-site/
├─ LEEME.md              ← este archivo (solo para ti)
├─ CLAUDE.md             ← reglas. CORTO: el modelo local lo paga en cada tarea
├─ .gitignore
├─ .claude/
│  ├─ settings.json      ← permisos: qué ejecuta sin preguntar y qué tiene prohibido
│  └─ skills/
│     ├─ planificar/     ← /planificar : spec → archivos de tarea
│     └─ tarea/          ← /tarea      : delegar → revisar → corregir → aprobar
├─ scripts/
│  └─ delegar-local.ps1  ← el "puente": lanza Claude Code apuntando a LM Studio
├─ docs/
│  ├─ spec.md            ← QUÉ (borrador con preguntas abiertas)
│  ├─ diseno.md          ← CÓMO SE VE (borrador)
│  └─ tasks/
│     ├─ _plantilla.md   ← forma que debe tener cada tarea
│     └─ logs/           ← resúmenes del worker (los crea el script)
├─ data/raw/             ← tus reportes originales (prohibido editarlos)
└─ src/, tests/, package.json  ← todavía no existen: los crea la tarea 001
```

## Quién hace qué
- **Tú:** cierras la spec y el diseño, apruebas la lista de tareas y pruebas el resultado en el navegador.
- **Claude (tu suscripción):** planifica, revisa diffs, ejecuta la validación, pide correcciones y aprueba.
- **Modelo local:** implementa cada tarea y cada corrección. No ve la conversación con Claude,
  solo la tarea, `CLAUDE.md` y los archivos del proyecto.

## Primeros pasos
1. Verifica que tienes todo instalado: `git --version`, `node -v` (18 o más), `claude --version`.
2. En una terminal, dentro de esta carpeta:
   ```
   git init -b main
   git add -A
   git commit -m "inicio: estructura del harness"
   ```
3. `claude` y luego, en la fase 0: *"Revisemos docs/spec.md y docs/diseno.md y respondamos las preguntas abiertas"*.
4. `/planificar` y revisa la tabla de tareas.
5. Abre LM Studio (no Bionic), carga el modelo e inicia el servidor. Luego ejecuta `/tarea siguiente`.

## Ciclo de vida de una tarea
```
pendiente ─▶ en-curso ─▶ worker implementa en rama task/NNN
                              │
                       Claude revisa diff + npm test/build
                              │
                 ¿cumple? ── no ──▶ NNN.fix-1.md ─▶ worker corrige (máx. 3)
                    │
                   sí ──▶ merge a main ─▶ hecha (rondas: K)
```
