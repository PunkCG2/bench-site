// Textos de las secciones "Hallazgos" y "Metodología". Claves planas con
// punto. Los parámetros llevan las cifras ya formateadas; ninguna cifra se
// escribe aquí.
export default {
  es: {
    'hallazgos.titulo': 'Hallazgos',
    'metodologia.titulo': 'Metodología',
    'hallazgos.tokens.menos':
      'La pareja usa {n} % menos tokens de Claude que Claude solo.',
    'hallazgos.tokens.mas':
      'La pareja usa {n} % más tokens de Claude que Claude solo.',
    'hallazgos.tokens.igual':
      'La pareja usa los mismos tokens de Claude que Claude solo.',
    'hallazgos.tiempo.mas_lenta':
      'La pareja es {n} veces más lenta que Claude solo.',
    'hallazgos.tiempo.igual': 'La pareja tarda lo mismo que Claude solo.',
    'hallazgos.tiempo.mas_rapida':
      'La pareja es {n} veces más rápida que Claude solo.',
    'hallazgos.revision.mejora':
      'La revisión sube la nota del modelo local de {de} a {a}.',
    'hallazgos.revision.empeora':
      'La revisión baja la nota del modelo local de {de} a {a}.',
    'hallazgos.revision.igual': 'La revisión no cambia la nota: {de}.',
    'hallazgos.nota.una':
      'La tarea con menor nota del modelo local solo es {ids}, con {nota}.',
    'hallazgos.nota.varias':
      'Las tareas con menor nota del modelo local solo son {ids}, con {nota}.',
    'hallazgos.nota.uniforme':
      'Todas las tareas del modelo local solo obtuvieron {nota}.',
    'metodologia.texto':
      'El benchmark se hizo con {tareas} tareas reales y el revisor fue {revisor}. Las notas salen de los mismos tests reales del benchmark.',
  },
  en: {
    'hallazgos.titulo': 'Findings',
    'metodologia.titulo': 'Methodology',
    'hallazgos.tokens.menos':
      'The pair uses {n} % fewer Claude tokens than Claude only.',
    'hallazgos.tokens.mas':
      'The pair uses {n} % more Claude tokens than Claude only.',
    'hallazgos.tokens.igual':
      'The pair uses the same Claude tokens as Claude only.',
    'hallazgos.tiempo.mas_lenta':
      'The pair is {n} times slower than Claude only.',
    'hallazgos.tiempo.igual': 'The pair takes the same time as Claude only.',
    'hallazgos.tiempo.mas_rapida':
      'The pair is {n} times faster than Claude only.',
    'hallazgos.revision.mejora':
      'Review raises the local model score from {de} to {a}.',
    'hallazgos.revision.empeora':
      'Review lowers the local model score from {de} to {a}.',
    'hallazgos.revision.igual': 'Review does not change the score: {de}.',
    'hallazgos.nota.una':
      'The task with the lowest local-only score is {ids}, with {nota}.',
    'hallazgos.nota.varias':
      'The tasks with the lowest local-only score are {ids}, with {nota}.',
    'hallazgos.nota.uniforme':
      'All local-only tasks scored {nota}.',
    'metodologia.texto':
      'The benchmark was run on {tareas} real tasks with {revisor} as the reviewer. The scores come from the same real benchmark tests.',
  },
}
