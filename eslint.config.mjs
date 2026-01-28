import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  // Base do Next + TS
  ...nextVitals,
  ...nextTs,

  // Ignorar arquivos gerados
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Regras adicionais
  {
    plugins: {
      prettier,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      // Prettier como regra ESLint
      "prettier/prettier": "error",

      // Imports organizados
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
]);
