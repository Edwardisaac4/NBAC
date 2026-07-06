'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
}

const yearlyData: ChartDataPoint[] = [
  { label: 'Jan', value: 240 },
  { label: 'Feb', value: 380 },
  { label: 'Mar', value: 450 },
  { label: 'Apr', value: 620 },
  { label: 'May', value: 780 },
  { label: 'Jun', value: 850 },
  { label: 'Jul', value: 920 },
  { label: 'Aug', value: 1040 },
  { label: 'Sep', value: 1100 },
  { label: 'Oct', value: 1150 },
  { label: 'Nov', value: 1204 }
];

const monthlyData: ChartDataPoint[] = [
  { label: 'W1', value: 1040 },
  { label: 'W2', value: 1080 },
  { label: 'W3', value: 1140 },
  { label: 'W4', value: 1204 }
];

export function RegistrationsChart() {
  const [timeframe, setTimeframe] = useState<'30D' | '12M'>('12M');
  const data = timeframe === '12M' ? yearlyData : monthlyData;

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(500);
  const chartHeight = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  // Update chart width on window resize
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      setChartWidth(containerRef.current?.clientWidth || 500);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const xMax = chartWidth - padding.left - padding.right;
  const yMax = chartHeight - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1500) * 1.1; // scale slightly above max
  const minVal = 0;

  // Map data to SVG coordinates
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * xMax;
    const y = padding.top + yMax - ((d.value - minVal) / (maxVal - minVal)) * yMax;
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
  const fillPath = curvePath ? `${curvePath} L ${points[points.length - 1].x} ${padding.top + yMax} L ${points[0].x} ${padding.top + yMax} Z` : '';

  // Handle mouse move to display tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find the closest point based on X coordinate
    let closest = points[0];
    let minDist = Math.abs(points[0].x - mouseX);

    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - mouseX);
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

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div ref={containerRef} className="bg-nbac-panel border border-nbac-border rounded-lg p-5 flex flex-col select-none h-full">
      {/* Title & Timeframe controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans text-sm font-semibold text-nbac-text">
          Registrations Over Time
        </h3>
        <div className="flex items-center gap-1.5 border border-nbac-border bg-[#0b0f10]/60 p-0.5 rounded-lg text-xs font-sans">
          <button
            onClick={() => setTimeframe('30D')}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all duration-200",
              timeframe === '30D'
                ? "bg-nbac-panel text-nbac-gold border border-nbac-border shadow-md"
                : "text-nbac-muted hover:text-nbac-text"
            )}
          >
            30D
          </button>
          <button
            onClick={() => setTimeframe('12M')}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all duration-200",
              timeframe === '12M'
                ? "bg-nbac-panel text-nbac-gold border border-nbac-border shadow-md"
                : "text-nbac-muted hover:text-nbac-text"
            )}
          >
            12M
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex-1">
        <svg
          width="100%"
          height={chartHeight}
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Definitions for Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="chartGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dfb76c" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#dfb76c" stopOpacity="0.00" />
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

          {/* Left Y-Axis labels */}
          {[1.2, 0.8, 0.4, 0].map((val, i) => {
            const y = padding.top + (i / 3) * yMax + 4;
            const labelValue = Math.round((val * maxVal) / 1.2);
            const formattedLabel = labelValue >= 1000 ? `${(labelValue / 1000).toFixed(1)}k` : labelValue;
            return (
              <text
                key={i}
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                className="fill-nbac-muted font-sans text-[10px] tracking-wide"
              >
                {formattedLabel}
              </text>
            );
          })}

          {/* Bottom X-Axis labels */}
          {points.map((pt, i) => {
            // Render every label for 30D, or every second label for 12M to avoid clutter
            const shouldRender = timeframe === '30D' || i % 2 === 0 || i === points.length - 1;
            if (!shouldRender) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-nbac-muted font-sans text-[10px] tracking-wide"
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
            className="absolute z-10 bg-[#070b0c] border border-nbac-gold/30 px-3 py-2 rounded-lg text-xs font-sans shadow-xl pointer-events-none select-none text-nbac-text"
            style={{
              left: `${Math.min(hoveredPoint.x - 50, chartWidth - 120)}px`,
              top: `${Math.max(hoveredPoint.y - 50, 0)}px`
            }}
          >
            <div className="font-semibold text-nbac-gold-light mb-0.5">{hoveredPoint.label}</div>
            <div className="text-nbac-body font-light">
              <span className="font-medium text-nbac-text">{hoveredPoint.value.toLocaleString()}</span> Registrations
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
