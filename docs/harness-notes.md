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
- Estado: harvested cfa6e4d (L-028)

## 2026-10-15 · Un archivo generado cambia de saltos de línea al hacer checkout
- Que paso: una prueba que compara `benchmarks.json` byte a byte falló en `main` tras un merge.
- Causa: `core.autocrlf` de Git en Windows convirtió el JSON generado (LF) a CRLF en el checkout.
- Remedio usado: `.gitattributes` con `src/data/benchmarks.json text eol=lf`.
- Aplica a: core (cualquier proyecto con un archivo generado que se compara o regenera)
- Estado: harvested cfa6e4d (L-013, ya existia)

## 2026-10-16 · Playwright deja los navegadores abiertos
- Que paso: tras las pruebas visuales el autor tenia que cerrar a mano Edge/Firefox.
- Causa: `browser_close` no se llamaba al terminar y `scripts/check-layout.mjs` solo cerraba en el camino sin errores.
- Remedio usado: regla en CLAUDE.md (llamar `browser_close` siempre) y `try/finally` en check-layout.
- Aplica a: stack:web (y cualquier stack con pruebas en navegador)
- Estado: harvested cfa6e4d (L-020)

## 2026-10-16 · El proxy del worker imprimia tracebacks al cerrar el cliente
- Que paso: `run_worker.py` mostraba `ConnectionResetError` largos aunque la tarea salia bien.
- Causa: `ThreadingHTTPServer.handle_error` imprime las conexiones que Claude Code cierra a mitad de peticion.
- Remedio usado: servidor propio que ignora `ConnectionError`/`BrokenPipeError`.
- Aplica a: core
- Estado: harvested cfa6e4d (L-031)

## 2026-10-16 · Primer uso real de run_worker.py (tareas 030 y 031)
- Que paso: ambas tareas (2 archivos, ~15 lineas de detalle) pasaron al primer intento local: 244 s y 96 s, alcance OK y `npm test` OK.
- Causa: tareas partidas segun la regla de <=3 archivos; el control de alcance y las comprobaciones corren dentro del script.
- Remedio usado: n/a (confirma el diseno). Pendiente: probar `strip_thinking` y un fallo real para ver la escalera.
- Aplica a: core
- Estado: harvested cfa6e4d (informativa: sin leccion nueva)

## 2026-10-16 · Tarea de 3 archivos nuevos: el worker local fallo 3 veces y escalo a Haiku
- Que paso: la tarea 036 (componente + textos + test, 3 archivos nuevos) dio `no_output` 3 veces en local (430, 299 y 542 s) y Haiku la resolvio en 59 s.
- Causa: mismo patron de desborde de salida con varios archivos nuevos (L-003); el reintento endurecido no alcanzo. Los tiempos de espera calibrados (441-771 s) tambien fueron justos: 034 agoto el primer intento con 258 lineas.
- Remedio usado: la escalera del script funciono sin intervencion. Para el futuro: partir en componente+textos y test aparte, o pasar `--start claude-haiku` si la tarea tiene 3 archivos nuevos.
- Aplica a: core
- Estado: harvested cfa6e4d (L-032)

## 2026-10-16 · El worker anadio un cambio condicional sin comprobar la condicion
- Que paso: en 038 el worker puso el titulo en `--fs-20` en movil aunque la tarea decia "solo si no cabe". Al medir, a 28 px cabia en 360 px pero se partia en dos lineas.
- Causa: criterio "si no cabe" no verificable por el worker (no ve el navegador).
- Remedio usado: Claude midio en Edge y dejo el override solo bajo 480 px.
- Aplica a: core (las condiciones visuales las decide quien ve el navegador, no el worker)
- Estado: harvested cfa6e4d (L-029)

## 2026-10-16 · Feedback en vivo del worker: probado y revertido
- Que paso: se construyo `--watch`, una linea de estado con tokens y t/s y un proxy con streaming. Funcionaba, pero el autor prefirio no abrir otra terminal y la ventana del chat no puede mostrar el progreso de un comando en curso.
- Causa: el resultado de un comando solo llega a Claude al terminar; una terminal aparte no aporta lo bastante.
- Remedio usado: se revirtio todo salvo la correccion util: `.harness/state/` se ignora en el control de alcance y se excluye del commit del worker. Una prueba con respuestas que llegan de golpe daba velocidades absurdas: otra razon para no medir t/s.
- Aplica a: core
- Estado: harvested cfa6e4d (L-033)

