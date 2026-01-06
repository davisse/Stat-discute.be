'use client'

import * as React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

/**
 * DvPRadarChart - Aesthetic radar chart showing team defensive profile
 *
 * Features:
 * - Glow effect on team polygon (SVG filter)
 * - Gradient fill with transparency
 * - Inverted scale (smaller = better defense)
 * - League average as dashed overlay
 * - Custom position labels with rank badges
 * - Smooth entry animation
 */

export interface DvPRadarData {
  position: string
  positionFull: string
  pointsAllowed: number
  rank: number
  leagueAvg: number
  tier: 'elite' | 'good' | 'average' | 'below' | 'weak'
}

export interface DvPRadarChartProps {
  data: DvPRadarData[]
  teamAbbreviation: string
  className?: string
}

// Tier colors matching project theme
const TIER_COLORS = {
  elite: { bg: '#991b1b', border: '#dc2626', text: '#fecaca' },
  good: { bg: '#c2410c', border: '#ea580c', text: '#fed7aa' },
  average: { bg: '#52525b', border: '#71717a', text: '#d4d4d8' },
  below: { bg: '#047857', border: '#10b981', text: '#a7f3d0' },
  weak: { bg: '#0e7490', border: '#06b6d4', text: '#a5f3fc' },
}

// Custom position label with rank badge - simplified for mobile
function CustomPositionLabel({
  payload,
  x,
  y,
  cx,
  cy,
  data,
}: {
  payload: { value: string }
  x?: number | string
  y?: number | string
  cx?: number | string
  cy?: number | string
  data: DvPRadarData[]
}) {
  const positionData = data.find(d => d.position === payload.value)
  if (!positionData) return null

  // Convert to numbers with defaults
  const xNum = typeof x === 'number' ? x : parseFloat(String(x)) || 0
  const yNum = typeof y === 'number' ? y : parseFloat(String(y)) || 0
  const cxNum = typeof cx === 'number' ? cx : parseFloat(String(cx)) || 0
  const cyNum = typeof cy === 'number' ? cy : parseFloat(String(cy)) || 0

  const tier = positionData.tier
  const tierColor = TIER_COLORS[tier]

  // Calculate offset from center - reduced for mobile
  const dx = xNum - cxNum
  const dy = yNum - cyNum
  const distance = Math.sqrt(dx * dx + dy * dy)
  const offsetX = distance > 0 ? (dx / distance) * 30 : 0
  const offsetY = distance > 0 ? (dy / distance) * 35 : 0

  return (
    <g>
      {/* Position label background */}
      <rect
        x={xNum + offsetX - 20}
        y={yNum + offsetY - 24}
        width={40}
        height={22}
        rx={5}
        fill="rgba(0,0,0,0.9)"
        stroke={tierColor.border}
        strokeWidth={2}
      />
      {/* Position text */}
      <text
        x={xNum + offsetX}
        y={yNum + offsetY - 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {payload.value}
      </text>

      {/* Value below */}
      <text
        x={xNum + offsetX}
        y={yNum + offsetY + 10}
        textAnchor="middle"
        fill="#d4d4d8"
        fontSize={12}
        fontWeight="600"
        fontFamily="JetBrains Mono, monospace"
      >
        {positionData.pointsAllowed.toFixed(1)}
      </text>

      {/* Rank badge */}
      <circle
        cx={xNum + offsetX + 24}
        cy={yNum + offsetY - 14}
        r={11}
        fill={tierColor.bg}
        stroke={tierColor.border}
        strokeWidth={1.5}
      />
      <text
        x={xNum + offsetX + 24}
        y={yNum + offsetY - 10}
        textAnchor="middle"
        fill={tierColor.text}
        fontSize={9}
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        #{positionData.rank}
      </text>
    </g>
  )
}


export function DvPRadarChart({ data, teamAbbreviation, className }: DvPRadarChartProps) {
  // Calculate domain for the radar (inverted: 0 at center, max at edge)
  const maxValue = Math.max(...data.map(d => d.pointsAllowed), ...data.map(d => d.leagueAvg)) + 2
  const minValue = Math.min(...data.map(d => d.pointsAllowed), ...data.map(d => d.leagueAvg)) - 2

  // Prepare data with league averages for overlay
  const chartData = data.map(d => ({
    ...d,
    // For radar, we want smaller values to be closer to center
    // So we keep values as-is since smaller = better defense = smaller polygon
  }))

  return (
    <div className={cn("relative pt-12", className)}>
      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mb-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-3 rounded-sm bg-gradient-to-r from-red-500/60 to-orange-500/30" />
          <span className="text-zinc-300 font-medium">{teamAbbreviation} Defense</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 border-t-2 border-dashed border-white/40" />
          <span className="text-zinc-300 font-medium">League Average</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={480}>
        <RadarChart data={chartData} cx="50%" cy="56%" outerRadius="68%">
          {/* SVG Definitions for effects */}
          <defs>
            {/* Glow filter for radar polygon */}
            <filter id="radarGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Team gradient fill */}
            <linearGradient id="teamRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5"/>
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.15"/>
            </linearGradient>

            {/* Team stroke gradient */}
            <linearGradient id="teamStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444"/>
              <stop offset="100%" stopColor="#f97316"/>
            </linearGradient>
          </defs>

          {/* Grid with custom styling */}
          <PolarGrid
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="2 4"
            gridType="polygon"
          />

          {/* Radius axis (hidden but defines scale) */}
          <PolarRadiusAxis
            domain={[minValue, maxValue]}
            tick={false}
            axisLine={false}
          />

          {/* Position labels */}
          <PolarAngleAxis
            dataKey="position"
            tick={(props) => (
              <CustomPositionLabel {...props} data={chartData} />
            )}
          />

          {/* League average overlay (dashed) */}
          <Radar
            name="League Avg"
            dataKey="leagueAvg"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            animationBegin={400}
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* Team defense polygon with glow */}
          <Radar
            name={teamAbbreviation}
            dataKey="pointsAllowed"
            stroke="url(#teamStrokeGradient)"
            strokeWidth={2.5}
            fill="url(#teamRadarGradient)"
            fillOpacity={1}
            filter="url(#radarGlow)"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
            dot={{
              r: 4,
              fill: '#ef4444',
              stroke: '#fff',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: '#f97316',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />

        </RadarChart>
      </ResponsiveContainer>

      {/* Scale hint */}
      <div className="text-center mt-2">
        <p className="text-xs text-zinc-500">
          Smaller shape = better defense (fewer points allowed)
        </p>
      </div>
    </div>
  )
}
