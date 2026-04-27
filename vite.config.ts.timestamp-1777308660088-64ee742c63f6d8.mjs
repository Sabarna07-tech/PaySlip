// vite.config.ts
import { defineConfig } from "file:///E:/PaySlip/node_modules/vite/dist/node/index.js";
import react from "file:///E:/PaySlip/node_modules/@vitejs/plugin-react/dist/index.js";
import { crx } from "file:///E:/PaySlip/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "PaySlip \u2014 Mini Payroll Calculator",
  version: "1.0.0",
  description: "Instant salary calculator with PDF payslips for small businesses.",
  action: {
    default_popup: "popup.html",
    default_icon: {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  icons: {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  permissions: ["storage"],
  host_permissions: ["https://api.lemonsqueezy.com/*"]
};

// vite.config.ts
import path from "path";
var __vite_injected_original_dirname = "E:\\PaySlip";
var vite_config_default = defineConfig({
  base: "",
  plugins: [
    react(),
    crx({ manifest: manifest_default })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  build: {
    outDir: "dist"
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    origin: "http://localhost:5173",
    hmr: {
      port: 5173
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXFBheVNsaXBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFBheVNsaXBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1BheVNsaXAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgY3J4IH0gZnJvbSBcIkBjcnhqcy92aXRlLXBsdWdpblwiO1xuaW1wb3J0IG1hbmlmZXN0IGZyb20gXCIuL21hbmlmZXN0Lmpzb25cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6IFwiXCIsXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGNyeCh7IG1hbmlmZXN0IH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogXCJkaXN0XCIsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIG9yaWdpbjogXCJodHRwOi8vbG9jYWxob3N0OjUxNzNcIixcbiAgICBobXI6IHtcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgfSxcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJtYW5pZmVzdF92ZXJzaW9uXCI6IDMsXG4gIFwibmFtZVwiOiBcIlBheVNsaXAgXHUyMDE0IE1pbmkgUGF5cm9sbCBDYWxjdWxhdG9yXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuMC4wXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJJbnN0YW50IHNhbGFyeSBjYWxjdWxhdG9yIHdpdGggUERGIHBheXNsaXBzIGZvciBzbWFsbCBidXNpbmVzc2VzLlwiLFxuICBcImFjdGlvblwiOiB7XG4gICAgXCJkZWZhdWx0X3BvcHVwXCI6IFwicG9wdXAuaHRtbFwiLFxuICAgIFwiZGVmYXVsdF9pY29uXCI6IHtcbiAgICAgIFwiMTZcIjogXCJpY29ucy9pY29uLTE2LnBuZ1wiLFxuICAgICAgXCI0OFwiOiBcImljb25zL2ljb24tNDgucG5nXCIsXG4gICAgICBcIjEyOFwiOiBcImljb25zL2ljb24tMTI4LnBuZ1wiXG4gICAgfVxuICB9LFxuICBcImljb25zXCI6IHtcbiAgICBcIjE2XCI6IFwiaWNvbnMvaWNvbi0xNi5wbmdcIixcbiAgICBcIjQ4XCI6IFwiaWNvbnMvaWNvbi00OC5wbmdcIixcbiAgICBcIjEyOFwiOiBcImljb25zL2ljb24tMTI4LnBuZ1wiXG4gIH0sXG4gIFwicGVybWlzc2lvbnNcIjogW1wic3RvcmFnZVwiXSxcbiAgXCJob3N0X3Blcm1pc3Npb25zXCI6IFtcImh0dHBzOi8vYXBpLmxlbW9uc3F1ZWV6eS5jb20vKlwiXVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvTixTQUFTLG9CQUFvQjtBQUNqUCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxXQUFXOzs7QUNGcEI7QUFBQSxFQUNFLGtCQUFvQjtBQUFBLEVBQ3BCLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLGFBQWU7QUFBQSxFQUNmLFFBQVU7QUFBQSxJQUNSLGVBQWlCO0FBQUEsSUFDakIsY0FBZ0I7QUFBQSxNQUNkLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGFBQWUsQ0FBQyxTQUFTO0FBQUEsRUFDekIsa0JBQW9CLENBQUMsZ0NBQWdDO0FBQ3ZEOzs7QURoQkEsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLElBQUksRUFBRSwyQkFBUyxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUNwQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
