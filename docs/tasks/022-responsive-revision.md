---
id: 022
status: done
runner: claude
depends: [021]
rounds: 0
---
# Revisión responsive con navegador real (Opera GX vía Playwright)

## Objetivo
Revisar el sitio en 320, 375, 800, 900, 1024, 1280 y 1920 px y corregir lo que se encontró.

## Hallazgos y correcciones
- En móvil los paneles de detalle aparecían abiertos: `display: block` de las filas anulaba `hidden` (regla `.tabla__detalle[hidden]`).
- Tabla móvil: etiqueta a la izquierda y valor a la derecha; las dos columnas "Tokens de Claude" ahora se distinguen (pareja / Claude solo).
- Indicador de apertura dibujado con bordes (el glifo ▸ casi no se veía).
- Gráfico en pantallas estrechas: etiqueta y valor en una línea, barra debajo.
- Hero en móvil: frase más pequeña. Texto "Rondas de revisión: {n}" (sin plural roto).
- `favicon` vacío para evitar el 404 en consola.

## Verificación
Sin desbordes horizontales de página en ninguna resolución (solo la cabecera oculta de la tabla móvil, que está recortada a propósito).
Carrusel a 375 y 800 px: flechas ← → y arrastre con mouse (probado con eventos de puntero) cambian de columna; los puntos siguen al índice.
Consola: sin errores.

## Notas de revisión
Hecho por Claude. 143 tests y build verificados.
