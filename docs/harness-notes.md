# Notas del harness — bench-site

Se anota aqui cada vez que el propio harness falla (un worker se desborda, un permiso esta mal, un criterio salio malo,
faltaba una pregunta). `/harvest` (desde `E:\IA\harness-template`) sube lo util a la plantilla.

Formato de cada entrada:

```
## AAAA-MM-DD · titulo corto
- Que paso:
- Causa:
- Remedio usado:
- Aplica a: core | stack:<nombre> | proyecto
- Estado: new            (luego: harvested <commit de la plantilla>)
```

## Entradas

Las lecciones de la construccion inicial (tareas 001 a 027) ya se pasaron a la plantilla como L-001 a L-019
(`E:\IA\harness-template\docs\lessons.md`), asi que quedan con estado `harvested plantilla-fase1`.

## 2026-10-15 · Mensaje system dentro de messages
- Que paso: error 500 "System message must be at the beginning" al delegar al modelo local.
- Causa: Claude Code mete un mensaje con role system dentro de messages; la plantilla del modelo lo rechaza.
- Remedio usado: proxy scripts/lm-proxy.py que lo mueve al campo system.
- Aplica a: core
- Estado: harvested plantilla-fase1 (L-001)

## 2026-10-15 · Contexto y prompt base de Claude Code
- Que paso: "request exceeds the available context size" con 32k de contexto.
- Causa: el prompt por defecto de Claude Code (~36k tokens con todas las herramientas).
- Remedio usado: --tools con 6 herramientas y --system-prompt corto.
- Aplica a: core
- Estado: harvested plantilla-fase1 (L-002)

## 2026-10-15 · Desbordamiento de salida del worker
- Que paso: "exceeded the 16000/32000 output token maximum" en las tareas 010, 011, 014, 015 (UI con 3-4 archivos nuevos).
- Causa: probable bucle de razonamiento; subir o bajar el tope y /no_think no ayudaron. Claude Code manda thinking, output_config y context_management.
- Remedio usado: partir cada tarea en rondas (codigo y estilos / pruebas), un archivo por llamada.
- Aplica a: core
- Estado: harvested plantilla-fase1 (L-003). Pendiente probar -QuitarThinking (proxy quita esos campos).

## 2026-10-15 · Archivos sueltos y cambios fuera de alcance
- Que paso: el worker dejo scripts-tmp/, tests/_tmp_check.mjs, un test de depuracion y edito el estado de la tarea.
- Causa: nadie lo comprobaba.
- Remedio usado: revision manual; ahora scripts/scope-guard.ps1 corre despues de cada entrega.
- Aplica a: core
- Estado: harvested plantilla-fase1 (L-004)

## 2026-10-15 · Servidor de desarrollo con CSS viejo
- Que paso: Firefox mostro un arreglo ya corregido.
- Causa: Vite dev no vio los cambios de archivos hechos por git al cambiar de rama.
- Remedio usado: touch del archivo o reiniciar npm run dev.
- Aplica a: stack:web
- Estado: harvested plantilla-fase1 (L-015)

## 2026-10-15 · Politica de movimiento reducido
- Que paso: el autor tenia las animaciones del sistema desactivadas y no veia ninguna.
- Causa: la regla del proyecto era respetar prefers-reduced-motion.
- Remedio usado: decision del autor: las animaciones no dependen de esa preferencia.
- Aplica a: stack:web (preguntar en /kickoff)
- Estado: harvested plantilla-fase1 (L-017)

## 2026-10-15 · offsetLeft no es relativo al contenedor con scroll
- Que paso: el botón activo del selector no quedaba visible en móvil con 5 modelos.
- Causa: `offsetLeft` se mide contra el `offsetParent` (un contenedor posicionado), no contra el selector que hace scroll.
- Remedio usado: restar `getBoundingClientRect().left` del selector y sumar su `scrollLeft`.
- Aplica a: stack:web
- Estado: new
