// scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'

const icon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#1a56db"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-weight="800" font-size="240" fill="#ffffff">G</text>
  <circle cx="378" cy="150" r="26" fill="#d97706"/>
</svg>`

const maskable = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1a56db"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-weight="800" font-size="190" fill="#ffffff">G</text>
  <circle cx="360" cy="165" r="22" fill="#d97706"/>
</svg>`

await mkdir('public/icons', { recursive: true })

await sharp(Buffer.from(icon))
  .resize(192, 192)
  .png()
  .toFile('public/icons/icon-192.png')
await sharp(Buffer.from(icon))
  .resize(512, 512)
  .png()
  .toFile('public/icons/icon-512.png')
await sharp(Buffer.from(maskable))
  .resize(192, 192)
  .png()
  .toFile('public/icons/icon-maskable-192.png')
await sharp(Buffer.from(maskable))
  .resize(512, 512)
  .png()
  .toFile('public/icons/icon-maskable-512.png')

console.log('Icons written to public/icons/')
