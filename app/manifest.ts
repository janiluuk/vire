import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sparkki",
    short_name: "Sparkki",
    description:
      "Nordic tooling for reviving old computers — SSD, RAM, and Linux.",
    start_url: "/",
    display: "standalone",
    background_color: "#101214",
    theme_color: "#101214",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  };
}
