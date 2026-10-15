# Spec — Bench Site (BORRADOR, fase 0)

> Este documento se cierra en la fase 0, conversando con Claude y sin escribir código.
> Cuando no queden preguntas abiertas, se puede ejecutar `/planificar`.

## Propósito
Mostrar, en una sola página, si vale la pena delegar el trabajo a un modelo local y usar
Claude solo para revisar, comparado con usar solo el modelo local o solo Claude.

## Público
Por definir (ver preguntas abiertas).

## Fuente de datos
- `data/raw/*.txt`: reportes del benchmark de pareja, uno por modelo local.
  Hoy son gemma-4-26b-a4b-qat (Q4_0) y qwen3.8-27b (IQ3_XXS). En ambos, Haiku es el revisor.
- Un script (`npm run data`) los convierte en `src/data/benchmarks.json`.
  Si se agrega un reporte nuevo a `data/raw/`, el sitio lo muestra sin cambios de código.
- Problema conocido: el resumen de cada reporte dice "Qwen solo" aunque el modelo sea otro.
  El parser debe usar el nombre real del modelo que aparece en la cabecera.

## Por cada modelo local se tienen
- Resumen de 3 modos: nota, tiempo por tarea, tokens de Claude por tarea, costo API equivalente.
- Detalle de 13 tareas (Unity, web, C++, Unreal, Rust, .NET, Firebase): nota del modelo solo,
  nota en pareja, rondas, tokens de Claude, nota de Claude solo, tokens de Claude solo.
- Textos de cada revisión de Haiku y fallos marcados con ✗.

## Secciones del sitio
1. **Hero**: la conclusión en una frase, más 2 o 3 cifras grandes animadas
   (p. ej. "−73 % a −78 % de tokens de Claude").
2. **Selector de modelo**: Gemma / Qwen. Al cambiarlo, se actualiza todo lo de abajo.
3. **Tres modos**: una tarjeta por modo con nota, tiempo y tokens.
4. **Gráfico**: nota vs tokens de Claude por modo y por modelo.
5. **Detalle por tarea**: tabla agrupada por ámbito. Al expandir una fila se ven las revisiones de Haiku.
6. **Hallazgos**: 3 o 4 conclusiones escritas a mano (ver abajo).
7. **Metodología**: cómo se hizo el benchmark, en un párrafo.

## Hallazgos (borrador)
- La pareja usa entre 73 % y 78 % menos tokens de Claude que Claude solo.
- La pareja es entre 7 y 9 veces más lenta (217–290 s vs 31–32 s por tarea).
- Gemma gana mucho con la revisión (8.8 → 10.0). Qwen casi no la necesita (9.6 → 9.5).
- NET-501 (.NET) es el punto débil de los dos modelos locales.

## Fuera de alcance
- Backend, base de datos o carga de reportes desde el navegador.

## Preguntas abiertas (responder en fase 0)
1. ¿Para quién es el sitio: solo para ti, para tu portafolio o LinkedIn, o para la comunidad?
   Esto cambia el tono y cuánto explicar.
2. ¿Dónde se publica? (GitHub Pages, Firebase Hosting, un artifact o solo en local)
3. ¿Solo en español o también en inglés?
4. ¿Se muestra el costo API equivalente? Hoy es menos de 0.01 $ por tarea y puede confundir.
5. ¿Se agrega una vista "comparar modelos" con Gemma y Qwen lado a lado, además del selector?
