import { useMemo, useState, useEffect } from "react";

const SCALES = {
  blue: (t) => `hsl(${210 + t * 15}, ${30 + t * 65}%, ${85 - t * 48}%)`,
  teal: (t) => `hsl(${175 - t * 20}, ${25 + t * 70}%, ${88 - t * 50}%)`,
  amber: (t) => `hsl(${48 - t * 22}, ${30 + t * 68}%, ${90 - t * 52}%)`,
  rose: (t) => `hsl(${350 + t * 10}, ${25 + t * 72}%, ${90 - t * 52}%)`,

  "blue-light": (t) => `hsl(${210 + t * 15}, ${15 + t * 55}%, ${96 - t * 35}%)`,
  "teal-light": (t) => `hsl(${175 - t * 20}, ${15 + t * 55}%, ${96 - t * 35}%)`,
  "amber-light": (t) => `hsl(${48 - t * 22}, ${20 + t * 50}%, ${96 - t * 35}%)`,
  "rose-light": (t) => `hsl(${350 + t * 10}, ${15 + t * 55}%, ${96 - t * 35}%)`,
};

function contrastText(hslStr) {
  const m = hslStr.match(/,(\d+(?:\.\d+)?)%\)/);
  if (!m) return "#1a1a2e";
  return parseFloat(m[1]) > 65 ? "#1a1a2e" : "#ffffff";
}

const TOKENS = {
  dark: {
    titleColor: "#f8fafd",
    subtitleColor: "#64748b",
    labelColor: "#f8fafd",
    labelHighlight: "#84c4f2",
    legendText: "#94a3b8",
    connectorStroke: "#cbd5e1",
    hoverFill: "#c0c4ce55",
    segmentStroke: "#ffffff",
  },
  light: {
    titleColor: "#0f172a",
    subtitleColor: "#475569",
    labelColor: "#1e293b",
    labelHighlight: "#4ea2de",
    legendText: "#64748b",
    connectorStroke: "#94a3b8",
    hoverFill: "#00000222",
    segmentStroke: "#ffffff",
  },
};

