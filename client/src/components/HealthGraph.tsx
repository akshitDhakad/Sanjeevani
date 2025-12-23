/**
 * Health Graph Component
 * Displays real-time health monitoring graphs
 */

import { useMemo } from 'react';
import type { HealthTrend } from '../services/health';

interface HealthGraphProps {
  trend: HealthTrend;
  height?: number;
  color?: string;
  showLabels?: boolean;
}

export function HealthGraph({
  trend,
  height = 120,
  color = 'primary',
  showLabels = true,
}: HealthGraphProps) {
  const { path, areaPath, points, width } = useMemo(() => {
    if (!trend.data || trend.data.length === 0) {
      return {
        path: '',
        areaPath: '',
        points: [],
        width: 400,
      };
    }

    const values = trend.data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const padding = range * 0.2; // 20% padding
    
    const chartMax = max + padding;
    const chartMin = Math.max(0, min - padding);
    const chartRange = chartMax - chartMin;
    
    const width = 400;
    const chartHeight = height - 40;
    const stepX = width / (trend.data.length - 1 || 1);
    
    const points = trend.data.map((point, index) => {
      const x = index * stepX;
      const normalizedValue = (point.value - chartMin) / chartRange;
      const y = chartHeight - normalizedValue * chartHeight;
      return { x, y, value: point.value };
    });
    
    // Create smooth path
    if (points.length === 0) {
      return {
        path: '',
        areaPath: '',
        points: [],
        width,
      };
    }

    let pathData = `M ${points[0]!.x} ${points[0]!.y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      if (prev && curr) {
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (curr.x - prev.x) / 2;
        const cp2y = curr.y;
        pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }
    }
    
    // Add area fill path
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const areaPath = lastPoint && firstPoint
      ? `${pathData} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`
      : '';
    
    return {
      path: pathData,
      areaPath,
      points,
      width,
    };
  }, [trend.data, height]);
  
  const colorClasses = {
    primary: {
      stroke: 'stroke-primary-600',
      fill: 'fill-primary-50',
      gradient: 'from-primary-500/20 to-primary-50/0',
    },
    green: {
      stroke: 'stroke-green-600',
      fill: 'fill-green-50',
      gradient: 'from-green-500/20 to-green-50/0',
    },
    blue: {
      stroke: 'stroke-blue-600',
      fill: 'fill-blue-50',
      gradient: 'from-blue-500/20 to-blue-50/0',
    },
    red: {
      stroke: 'stroke-red-600',
      fill: 'fill-red-50',
      gradient: 'from-red-500/20 to-red-50/0',
    },
    purple: {
      stroke: 'stroke-purple-600',
      fill: 'fill-purple-50',
      gradient: 'from-purple-500/20 to-purple-50/0',
    },
  };
  
  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
  
  return (
    <div className="relative">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" className={colors.fill} />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {showLabels && (
          <g className="text-gray-300">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - 40 - ratio * (height - 40);
              return (
                <line
                  key={ratio}
                  x1="0"
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.2"
                />
              );
            })}
          </g>
        )}
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#gradient-${color})`}
          className="opacity-30"
        />
        
        {/* Line */}
        <path
          d={path}
          fill="none"
          strokeWidth="2.5"
          className={colors.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            className={colors.stroke}
            fill="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* Labels */}
      {showLabels && trend.data.length > 0 && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{trend.data[0]?.date ? new Date(trend.data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
          <span>{trend.data[trend.data.length - 1]?.date ? new Date(trend.data[trend.data.length - 1]!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
        </div>
      )}
    </div>
  );
}
