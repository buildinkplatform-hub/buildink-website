import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buildink — Build Beyond Limits",
    short_name: "Buildink",
    description: "Construction marketplace and professional workspace.",
    start_url: "/it",
    display: "standalone",
    background_color: "#F5F7FB",
    theme_color: "#071A33",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
