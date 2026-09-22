'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  ReferenceArea,
  Cell
} from 'recharts';
import { getAirportName } from '@/lib/airports';

// Quadrant labels + very pale background tints (kept only for zone orientation,
// no longer used to color the points themselves — see getSeverityColor below)
const QUADRANT_BG = {
  congestion: { bg: 'rgba(245, 158, 11, 0.05)', label: '#b45309' }, // Amber
  bottleneck: { bg: 'rgba(239, 68, 68, 0.05)', label: '#b91c1c' },  // Red
  baseline: { bg: 'rgba(100, 116, 139, 0.04)', label: '#334155' }, // Slate
  recovery: { bg: 'rgba(16, 185, 129, 0.05)', label: '#047857' }   // Green
};

// --- Severity color scale -------------------------------------------------
// Instead of coloring points by which quadrant they fall in (which just repeats
// the x/y position and adds no new information), points are now colored by a
// continuous "net delay" score: departure delay + arrival delay. This is a
// diverging scale — blue for airports running ahead of schedule overall,
// slate for near-zero net delay, red for airports with the worst combined
// delay. It adds a channel that quadrant membership alone couldn't show
// (e.g. distinguishing a mild 5-min bottleneck from a severe 60-min one).
const SEVERITY_STOPS: [number, [number, number, number]][] = [
  [-40, [14, 165, 233]],   // sky-500 (ahead of schedule)
  [0, [148, 163, 184]],    // slate-400 (on time)
  [90, [220, 38, 38]]      // red-600 (severely delayed)
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getSeverityColor(dep: number, arr: number) {
  const score = dep + arr;
  const clamped = Math.max(SEVERITY_STOPS[0][0], Math.min(SEVERITY_STOPS[2][0], score));

  let lower = SEVERITY_STOPS[0];
  let upper = SEVERITY_STOPS[SEVERITY_STOPS.length - 1];
  for (let i = 0; i < SEVERITY_STOPS.length - 1; i++) {
    if (clamped >= SEVERITY_STOPS[i][0] && clamped <= SEVERITY_STOPS[i + 1][0]) {
      lower = SEVERITY_STOPS[i];
      upper = SEVERITY_STOPS[i + 1];
      break;
    }
  }

  const range = upper[0] - lower[0];
  const t = range === 0 ? 0 : (clamped - lower[0]) / range;
  const rgb = [0, 1, 2].map(i => Math.round(lerp(lower[1][i], upper[1][i], t)));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function getQuadrantTheme(dep: number, arr: number) {
  if (dep > 0 && arr > 0) return QUADRANT_BG.bottleneck;
  if (dep <= 0 && arr > 0) return QUADRANT_BG.congestion;
  if (dep > 0 && arr <= 0) return QUADRANT_BG.recovery;
  return QUADRANT_BG.baseline;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const fullName = getAirportName(data.name);
    const color = getSeverityColor(data.depDelay, data.arrDelay);

    return (
      <div style={{
        backgroundColor: 'var(--bg-panel, #ffffff)',
        border: '1px solid var(--border-hairline, #e2e8f0)',
        padding: '0.625rem 0.875rem',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '0.8125rem',
        lineHeight: '1.4'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color
          }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-ink, #0f172a)' }}>
            {data.name}
          </span>
          {fullName !== data.name && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted, #64748b)', fontSize: '0.8125rem' }}>
              ({fullName})
            </span>
          )}
        </div>
        <div style={{ color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0.5rem 0', fontSize: '0.75rem' }}>
          {data.volume?.toLocaleString()} total flights
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <div><strong>Avg Dep Delay:</strong> {data.depDelay.toFixed(1)} min</div>
          <div><strong>Avg Arr Delay:</strong> {data.arrDelay.toFixed(1)} min</div>
          <div><strong>Net Delay:</strong> {(data.depDelay + data.arrDelay).toFixed(1)} min</div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AirportDelayScatter({ data }: { data: any[] }) {
  const chartData = data
    .filter(d => d.avg_departure_delay !== null && d.avg_arrival_delay !== null)
    .map(d => ({
      name: d.airport_code,
      depDelay: Number(d.avg_departure_delay),
      arrDelay: Number(d.avg_arrival_delay),
      volume: Number(d.total_departures || 0) + Number(d.total_arrivals || 0)
    }))
    .filter(d => d.arrDelay <= 70 && d.depDelay <= 70 && d.arrDelay >= -20 && d.depDelay >= -20);

  return (
    <div style={{ width: '100%' }}>
      {/* Top Controls: axis note, size legend, severity color legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        padding: '0 0.25rem'
      }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
          Axes origin centered at 0 min delay
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Severity Color Legend (net delay) — primary encoding, shown first/most prominent */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-ink, #334155)',
            backgroundColor: 'var(--bg-panel, #f8fafc)',
            padding: '0.25rem 0.625rem',
            borderRadius: '4px',
            border: '1px solid var(--border-hairline, #e2e8f0)'
          }}>
            <span style={{ fontWeight: 700 }}>Net Delay:</span>
            <span style={{ fontWeight: 400 }}>Ahead</span>
            <div style={{
              width: 60,
              height: 8,
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgb(14,165,233) 0%, rgb(148,163,184) 35%, rgb(220,38,38) 100%)'
            }} />
            <span style={{ fontWeight: 400 }}>Delayed</span>
          </div>

          {/* Point Size Legend (flight volume) — secondary, visually subordinated */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.6875rem',
            color: 'var(--text-muted, #94a3b8)',
            padding: '0.25rem 0.375rem'
          }}>
            <span>Volume:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#94a3b8', opacity: 0.6 }} />
              <span>5k</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#94a3b8', opacity: 0.6 }} />
              <span>15k</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#94a3b8', opacity: 0.6 }} />
              <span>35k+</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)', padding: '0 0.25rem', marginBottom: '0.5rem' }}>
        Background shading = operational zone · point color = net delay (dep + arr)
      </div>

      {/* Square-ish container so the 1:1 parity line actually reads as 45 degrees */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', maxHeight: 480, minHeight: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 15, bottom: 30, left: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline, #e2e8f0)" />

            <XAxis
              type="number"
              dataKey="depDelay"
              domain={[-20, 70]}
              ticks={[-20, 0, 20, 40, 60]}
              stroke="var(--text-muted, #64748b)"
              tick={{ fill: 'var(--text-muted, #64748b)', fontSize: 11 }}
              label={{ value: 'Avg departure delay (min)', position: 'bottom', offset: 10, fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="arrDelay"
              domain={[-20, 70]}
              ticks={[-20, 0, 20, 40, 60]}
              stroke="var(--text-muted, #64748b)"
              tick={{ fill: 'var(--text-muted, #64748b)', fontSize: 11 }}
              label={{ value: 'Avg arrival delay (min)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-muted)', fontSize: 11 }}
            />

            {/* Smaller max radius + lower opacity to reduce overplotting in the dense cluster */}
            <ZAxis type="number" dataKey="volume" range={[14, 140]} name="Volume" />

            <Tooltip content={<CustomTooltip />} />

            {/* Quadrant Pale Background Fills (orientation only — points no longer duplicate this via color) */}
            <ReferenceArea
              x1={-20} x2={0} y1={0} y2={70}
              fill={QUADRANT_BG.congestion.bg}
              label={{ value: "DESTINATION CONGESTION", position: "insideTopLeft", fill: QUADRANT_BG.congestion.label, fontSize: 10, fontWeight: 700 }}
            />
            <ReferenceArea
              x1={0} x2={70} y1={0} y2={70}
              fill={QUADRANT_BG.bottleneck.bg}
              label={{ value: "SYSTEMIC BOTTLENECK", position: "insideTopRight", fill: QUADRANT_BG.bottleneck.label, fontSize: 10, fontWeight: 700 }}
            />
            <ReferenceArea
              x1={-20} x2={0} y1={-20} y2={0}
              fill={QUADRANT_BG.baseline.bg}
              label={{ value: "BASELINE EFFICIENCY", position: "insideBottomLeft", fill: QUADRANT_BG.baseline.label, fontSize: 10, fontWeight: 700 }}
            />
            <ReferenceArea
              x1={0} x2={70} y1={-20} y2={0}
              fill={QUADRANT_BG.recovery.bg}
              label={{ value: "EN-ROUTE RECOVERY", position: "insideBottomRight", fill: QUADRANT_BG.recovery.label, fontSize: 10, fontWeight: 700 }}
            />

            {/* Quadrant Crosshairs */}
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} />

            {/* True 45-degree parity line. Label sits just above the line's center
                (dy offset) so it clears both the "DESTINATION CONGESTION" corner
                label and the dense point cluster the line runs through. */}
            <ReferenceLine
              segment={[{ x: -20, y: -20 }, { x: 70, y: 70 }]}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: "1:1 delay parity",
                position: "center",
                fill: "#64748b",
                fontSize: 10,
                dy: -10
              }}
            />

            {/* Severity-Colored Scatter Nodes.
                NOTE: mixBlendMode:'multiply' was removed — with a diverging (blue-to-red)
                color scale, multiply blends overlapping hues into muddy purple/brown
                patches that read as a false third category rather than "denser here."
                Multiply only works cleanly for density when every point shares one hue.
                Density in the crowded 0-20min cluster is instead handled by plain
                opacity: low per-point alpha + a thin near-opaque stroke so individual
                points stay distinguishable while overlapping regions still read darker. */}
            <Scatter name="Airports" data={chartData}>
              {chartData.map((entry, index) => {
                const color = getSeverityColor(entry.depDelay, entry.arrDelay);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={0.4}
                    stroke={color}
                    strokeWidth={0.6}
                    strokeOpacity={0.85}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Bottom quadrant-swatch legend removed: it duplicated the on-chart corner
          labels but used quadrant colors that no longer match point color (which
          now encodes net delay, not quadrant), so it risked viewers trying to
          match legend swatches to point colors and failing. The corner labels +
          background tints on the chart itself already convey the zones. */}
    </div>
  );
}