import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import fs from 'fs'
import path from 'path'


// Read package.json without using "assert { type: 'json' }"
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'))

// External dependencies (peerDependencies + react/jsx-runtime)
const external = (id) => {
  // Always externalize React and React DOM
  if (/^react($|\/)|^react-dom($|\/)/.test(id)) {
    return true
  }
  // Always externalize Next.js modules
  if (id.startsWith('next/')) {
    return true
  }
  // Externalize peer dependencies
  if (Object.keys(pkg.peerDependencies || {}).some(dep => id === dep || id.startsWith(dep + '/'))) {
    return true
  }
  return false
}

// Common plugin list
const plugins = [
  peerDepsExternal(),
  resolve({ 
    browser: true, 
    preferBuiltins: false,
    // Ensure we don't try to resolve React modules
    external: ['react', 'react-dom', 'react/jsx-runtime', 'next/navigation']
  }),
  commonjs({
    // Don't transform React modules
    exclude: ['react/**', 'react-dom/**']
  }),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['**/*.test.*', '**/__tests__/**/*'],
  }),
  json(), // allows importing JSON files
]

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins,
  },

  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins,
  },

  // UMD build (for CDN usage)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'ReactDynamicBreadcrumb',
      sourcemap: true,
      exports: 'named',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'jsxRuntime',
        'next/navigation': 'NextNavigation',
      },
    },
    external,
    plugins: [...plugins, terser()],
  },
]
