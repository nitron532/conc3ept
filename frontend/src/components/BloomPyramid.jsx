import { useMemo } from "react";

/**
 * PyramidChart — MUI Pro / AG Charts Enterprise–style pyramid chart
 *
 * Props:
 *  data        {Array<{ label: string, value: number }>}  Required. Levels top→bottom.
 *  title       {string}                                   Optional chart title.
 *  subtitle    {string}                                   Optional subtitle.
 *  width       {number|string}                            Container width  (default "100%").
 *  height      {number}                                   SVG height px    (default 420).
 *  colorScale  {"blue"|"teal"|"amber"|"rose"}             Heatmap palette  (default "blue").
 *  showValues  {boolean}                                  Inline value labels (default true).
 *  showLegend  {boolean}                                  Color-scale legend (default true).
 *  formatValue {(v: number) => string}                    Value formatter.
 *  onSegmentClick {(item, index) => void}                 Click callback.
 */

// ─── Colour scales (low→high saturation/brightness) ─────────────────────────
const SCALES = {
  blue: (t) => {
    // ice-blue  →  vivid cobalt
    const h = 210 + t * 15;
    const s = 30 + t * 65;
    const l = 85 - t * 48;
    return `hsl(${h},${s}%,${l}%)`;
  },
  teal: (t) => {
    const h = 175 - t * 20;
    const s = 25 + t * 70;
    const l = 88 - t * 50;
    return `hsl(${h},${s}%,${l}%)`;
  },
  amber: (t) => {
    const h = 48 - t * 22;
    const s = 30 + t * 68;
    const l = 90 - t * 52;
    return `hsl(${h},${s}%,${l}%)`;
  },
  rose: (t) => {
    const h = 350 + t * 10;
    const s = 25 + t * 72;
    const l = 90 - t * 52;
    return `hsl(${h},${s}%,${l}%)`;
  },
};

function contrastText(hslStr) {
  // Very rough luminance estimate from the L channel
  const m = hslStr.match(/,(\d+(?:\.\d+)?)%\)/);
  if (!m) return "#1a1a2e";
  return parseFloat(m[1]) > 55 ? "#1a1a2e" : "#ffffff";
}

