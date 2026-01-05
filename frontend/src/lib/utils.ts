import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conflicts and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format a stat value (handles PostgreSQL numeric type)
 */
export function formatStat(value: string | number | null, decimals = 1): string {
  if (value === null || value === undefined) return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return num.toFixed(decimals)
}

/**
 * Safely convert PostgreSQL numeric (string) to number
 * Handles null, undefined, and string values from database
 */
export function safeNum(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

/**
 * Format decimal odds
 */
export function formatOdds(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(2)
}

/**
 * Convert American odds to decimal
 */
export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1
  } else {
    return (100 / Math.abs(american)) + 1
  }
}

/**
 * Convert decimal odds to American
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100)
  } else {
    return Math.round(-100 / (decimal - 1))
  }
}
