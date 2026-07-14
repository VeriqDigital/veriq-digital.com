import { ImageResponse } from "next/og";

export const alt =
  "Veriq, a Des Moines web design and custom software studio";
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
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "64px 72px",
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
            gap: "18px",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 42,
              height: 4,
              background: "#4ef2f2",
            }}
          />
          VERIQ
        </div>

        <div
          style={{
            position: "absolute",
            top: 76,
            right: 44,
            display: "flex",
            width: 430,
            height: 430,
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(78,242,242,0.36)",
            borderRadius: "50%",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 270,
              height: 270,
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(247,247,245,0.25)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #364348 0%, #172326 45%, #0b0d0e 76%)",
              boxShadow: "0 0 90px rgba(78,242,242,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#4ef2f2",
                boxShadow: "0 0 24px rgba(78,242,242,0.8)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 760,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#4ef2f2",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Independent digital studio
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              flexDirection: "column",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.055em",
              lineHeight: 0.94,
              textTransform: "uppercase",
            }}
          >
            <span>Websites &amp; software</span>
            <span style={{ color: "#8f9699" }}>built with purpose.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#aeb3b7",
            fontSize: 18,
          }}
        >
          <span>Des Moines, Iowa · Local &amp; remote projects</span>
          <span>veriqdigital.com</span>
        </div>
      </div>
    ),
    size,
  );
}