export default function BloomPyramid({
  data = [],
  title,
  subtitle,
  width = "100%",
  height = 420,
  colorScale = "blue",
  showValues = true,
  showLegend = true,
  formatValue = (v) => v.toLocaleString(),
  onSegmentClick,
}) {
  // ─── Geometry ──────────────────────────────────────────────────────────────
  const PAD_TOP = title ? 72 : 16;
  const PAD_BOTTOM = showLegend ? 56 : 20;
  const PAD_H = 48;
  const LABEL_W = 140;
  const GAP = 3; // px gap between levels

  const svgH = height;
  const pyramidW = 560;
  const pyramidH = svgH - PAD_TOP - PAD_BOTTOM;

  const n = data.length;
  const totalH = pyramidH - GAP * (n - 1);
  const sliceH = n > 0 ? totalH / n : 0;

  // Normalise values for colour mapping
  const vals = data.map((d) => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = maxVal - minVal || 1;

  const colorFn = SCALES[colorScale] ?? SCALES.blue;

  const segments = useMemo(() => {
    return data.map((item, i) => {
      // Trapezoid: narrower at top, full width at bottom
      const topFrac = i / n;       // 0 → apex
      const botFrac = (i + 1) / n; // 1 → base

      const halfTop = (pyramidW / 2) * topFrac;
      const halfBot = (pyramidW / 2) * botFrac;

      const y = PAD_TOP + i * (sliceH + GAP);

      // Trapezoid points (centred on pyramidW/2 + LABEL_W + PAD_H)
      const cx = LABEL_W + PAD_H + pyramidW / 2;
      const x1 = cx - halfTop;
      const x2 = cx + halfTop;
      const x3 = cx + halfBot;
      const x4 = cx - halfBot;

      const t = (item.value - minVal) / range; // 0..1
      const fill = colorFn(t);
      const textCol = contrastText(fill);

      // Mid-Y of trapezoid for label
      const midY = y + sliceH / 2;
      // Mid-X is always cx
      const midX = cx;

      return { ...item, i, x1, x2, x3, x4, y, midY, midX, fill, textCol, t };
    });
  }, [data, n, pyramidW, sliceH, PAD_TOP, GAP, minVal, range, colorFn, LABEL_W, PAD_H]);

  const totalSvgW = LABEL_W + PAD_H + pyramidW + PAD_H;

  // ─── Legend gradient ───────────────────────────────────────────────────────
  const LEGEND_STOPS = 6;
  const legendStops = Array.from({ length: LEGEND_STOPS }, (_, i) => {
    const t = i / (LEGEND_STOPS - 1);
    return { t, color: colorFn(t) };
  });

  return (
    <div
      style={{
        width,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        // background: "#f8fafd",
        borderRadius: 12,
        // border: "1px solid #e0e7ef",
        // boxShadow:
        //   "0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05)",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* ── Toolbar row ── */}
      {(title || subtitle) && (
        <div
          style={{
            padding: "16px 20px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {title && (
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 12, color: "#64748b" }}>{subtitle}</span>
          )}
        </div>
      )}

      {/* ── Main SVG ── */}
      <svg
        viewBox={`0 0 ${totalSvgW} ${svgH}`}
        width="100%"
        height={svgH}
        style={{ display: "block" }}
        aria-label={title || "Pyramid chart"}
        role="img"
      >
        <defs>
          {segments.map((s) => (
            <linearGradient
              key={`grad-${s.i}`}
              id={`grad-${s.i}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={colorFn(Math.min(1, s.t + 0.12))}
              />
              <stop offset="100%" stopColor={s.fill} />
            </linearGradient>
          ))}
          <filter id="seg-shadow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.1" />
          </filter>
        </defs>

        {segments.map((s) => {
          const points = `${s.x1},${s.y} ${s.x2},${s.y} ${s.x3},${s.y + sliceH} ${s.x4},${s.y + sliceH}`;
          const isClickable = !!onSegmentClick;
          return (
            <g
              key={s.i}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onClick={() => onSegmentClick?.(s, s.i)}
            >
              {/* Segment shape */}
              <polygon
                points={points}
                fill={`url(#grad-${s.i})`}
                stroke="#ffffff"
                strokeWidth={GAP}
                filter="url(#seg-shadow)"
              />

              {/* Hover overlay */}
              <polygon
                points={points}
                fill="transparent"
                stroke="transparent"
                strokeWidth={GAP}
                style={{ transition: "fill .15s" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.fill = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.fill = "transparent")
                }
              />

              {/* Inline value label */}
              {showValues && sliceH >= 18 && (
                <text
                  x={s.midX}
                  y={s.midY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={s.textCol}
                  fontSize={Math.min(13, sliceH * 0.38)}
                  fontWeight="600"
                  fontFamily="'DM Sans','Segoe UI',sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {formatValue(s.value)}
                </text>
              )}

              {/* Left label */}
              <text
                x={LABEL_W + PAD_H - 12}
                y={s.midY + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#334155"
                fontSize={Math.min(12.5, sliceH * 0.36)}
                fontWeight="500"
                fontFamily="'DM Sans','Segoe UI',sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {s.label}
              </text>

              {/* Connector tick */}
              <line
                x1={LABEL_W + PAD_H - 8}
                y1={s.midY}
                x2={s.x1 - 1}
                y2={s.midY}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
            </g>
          );
        })}

        {/* ── Legend ── */}
        {showLegend && (
          <g transform={`translate(${LABEL_W + PAD_H},${svgH - PAD_BOTTOM + 14})`}>
            <text
              x={0}
              y={0}
              fill="#94a3b8"
              fontSize={10}
              fontFamily="'DM Sans','Segoe UI',sans-serif"
            >
              {formatValue(minVal)}
            </text>

            {legendStops.map((stop, idx) => (
              <rect
                key={idx}
                x={28 + idx * 28}
                y={-10}
                width={28}
                height={10}
                fill={stop.color}
                rx={idx === 0 ? "3 0 0 3" : idx === LEGEND_STOPS - 1 ? "0 3 3 0" : "0"}
              />
            ))}

            <text
              x={28 + LEGEND_STOPS * 28 + 6}
              y={0}
              fill="#94a3b8"
              fontSize={10}
              fontFamily="'DM Sans','Segoe UI',sans-serif"
            >
              {formatValue(maxVal)}
            </text>

            <text
              x={pyramidW / 2}
              y={18}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={10}
              fontFamily="'DM Sans','Segoe UI',sans-serif"
            >
              intensity scale
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}


// ─── Demo ────────────────────────────────────────────────────────────────────
// Uncomment below to preview in isolation:

/*
import { useState } from "react";

const DEMO_DATA = [
  { label: "Awareness",    value: 9800 },
  { label: "Interest",     value: 6200 },
  { label: "Consideration",value: 3800 },
  { label: "Intent",       value: 2100 },
  { label: "Purchase",     value:  980 },
];

export function PyramidDemo() {
  const [scale, setScale] = useState("blue");
  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        {["blue","teal","amber","rose"].map(s => (
          <button key={s} onClick={() => setScale(s)}
            style={{ padding:"4px 14px", borderRadius:6,
              background: scale===s?"#0f172a":"#e2e8f0", color: scale===s?"#fff":"#334155",
              border:"none", cursor:"pointer", fontSize:13 }}>
            {s}
          </button>
        ))}
      </div>
      <PyramidChart
        data={DEMO_DATA}
        title="Sales Funnel"
        subtitle="Quarterly pipeline · all channels"
        colorScale={scale}
        formatValue={v => v.toLocaleString()}
        onSegmentClick={(item) => alert(`${item.label}: ${item.value}`)}
      />
    </div>
  );
}
*/
