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

## 2026-10-15 · Un archivo generado cambia de saltos de línea al hacer checkout
- Que paso: una prueba que compara `benchmarks.json` byte a byte falló en `main` tras un merge.
- Causa: `core.autocrlf` de Git en Windows convirtió el JSON generado (LF) a CRLF en el checkout.
- Remedio usado: `.gitattributes` con `src/data/benchmarks.json text eol=lf`.
- Aplica a: core (cualquier proyecto con un archivo generado que se compara o regenera)
- Estado: new

## 2026-10-16 · Playwright deja los navegadores abiertos
- Que paso: tras las pruebas visuales el autor tenia que cerrar a mano Edge/Firefox.
- Causa: `browser_close` no se llamaba al terminar y `scripts/check-layout.mjs` solo cerraba en el camino sin errores.
- Remedio usado: regla en CLAUDE.md (llamar `browser_close` siempre) y `try/finally` en check-layout.
- Aplica a: stack:web (y cualquier stack con pruebas en navegador)
- Estado: new

## 2026-10-16 · El proxy del worker imprimia tracebacks al cerrar el cliente
- Que paso: `run_worker.py` mostraba `ConnectionResetError` largos aunque la tarea salia bien.
- Causa: `ThreadingHTTPServer.handle_error` imprime las conexiones que Claude Code cierra a mitad de peticion.
- Remedio usado: servidor propio que ignora `ConnectionError`/`BrokenPipeError`.
- Aplica a: core
- Estado: new

## 2026-10-16 · Primer uso real de run_worker.py (tareas 030 y 031)
- Que paso: ambas tareas (2 archivos, ~15 lineas de detalle) pasaron al primer intento local: 244 s y 96 s, alcance OK y `npm test` OK.
- Causa: tareas partidas segun la regla de <=3 archivos; el control de alcance y las comprobaciones corren dentro del script.
- Remedio usado: n/a (confirma el diseno). Pendiente: probar `strip_thinking` y un fallo real para ver la escalera.
- Aplica a: core
- Estado: new
