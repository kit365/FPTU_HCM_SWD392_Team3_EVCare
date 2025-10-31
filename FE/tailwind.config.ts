import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const SIDEBAR_WIDTH = 270
const SIDEBAR_COLLAPSE = 70

const config: Config = {
  content: [
    "./src/components/**/*.{ts,tsx}",
    "./src/layouts/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        topbar: "120px",
      },
      width: {
        sidebar: `${SIDEBAR_WIDTH}px`,
        sidebarCollapse: `${SIDEBAR_COLLAPSE}px`,
      },
      margin: {
        sidebar: `${SIDEBAR_WIDTH}px`,
        sidebarCollapse: `${SIDEBAR_COLLAPSE}px`,
      },
      colors: {
        admin: {
          primary: "#22c55e",
          secondary: "#2b2d3b",
          body: "#f7f9fb",
        },
      },
      fontFamily: {
        secondary: ["Lexend Deca", "sans-serif"],
        third: ["Roboto", "sans-serif"]
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      const sidebar = theme("width.sidebar") as string
      const sidebarCollapse = theme("width.sidebarCollapse") as string
      const topbar = theme("height.topbar") as string

      addUtilities({
        ".w-content": { width: `calc(100% - ${sidebar})` },
        ".w-contentCollapse": { width: `calc(100% - ${sidebarCollapse})` },
        ".h-content": { height: `calc(100% - ${topbar})` },
        ".min-h-content": { minHeight: `calc(100% - ${topbar})` },

        ".ml-sidebar": { marginLeft: sidebar },
        ".ml-sidebarCollapse": { marginLeft: sidebarCollapse },

        ".mt-topbar": { marginTop: topbar },
      })
    }),
  ],
}

export default config
