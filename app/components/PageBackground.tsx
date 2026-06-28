type PageBackgroundProps = {
  showBeta?: boolean;
  leftOffset?: number;
};

export default function PageBackground({
  showBeta = true,
  leftOffset = 0,
}: PageBackgroundProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: `${leftOffset}px`,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#101116",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
        backgroundSize: "38px 38px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-70px",
          top: "-10vh",
          width: "175px",
          height: "140vh",
          transform: "skewX(-12deg)",
          background: "#1e40af",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "118px",
          top: 0,
          width: "58px",
          height: "100vh",
          transform: "skewX(-12deg)",
          background: "#1d4ed8",
          opacity: 0.95,
        }}
      />

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

      {showBeta && (
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
      )}
    </div>
  );
}