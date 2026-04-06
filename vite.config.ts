// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
