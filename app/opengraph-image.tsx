import { ImageResponse } from "next/og";

export const alt =
  "Veriq, a Des Moines web design, SEO, and conversion partner";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 64px 42px",
          backgroundColor: "#111111",
          backgroundImage:
            "linear-gradient(rgba(247,247,245,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(247,247,245,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "#f7f7f5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingBottom: 30,
            borderBottom: "1px solid rgba(247,247,245,0.16)",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "-0.035em",
          }}
        >
          <span style={{ display: "flex", color: "#4ef2f2" }}>V</span>
          <span>ERIQ</span>
        </div>

        <div
          style={{
            display: "flex",
            width: 1040,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#4ef2f2",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Des Moines digital studio
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              flexDirection: "column",
              fontSize: 82,
              fontWeight: 900,
              letterSpacing: "-0.035em",
              lineHeight: 0.92,
              textTransform: "uppercase",
            }}
          >
            <span>A digital presence</span>
            <span style={{ color: "#c3c8ca" }}>Unlike any other.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              color: "#f7f7f5",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            Web Design • SEO • Conversion
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(247,247,245,0.16)",
            color: "#aeb3b7",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          <span>DES MOINES, IOWA</span>
          <span style={{ letterSpacing: "0.02em" }}>veriqdigital.com</span>
        </div>
      </div>
    ),
    size,
  );
}
