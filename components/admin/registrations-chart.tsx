'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
}

/** One reservation row, reduced to the fields the chart needs. */
export interface RegistrationRecord {
  created_at: string;
  delegate_count: number | null;
}

interface RegistrationsChartProps {
  records: RegistrationRecord[];
  loading?: boolean;
}

// Approximate rendered tooltip width, used to keep it inside the plot bounds.
const TOOLTIP_WIDTH = 148;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Delegates on a reservation. A null count is one seat, matching the KPI maths. */
const seatsOf = (record: RegistrationRecord) => Number(record.delegate_count ?? 1) || 0;

/**
 * Round an axis maximum up to a readable 1 / 2 / 5 x 10^n boundary, so the
 * gridline labels stay whole numbers instead of things like "3.7".
 */
function niceCeil(value: number): number {
  if (value <= 0) return 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalised = value / magnitude;
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Trailing 12 calendar months, oldest first, summing delegates per month. */
function buildMonthlySeries(records: RegistrationRecord[]): ChartDataPoint[] {
  const now = new Date();
  const buckets: { key: string; label: string; value: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_LABELS[d.getMonth()],
      value: 0,
    });
  }

  const index = new Map(buckets.map((b, i) => [b.key, i]));

  for (const record of records) {
    const d = new Date(record.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const slot = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (slot !== undefined) buckets[slot].value += seatsOf(record);
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

/** Last 30 days as daily buckets, oldest first. */
function buildDailySeries(records: RegistrationRecord[]): ChartDataPoint[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  const buckets: { key: string; label: string; value: number }[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      label: `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`,
      value: 0,
    });
  }

  const index = new Map(buckets.map((b, i) => [b.key, i]));

  for (const record of records) {
    const d = new Date(record.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const slot = index.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    if (slot !== undefined) buckets[slot].value += seatsOf(record);
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

export function RegistrationsChart({ records, loading = false }: RegistrationsChartProps) {
  const [timeframe, setTimeframe] = useState<'30D' | '12M'>('12M');

  const data = useMemo(
    () => (timeframe === '12M' ? buildMonthlySeries(records) : buildDailySeries(records)),
    [records, timeframe]
  );

  const periodTotal = data.reduce((sum, d) => sum + d.value, 0);

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const plotRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(500);
  const [isCompact, setIsCompact] = useState(false);

  // Shorter plot on phones so the card doesn't dominate the scroll, and a tighter
  // left gutter because the y-axis labels are narrower than the desktop ones.
  const chartHeight = isCompact ? 180 : 240;
  const padding = {
    top: 20,
    right: isCompact ? 10 : 20,
    bottom: 30,
    left: isCompact ? 32 : 40,
  };
  const yLabelGap = isCompact ? 6 : 10;

  // Track the plot element itself. ResizeObserver also catches sidebar toggles and
  // grid reflows, which a window resize listener misses.
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      // Ignore zero-width reads (e.g. while an ancestor is hidden) so the layout
      // isn't briefly recalculated as if it were a very narrow screen.
      if (width <= 0) return;
      setChartWidth(width);
      setIsCompact(width < 420);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const xMax = chartWidth - padding.left - padding.right;
  const yMax = chartHeight - padding.top - padding.bottom;

  // Scale to the data rather than a fixed ceiling, with a floor of 4 so a single
  // registration doesn't render as a flat line pinned to the top of the plot.
  const maxVal = niceCeil(Math.max(...data.map((d) => d.value), 4));

  const points = data.map((d, i) => {
    const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * xMax : xMax / 2);
    const y = padding.top + yMax - (d.value / maxVal) * yMax;
    return { x, y, label: d.label, value: d.value };
  });

  // Create smooth bezier curve path
  const getCurvePath = () => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (2 * (next.x - curr.x)) / 3;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const curvePath = getCurvePath();
  const fillPath = curvePath
    ? `${curvePath} L ${points[points.length - 1].x} ${padding.top + yMax} L ${points[0].x} ${padding.top + yMax} Z`
    : '';

  // Resolve whichever data point is nearest the pointer's x position.
  const selectNearestPoint = (clientX: number, target: SVGSVGElement) => {
    if (points.length === 0) return;
    const rect = target.getBoundingClientRect();
    const localX = clientX - rect.left;

    let closest = points[0];
    let minDist = Math.abs(points[0].x - localX);

    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - localX);
      if (dist < minDist) {
        minDist = dist;
        closest = points[i];
      }
    }

    setHoveredPoint({
      x: closest.x,
      y: closest.y,
      label: closest.label,
      value: closest.value
    });
  };

  // Pointer events cover mouse, touch and pen from a single handler.
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    selectNearestPoint(e.clientX, e.currentTarget);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    selectNearestPoint(e.clientX, e.currentTarget);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const hasData = records.length > 0;

  return (
    <div className="bg-nbac-panel border border-nbac-border rounded-lg p-3.5 sm:p-5 flex flex-col select-none h-full min-w-0">
      {/* Title & Timeframe controls */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h3 className="font-sans text-[13px] sm:text-sm font-semibold text-nbac-text truncate">
            Registrations Over Time
          </h3>
          <p className="font-sans text-[11px] text-nbac-muted mt-0.5">
            {loading
              ? 'Loading…'
              : `${periodTotal.toLocaleString()} delegate${periodTotal === 1 ? '' : 's'} in the last ${
                  timeframe === '12M' ? '12 months' : '30 days'
                }`}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 border border-nbac-border bg-[#0b0f10]/60 p-0.5 rounded-lg text-xs font-sans">
          <button
            onClick={() => {
              setTimeframe('30D');
              setHoveredPoint(null);
            }}
            className={cn(
              "px-3.5 py-2 sm:py-1.5 rounded-md font-medium transition-all duration-200",
              timeframe === '30D'
                ? "bg-nbac-panel text-nbac-gold border border-nbac-border shadow-md"
                : "text-nbac-muted hover:text-nbac-text"
            )}
          >
            30D
          </button>
          <button
            onClick={() => {
              setTimeframe('12M');
              setHoveredPoint(null);
            }}
            className={cn(
              "px-3.5 py-2 sm:py-1.5 rounded-md font-medium transition-all duration-200",
              timeframe === '12M'
                ? "bg-nbac-panel text-nbac-gold border border-nbac-border shadow-md"
                : "text-nbac-muted hover:text-nbac-text"
            )}
          >
            12M
          </button>
        </div>
      </div>

      {/* SVG Canvas Area — the ref sits here so measurements exclude the card padding */}
      <div ref={plotRef} className="relative flex-1 min-w-0">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`Registrations over time, ${timeframe === '12M' ? 'last 12 months' : 'last 30 days'}`}
          className="block overflow-visible touch-pan-y"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
        >
          {/* Definitions for Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * yMax;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                className="stroke-nbac-border"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Left Y-Axis labels, derived from the live data ceiling */}
          {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => {
            const y = padding.top + (1 - ratio) * yMax + 4;
            const labelValue = ratio * maxVal;
            const formattedLabel =
              labelValue >= 1000 ? `${(labelValue / 1000).toFixed(1)}k` : Math.round(labelValue);
            return (
              <text
                key={i}
                x={padding.left - yLabelGap}
                y={y}
                textAnchor="end"
                className="fill-nbac-muted font-sans text-[9px] sm:text-[10px] tracking-wide"
              >
                {formattedLabel}
              </text>
            );
          })}

          {/* Bottom X-Axis labels */}
          {points.map((pt, i) => {
            // Thin the labels so they never collide: roughly six across the plot,
            // and always keep the most recent one.
            const step = Math.max(1, Math.ceil(points.length / (isCompact ? 4 : 6)));
            const shouldRender = i % step === 0 || i === points.length - 1;
            if (!shouldRender) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-nbac-muted font-sans text-[9px] sm:text-[10px] tracking-wide"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Gradient Fill under the line */}
          {fillPath && (
            <path
              d={fillPath}
              fill="url(#chartGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Smooth Stroke Curve Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            />
          )}

          {/* Active Hover vertical guide line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={padding.top + yMax}
              className="stroke-nbac-gold/30"
              strokeWidth={1}
            />
          )}

          {/* Active Hover dot */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={5}
              className="fill-[#0b0f10] stroke-nbac-gold"
              strokeWidth={2.5}
            />
          )}
        </svg>

        {/* Dynamic Tooltip overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-[#070b0c] border border-nbac-gold/30 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-sans shadow-xl pointer-events-none select-none text-nbac-text whitespace-nowrap"
            style={{
              // Centre on the point, then clamp to both edges of the plot.
              left: `${Math.max(0, Math.min(hoveredPoint.x - TOOLTIP_WIDTH / 2, chartWidth - TOOLTIP_WIDTH))}px`,
              top: `${Math.max(0, hoveredPoint.y - 50)}px`
            }}
          >
            <div className="font-semibold text-nbac-gold-light mb-0.5">{hoveredPoint.label}</div>
            <div className="text-nbac-body font-light">
              <span className="font-medium text-nbac-text">{hoveredPoint.value.toLocaleString()}</span>{' '}
              {hoveredPoint.value === 1 ? 'delegate' : 'delegates'}
            </div>
          </div>
        )}

        {/* Overlays for the states where the curve has nothing to say */}
        {(loading || !hasData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-nbac-panel/70 backdrop-blur-[1px] rounded-md">
            <span className="font-sans text-xs text-nbac-muted text-center px-4">
              {loading ? 'Loading registrations…' : 'No registrations recorded yet'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
