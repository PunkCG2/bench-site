# Spec — Bench Site (BORRADOR, fase 0)

> Este documento se cierra en la fase 0, conversando con Claude y sin escribir código.
> Cuando no queden preguntas abiertas, se puede ejecutar `/planificar`.

## Título
"Local + Claude". Igual en español e inglés. El subtítulo sí se traduce:
"¿Vale la pena delegar?" / "Is delegating worth it?".

## Propósito
Mostrar, en una sola página, si vale la pena delegar el trabajo a un modelo local y usar
Claude solo para revisar, comparado con usar solo el modelo local o solo Claude.

El foco es la diferencia de **costo, precisión y velocidad entre los tres modos** (local solo,
pareja y Claude solo) dentro de cada modelo. El sitio no compara modelos entre sí: el selector
elige qué modelo se está mirando. Se planea sumar 2 o 3 benchmarks de otros modelos, así que
nada puede suponer que son solo dos. Se muestra siempre el dato real, aunque no haya diferencia
(por ejemplo, notas de 10 en los tres modos).

## Público
Uso propio y portafolio público en GitHub (ver Decisiones).

## Fuente de datos
- `data/raw/*.txt`: reportes del benchmark de pareja, uno por modelo local.
  Hoy son gemma-4-26b-a4b-qat (Q4_0) y qwen3.8-27b (IQ3_XXS). En ambos, Haiku es el revisor.
- Un script (`npm run data`) los convierte en `src/data/benchmarks.json`.
  Si se agrega un reporte nuevo a `data/raw/`, el sitio lo muestra sin cambios de código.
- Problema conocido: el resumen de cada reporte dice "Qwen solo" aunque el modelo sea otro.
  El parser debe usar el nombre real del modelo que aparece en la cabecera.

## Por cada modelo local se tienen
- Resumen de 3 modos: nota, tiempo por tarea, tokens de Claude por tarea, costo API equivalente.
- Detalle por tarea (Unity, web, C++, Unreal, Rust, .NET, Firebase): nota del modelo solo,
  nota en pareja, rondas, tokens de Claude, nota de Claude solo, tokens de Claude solo.
  El número de tareas no es fijo: cada reporte trae las suyas (13 en los de benchmark v1, 11 en
  los de v2) y el sitio muestra las que haya. Una tarea con prefijo desconocido se agrupa en "Otro".
- Textos de cada revisión de Haiku y fallos marcados con ✗.

## Secciones del sitio
1. **Hero**: la conclusión en una frase, más 2 o 3 cifras grandes animadas
   (p. ej. "−73 % a −78 % de tokens de Claude").
2. **Header estático**: título, selector de modelo (nombre completo del modelo, sin la organización), botón de idioma ES/EN
   y botón de tema oscuro/claro. Al cambiar el modelo, se actualiza todo lo de abajo.
   No hay otro selector de modelo en la página.
3. **Tres modos**: tres columnas (local solo, pareja, Claude solo), cada una con tarjetas de
   precisión, velocidad, tokens de Claude y costo API equivalente, con la diferencia frente a
   Claude solo. En móvil, carrusel con swipe (ver diseno.md).
4. **Gráfico**: cuatro gráficos de barras del modelo activo (precisión, velocidad, tokens de
   Claude, costo), cada uno con una barra por modo. No compara modelos.
5. **Detalle por tarea**: tabla agrupada por ámbito. Al expandir una fila se ven las revisiones de Haiku.
6. **Hallazgos**: 3 o 4 conclusiones del modelo activo, generadas desde los datos (ver abajo).
7. **Metodología**: cómo se hizo el benchmark, en un párrafo.
8. **Footer**: leyenda pequeña "Hecho con Claude Code y SDD" (también en inglés).

## Hallazgos (borrador)
Los hallazgos son del modelo elegido, no de todos juntos. Los ejemplos son solo ilustrativos:
- La pareja usa un X % menos de tokens de Claude que Claude solo.
- La pareja es N veces más lenta que Claude solo.
- La revisión cambia la nota del modelo local de A a B (o "no cambia la nota").
- La tarea con menor nota del modelo local solo es T (o "todas las tareas obtuvieron 10").

Cada hallazgo tiene variantes para los casos sin diferencia o con resultado adverso (la pareja
saca menos nota, no hay mejora, todas las notas son iguales). Se muestra siempre lo que dicen
los datos; nunca se omite un hallazgo porque "no haya nada que decir".

## Fuera de alcance
- Backend, base de datos o carga de reportes desde el navegador.

## Decisiones (fase 0)
1. **Público**: el sitio es para uso propio, pero el repositorio será público en GitHub como
   parte del portafolio. Tono sobrio y técnico; la metodología se explica en breve.
2. **Publicación**: solo en local por ahora. El repo es público, pero no hay deploy. No se
   configura base path ni hosting.
3. **Idioma**: español por defecto y también inglés. Los textos viven en dos diccionarios
   (`es` y `en`) y el header tiene un botón ES/EN arriba a la derecha. Todo texto visible sale
   de los diccionarios, incluidos los hallazgos y la metodología.
   **Tema**: el sitio tiene tema oscuro y claro, seleccionable con un botón en el header.
   Por defecto sigue `prefers-color-scheme`. Idioma y tema se guardan en `localStorage`.
4. **Costo API equivalente**: se muestra en las columnas de modos, junto con precisión y
   velocidad, porque el costo es una de las tres diferencias que el sitio quiere mostrar.
   Con una nota que aclara que es un equivalente y no un gasto real. Se muestra el valor real
   con tres decimales (`0.005 $`); no se redondea a "< 0.01 $" porque ocultaría la diferencia.
   (Reemplaza la decisión anterior de mostrarlo solo en el detalle.)
5. **Comparar modelos**: no hay vista lado a lado. La vista es la de §3 (tres columnas:
   modelo local solo, pareja y Claude solo) para el modelo elegido en el selector. Al
   cambiar de modelo se muestran las mismas tres columnas con los datos del otro.
6. **Cifras de los hallazgos**: las cifras del hero y de los hallazgos se calculan desde
   `benchmarks.json` y se insertan en plantillas de texto. Los números de arriba son solo
   ejemplo del borrador.
7. **Más modelos**: se agregarán 2 o 3 benchmarks más. Todo se genera desde los datos; el
   selector del header admite hasta ~5 modelos y las etiquetas no pueden chocar.
8. **Enfoque**: la comparación es entre modos, dentro de un modelo. No hay vistas ni gráficos
   que comparen modelos entre sí.

## Preguntas abiertas
Ninguna. Se puede ejecutar `/planificar`.
