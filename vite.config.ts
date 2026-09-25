import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// defineConfig من vitest/config حتى يتم التعرّف على المفتاح test
// مع بقاء نفس الإعداد صالحاً لأمر vite build
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // الاختبارات تستخدم renderHook من testing-library الذي يحتاج DOM
    environment: "jsdom",
    // يتيح cleanup التلقائي لـ testing-library عبر afterEach
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
