import { defineConfig, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin to rewrite Recharts' es-toolkit/compat/* CJS imports to use the ESM root entry.
// This prevents a known Rollup minification bug with CJS interop that causes "TypeError: t is not a function"
function esToolkitCompatPlugin(): Plugin {
  return {
    name: 'es-toolkit-compat',
    enforce: 'pre' as const,
    async resolveId(source: string, importer: string | undefined) {
      if (source.startsWith('es-toolkit/compat/') && source !== 'es-toolkit/compat') {
        const name = source.replace('es-toolkit/compat/', '')
        const resolved = await this.resolve('es-toolkit/compat', importer, { skipSelf: true })
        if (resolved) {
          return `\0es-toolkit/compat/${name}?resolved=${resolved.id}`
        }
      }
      return null
    },
    load(id: string) {
      if (id.startsWith('\0es-toolkit/compat/')) {
        const [path, query] = id.split('?resolved=')
        const name = path.replace('\0es-toolkit/compat/', '')
        // es-toolkit/compat exports all functions as named exports.
        // We re-export the requested function as default to match the CJS behavior.
        return `export { ${name} as default } from '${query.replace(/\\/g, '/')}';`
      }
      return null
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
    esToolkitCompatPlugin(),
  ],
})

export default config
