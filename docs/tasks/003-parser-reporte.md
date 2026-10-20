---
id: 003
status: done
runner: local
depends: [001]
rounds: 0
---
# Escribir el parser de reportes de benchmark

## Objetivo
Existe `parseReport(texto)`, una función pura que convierte el texto de un reporte de
`data/raw/*.txt` en un objeto de modelo, con pruebas contra los dos reportes reales.

## Archivos en alcance
- scripts/parse-report.js (crear)
- tests/parse-report.test.js (crear)

## No tocar
- data/raw/ (las pruebas solo lo leen)

## Detalles
Formato del reporte (ver los dos archivos de `data/raw/`):
- Cabecera: `Modelo local:  google/gemma-4-26b-a4b-qat (Q4_0)`, `Revisor:  Claude haiku (...)`,
  `Fecha:  2026-10-15 02:29    Benchmark: v1    Tareas: 13`.
- `RESUMEN`: tres filas de datos, en este orden: local solo, pareja, Claude solo. Columnas:
  nota, tiempo por tarea (`184 s`), tokens de Claude (`23,786`; `0` en el local) y costo
  (`0.005$`, o `—` cuando no hay).
- Problema conocido: la etiqueta de la primera fila dice siempre "Qwen solo", aunque el modelo
  sea otro. **Identifica las filas por posición e ignora esas etiquetas.** El nombre del modelo
  sale solo de `Modelo local:`.
- La línea `La revisión mejoró N tarea(s), empeoró M y K quedaron aprobadas en la primera revisión.`
- `DETALLE POR TAREA`: una línea por tarea con columnas: id, nota local, nota pareja, rondas,
  tokens Claude de la pareja, nota Claude solo, tokens Claude solo. Debajo, líneas opcionales:
  `· revisión N: [archivo] texto` (puede haber varias) y `✗ texto` (fallo).

Forma de salida (nombres exactos; la tarea 004 y las siguientes dependen de ellos):
```js
{
  id: 'gemma-4-26b-a4b-qat',        // parte tras la última "/" y sin la cuantización
  nombre: 'gemma-4-26b-a4b-qat',
  etiqueta: 'Gemma',                // primera palabra alfabética de `nombre`, con inicial mayúscula
  cuantizacion: 'Q4_0',
  revisor: 'haiku',                 // palabra tras "Claude" en la línea Revisor, en minúsculas
  fecha: '2026-10-15 02:29',
  version: 'v1',
  resumen: {
    local:  { nota: 8.8,  tiempo_s: 184, tokens_claude: 0,     costo_usd: null },
    pareja: { nota: 10.0, tiempo_s: 290, tokens_claude: 23786, costo_usd: 0.005 },
    claude: { nota: 9.9,  tiempo_s: 31,  tokens_claude: 88790, costo_usd: 0.006 },
    revision: { mejoro: 4, empeoro: 0, aprobadas_primera: 3 }
  },
  tareas: [
    { id: 'T-101', ambito: 'unity', local: 10.0, pareja: 10.0, rondas: 0,
      tokens_pareja: 19689, claude: 10.0, tokens_claude: 77113,
      revisiones: [ { ronda: 1, archivo: 'Assets/...', texto: '...' } ],
      fallos: [ { quien: 'claude', texto: '...' } ] }
  ]
}
```
- `ambito` sale del prefijo del id de la tarea: `T`→`unity`, `W`→`web`, `CPP`→`cpp`,
  `UE`→`unreal`, `RS`→`rust`, `NET`→`dotnet`, `FB`→`firebase`; cualquier otro → `otro`.
- `fallos[].quien`: `'claude'` si el texto del ✗ contiene "Claude solo"; `'pareja'` si contiene
  "pareja"; en otro caso `'local'`. `texto` es lo que sigue al `✗`, sin el símbolo.
- Números con coma de miles se convierten a entero. El `—` es `null`.
- Si falta una sección obligatoria (cabecera, resumen o detalle), lanza un `Error` con un
  mensaje que diga cuál.
- Exporta `parseReport` con `export`. Sin dependencias.

Pruebas (cifras tomadas de los reportes reales; es válido escribirlas en tests):
- Gemma: `id` `gemma-4-26b-a4b-qat`, `etiqueta` `Gemma`, `cuantizacion` `Q4_0`, 13 tareas,
  `resumen.pareja.tokens_claude` 23786, `resumen.local.costo_usd` null, `resumen.revision`
  `{4, 0, 3}`; `T-103` tiene 2 revisiones; `UE-302` tiene `ambito` `unreal` y local 3.1;
  `FB-601` tiene 5 revisiones y 1 fallo con `quien` `pareja`; `W-202` tiene 1 fallo con
  `quien` `claude`.
- Qwen: `id` `qwen3.8-27b`, `etiqueta` `Qwen`, `cuantizacion` `IQ3_XXS`, 13 tareas,
  `resumen.pareja.nota` 9.5, `NET-501` con local 4.2 y pareja 3.2, y ninguna tarea con fallos.
- Un texto sin cabecera lanza un error.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] El parser devuelve 13 tareas para cada uno de los dos reportes de `data/raw/`
- [ ] Ningún campo de la salida del modelo Gemma contiene la palabra "Qwen" (el bug de la
      etiqueta no se propaga); la prueba lo verifica con `JSON.stringify(...).includes('Qwen')`
      sobre `id`, `nombre` y `etiqueta`

## Notas de revisión
Primer intento del worker agotó tokens de salida sin producir nada; segundo intento correcto. Fallo menor aceptado: líneas de resumen mal formadas lanzan TypeError en vez de Error con mensaje (los reportes son fijos).
