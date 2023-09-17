import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

const getPackageName = (): string => {
  return packageJson.name
}

const kebabToCamel = (str: string): string => {
  return str.replace(/-./g, (char) => char[1].toUpperCase())
}

const getFormattedPackageName = (): string => {
  return kebabToCamel(getPackageName().replace(/^@/, '').replace(/\//g, '-'))
}

module.exports = defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: getFormattedPackageName(),
      formats: ['es'],
      fileName: 'index',
    },
  },
})
