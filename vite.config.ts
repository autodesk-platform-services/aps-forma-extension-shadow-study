import { defineConfig, loadEnv } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, process.cwd(), ""),
    ...loadEnv(mode, path.resolve(process.cwd(), ".."), ""),
    ...loadEnv(mode, path.resolve(process.cwd(), "../temperature-api-quickstart"), ""),
  };

  const apiKey = env.FORTYGUARD_API_KEY || "";
  const targetUrl = env.FORTYGUARD_BASE_URL || "https://api.fortyguard.com";

  return {
    base: "./",
    plugins: [preact()],
    server: {
      port: 8081,
      cors: true,
      proxy: {
        "/api/fortyguard": {
          target: targetUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fortyguard/, ""),
          headers: apiKey ? { "api-key": apiKey } : {},
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (apiKey) {
                proxyReq.setHeader("api-key", apiKey);
              }
            });
          },
        },
      },
    },
    define: {
      "__FORTYGUARD_HAS_KEY__": JSON.stringify(Boolean(apiKey)),
    },
  };
});
