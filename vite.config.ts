// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/kis-api": {
        target: "https://openapi.koreainvestment.com:29443", // 모의투자 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kis-api/, ""),
        secure: false,
      },
    },
  },
});
