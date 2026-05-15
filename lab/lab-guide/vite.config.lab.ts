// =============================================================================
// Configuración Vite mínima usada exclusivamente por el contenedor `lab-guide`
// para producir la SPA estática que se sirve a través de Nginx en el alumno.
//
// Se mantiene aparte de `vite.config.ts` (configuración del entorno Manus)
// para evitar arrastrar plugins internos que requieren variables y rutas
// no disponibles fuera del sandbox de desarrollo.
// =============================================================================

import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// El Dockerfile copia este archivo a la raíz del workspace antes del build.
// Por eso `projectRoot` es directamente `import.meta.dirname`.
const projectRoot = import.meta.dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client", "src"),
      "@shared": path.resolve(projectRoot, "shared"),
    },
  },
  envDir: projectRoot,
  root: path.resolve(projectRoot, "client"),
  build: {
    outDir: path.resolve(projectRoot, "dist", "public"),
    emptyOutDir: true,
  },
});
