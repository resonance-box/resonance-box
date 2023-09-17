import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: 'src/synthesizers/soundfont2/processor.ts',
    output: {
      name: 'whiteNoiseProcessor',
      file: 'src/generated/synthesizers/soundfont2/processor.js',
      format: 'iife',
      sourcemap: true,
    },
    plugins: [typescript(), terser()],
  },
]
