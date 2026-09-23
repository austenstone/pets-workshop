// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const [repositoryOwner = 'octocat', repositoryName = 'pets-workshop'] =
  (process.env.GITHUB_REPOSITORY ?? 'octocat/pets-workshop').split('/');
const configuredBasePath = process.env.PAGES_BASE_PATH;
const defaultBasePath =
  repositoryName.toLowerCase() === `${repositoryOwner}.github.io`.toLowerCase()
    ? '/'
    : `/${repositoryName}`;
const basePath =
  configuredBasePath === undefined ? defaultBasePath : configuredBasePath || '/';
const site = process.env.PAGES_SITE ?? `https://${repositoryOwner}.github.io`;

export default defineConfig({
  output: 'static',
  site,
  base: basePath,
  trailingSlash: 'always',
  srcDir: './src-preview',
  publicDir: './public',
  outDir: './dist-pages',
  prerenderConflictBehavior: 'error',
  vite: {
    plugins: [tailwindcss()],
  },
});
