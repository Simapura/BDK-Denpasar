import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/BDK-Denpasar/',
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
      {
        name: 'generate-singlefile-html',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const indexPath = path.resolve(distDir, 'index.html');
          if (!fs.existsSync(indexPath)) {
            return;
          }

          let html = fs.readFileSync(indexPath, 'utf-8');

          // Replace favicon link with inline SVG data URI for offline standalone use
          const inlineSvgFavicon =
            'data:image/svg+xml,' +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0D6B48"/><path d="M16 48h32v4H16zm4-6h24v4H20zm4-6h16v4H24zm4-16l4-10 4 10 8 14H20z" fill="#C99A2E"/></svg>'
            );
          html = html.replace(
            /<link\s+rel=["']icon["'][^>]*>/i,
            () => `<link rel="icon" type="image/svg+xml" href="${inlineSvgFavicon}" />`
          );

          // Inline all stylesheet <link> tags regardless of attribute order
          html = html.replace(/<link\b[^>]*>/gi, (tag: string) => {
            if (!/\brel=["']stylesheet["']/i.test(tag)) return tag;
            const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
            if (!hrefMatch) return tag;
            const relPath = hrefMatch[1].replace(/^\//, '');
            const cssFile = path.resolve(distDir, relPath);
            if (!fs.existsSync(cssFile)) return tag;
            const cssContent = fs
              .readFileSync(cssFile, 'utf-8')
              .replace(/<\/style/gi, '<\\/style');
            return `<style>\n${cssContent}\n</style>`;
          });

          // Extract & inline module <script> tags regardless of attribute order, placing before </body>
          const inlineModuleScripts: string[] = [];
          html = html.replace(/<script\b[^>]*>\s*<\/script>/gi, (tag: string) => {
            if (!/\btype=["']module["']/i.test(tag)) return tag;
            const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
            if (!srcMatch) return tag;
            const relPath = srcMatch[1].replace(/^\//, '');
            const jsFile = path.resolve(distDir, relPath);
            if (!fs.existsSync(jsFile)) return tag;
            const jsContent = fs
              .readFileSync(jsFile, 'utf-8')
              .replace(/<\/script/gi, '<\\/script');
            inlineModuleScripts.push(`<script type="module">\n${jsContent}\n</script>`);
            return '';
          });

          if (inlineModuleScripts.length > 0) {
            const joinedScripts = inlineModuleScripts.join('\n');
            if (/<\/body>/i.test(html)) {
              html = html.replace(/<\/body>/i, () => `${joinedScripts}\n  </body>`);
            } else {
              html += `\n${joinedScripts}`;
            }
          }

          const singleDistPath = path.resolve(distDir, 'simapura-bdk-denpasar-tunggal.html');
          fs.writeFileSync(singleDistPath, html, 'utf-8');

          const publicDir = path.resolve(__dirname, 'public');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, {recursive: true});
          }
          const singlePublicPath = path.resolve(publicDir, 'simapura-bdk-denpasar-tunggal.html');
          fs.writeFileSync(singlePublicPath, html, 'utf-8');
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
