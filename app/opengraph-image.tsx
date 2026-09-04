import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `Veriq — ${siteConfig.brandSlogan} Custom website design, SEO, and conversion.`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "46px 58px 40px",
        backgroundColor: "#f5f2ea",
        backgroundImage:
          "linear-gradient(rgba(17,17,17,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.035) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        color: "#111111",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "-0.045em",
          }}
        >
          VERIQ
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#5d6264",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: "#4fe3e5",
            }}
          />
          Des Moines, Iowa
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1040,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#4b5254",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Custom websites for growing businesses
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            flexDirection: "column",
            fontSize: 94,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 0.92,
            textTransform: "uppercase",
          }}
        >
          <span>CUSTOM WEBSITES.</span>
          <span style={{ color: "#616769" }}>THAT TURN LEADS</span>
          <span style={{ color: "#616769" }}>INTO CUSTOMERS.</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 850,
            color: "#4e5557",
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.45,
          }}
        >
          Strategy, design, development, and SEO. Websites built around your
          business, your customers, and the results you want.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 22,
          borderTop: "1px solid rgba(17,17,17,0.13)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 28,
            color: "#555b5d",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "flex",
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: "#4fe3e5",
              }}
            />
            Custom design
          </span>

          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "flex",
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: "#4fe3e5",
              }}
            />
            SEO ready
          </span>

          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "flex",
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: "#4fe3e5",
              }}
            />
            Conversion focused
          </span>
        </div>

        <div
          style={{
            display: "flex",
            color: "#111111",
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          veriqdigital.com
        </div>
      </div>
    </div>,
    size,
  );
}
