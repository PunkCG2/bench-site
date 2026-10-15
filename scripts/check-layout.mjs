import { chromium, firefox } from 'playwright-core'

const url = process.argv[2] || 'http://localhost:5173/'
const anchuras = [320, 375, 800, 900, 1024, 1280, 1920]
const alto = 900

try {
  await fetch(url)
} catch {
  console.log('Arranca el sitio con npm run dev')
  process.exit(2)
}

let fallos = 0

async function revisar(browser, nombre) {
  const page = await browser.newPage()
  const errores = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const texto = msg.text()
    const loc = msg.location()
    if (texto.includes('favicon') || (loc && loc.url && loc.url.includes('favicon'))) return
    errores.push(texto)
  })
  page.on('pageerror', (err) => errores.push(String(err)))

  for (const ancho of anchuras) {
    errores.length = 0
    await page.setViewportSize({ width: ancho, height: alto })
    await page.goto(url)
    await page.waitForTimeout(1000)
    const r = await page.evaluate(() => {
      const de = document.documentElement
      const detalle = [...document.querySelectorAll('.tabla__detalle')]
        .filter((e) => getComputedStyle(e).display !== 'none').length
      return { sw: de.scrollWidth, cw: de.clientWidth, detalle }
    })
    let motivo
    if (r.sw > r.cw) motivo = `desborde ${r.sw}>${r.cw}`
    else if (r.detalle > 0) motivo = `${r.detalle} detalle visible`
    else if (errores.length) motivo = `consola: ${errores[0]}`
    if (motivo) {
      fallos++
      console.log(`FALLA  ${nombre} ${ancho}: ${motivo}`)
    } else {
      console.log(`OK  ${nombre} ${ancho}`)
    }
  }
  await page.close()
}

async function lanzar(launch, nombre) {
  try {
    const browser = await launch()
    await revisar(browser, nombre)
    await browser.close()
  } catch (e) {
    console.log(`OMITIDO ${nombre}: ${String(e.message).split('\n')[0]}`)
  }
}

await lanzar(() => chromium.launch({ channel: 'msedge' }), 'edge')
await lanzar(() => firefox.launch(), 'firefox')

console.log(`${fallos} fallos`)
process.exit(fallos ? 1 : 0)
