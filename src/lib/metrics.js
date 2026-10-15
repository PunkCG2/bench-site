// Métricas derivadas de un modelo (forma de las tareas 003/004).
// Todas las funciones reciben el modelo o los valores ya extraídos;
// ninguna cifra se escribe a mano y ninguna oculta un resultado sin diferencia.

function tipoDiferencia(valor, referencia) {
  if (valor === referencia) return 'igual'
  return valor < referencia ? 'menos' : 'mas'
}

// Diferencia relativa en porcentaje entero de `valor` frente a `referencia`.
// Con `valor` o `referencia` null devuelve null. Con `referencia` 0 no se
// puede dar porcentaje: `{ tipo, valor: null }`.
export function diferencia(valor, referencia) {
  if (valor === null || referencia === null) return null
  const tipo = tipoDiferencia(valor, referencia)
  if (referencia === 0) return { tipo, valor: null }
  return { tipo, valor: Math.round((Math.abs(valor - referencia) / referencia) * 100) }
}

// Lo mismo que `diferencia` pero en puntos, con un decimal.
export function diferenciaNota(valor, referencia) {
  if (valor === null || referencia === null) return null
  const tipo = tipoDiferencia(valor, referencia)
  return { tipo, valor: Number(Math.abs(valor - referencia).toFixed(1)) }
}

// Porcentaje de tokens de Claude que ahorra la pareja frente a Claude solo.
// Entero; puede ser negativo si la pareja usa más tokens; no se recorta.
export function reduccionTokens(modelo) {
  const { pareja, claude } = modelo.resumen
  return Math.round((1 - pareja.tokens_claude / claude.tokens_claude) * 100)
}

// Cuántas veces más tarda la pareja que Claude solo.
// Entero; puede dar 1 o menos; no se recorta.
export function factorTiempo(modelo) {
  const { pareja, claude } = modelo.resumen
  return Math.round(pareja.tiempo_s / claude.tiempo_s)
}

// La menor nota local del modelo y los ids de todas las tareas que la tienen.
// Si todas las tareas tienen la misma nota local, `uniforme: true` e `ids`
// son todas las tareas.
export function notaMasBaja(modelo) {
  const min = Math.min(...modelo.tareas.map((t) => t.local))
  const ids = modelo.tareas.filter((t) => t.local === min).map((t) => t.id)
  if (modelo.tareas.every((t) => t.local === min)) {
    return { nota: min, ids, uniforme: true }
  }
  return { nota: min, ids }
}

// Cómo cambia la nota del modelo local al pasar a la pareja.
export function cambioPorRevision(modelo) {
  const de = modelo.resumen.local.nota
  const a = modelo.resumen.pareja.nota
  const tipo = a > de ? 'mejora' : a < de ? 'empeora' : 'igual'
  return { de, a, tipo }
}