export default function BloomPyramid({
  data,
  title,
  subtitle,
  width = "100%",
  height = 640,
  colorScale = "blue",
  showValues = true,
  showLegend = true,
  onSegmentClick,
  highlightLevel = -1,
}) {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const tk = TOKENS[prefersDark ? "dark" : "light"];
  const colorFn =
    SCALES[!prefersDark ? `${colorScale}-light` : colorScale] ?? SCALES.blue;

  const labelToLevel = {
    Remember: 0,
    Understand: 1,
    Apply: 2,
    Analyze: 3,
    Evaluate: 4,
    Create: 5,
  };

  const PAD_TOP = title ? 72 : 16;
  const PAD_BOTTOM = showLegend ? 72 : 30;
  const PAD_H = 64;
  const LABEL_W = 200;
  const GAP = 1;

  const pyramidW = 700;
  const pyramidH = height - PAD_TOP - PAD_BOTTOM;
  const n = data.length;
  const sliceH = n > 0 ? (pyramidH - GAP * (n - 1)) / n : 0;

  const vals = data.map((d) => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = maxVal - minVal || 1;

  const segments = useMemo(() => {
    return data.map((item, i) => {
      const topFrac = i / n;
      const botFrac = (i + 1) / n;
      const halfTop = (pyramidW / 2) * topFrac;
      const halfBot = (pyramidW / 2) * botFrac;
      const y = PAD_TOP + i * (sliceH + GAP);
      const cx = LABEL_W + PAD_H + pyramidW / 2;
      const x1 = cx - halfTop,
        x2 = cx + halfTop;
      const x3 = cx + halfBot,
        x4 = cx - halfBot;
      const t = (item.value - minVal) / range;
      const fill = colorFn(t);
      const textCol = contrastText(fill);
      return {
        ...item,
        i,
        x1,
        x2,
        x3,
        x4,
        y,
        midY: y + sliceH / 2,
        midX: cx,
        fill,
        textCol,
        t,
      };
    });
  }, [
    data,
    n,
    pyramidW,
    sliceH,
    PAD_TOP,
    GAP,
    minVal,
    range,
    colorFn,
    LABEL_W,
    PAD_H,
  ]);

  const totalSvgW = LABEL_W + PAD_H + pyramidW + PAD_H;

  const [totalQuestions, setTotalQuestions] = useState(0);
  useEffect(() => {
    const total = data.reduce((acc, level) => acc + level.value, 0);
    setTotalQuestions(total);
  }, [data]);

  const LEGEND_STOPS = 6;
  const legendStops = Array.from({ length: LEGEND_STOPS }, (_, i) => ({
    t: i / (LEGEND_STOPS - 1),
    color: colorFn(i / (LEGEND_STOPS - 1)),
  }));

  return (
    <div
      style={{
        width,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {(title || subtitle) && (
        <div
          style={{
            padding: "16px 10px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {title && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: tk.titleColor,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 14, color: tk.subtitleColor }}>
              {subtitle}
            </span>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${totalSvgW} ${height}`}
        width="100%"
        height={height}
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
              <stop offset="0%" stopColor={colorFn(Math.min(1, s.t + 0.12))} />
              <stop offset="100%" stopColor={s.fill} />
            </linearGradient>
          ))}
          <filter id="seg-shadow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.1" />
          </filter>
        </defs>

        {segments.map((s) => {
          const points = `${s.x1},${s.y} ${s.x2},${s.y} ${s.x3},${s.y + sliceH} ${s.x4},${s.y + sliceH}`;
          const isHighlighted = highlightLevel === labelToLevel[s.label];
          const labelCol = isHighlighted ? tk.labelHighlight : tk.labelColor;

          return (
            <g
              key={s.i}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              onClick={() => onSegmentClick?.(s, s.i)}
            >
              <polygon
                points={points}
                fill={`url(#grad-${s.i})`}
                stroke={tk.segmentStroke}
                strokeWidth={GAP}
                filter="url(#seg-shadow)"
              />

              {/* Hover overlay */}
              <polygon
                points={points}
                fill="transparent"
                stroke={prefersDark ? "#000" : "#fff"}
                strokeWidth={GAP + 2}
                style={{ transition: "fill .15s" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.fill = tk.hoverFill)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.fill = "transparent")
                }
              />

              {showValues && sliceH >= 18 && (
                <text
                  x={s.midX}
                  y={s.midY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={s.textCol}
                  fontSize={Math.min(20, sliceH * 0.67)}
                  fontWeight="600"
                  fontFamily="'DM Sans','Segoe UI',sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {s.value}
                </text>
              )}

              {/* Stage label (left) */}
              <text
                x={LABEL_W + PAD_H - 12}
                y={s.midY - 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill={labelCol}
                fontSize={Math.min(20, sliceH * 0.67)}
                fontWeight="500"
                fontFamily="'DM Sans','Segoe UI',sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {s.label}
              </text>

              {/* Percentage label (right) */}
              <text
                x={LABEL_W + PAD_H + 720}
                y={s.midY + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill={labelCol}
                fontSize={Math.min(20, sliceH * 0.67)}
                fontWeight="500"
                fontFamily="'DM Sans','Segoe UI',sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {s.value !== 0
                  ? Math.round((s.value / totalQuestions) * 100)
                  : 0}
                %
              </text>

              {isHighlighted && (
                <line
                  x1={LABEL_W + PAD_H - 8}
                  y1={s.midY - 3}
                  x2={s.x1 - 1}
                  y2={s.midY - 3}
                  stroke={tk.connectorStroke}
                  strokeWidth={5}
                  strokeDasharray="3 2"
                />
              )}
            </g>
          );
        })}

        {showLegend && (
          <g
            transform={`translate(${LABEL_W + PAD_H},${height - PAD_BOTTOM + 28})`}
          >
            <text
              x={0}
              y={0}
              fill={tk.legendText}
              fontSize={15}
              fontFamily="'DM Sans','Segoe UI',sans-serif"
            >
              {minVal}
            </text>
            {legendStops.map((stop, idx) => (
              <rect
                key={idx}
                x={28 + idx * 28}
                y={-10}
                width={28}
                height={10}
                fill={stop.color}
                rx={
                  idx === 0
                    ? "3 0 0 3"
                    : idx === LEGEND_STOPS - 1
                      ? "0 3 3 0"
                      : "0"
                }
              />
            ))}
            <text
              x={28 + LEGEND_STOPS * 28 + 6}
              y={0}
              fill={tk.legendText}
              fontSize={15}
              fontFamily="'DM Sans','Segoe UI',sans-serif"
            >
              {maxVal}
            </text>
            <text
              x={88}
              y={30}
              textAnchor="middle"
              fill={tk.legendText}
              fontSize={20}
              fontFamily="'DM Sans','Segoe UI',sans-serif"
            >
              Intensity scale
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
