---
id: NNN
estado: pendiente        # pendiente | en-curso | hecha | bloqueada
ejecuta: local           # local | claude
depende: []              # ids de tareas que deben estar hechas antes
rondas: 0                # lo llena Claude al aprobar
---
# Título corto en imperativo

## Objetivo
Una o dos frases: qué debe existir al terminar.

## Archivos en alcance
- ruta/archivo.js (crear | modificar)

## No tocar
- data/raw/

## Detalles
Lo que el worker necesita saber para no adivinar: formato de datos, nombres de funciones,
sección de docs/diseno.md que aplica, etc.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] (hecho concreto y comprobable)

## Notas de revisión
(las escribe Claude al aprobar)
