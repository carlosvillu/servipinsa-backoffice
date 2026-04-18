import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC_SVG = resolve(ROOT, 'public/favicon.svg')
const OUT_DIR = resolve(ROOT, 'public/icons')
const BACKGROUND = '#F4EFEA'

const TARGETS = [
  { size: 192, name: 'icon-192', padding: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  { size: 512, name: 'icon-512', padding: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  { size: 512, name: 'icon-maskable-512', padding: 0.2, background: BACKGROUND },
  { size: 180, name: 'apple-touch-icon-180', padding: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const svg = await readFile(SRC_SVG)

  for (const { size, name, padding, background } of TARGETS) {
    const inner = Math.round(size * (1 - padding * 2))
    const offset = Math.round((size - inner) / 2)

    const rendered = await sharp(svg, { density: 384 })
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    const out = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background,
      },
    })
      .composite([{ input: rendered, top: offset, left: offset }])
      .png()
      .toBuffer()

    const outPath = resolve(OUT_DIR, `${name}.png`)
    await writeFile(outPath, out)
    console.log(`✓ ${name}.png (${size}x${size})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
