import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: (f) => f === 'es' ? 'index.js' : 'index.cjs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@tweenjs/tween.js'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  }
})
