// Veredicto de un modelo: cuatro semáforos y una conclusión global.
// Niveles: 'bien' | 'reservas' | 'mal'.
import { reduccionTokens, factorTiempo } from './metrics.js'

// Umbrales de cada eje. `bien`/`reservas` son los límites de corte:
// calidad y tiempo: diferencia/factor por debajo del umbral;
// ahorro y costo: porcentaje de ahorro por encima del umbral.
export const UMBRALES = {
  calidad: { bien: 0.5, reservas: 2 },
  ahorro: { bien: 50, reservas: 20 },
  costo: { bien: 30, reservas: 15 },
  tiempo: { bien: 6, reservas: 15 },
}

function nivelCalidad(dif) {
  const { bien, reservas } = UMBRALES.calidad
  if (dif <= bien) return 'bien'
  if (dif <= reservas) return 'reservas'
  return 'mal'
}

function nivelAhorro(pct) {
  const { bien, reservas } = UMBRALES.ahorro
  if (pct >= bien) return 'bien'
  if (pct >= reservas) return 'reservas'
  return 'mal'
}

function nivelCosto(pct) {
  const { bien, reservas } = UMBRALES.costo
  if (pct >= bien) return 'bien'
  if (pct >= reservas) return 'reservas'
  return 'mal'
}

function nivelTiempo(factor) {
  const { bien, reservas } = UMBRALES.tiempo
  if (factor <= bien) return 'bien'
  if (factor <= reservas) return 'reservas'
  return 'mal'
}

// Ahorro de la pareja frente a Claude solo en costo de API, en porcentaje.
// Con costo null o referencia 0 no se puede calcular: { nivel: null, pct: null }.
function costoDeApi(modelo) {
  const { pareja, claude } = modelo.resumen
  if (pareja.costo_usd === null || claude.costo_usd === null || claude.costo_usd === 0) {
    return { nivel: null, pct: null }
  }
  const pct = Math.round((1 - pareja.costo_usd / claude.costo_usd) * 100)
  return { nivel: nivelCosto(pct), pct }
}

export function veredicto(modelo) {
  const { pareja, claude } = modelo.resumen
  const dif = Number((claude.nota - pareja.nota).toFixed(1))
  const calidad = { nivel: nivelCalidad(dif), dif }
  const pctAhorro = reduccionTokens(modelo)
  const ahorro = { nivel: nivelAhorro(pctAhorro), pct: pctAhorro }
  const costo = costoDeApi(modelo)
  const factor = factorTiempo(modelo)
  const tiempo = { nivel: nivelTiempo(factor), factor }

  let conclusion
  if (calidad.nivel === 'mal' || ahorro.nivel === 'mal') {
    conclusion = 'no'
  } else if (
    calidad.nivel === 'bien' &&
    ahorro.nivel === 'bien' &&
    tiempo.nivel !== 'mal' &&
    costo.nivel !== 'mal'
  ) {
    conclusion = 'si'
  } else {
    conclusion = 'depende'
  }

  return { calidad, ahorro, costo, tiempo, conclusion }
}
