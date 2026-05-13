import { ImageResponse } from "next/og";

export const alt = "Sparkki";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Brand-aligned OG image — dark matte + electric yellow (DESIGN_SYSTEM.md). */
export default function OpenGraphImage({ params }: { params: { locale: string } }) {
  const isEn = params.locale === "en";
  const headline = isEn
    ? "Fast, dependable PCs from hardware you already own"
    : "Vanhoista koneista nopeita ja kestäviä";
  const sub = isEn
    ? "SSD, RAM, and Linux — reuse at home and at work."
    : "SSD, RAM ja Linux — uusiokäyttö kotiin ja yrityksille.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(145deg, #101214 0%, #171a1f 45%, #20242b 100%)",
          color: "#f3f4f6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#ffd54a",
            marginBottom: 16,
          }}
        >
          Sparkki
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, maxWidth: 960 }}>
          {headline}
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "#c9ced6", maxWidth: 960 }}>{sub}</div>
      </div>
    ),
    { ...size },
  );
}
