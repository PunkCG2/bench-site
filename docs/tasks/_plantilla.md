---
id: NNN
estado: pendiente        # pendiente | en-curso | hecha | bloqueada
ejecuta: local           # local | claude
depende: []              # ids de tareas que deben estar hechas antes
hito: M1                 # hito al que pertenece (ver docs/progress/progress.md)
rondas: 0                # lo llena Claude al aprobar
---
# Titulo corto en imperativo

## Objetivo
Una o dos frases: que debe existir al terminar.

## Archivos en alcance
- ruta/archivo.js (crear | modificar)

## No tocar
- data/raw/

## Detalles
Lo que el worker necesita saber para no adivinar: formato de datos, nombres de funciones,
seccion de docs/diseno.md que aplica, etc. Maximo ~15 lineas y 3 archivos; si no cabe, partir la tarea
(textos y estilos / componente / pruebas).

## Criterios de aceptacion
- [ ] `npm test` pasa
- [ ] (hecho concreto y comprobable; contrastalo antes con lo que el diseno ya garantiza)

## Notas de revision
(las escribe Claude al aprobar)
