// Footer discreto: una línea centrada con la leyenda.
// Inserta el DOM en `contenedor` y se actualiza solo al cambiar el idioma.

import { t, onLangChange } from '../i18n/index.js'

export function renderFooter(contenedor) {
  const footer = document.createElement('footer')
  footer.className = 'footer'

  const linea = document.createElement('p')
  linea.className = 'footer__leyenda'
  linea.textContent = t('footer.leyenda')
  footer.appendChild(linea)
  contenedor.appendChild(footer)

  const cancelar = onLangChange(() => {
    linea.textContent = t('footer.leyenda')
  })

  return {
    // Deja de escuchar los cambios de idioma.
    cancelar,
  }
}
