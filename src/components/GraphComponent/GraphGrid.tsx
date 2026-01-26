"use client";
import React, { useMemo } from "react";
import { GraphDataProps } from "./types";

// Define a type for valid status values
type DutyStatus = "off-duty" | "sleeper-berth" | "driving" | "on-duty";

const GraphGrid: React.FC<GraphDataProps> = ({ hourData, remarks }) => {
  // SVG dimensions and grid layout
  const svgWidth = 100;
  const svgHeight = 320;
  const leftMargin = 100;
  const rightMargin = 80;
  const headerHeight = 50;
  const rowHeight = 40;
  const remarksHeight = 80;
  const gridWidth = svgWidth - leftMargin - rightMargin;
  const hourWidth = gridWidth / 24;

  // Convert time to X position (supporting fractional hours)
  const timeToX = (time: number) => leftMargin + time * hourWidth;

  // Map statuses to Y positions (center of row)
  const statusToY: Record<DutyStatus, number> = {
    "off-duty": headerHeight + rowHeight / 2,
    "sleeper-berth": headerHeight + rowHeight + rowHeight / 2,
    driving: headerHeight + 2 * rowHeight + rowHeight / 2,
    "on-duty": headerHeight + 3 * rowHeight + rowHeight / 2,
  };

  // Process status data to find segments and transitions
  const { segments, transitions } = useMemo(() => {
    // Sort the status entries by time
    const sortedStatuses = [...hourData].sort((a, b) => a.hour - b.hour);

    const segs: { status: DutyStatus; startTime: number; endTime: number }[] =
      [];
    const trans: {
      fromStatus: DutyStatus;
      toStatus: DutyStatus;
      hour: number;
    }[] = [];

    // Process each pair of consecutive status entries
    for (let i = 0; i < sortedStatuses.length - 1; i++) {
      const currentEntry = sortedStatuses[i];
      const nextEntry = sortedStatuses[i + 1];

      if (currentEntry.status) {
        // Add a segment from current time to next time
        segs.push({
          status: currentEntry.status as DutyStatus,
          startTime: currentEntry.hour,
          endTime: nextEntry.hour,
        });

        // Add a transition if the status changes
        if (nextEntry.status && currentEntry.status !== nextEntry.status) {
          trans.push({
            fromStatus: currentEntry.status as DutyStatus,
            toStatus: nextEntry.status as DutyStatus,
            hour: nextEntry.hour,
          });
        }
      }
    }

    // Handle the last entry (extend to 24 hours if it's before that)
    const lastEntry = sortedStatuses[sortedStatuses.length - 1];
    if (lastEntry.status && lastEntry.hour < 24) {
      segs.push({
        status: lastEntry.status as DutyStatus,
        startTime: lastEntry.hour,
        endTime: 24,
      });
    }

    return { segments: segs, transitions: trans };
  }, [hourData]);

  const totalHours = useMemo(() => {
    const hours: Record<DutyStatus, number> = {
      "off-duty": 0,
      "sleeper-berth": 0,
      driving: 0,
      "on-duty": 0,
    };

    segments.forEach((segment) => {
      const duration = segment.endTime - segment.startTime;
      hours[segment.status] += duration;
    });
    const total = Object.values(hours).reduce((sum, value) => sum + value, 0);

    return { ...hours, total };
  }, [segments]);

  return (
    <div className="eld-graph-container">
      <svg
        width={`${svgWidth}%`}
        height={svgHeight}
        className="grid-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient header background */}
        <defs>
          <linearGradient id="headerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#1e3a8a", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#2563eb", stopOpacity: 1 }}
            />
          </linearGradient>
          <linearGradient id="rowGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#f0f9ff", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#e0f2fe", stopOpacity: 1 }}
            />
          </linearGradient>
          <linearGradient id="rowGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#fef3c7", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#fde68a", stopOpacity: 1 }}
            />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Header background with gradient */}
        <rect
          x="0"
          y="0"
          width={svgWidth}
          height={headerHeight}
          fill="url(#headerGradient)"
          filter="url(#shadow)"
        />

        {/* Hours header */}
        {Array.from({ length: 25 }, (_, i) => {
          if (i === 0 || i === 24) {
            // Split Mid-night into two lines
            return (
              <React.Fragment key={`hour-${i}`}>
                <text
                  x={timeToX(i)}
                  y={headerHeight / 2 - 5}
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="14"
                >
                  Mid-
                </text>
                <text
                  x={timeToX(i)}
                  y={headerHeight / 2 + 15}
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="14"
                >
                  night
                </text>
              </React.Fragment>
            );
          } else {
            // Regular hour numbers
            return (
              <text
                key={`hour-${i}`}
                x={timeToX(i)}
                y={headerHeight / 2 + 20}
                textAnchor="middle"
                fill="white"
                fontWeight="bold"
                fontSize="14"
              >
                {i > 12 ? i % 12 || 12 : i === 12 ? "Noon" : i}
              </text>
            );
          }
        })}

        {/* Total Hours label */}
        <text
          x={svgWidth - rightMargin / 2}
          y={headerHeight / 2 - 5}
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="14"
        >
          Total
        </text>
        <text
          x={svgWidth - rightMargin / 2}
          y={headerHeight / 2 + 15}
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="14"
        >
          Hours
        </text>

        {/* Grid background with alternating row colors */}
        {/* Off Duty row */}
        <rect
          x="0"
          y={headerHeight}
          width={svgWidth}
          height={rowHeight}
          fill="url(#rowGradient1)"
        />
        {/* Sleeper Berth row */}
        <rect
          x="0"
          y={headerHeight + rowHeight}
          width={svgWidth}
          height={rowHeight}
          fill="#ffffff"
        />
        {/* Driving row */}
        <rect
          x="0"
          y={headerHeight + 2 * rowHeight}
          width={svgWidth}
          height={rowHeight}
          fill="url(#rowGradient2)"
        />
        {/* On Duty row */}
        <rect
          x="0"
          y={headerHeight + 3 * rowHeight}
          width={svgWidth}
          height={rowHeight}
          fill="#ffffff"
        />
        {/* Remarks row */}
        <rect
          x="0"
          y={headerHeight + 4 * rowHeight}
          width={svgWidth}
          height={remarksHeight}
          fill="#f9fafb"
        />

        {/* Row labels with icons and better styling */}
        <g>
          {/* Off Duty */}
          <rect
            x={5}
            y={headerHeight + rowHeight / 2 - 12}
            width={leftMargin - 15}
            height={24}
            fill="#3b82f6"
            rx="4"
            opacity="0.1"
          />
          <text
            x={leftMargin - 10}
            y={headerHeight + rowHeight / 2}
            textAnchor="end"
            fill="#1e40af"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            🛌 Off Duty
          </text>
        </g>
        <g>
          {/* Sleeper Berth */}
          <rect
            x={5}
            y={headerHeight + rowHeight + rowHeight / 2 - 12}
            width={leftMargin - 15}
            height={24}
            fill="#8b5cf6"
            rx="4"
            opacity="0.1"
          />
          <text
            x={leftMargin - 10}
            y={headerHeight + rowHeight + rowHeight / 2}
            textAnchor="end"
            fill="#6d28d9"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            😴 Sleeper Berth
          </text>
        </g>
        <g>
          {/* Driving */}
          <rect
            x={5}
            y={headerHeight + 2 * rowHeight + rowHeight / 2 - 12}
            width={leftMargin - 15}
            height={24}
            fill="#f59e0b"
            rx="4"
            opacity="0.1"
          />
          <text
            x={leftMargin - 10}
            y={headerHeight + 2 * rowHeight + rowHeight / 2}
            textAnchor="end"
            fill="#d97706"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            🚛 Driving
          </text>
        </g>
        <g>
          {/* On Duty */}
          <rect
            x={5}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 - 18}
            width={leftMargin - 15}
            height={36}
            fill="#10b981"
            rx="4"
            opacity="0.1"
          />
          <text
            x={leftMargin - 10}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 - 5}
            textAnchor="end"
            fill="#059669"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            ⚙️ On Duty
          </text>
          <text
            x={leftMargin - 10}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 + 10}
            textAnchor="end"
            fill="#059669"
            fontWeight="normal"
            fontSize="10"
            dominantBaseline="middle"
          >
            (Not Driving)
          </text>
        </g>
        <g>
          {/* Remarks */}
          <rect
            x={5}
            y={headerHeight + 4 * rowHeight + remarksHeight / 2 - 25 - 12}
            width={leftMargin - 15}
            height={24}
            fill="#6b7280"
            rx="4"
            opacity="0.1"
          />
          <text
            x={leftMargin - 10}
            y={headerHeight + 4 * rowHeight + remarksHeight / 2 - 10 - 15}
            textAnchor="end"
            fill="#374151"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            📍 REMARKS
          </text>
        </g>

        {/* Horizontal row dividers */}
        <line
          x1="0"
          y1={headerHeight}
          x2={svgWidth}
          y2={headerHeight}
          stroke="black"
          strokeWidth="1"
        />
        {Array.from({ length: 4 }, (_, i) => (
          <line
            key={`row-divider-${i}`}
            x1="0"
            y1={headerHeight + (i + 1) * rowHeight}
            x2={svgWidth}
            y2={headerHeight + (i + 1) * rowHeight}
            stroke="black"
            strokeWidth="1"
          />
        ))}

        {/* Vertical dividers */}
        <line
          x1={leftMargin}
          y1="50"
          x2={leftMargin}
          y2={headerHeight + 4 * rowHeight + remarksHeight + 50}
          stroke="black"
          strokeWidth="1"
        />

        {/* Hour grid lines and tick marks */}
        {Array.from({ length: 25 }, (_, hour) => (
          <React.Fragment key={`grid-hour-${hour}`}>
            {/* Vertical hour line */}
            <line
              x1={timeToX(hour)}
              y1={headerHeight}
              x2={timeToX(hour)}
              y2={headerHeight + 4 * rowHeight}
              stroke="black"
              strokeWidth="1"
              strokeDasharray={hour === 0 || hour === 24 ? "none" : "1,3"}
            />

            {/* Draw tick marks for each hour on each row */}
            {Array.from({ length: 4 }, (_, row) => {
              // Only draw ticks if not at the last hour position
              if (hour < 24) {
                return (
                  <React.Fragment key={`ticks-row-${row}-hour-${hour}`}>
                    {/* Four tick marks per hour (15-minute intervals) */}
                    <line
                      x1={timeToX(hour + 0.25)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.25)}
                      y2={headerHeight + row * rowHeight + 10}
                      stroke="black"
                      strokeWidth="1"
                    />
                    <line
                      x1={timeToX(hour + 0.5)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.5)}
                      y2={headerHeight + row * rowHeight + 15}
                      stroke="black"
                      strokeWidth="1"
                    />
                    <line
                      x1={timeToX(hour + 0.75)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.75)}
                      y2={headerHeight + row * rowHeight + 10}
                      stroke="black"
                      strokeWidth="1"
                    />
                  </React.Fragment>
                );
              }
              return null;
            })}
          </React.Fragment>
        ))}

        {/* Status segments with enhanced styling */}
        {segments.map((segment, index) => {
          const startX = timeToX(segment.startTime);
          const endX = timeToX(segment.endTime);
          const y = statusToY[segment.status];

          // Color based on status
          const segmentColors: Record<DutyStatus, string> = {
            "off-duty": "#3b82f6",
            "sleeper-berth": "#8b5cf6",
            driving: "#f59e0b",
            "on-duty": "#10b981",
          };

          return (
            <g key={`segment-${index}`}>
              {/* Shadow line */}
              <line
                x1={startX}
                y1={y + 1}
                x2={endX}
                y2={y + 1}
                stroke="#000000"
                strokeWidth="5"
                opacity="0.1"
              />
              {/* Main colored line */}
              <line
                x1={startX}
                y1={y}
                x2={endX}
                y2={y}
                stroke={segmentColors[segment.status]}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Transitions with gradient effect */}
        {transitions.map((transition, index) => {
          const x = timeToX(transition.hour);
          const y1 = statusToY[transition.fromStatus];
          const y2 = statusToY[transition.toStatus];

          const transitionColors: Record<DutyStatus, string> = {
            "off-duty": "#3b82f6",
            "sleeper-berth": "#8b5cf6",
            driving: "#f59e0b",
            "on-duty": "#10b981",
          };

          return (
            <g key={`transition-${index}`}>
              {/* Shadow line */}
              <line
                x1={x + 1}
                y1={y1}
                x2={x + 1}
                y2={y2}
                stroke="#000000"
                strokeWidth="5"
                opacity="0.1"
              />
              {/* Main transition line */}
              <line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={transitionColors[transition.fromStatus]}
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Transition dot at junction */}
              <circle
                cx={x}
                cy={y1}
                r="5"
                fill={transitionColors[transition.fromStatus]}
                stroke="white"
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y2}
                r="5"
                fill={transitionColors[transition.toStatus]}
                stroke="white"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Remarks/location markers */}
        {remarks.map((remark, index) => {
          const x = timeToX(remark.time);
          const y = headerHeight + 4 * rowHeight + 30 - 15;

          return (
            <g
              key={`remark-${index}`}
              transform={`translate(${x}, ${y}) rotate(45)`}
            >
              <text
                x="0"
                y="0"
                fill="#0078d4"
                fontWeight="bold"
                fontSize="12"
                textAnchor="start"
              >
                {remark.location}
              </text>
            </g>
          );
        })}

        {/* Total Hours for each status with colored badges */}
        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 25}
            y={headerHeight + rowHeight / 2 - 12}
            width={50}
            height={24}
            fill="#3b82f6"
            rx="12"
            opacity="0.9"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="14"
            dominantBaseline="middle"
          >
            {totalHours["off-duty"].toFixed(1)}
          </text>
        </g>
        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 25}
            y={headerHeight + rowHeight + rowHeight / 2 - 12}
            width={50}
            height={24}
            fill="#8b5cf6"
            rx="12"
            opacity="0.9"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="14"
            dominantBaseline="middle"
          >
            {totalHours["sleeper-berth"].toFixed(1)}
          </text>
        </g>
        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 25}
            y={headerHeight + 2 * rowHeight + rowHeight / 2 - 12}
            width={50}
            height={24}
            fill="#f59e0b"
            rx="12"
            opacity="0.9"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + 2 * rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="14"
            dominantBaseline="middle"
          >
            {totalHours["driving"].toFixed(1)}
          </text>
        </g>
        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 25}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 - 12}
            width={50}
            height={24}
            fill="#10b981"
            rx="12"
            opacity="0.9"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + 3 * rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="14"
            dominantBaseline="middle"
          >
            {totalHours["on-duty"].toFixed(1)}
          </text>
        </g>
        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 30}
            y={headerHeight + 4 * rowHeight + rowHeight / 2 - 14}
            width={60}
            height={28}
            fill="#1e3a8a"
            rx="14"
            opacity="0.9"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + 4 * rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="16"
            dominantBaseline="middle"
          >
            {totalHours.total.toFixed(1)}
          </text>
        </g>
      </svg>

      <style jsx>{`
        .eld-graph-container {
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          width: 100%;
          max-width: ${svgWidth}px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .graph-title {
          color: #1e3a8a;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
        }

        .grid-svg {
          border: 3px solid #e5e7eb;
          border-radius: 8px;
          display: block;
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
          transition: box-shadow 0.3s ease;
        }

        .grid-svg:hover {
          box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default GraphGrid;
