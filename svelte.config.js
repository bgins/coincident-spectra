import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    defaults: {
      style: "postcss",
    },
    postcss: true,
  }),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null
    }),
    vite: {
      resolve: {
        alias: {
          $components: resolve('./src/components'),
          $static: resolve('./static')
        }
      },
    }
  }
}

export default config
