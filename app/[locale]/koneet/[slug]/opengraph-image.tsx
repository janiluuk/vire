import { ImageResponse } from "next/og";
import { findComputerModelBySlug } from "@/lib/koneet/computer-model-db";
import { compatibilityBadgeKey } from "@/lib/koneet/koneet-detail";

export const alt = "Sparkki compatibility";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function KoneetOgImage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const m = await findComputerModelBySlug(params.slug);
  const isEn = params.locale === "en";
  const name = m ? `${m.make} ${m.model}` : "Sparkki";
  const badgeKey = m ? compatibilityBadgeKey(m.compatible) : "compatUnknown";
  const badgeText = isEn
    ? badgeKey === "compatYes"
      ? "Compatible"
      : badgeKey === "compatNo"
        ? "Not recommended"
        : "Open"
    : badgeKey === "compatYes"
      ? "Sopii"
      : badgeKey === "compatNo"
        ? "Ei suositella"
        : "Avoin";
  const badgeColor =
    m?.compatible === true
      ? "#1df5a0"
      : m?.compatible === false
        ? "#ff6b6b"
        : "#f5a623";

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
          background:
            "linear-gradient(145deg, #101214 0%, #171a1f 45%, #20242b 100%)",
          color: "#f3f4f6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#ffd54a",
            marginBottom: 20,
          }}
        >
          Sparkki
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 1000,
            letterSpacing: "-0.02em",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: badgeColor,
            fontWeight: 700,
          }}
        >
          {badgeText}
        </div>
        <div style={{ marginTop: 20, fontSize: 22, color: "#8a93a2" }}>
          {isEn ? "Verified compatibility · SSD upgrade" : "Tarkistettu yhteensopivuus · SSD-päivitys"}
        </div>
      </div>
    ),
    { ...size },
  );
}
