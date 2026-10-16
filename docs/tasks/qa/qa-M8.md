# QA del hito M8 (revisión a ojo del autor, 2026-10-16)

| id | ítem | tipo | severidad | qué se espera | tarea | estado |
|---|---|---|---|---|---|---|
| S1 | LEEME poco amigable para GitHub; falta contar el experimento híbrido, alcances, desafíos y logros | ajuste | media | README.md y README.en.md (bilingüe) con capturas; el mapa del harness pasa a `docs/harness-mapa.md` | 043 | pendiente |
| S2 | Metodología debe avisar que las notas no son desempeño real ni comparativa precisa | ajuste | media | párrafo de aviso (es/en) en Metodología | 040 | hecho |
| S3 | En el detalle por tarea, Rondas debe ir al final a la derecha | ajuste | baja | Rondas es la última columna | 041 | pendiente |
| S4 | La frase del hero debe nombrar el modelo | ajuste | baja | "La pareja de Claude con <modelo> usa ..." | 042 | pendiente |

Decisiones del autor (S1): README.md nuevo y LEEME.md movido a docs/; bilingüe completo (README.md y README.en.md); 2 o 3 capturas con Playwright.
Esta ronda es la primera que usa el esquema nuevo del worker (intentos 1-2 sin razonamiento, `strip_thinking_attempts = 2`) en tareas reales.
