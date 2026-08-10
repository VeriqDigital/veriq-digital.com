import { ImageResponse } from "next/og";

export const alt =
  "Veriq, a Des Moines web design, development, and growth partner";
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
            position: "absolute",
            top: 142,
            right: 54,
            display: "flex",
            width: 350,
            height: 350,
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(78,242,242,0.3)",
            borderRadius: "50%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 82,
              left: 20,
              display: "flex",
              width: 310,
              height: 186,
              border: "1px solid rgba(78,242,242,0.22)",
              borderRadius: "50%",
              transform: "rotate(-14deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 34,
              right: 46,
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#4ef2f2",
              boxShadow: "0 0 18px rgba(78,242,242,0.6)",
            }}
          />
          <div
            style={{
              display: "flex",
              width: 218,
              height: 218,
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(247,247,245,0.25)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #364348 0%, #172326 45%, #0b0d0e 76%)",
              boxShadow: "0 0 62px rgba(78,242,242,0.14)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#4ef2f2",
                boxShadow: "0 0 24px rgba(78,242,242,0.8)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 142,
            left: 64,
            display: "flex",
            width: 760,
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
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: "-0.035em",
              lineHeight: 0.92,
              textTransform: "uppercase",
            }}
          >
            <span>Digital systems</span>
            <span style={{ color: "#c3c8ca" }}>Built for growth.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              color: "#f7f7f5",
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            Web Design • Development • Growth
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
