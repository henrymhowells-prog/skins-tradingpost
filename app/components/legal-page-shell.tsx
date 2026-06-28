import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";

type LegalPageShellProps = {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  description,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#101116",
        color: "white",
        paddingBottom: "96px",
      }}
    >
      <LegalBackground />

      <Link
        href="/dashboard"
        style={{
          position: "relative",
          zIndex: 10,
          display: "inline-block",
          marginLeft: "96px",
          marginTop: "64px",
          color: "#f97316",
          fontSize: "14px",
          fontWeight: 900,
          textDecoration: "none",
        }}
      >
        ← Back to Dashboard
      </Link>

      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1000px",
          margin: "40px auto 0",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            lineHeight: "1",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}
        >
          <span style={{ color: "#f97316" }}>{getFirstTitleWord(title)}</span>{" "}
          <span>{getRemainingTitleWords(title)}</span>
        </h1>

        <p
          style={{
            marginTop: "18px",
            fontSize: "18px",
            color: "#e4e4e7",
          }}
        >
          {description}
        </p>

        <p
          style={{
            marginTop: "16px",
            fontSize: "14px",
            color: "#9ca3af",
          }}
        >
          Last updated: {lastUpdated}
        </p>
      </section>

      <section
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "980px",
          margin: "36px auto 0",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {children}
      </section>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          background: "rgba(8, 12, 18, 0.94)",
          backdropFilter: "blur(18px)",
        }}
      >
        <SiteFooter />
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const sectionNumber = getSectionNumber(title);
  const sectionTitle = removeSectionNumber(title);

  return (
    <section
      style={{
        width: "100%",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "14px",
        background: "rgba(0,0,0,0.55)",
        boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        padding: "28px 36px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr",
          gap: "28px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            borderRight: "1px solid rgba(255,255,255,0.2)",
            paddingRight: "24px",
            alignSelf: "stretch",
          }}
        >
          <p
            style={{
              color: "#f97316",
              fontSize: "42px",
              lineHeight: "1",
              fontWeight: 900,
            }}
          >
            {sectionNumber}
          </p>

          <div
            style={{
              width: "32px",
              height: "2px",
              background: "#f97316",
              marginTop: "16px",
            }}
          />
        </div>

        <div style={{ maxWidth: "760px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "white",
              marginBottom: "10px",
            }}
          >
            {sectionTitle}
          </h2>

          <div
            style={{
              fontSize: "16px",
              lineHeight: "1.65",
              color: "#d4d4d8",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: "#101116",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
        backgroundSize: "38px 38px",
      }}
    >
      {/* Left Blue Band */}
<div
  style={{
    position: "fixed",
    left: "-70px",
    top: "-10vh",
    width: "175px",
    height: "140vh",
    transform: "skewX(-12deg)",
    background: "#1e40af",
    zIndex: 0,
  }}
/>

      {/* Left Secondary Blue Band */}
<div
  style={{
    position: "fixed",
    left: "118px",
    top: 0,
    width: "58px",
    height: "100vh",
    transform: "skewX(-12deg)",
    background: "#1d4ed8",
    opacity: 0.95,
    zIndex: 0,
  }}
/>

      {/* Right Main Orange Band */}
      <div
        style={{
          position: "absolute",
          right: "-70px",
          top: 0,
          height: "120vh",
          width: "185px",
          transform: "skewX(-12deg)",
          background: "#ff6a00",
        }}
      />

      {/* Right Middle Orange Band */}
      <div
        style={{
          position: "absolute",
          right: "65px",
          top: 0,
          height: "120vh",
          width: "95px",
          transform: "skewX(-12deg)",
          background: "rgba(255,140,0,0.72)",
        }}
      />

      {/* Right Inner Orange Band */}
      <div
        style={{
          position: "absolute",
          right: "135px",
          top: 0,
          height: "120vh",
          width: "90px",
          transform: "skewX(-12deg)",
          background: "rgba(210,100,0,0.55)",
        }}
      />

      {/* Soft Orange Glow */}
      <div
        style={{
          position: "absolute",
          right: "150px",
          top: "-10%",
          width: "260px",
          height: "130%",
          background:
            "linear-gradient(to left, rgba(255,120,0,0.12), transparent)",
          filter: "blur(60px)",
        }}
      />

      {/* Soft Blue Glow */}
      <div
        style={{
          position: "absolute",
          left: "90px",
          top: "-10%",
          width: "260px",
          height: "130%",
          background:
            "linear-gradient(to right, rgba(37,99,235,0.10), transparent)",
          filter: "blur(60px)",
        }}
      />

      {/* BETA */}
      <div
        style={{
          position: "absolute",
          right: "110px",
          top: "40px",
          fontSize: "42px",
          fontWeight: 900,
          fontStyle: "italic",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        BETA
      </div>
    </div>
  );
}

function getSectionNumber(title: string) {
  const match = title.match(/^(\d+)/);
  return match ? match[1].padStart(2, "0") : "01";
}

function removeSectionNumber(title: string) {
  return title.replace(/^\d+\.?\s*/, "");
}

function getFirstTitleWord(title: string) {
  return title.split(" ")[0] || title;
}

function getRemainingTitleWords(title: string) {
  return title.split(" ").slice(1).join(" ");
}