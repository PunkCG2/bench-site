---
id: 026
estado: pendiente
ejecuta: local
depende: [025]
rondas: 0
---
# Script de comprobación de layout en varios navegadores

## Objetivo
`npm run check:layout` abre el sitio en Edge y Firefox a varias anchuras y escribe un informe de texto: si hay desborde horizontal,
si los paneles de detalle están ocultos y si hay errores de consola. Sirve para repetir las revisiones visuales sin gastar tokens.

## Archivos en alcance
- scripts/check-layout.mjs (crear)
- package.json (modificar: script `check:layout` y la devDependency `playwright-core`)

## No tocar
- data/raw/, src/

## Detalles
Esta tarea autoriza UNA dependencia nueva: `playwright-core` en `devDependencies` (sin descargar navegadores).
- Requiere el servidor en marcha: el script usa `http://localhost:5173/` (o el valor de `process.argv[2]`). Si no responde,
  imprime "Arranca el sitio con npm run dev" y termina con código 2.
- Navegadores: Edge con `chromium.launch({ channel: 'msedge' })` y Firefox con `firefox.launch()`. Si un navegador no se puede
  abrir, imprime `OMITIDO <navegador>: <motivo corto>` y sigue con el otro (no falla por eso).
- Anchuras: 320, 375, 800, 900, 1024, 1280, 1920 (alto 900).
- Por cada navegador y anchura (`page.setViewportSize` y `page.goto`, espera 1000 ms) comprueba con `page.evaluate`:
  1. no hay desborde: `document.documentElement.scrollWidth <= document.documentElement.clientWidth`;
  2. los `.tabla__detalle` visibles (`getComputedStyle(e).display !== 'none'`) son 0;
  3. no hubo mensajes de consola de tipo `error` ni `pageerror` (acumúlalos con `page.on`; ignora los de `favicon`).
- Salida: una línea por combinación, `OK  edge 375` o `FALLA  firefox 800: desborde 392>375`, y al final `N fallos`. Código de salida 1
  si hay algún fallo, 0 si no.
- Un solo archivo de menos de 90 líneas; sin otras dependencias.

## Criterios de aceptación
- [ ] `npm test` y `npm run build` pasan
- [ ] Con el sitio en marcha, `npm run check:layout` termina con código 0 y muestra 14 líneas `OK` (o `OMITIDO` si falta un navegador)
- [ ] `package.json` solo añade `playwright-core` en `devDependencies` y el script `check:layout`

## Notas de revisión
(las escribe Claude al aprobar)
