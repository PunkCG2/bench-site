---
id: 043
estado: hecha
ejecuta: claude
depende: [040, 041, 042]
hito: M8
rondas: 0
---
# README para GitHub (bilingüe) con capturas y mapa del harness en docs/

## Objetivo
El repositorio tiene un README.md y un README.en.md pensados para GitHub: qué es el sitio, el experimento de desarrollo híbrido con workers locales, resultados, desafíos y logros; el mapa interno del harness pasa a docs/harness-mapa.md.

## Archivos en alcance
- README.md (crear)
- README.en.md (crear)
- LEEME.md → docs/harness-mapa.md (mover con `git mv` y actualizar sus enlaces y título)
- docs/img/ (crear: 2 o 3 capturas con Playwright)

## No tocar
- data/raw/
- src/data/benchmarks.json
- docs/harness-notes.md (solo lectura)

## Detalles
Ejecuta Claude (necesita criterio y la historia del proyecto). Esperar a que 040-042 estén hechas para que las capturas reflejen la página final.
Contenido (cada archivo en su idioma; cabecera con enlace cruzado entre idiomas):
1. Qué es el sitio y la pregunta que responde (¿vale la pena delegar a un modelo local?), con capturas (escritorio oscuro, claro y móvil, de `npm run dev`).
2. El experimento: este proyecto se construyó con un modelo local como worker y Claude como revisor (ciclo spec → tareas → worker → alcance + pruebas → revisión → merge), con la escalera local → Haiku → Sonnet → Claude y `strip_thinking` en los primeros intentos.
3. Resultados del benchmark: los datos salen de `src/data/benchmarks.json` (no inventar cifras; si se incluye una tabla, generarla de ese JSON y fecharla) y el aviso de que no son un desempeño real.
4. Desafíos y aprendizajes (de `docs/harness-notes.md` y la plantilla): límite de salida del worker y tareas pequeñas, mensajes `system` y el proxy, alcance y temporales, CSS cacheado tras cambiar de rama, saltos de línea CRLF, escalera en real, strip thinking.
5. Logros: número de tareas, tests, hitos, 5 modelos, veredicto in-site, plantilla reutilizable (`harness-template`).
6. Cómo ejecutarlo (`npm run dev`, `npm test`, `npm run build`, `npm run data`, `npm run check:layout`), estructura de carpetas y enlace a `docs/harness-mapa.md`.
7. Limitaciones y próximos pasos.
Reglas: sin tablas gigantes; sin colores/espaciados (no aplica); enlaces relativos que funcionen en GitHub; las capturas en `docs/img/` con tamaño razonable (< 400 KB cada una).

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] README.md y README.en.md existen, se enlazan entre sí y todos sus enlaces relativos apuntan a archivos que existen
- [ ] `LEEME.md` ya no existe en la raíz y `docs/harness-mapa.md` sí
- [ ] las capturas existen y pesan menos de 400 KB cada una (las toma Claude y llama `browser_close`)

## Notas de revision
Hecha por Claude. README.md y README.en.md con 3 capturas (~100 KB c/u, tomadas en Edge) y tabla generada del JSON; LEEME.md movido a docs/harness-mapa.md. Enlaces relativos comprobados con un script (0 rotos).