## 2026-10-16 · strip_thinking: 4 pruebas reales
- Que paso: 4 tareas pequenas de codigo (3 en Python con tests ocultos y la de 2 archivos) con y sin `strip_thinking`: mismo resultado (tests ocultos 19/19 en ambos modos, siempre al primer intento), de 2 a 6 veces mas rapido (136 s -> 24 s la mayor) y de 6 a 18 veces menos tokens de salida.
- Causa: sin `thinking` el modelo no razona antes de escribir.
- Remedio usado: `strip_thinking_attempts = 2` en `.harness/harness.toml`: intentos 1 y 2 sin razonamiento y el 3 con razonamiento (red de seguridad). Revisar con tareas mas dificiles.
- Aplica a: core
- Estado: harvested cfa6e4d (L-024)

## 2026-10-16 · strip_thinking tambien con Gemma 4
- Que paso: las mismas 3 tareas con google/gemma-4-26b-a4b-qat: con strip 19/19 tests ocultos y sin strip 18/19 (fallo un caso de parse_duration); tiempos 149 s -> 40 s, 134 s -> 69 s y 88 s -> 35 s (1,9 a 3,8 veces mas rapido). Siempre al primer intento.
- Causa: igual que con Qwen: sin `thinking` el modelo no razona antes de escribir.
- Remedio usado: ninguno; se mantiene `strip_thinking_attempts = 2`. Pruebas solo con tareas faciles; falta probar tareas dificiles.
- Aplica a: core
- Estado: harvested cfa6e4d (L-025)

## 2026-10-16 · localhost llegaba a otro programa y varios fallos al solaparse comandos
- Que paso: (1) el worker recibio HTML en vez de la lista de modelos: un servidor de Vite escuchaba en `[::1]:1234` y `localhost` resolvia primero a IPv6, mientras Bionic escucha en `127.0.0.1`. (2) Forcé `--model` de Gemma sin comprobar que el autor habia cargado Qwen, y la carga fallo con HTTP 500 por falta de memoria. (3) Un comando que detuve a medias siguio ejecutandose y relanzo la tarea 040 mientras corria otra: la escalera se agoto y la 041 escalo a Haiku tras dos intentos locales de 1,6 s.
- Causa: URL con `localhost`; suponer en vez de comprobar el modelo cargado; matar solo el proceso python de un comando encadenado en vez de todo el comando.
- Remedio usado: URL `http://127.0.0.1:1234` en `harness.toml` y en la plantilla; error claro si el modelo no carga; no pasar `--model` sin mirar `--list-models`; al detener una ejecucion, detener tambien el comando padre y revisar `git status` antes de relanzar.
- Aplica a: core
- Estado: harvested cfa6e4d (L-026, L-030)

## 2026-10-16 · Primera ronda real con el esquema nuevo (M8)
- Que paso: las 3 tareas de codigo con el worker local (Qwen, intentos 1-2 sin razonamiento): 040 al primer intento (189 s), 042 al primer intento (93 s) y 041 escalo a Haiku, pero por culpa del solapamiento de comandos (ver nota anterior), no del esquema. La 043 (README) la hizo Claude.
- Causa: n/a para 040 y 042; el esquema sin razonamiento funciona tambien en tareas reales de UI de 2-3 archivos.
- Remedio usado: ninguno; las tareas no son comparables con las de antes porque cambiaron modelo y razonamiento a la vez.
- Aplica a: core
- Estado: harvested cfa6e4d (informativa: sin leccion nueva)

## 2026-10-16 · Dos instancias del mismo modelo cargadas
- Que paso: al lanzar Qwen aparecieron 2 instancias en la API (`qwen3.8-27b` y `qwen3.8-27b:2`).
- Causa: una segunda orden de carga con el modelo ya cargado crea otra instancia (comprobado en el servidor real). Las ordenes salieron de dos ejecuciones del worker solapadas (un comando que habia detenido a medias relanzo la tarea), cada una vio "no cargado" y mando su carga; un reintento tras un error 500 tambien habria duplicado.
- Remedio usado: `ensure_loaded` consulta `loaded_instances` antes de cargar, nunca repite la orden (tras un error espera y vuelve a mirar), serializa la carga con un candado, una sola ejecucion por proyecto (`worker.lock`, codigo 6) y, si hay otro modelo cargado, usa ese en vez de cargar uno encima. Modelo preferido (`model`) y secundario (`fallback_model`) en `harness.toml`. Pruebas reales: 3 procesos pidiendo la carga a la vez dejaron 1 instancia; dos ejecuciones simultaneas: la segunda se rechazo con el codigo 6.
- Aplica a: core
- Estado: harvested cfa6e4d (L-027)
