// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        bfcachetest: resolve(__dirname, "bfcachetest.html"),
      },
    },
  },
});
