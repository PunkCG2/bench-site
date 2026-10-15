// Textos del hero. Claves planas con punto.
// `hero.frase` es la frase de conclusión para el caso base (reducción positiva,
// factor mayor que 1, nota que sube). Cada `hero.frase.*` es una variante
// completa para cuando uno de los tres resultados no es el base; se elige la
// variante más específica (nota > tiempo > tokens). Los parámetros llevan las
// cifras ya formateadas; ninguna cifra se escribe aquí.
export default {
  es: {
    'hero.frase':
      'La pareja usa {reduccion} % menos tokens de Claude que Claude solo, es {factor}× más lenta y sube la nota del modelo local de {de} a {a}.',
    'hero.frase.reduccion.mas':
      'La pareja usa {reduccion} % más tokens de Claude que Claude solo, es {factor}× más lenta y sube la nota del modelo local de {de} a {a}.',
    'hero.frase.reduccion.igual':
      'La pareja usa la misma cantidad de tokens de Claude que Claude solo, es {factor}× más lenta y sube la nota del modelo local de {de} a {a}.',
    'hero.frase.tiempo.igual':
      'La pareja usa {reduccion} % menos tokens de Claude que Claude solo, es igual de rápida que Claude solo y sube la nota del modelo local de {de} a {a}.',
    'hero.frase.tiempo.mas_rapida':
      'La pareja usa {reduccion} % menos tokens de Claude que Claude solo, es {factor}× más rápida que Claude solo y sube la nota del modelo local de {de} a {a}.',
    'hero.frase.nota.empeora':
      'La pareja usa {reduccion} % menos tokens de Claude que Claude solo, es {factor}× más lenta y baja la nota del modelo local de {de} a {a}.',
    'hero.frase.nota.igual':
      'La pareja usa {reduccion} % menos tokens de Claude que Claude solo, es {factor}× más lenta y no cambia la nota del modelo local: {de}.',

    'hero.cifra.tokens': 'tokens de Claude menos',
    'hero.cifra.tiempo': 'más lenta que Claude solo',
    'hero.cifra.nota': 'nota del modelo local',
  },
  en: {
    'hero.frase':
      'The pair uses {reduccion} % fewer Claude tokens than Claude only, is {factor}× slower and raises the local model score from {de} to {a}.',
    'hero.frase.reduccion.mas':
      'The pair uses {reduccion} % more Claude tokens than Claude only, is {factor}× slower and raises the local model score from {de} to {a}.',
    'hero.frase.reduccion.igual':
      'The pair uses the same amount of Claude tokens as Claude only, is {factor}× slower and raises the local model score from {de} to {a}.',
    'hero.frase.tiempo.igual':
      'The pair uses {reduccion} % fewer Claude tokens than Claude only, is as fast as Claude only and raises the local model score from {de} to {a}.',
    'hero.frase.tiempo.mas_rapida':
      'The pair uses {reduccion} % fewer Claude tokens than Claude only, is {factor}× faster than Claude only and raises the local model score from {de} to {a}.',
    'hero.frase.nota.empeora':
      'The pair uses {reduccion} % fewer Claude tokens than Claude only, is {factor}× slower and lowers the local model score from {de} to {a}.',
    'hero.frase.nota.igual':
      'The pair uses {reduccion} % fewer Claude tokens than Claude only, is {factor}× slower and does not change the local model score: {de}.',

    'hero.cifra.tokens': 'fewer Claude tokens',
    'hero.cifra.tiempo': 'slower than Claude only',
    'hero.cifra.nota': 'local model score',
  },
}
