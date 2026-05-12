import { ImageResponse } from "next/og";

export const alt = "Vire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #ecfdf5 100%)",
          color: "#111827",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#1D9E75",
            marginBottom: 16,
          }}
        >
          Vire
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, maxWidth: 960 }}>{headline}</div>
        <div style={{ marginTop: 28, fontSize: 26, color: "#374151", maxWidth: 960 }}>{sub}</div>
      </div>
    ),
    { ...size },
  );
}
