"use client";
import React, { useMemo } from "react";
import { NewDailyLogSheet } from "@/app/types";

// Define a type for valid status values
type DutyStatus = "off-duty" | "sleeper-berth" | "driving" | "on-duty";

const GraphGrid: React.FC<NewDailyLogSheet["graphData"]> = ({
  hourData,
  remarks,
}) => {
  // SVG dimensions and grid layout
  const svgWidth = 1200;
  const svgHeight = 320;
  const leftMargin = 120;
  const rightMargin = 100;
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
      <div className="graph-title-header">
        <h2 className="graph-title">24-Hour Duty Status Graph</h2>
        <p className="graph-subtitle">Electronic Logging Device (ELD) Record</p>
      </div>
      <svg
        width="100%"
        height={svgHeight}
        className="grid-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient for header */}
          <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#1e293b", stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "#334155", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#1e293b", stopOpacity: 1 }}
            />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for status lines */}
          <linearGradient
            id="offDutyGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#2563eb", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
            />
          </linearGradient>

          <linearGradient
            id="sleeperGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#7c3aed", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#8b5cf6", stopOpacity: 1 }}
            />
          </linearGradient>

          <linearGradient
            id="drivingGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#d97706", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#f59e0b", stopOpacity: 1 }}
            />
          </linearGradient>

          <linearGradient id="onDutyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#059669", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#10b981", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>

        {/* Header background with gradient */}
        <rect
          x="0"
          y="0"
          width={svgWidth}
          height={headerHeight}
          fill="url(#headerGradient)"
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

        {/* Grid background */}
        <rect
          x="0"
          y={headerHeight}
          width={svgWidth}
          height={svgHeight - headerHeight}
          fill="white"
        />

        {/* Row labels with background badges */}
        <g>
          <rect
            x={10}
            y={headerHeight + rowHeight / 2 - 14}
            width={leftMargin - 20}
            height={28}
            fill="#eff6ff"
            rx="6"
            stroke="#3b82f6"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x={leftMargin - 15}
            y={headerHeight + rowHeight / 2}
            textAnchor="end"
            fill="#1e40af"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            Off Duty
          </text>
        </g>

        <g>
          <rect
            x={10}
            y={headerHeight + rowHeight + rowHeight / 2 - 14}
            width={leftMargin - 20}
            height={28}
            fill="#f5f3ff"
            rx="6"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x={leftMargin - 15}
            y={headerHeight + rowHeight + rowHeight / 2}
            textAnchor="end"
            fill="#6d28d9"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            Sleeper Berth
          </text>
        </g>

        <g>
          <rect
            x={10}
            y={headerHeight + 2 * rowHeight + rowHeight / 2 - 14}
            width={leftMargin - 20}
            height={28}
            fill="#fffbeb"
            rx="6"
            stroke="#f59e0b"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x={leftMargin - 15}
            y={headerHeight + 2 * rowHeight + rowHeight / 2}
            textAnchor="end"
            fill="#b45309"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            Driving
          </text>
        </g>

        <g>
          <rect
            x={10}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 - 18}
            width={leftMargin - 20}
            height={36}
            fill="#f0fdf4"
            rx="6"
            stroke="#10b981"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x={leftMargin - 15}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 - 5}
            textAnchor="end"
            fill="#065f46"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            On Duty
          </text>
          <text
            x={leftMargin - 15}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 + 10}
            textAnchor="end"
            fill="#065f46"
            fontWeight="600"
            fontSize="11"
            dominantBaseline="middle"
          >
            (Not Driving)
          </text>
        </g>

        <g>
          <rect
            x={10}
            y={headerHeight + 4 * rowHeight + remarksHeight / 2 - 10 - 27}
            width={leftMargin - 20}
            height={28}
            fill="#f1f5f9"
            rx="6"
            stroke="#64748b"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x={leftMargin - 15}
            y={headerHeight + 4 * rowHeight + remarksHeight / 2 - 10 - 15}
            textAnchor="end"
            fill="#334155"
            fontWeight="bold"
            fontSize="13"
            dominantBaseline="middle"
          >
            REMARKS
          </text>
        </g>

        {/* Horizontal row dividers */}
        <line
          x1="0"
          y1={headerHeight}
          x2={svgWidth}
          y2={headerHeight}
          stroke="#1e293b"
          strokeWidth="2"
        />
        {Array.from({ length: 4 }, (_, i) => (
          <line
            key={`row-divider-${i}`}
            x1="0"
            y1={headerHeight + (i + 1) * rowHeight}
            x2={svgWidth}
            y2={headerHeight + (i + 1) * rowHeight}
            stroke="#475569"
            strokeWidth="2"
            opacity="0.9"
          />
        ))}

        {/* Vertical dividers */}
        <line
          x1={leftMargin}
          y1="50"
          x2={leftMargin}
          y2={headerHeight + 4 * rowHeight + remarksHeight + 50}
          stroke="#1e293b"
          strokeWidth="2"
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
              stroke={hour === 0 || hour === 24 ? "#1e293b" : "#2d3748"}
              strokeWidth={hour === 0 || hour === 24 ? "2" : "1.5"}
              strokeDasharray={hour === 0 || hour === 24 ? "none" : "2,4"}
              opacity={hour === 0 || hour === 24 ? "1" : "0.8"}
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
                      y2={headerHeight + row * rowHeight + 17}
                      stroke="#21262c"
                      strokeWidth="1.0"
                      opacity="0.75"
                    />
                    <line
                      x1={timeToX(hour + 0.5)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.5)}
                      y2={headerHeight + row * rowHeight + 25}
                      stroke="#21262c"
                      strokeWidth="1.5"
                      opacity="0.7"
                    />
                    <line
                      x1={timeToX(hour + 0.75)}
                      y1={headerHeight + row * rowHeight}
                      x2={timeToX(hour + 0.75)}
                      y2={headerHeight + row * rowHeight + 17}
                      stroke="#21262c"
                      strokeWidth="1"
                      opacity="0.75"
                    />
                  </React.Fragment>
                );
              }
              return null;
            })}
          </React.Fragment>
        ))}

        {/* Status segments (horizontal colored lines with gradients) */}
        {segments.map((segment, index) => {
          const startX = timeToX(segment.startTime);
          const endX = timeToX(segment.endTime);
          const y = statusToY[segment.status];

          const segmentColors: Record<DutyStatus, string> = {
            "off-duty": "url(#offDutyGradient)",
            "sleeper-berth": "url(#sleeperGradient)",
            driving: "url(#drivingGradient)",
            "on-duty": "url(#onDutyGradient)",
          };

          return (
            <g key={`segment-${index}`}>
              {/* Shadow line */}
              <line
                x1={startX}
                y1={y + 2}
                x2={endX}
                y2={y + 2}
                stroke="#000000"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.25"
              />
              {/* Main colored line with gradient */}
              <line
                x1={startX}
                y1={y}
                x2={endX}
                y2={y}
                stroke={segmentColors[segment.status]}
                strokeWidth="7"
                strokeLinecap="round"
                filter="url(#dropShadow)"
              />
            </g>
          );
        })}

        {/* Transitions (vertical colored lines with dots) */}
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
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.15"
              />
              {/* Main colored line */}
              <line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke="#475569"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#dropShadow)"
              />
              {/* Dots at transition points */}
              <circle
                cx={x}
                cy={y1}
                r="6"
                fill={transitionColors[transition.fromStatus]}
                stroke="white"
                strokeWidth="2.5"
                filter="url(#dropShadow)"
              />
              <circle
                cx={x}
                cy={y2}
                r="6"
                fill={transitionColors[transition.toStatus]}
                stroke="white"
                strokeWidth="2.5"
                filter="url(#dropShadow)"
              />
            </g>
          );
        })}

        {/* Remarks/location markers with pins */}
        {remarks?.map((remark, index) => {
          const x = timeToX(remark.time);
          const y = headerHeight + 4 * rowHeight + 30 - 15;

          return (
            <g key={`remark-${index}`}>
              {/* Pin marker */}
              <g
                transform={`translate(${x}, ${headerHeight + 4 * rowHeight + 10})`}
              >
                <circle
                  cx="0"
                  cy="0"
                  r="4"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="1.5"
                  filter="url(#dropShadow)"
                />
                <line
                  x1="0"
                  y1="4"
                  x2="0"
                  y2="20"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.7"
                />
              </g>
              {/* Location text */}
              <g transform={`translate(${x}, ${y}) rotate(45)`}>
                <text
                  x="0"
                  y="0"
                  fill="#dc2626"
                  fontWeight="600"
                  fontSize="11"
                  textAnchor="start"
                  filter="url(#dropShadow)"
                >
                  {remark.location}
                </text>
              </g>
            </g>
          );
        })}

        {/* Total Hours badges for each status */}
        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 30}
            y={headerHeight + rowHeight / 2 - 16}
            width={60}
            height={32}
            fill="#3b82f6"
            rx="16"
            opacity="0.95"
            filter="url(#dropShadow)"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="15"
            dominantBaseline="middle"
          >
            {totalHours["off-duty"].toFixed(1)}
          </text>
        </g>

        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 30}
            y={headerHeight + rowHeight + rowHeight / 2 - 16}
            width={60}
            height={32}
            fill="#8b5cf6"
            rx="16"
            opacity="0.95"
            filter="url(#dropShadow)"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="15"
            dominantBaseline="middle"
          >
            {totalHours["sleeper-berth"].toFixed(1)}
          </text>
        </g>

        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 30}
            y={headerHeight + 2 * rowHeight + rowHeight / 2 - 16}
            width={60}
            height={32}
            fill="#f59e0b"
            rx="16"
            opacity="0.95"
            filter="url(#dropShadow)"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + 2 * rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="15"
            dominantBaseline="middle"
          >
            {totalHours["driving"].toFixed(1)}
          </text>
        </g>

        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 30}
            y={headerHeight + 3 * rowHeight + rowHeight / 2 - 16}
            width={60}
            height={32}
            fill="#10b981"
            rx="16"
            opacity="0.95"
            filter="url(#dropShadow)"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + 3 * rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="15"
            dominantBaseline="middle"
          >
            {totalHours["on-duty"].toFixed(1)}
          </text>
        </g>

        <g>
          <rect
            x={svgWidth - rightMargin / 2 - 30}
            y={headerHeight + 4 * rowHeight + rowHeight / 2 - 16}
            width={60}
            height={32}
            fill="#475569"
            rx="16"
            opacity="0.95"
            filter="url(#dropShadow)"
          />
          <text
            x={svgWidth - rightMargin / 2}
            y={headerHeight + 4 * rowHeight + rowHeight / 2}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="15"
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
            "Roboto",
            "Oxygen",
            sans-serif;
          width: 100%;
          margin: 30px auto;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          // padding: 24px;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        // .eld-graph-container::before {
        //   content: '';
        //   position: absolute;
        //   top: 0;
        //   left: 0;
        //   right: 0;
        //   height: 4px;
        //   background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #f59e0b 50%, #10b981 75%, #3b82f6 100%);
        //   opacity: 0.8;
        // }

        .eld-graph-container:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(59, 130, 246, 0.1),
            0 0 30px rgba(59, 130, 246, 0.1);
        }

        .graph-title-header {
          padding: 20px 24px 16px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 12px 12px 0 0;
          margin: -1px -1px 0 -1px;
          border-bottom: 3px solid #1e40af;
        }

        .graph-title {
          color: #ffffff;
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          letter-spacing: -0.025em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .graph-subtitle {
          color: #e0e7ff;
          margin: 4px 0 0 0;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          letter-spacing: 0.025em;
        }

        .grid-svg {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          display: block;
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #fafbfc 50%,
            #f9fafb 100%
          );
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            inset 0 1px 2px rgba(0, 0, 0, 0.05),
            0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .grid-svg:hover {
          box-shadow:
            inset 0 1px 2px rgba(0, 0, 0, 0.05),
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        @media (max-width: 768px) {
          .eld-graph-container {
            padding: 16px;
            margin: 20px auto;
            border-radius: 12px;
          }

          .graph-title {
            font-size: 18px;
            margin-bottom: 16px;
          }

          .grid-svg {
            border-radius: 8px;
          }
        }

        @media print {
          .eld-graph-container {
            box-shadow: none;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
          }

          .eld-graph-container::before {
            display: none;
          }

          .grid-svg {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default GraphGrid;
