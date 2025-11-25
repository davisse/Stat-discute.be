# HTML Reporting Template Architecture Specification
## NBA Statistics Platform - Sports Betting Analytics

**Version:** 1.0
**Date:** 2025-10-23
**Author:** System Architect (Claude Code)
**Project:** stat-discute.be

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Context](#system-context)
3. [Template Architecture](#template-architecture)
4. [Chart.js Integration](#chartjs-integration)
5. [Data Transformation Layer](#data-transformation-layer)
6. [Responsive Design System](#responsive-design-system)
7. [Visual Design Guidelines](#visual-design-guidelines)
8. [Bilingual Support](#bilingual-support)
9. [Accessibility Standards](#accessibility-standards)
10. [Performance Optimization](#performance-optimization)
11. [Export Capabilities](#export-capabilities)
12. [Interactive Features](#interactive-features)
13. [Implementation Roadmap](#implementation-roadmap)
14. [Testing Requirements](#testing-requirements)

---

## Executive Summary

This specification defines a production-ready HTML reporting template system for stat-discute.be, an NBA statistics platform optimized for French/Belgian sports betting analytics. The architecture prioritizes mobile-first design, sub-3s load times, WCAG 2.1 AA accessibility, and seamless bilingual support.

### Key Design Principles

- **Mobile-First**: 60% of betting traffic is mobile
- **Performance**: Sub-3s page load on 3G connections
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Data Accuracy**: Validated advanced metrics calculations
- **Shareability**: URL state persistence for filtered views
- **Export Quality**: Print/PDF matching screen design

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Markup | HTML5 semantic elements | Accessibility, SEO |
| Styling | Custom CSS with CSS variables | Performance, maintainability |
| Scripting | Vanilla ES6+ JavaScript | No framework overhead |
| Visualization | Chart.js 4.4.0+ | Rich NBA-specific charts |
| Build | Vite | Fast dev server, optimized bundling |
| Backend | Flask (existing) | Python NBA data processing |
| Database | PostgreSQL (existing) | Comprehensive betting schema |

---

## System Context

### Current Platform State

**Existing Infrastructure:**
- Flask backend serving NBA stats via REST API
- JavaScript ES6 client (`nba-client.js`) with 5-minute cache
- Demo page using Chart.js with purple gradient theme
- PostgreSQL database with comprehensive betting analytics schema
- Focus on French/Belgian sports betting market

**Recent Work:**
- Anthony Davis vs LeBron James impact analysis
- CSV exports with 77 games of comparative data
- Matplotlib chart generation (Python backend)

**Data Structures Available:**
- Game-level statistics (PTS, FG%, 3P%, FT%, REB, AST, STL, BLK, TOV)
- Advanced metrics (PLUS_MINUS, efficiency calculations)
- Contextual data (home/away, with/without player scenarios)
- Database schema supports: Four Factors, rest advantage, injury impact, ATS performance

### Target Audience

**Primary Users:** French/Belgian sports bettors and analysts

**User Context:**
- Mobile-first usage (before/during games)
- Need actionable insights quickly
- Bilingual (French UI, English stats terminology)
- Varying technical sophistication
- Accessibility considerations

---

## Template Architecture

### Three-Tier System

#### Tier 1: Base Template

**File:** `templates/base/report-base.html`

**Responsibilities:**
- Semantic HTML5 structure
- Common layout sections (header, nav, main, footer)
- Shared CSS/JS resource loading
- Bilingual i18n framework integration
- Print/export optimization
- Responsive grid system

**Structure:**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <!-- Meta tags, OG tags, preloading -->
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <header role="banner"><!-- Site header --></header>
  <main id="main-content" role="main">
    <!-- Content blocks -->
  </main>
  <footer role="contentinfo"><!-- Site footer --></footer>
  <script><!-- Scripts --></script>
</body>
</html>
```

#### Tier 2: Report Type Templates

**Available Report Types:**

1. **player-comparison.html** - AD vs LeBron style comparisons
2. **team-performance.html** - Seasonal analysis
3. **matchup-analysis.html** - Head-to-head predictions
4. **betting-edge.html** - ATS, O/U analytics
5. **injury-impact.html** - With/without scenarios

**Template Inheritance:**
```
report-base.html (base)
    ├── player-comparison.html (extends base)
    ├── team-performance.html (extends base)
    └── betting-edge.html (extends base)
```

#### Tier 3: Reusable Components

**Component Library:**

```html
<!-- Stat Card Component -->
<div class="stat-card" role="article" aria-labelledby="stat-{{id}}">
  <h3 id="stat-{{id}}" class="stat-label">{{label}}</h3>
  <div class="stat-value">
    <span class="value-number">{{value}}</span>
    <span class="value-unit">{{unit}}</span>
  </div>
  <div class="stat-trend {{direction}}">
    <span class="trend-icon">{{icon}}</span>
    <span class="trend-text">{{text}}</span>
  </div>
</div>

<!-- Chart Container Component -->
<div class="chart-container">
  <h3 class="chart-title">{{title}}</h3>
  <div class="chart-wrapper">
    <canvas id="{{chartId}}"
            role="img"
            aria-label="{{ariaLabel}}">
    </canvas>
  </div>
  <button class="chart-download">Download PNG</button>
</div>

<!-- Data Table Component -->
<div class="table-wrapper">
  <table class="data-table" role="table" aria-label="{{tableLabel}}">
    <thead><!-- Headers with sort controls --></thead>
    <tbody><!-- Data rows --></tbody>
  </table>
</div>
```

### Page Layout Sections

**1. Header Section**
- Logo and branding
- Primary navigation
- Language toggle
- Share button
- Sticky on scroll (mobile)

**2. Report Header**
- Breadcrumb navigation
- Report title (H1)
- Metadata (date, season)
- Summary text

**3. Control Panel**
- Date range filter
- Scenario selector
- Player/team selector
- Apply/reset buttons

**4. Summary Stats Cards**
- 4-column grid (desktop)
- 2-column (tablet)
- 1-column carousel (mobile)
- Key metrics with trends

**5. Charts Section**
- Primary chart (full width)
- Secondary charts grid (2-3 columns)
- Lazy loading on scroll

**6. Detailed Data Table**
- Sortable columns
- Search functionality
- Pagination (25 rows per page)
- Responsive (card layout on mobile)

**7. Insights Panel**
- Betting recommendations
- Confidence levels
- Warning indicators

**8. Footer**
- Copyright
- Disclaimer
- Legal links

---

## Chart.js Integration

### Chart Type Selection Matrix

| Use Case | Chart Type | Config Priority | Betting Context |
|----------|------------|-----------------|-----------------|
| Performance over time | Line Chart | High | Trend identification |
| Player comparison | Radar Chart | High | Scouting reports |
| Home/Away splits | Grouped Bar | Medium | Location advantage |
| Shot distribution | Doughnut Chart | Medium | Efficiency analysis |
| Game impact | Scatter Plot | Low | Outlier detection |
| Recent form | Line + MA | High | Hot/cold streaks |
| Four Factors | Stacked Bar | High | Predictive metrics |
| ATS performance | Mixed (Bar+Line) | High | Betting edge |

### 1. Performance Over Time - Line Chart

**Use Case:** Track points, FG%, rebounds across games

**Configuration:**
```javascript
const performanceConfig = {
  type: 'line',
  data: {
    labels: dates, // ['23 oct', '24 oct', ...]
    datasets: [{
      label: 'Points',
      data: pointsData,
      borderColor: '#FDB927', // Lakers gold
      backgroundColor: 'rgba(253, 185, 39, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: wins.map(w => w ? '#4CAF50' : '#F44336'),
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14, family: 'Inter' },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          title: (context) => games[context[0].dataIndex].MATCHUP,
          label: (context) => {
            const game = games[context.dataIndex];
            return [
              `Points: ${game.PTS}`,
              `FG: ${game.FGM}/${game.FGA} (${(game.FG_PCT * 100).toFixed(1)}%)`,
              `REB: ${game.REB} | AST: ${game.AST}`,
              `Résultat: ${game.WL === 'W' ? 'Victoire' : 'Défaite'}`
            ];
          }
        }
      },
      annotation: {
        annotations: {
          avgLine: {
            type: 'line',
            yMin: avgPoints,
            yMax: avgPoints,
            borderColor: '#9E9E9E',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `Moyenne: ${avgPoints.toFixed(1)}`,
              enabled: true,
              position: 'end'
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Points',
          font: { size: 14 }
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  }
};
```

**Betting Context:**
- Win/loss color coding helps identify patterns
- Average line shows consistency
- Tooltip shows full game context

### 2. Player Comparison - Radar Chart

**Use Case:** Multi-dimensional player comparison

**Configuration:**
```javascript
const radarConfig = {
  type: 'radar',
  data: {
    labels: ['Points', 'Rebonds', 'Passes', 'Tirs %', 'Interceptions', 'Contres'],
    datasets: [
      {
        label: 'Anthony Davis',
        data: [85, 90, 50, 75, 60, 95], // Normalized 0-100
        borderColor: '#FDB927',
        backgroundColor: 'rgba(253, 185, 39, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'LeBron James',
        data: [80, 70, 90, 70, 65, 55],
        borderColor: '#552583',
        backgroundColor: 'rgba(85, 37, 131, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: { size: 11 }
        },
        pointLabels: {
          font: { size: 12, weight: 'bold' }
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 },
          padding: 15
        }
      }
    }
  }
};
```

**Normalization Formula:**
```javascript
function normalizeForRadar(value, statType, leagueStats) {
  const { min, max, avg } = leagueStats[statType];
  // Normalize to 0-100 scale
  return ((value - min) / (max - min)) * 100;
}
```

### 3. Home/Away Split - Grouped Bar Chart

**Use Case:** Compare metrics by location

**Configuration:**
```javascript
const splitConfig = {
  type: 'bar',
  data: {
    labels: ['Points', 'Rebonds', 'Passes', 'FG%'],
    datasets: [
      {
        label: 'Domicile',
        data: homeStats,
        backgroundColor: '#FDB927',
        borderColor: '#FDBB30',
        borderWidth: 1
      },
      {
        label: 'Extérieur',
        data: awayStats,
        backgroundColor: '#552583',
        borderColor: '#3C1E5E',
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bars
    plugins: {
      legend: { position: 'top' },
      datalabels: { // Requires chartjs-plugin-datalabels
        anchor: 'end',
        align: 'end',
        formatter: (value) => value.toFixed(1),
        font: { size: 12, weight: 'bold' }
      }
    },
    scales: {
      x: { beginAtZero: true }
    }
  }
};
```

### 4. Trend Analysis - Line with Moving Average

**Use Case:** Recent form and trend direction

**Configuration:**
```javascript
const trendConfig = {
  type: 'line',
  data: {
    labels: dates,
    datasets: [
      {
        label: 'Points (réels)',
        data: actualPoints,
        borderColor: '#2196F3',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3
      },
      {
        label: 'Tendance (MA-5)',
        data: movingAverage5,
        borderColor: '#FDB927',
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.4
      }
    ]
  },
  options: {
    // Similar to performance config
  }
};
```

**Moving Average Calculation:**
```javascript
function calculateMovingAverage(data, window = 5) {
  return data.map((val, idx, arr) => {
    if (idx < window - 1) return null;
    const slice = arr.slice(idx - window + 1, idx + 1);
    return slice.reduce((sum, v) => sum + v, 0) / window;
  });
}
```

### Chart.js Plugins Required

```javascript
// Load these CDN resources
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import datalabelsPlugin from 'chartjs-plugin-datalabels';

Chart.register(annotationPlugin, datalabelsPlugin);
```

### Chart Lazy Loading

```javascript
// Intersection Observer for lazy chart rendering
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const chartId = entry.target.id;
      renderChart(chartId);
      chartObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '50px' // Start loading 50px before visible
});

// Observe all chart canvases
document.querySelectorAll('.chart-wrapper canvas').forEach(canvas => {
  chartObserver.observe(canvas);
});
```

---

## Data Transformation Layer

### Pipeline Architecture

```
CSV/API Response → DataParser → MetricsCalculator → ChartDataFormatter → Chart.js Config
```

### 1. Data Parser

**Purpose:** Convert raw CSV/JSON to structured game objects

```javascript
class DataParser {
  /**
   * Parse CSV string to array of game objects
   * @param {string} csvString - Raw CSV data
   * @returns {Array<Object>} Parsed game objects
   */
  static parseGameData(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      const game = {};

      headers.forEach((header, idx) => {
        let value = values[idx];

        // Type conversions
        if (header === 'GAME_DATE') {
          value = new Date(value);
        } else if (header.includes('PCT') || header.includes('_')) {
          value = parseFloat(value) || 0;
        } else if (!isNaN(value) && value !== '') {
          value = parseInt(value, 10);
        }

        game[header] = value;
      });

      return game;
    });
  }

  /**
   * Parse CSV line handling quoted values
   */
  static parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }
}
```

### 2. Advanced Metrics Calculator

**Purpose:** Calculate advanced basketball metrics

```javascript
class MetricsCalculator {
  /**
   * Calculate True Shooting Percentage
   * TS% = PTS / (2 * (FGA + 0.44 * FTA))
   */
  static trueShooting(game) {
    return game.PTS / (2 * (game.FGA + 0.44 * game.FTA));
  }

  /**
   * Calculate Effective Field Goal Percentage
   * eFG% = (FGM + 0.5 * 3PM) / FGA
   */
  static effectiveFG(game) {
    return (game.FGM + 0.5 * game.FG3M) / game.FGA;
  }

  /**
   * Calculate Game Score (John Hollinger formula)
   * GmSc = PTS + 0.4*FGM - 0.7*FGA - 0.4*(FTA-FTM) + 0.7*OREB + 0.3*DREB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV
   */
  static gameScore(game) {
    // Note: OREB/DREB not in current data, use REB
    return game.PTS +
           0.4 * game.FGM -
           0.7 * game.FGA -
           0.4 * (game.FTA - game.FTM) +
           0.3 * game.REB +
           game.STL +
           0.7 * game.AST +
           0.7 * game.BLK -
           0.4 * (game.PF || 0) -
           game.TOV;
  }

  /**
   * Enrich game data with advanced metrics
   */
  static enrichGameData(games) {
    return games.map(game => ({
      ...game,
      TS_PCT: this.trueShooting(game),
      EFG_PCT: this.effectiveFG(game),
      GAME_SCORE: this.gameScore(game)
    }));
  }
}
```

### 3. Scenario Aggregator

**Purpose:** Group and aggregate by scenarios

```javascript
class ScenarioAggregator {
  /**
   * Aggregate stats by scenario
   * @param {Array} games - Game objects
   * @param {string} groupBy - 'Scenario', 'home_away', 'opponent'
   */
  static aggregateByScenario(games, groupBy = 'Scenario') {
    const groups = {};

    games.forEach(game => {
      const key = this.getGroupKey(game, groupBy);

      if (!groups[key]) {
        groups[key] = {
          games: [],
          stats: this.initStats()
        };
      }

      groups[key].games.push(game);
    });

    // Calculate aggregates
    Object.keys(groups).forEach(key => {
      groups[key].stats = this.calculateAggregates(groups[key].games);
    });

    return groups;
  }

  static getGroupKey(game, groupBy) {
    switch(groupBy) {
      case 'Scenario':
        return game.Scenario;
      case 'home_away':
        return game.MATCHUP.includes('vs.') ? 'home' : 'away';
      case 'opponent':
        return this.extractOpponent(game.MATCHUP);
      default:
        return 'all';
    }
  }

  static calculateAggregates(games) {
    const count = games.length;
    const wins = games.filter(g => g.WL === 'W').length;

    return {
      games_played: count,
      wins: wins,
      losses: count - wins,
      win_pct: wins / count,
      avg_pts: this.avg(games, 'PTS'),
      avg_reb: this.avg(games, 'REB'),
      avg_ast: this.avg(games, 'AST'),
      avg_fg_pct: this.avg(games, 'FG_PCT'),
      avg_3p_pct: this.avg(games, 'FG3_PCT'),
      avg_ft_pct: this.avg(games, 'FT_PCT'),
      avg_plus_minus: this.avg(games, 'PLUS_MINUS'),
      total_pts: this.sum(games, 'PTS')
    };
  }

  static avg(games, field) {
    return games.reduce((sum, g) => sum + g[field], 0) / games.length;
  }

  static sum(games, field) {
    return games.reduce((sum, g) => sum + g[field], 0);
  }

  static initStats() {
    return {
      games_played: 0,
      wins: 0,
      losses: 0,
      win_pct: 0,
      avg_pts: 0,
      avg_reb: 0,
      avg_ast: 0
    };
  }

  static extractOpponent(matchup) {
    // Extract opponent from "LAL vs. GSW" or "LAL @ PHX"
    return matchup.split(/vs\.|@/)[1].trim();
  }
}
```

### 4. Chart Data Formatter

**Purpose:** Convert aggregated data to Chart.js format

```javascript
class ChartDataFormatter {
  /**
   * Format for line chart (time series)
   */
  static formatForLineChart(games, metric = 'PTS') {
    return {
      labels: games.map(g =>
        new Date(g.GAME_DATE).toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric'
        })
      ),
      datasets: [{
        label: this.getMetricLabel(metric),
        data: games.map(g => g[metric]),
        // ... styling config
      }]
    };
  }

  /**
   * Format for radar chart (comparison)
   */
  static formatForRadarChart(playerA, playerB, metrics) {
    return {
      labels: metrics.map(m => this.getMetricLabel(m)),
      datasets: [
        {
          label: playerA.name,
          data: metrics.map(m => this.normalize(playerA.stats[m], m))
        },
        {
          label: playerB.name,
          data: metrics.map(m => this.normalize(playerB.stats[m], m))
        }
      ]
    };
  }

  /**
   * Format for grouped bar chart
   */
  static formatForGroupedBar(homeStats, awayStats, categories) {
    return {
      labels: categories.map(c => this.getMetricLabel(c)),
      datasets: [
        {
          label: 'Domicile',
          data: categories.map(c => homeStats[c])
        },
        {
          label: 'Extérieur',
          data: categories.map(c => awayStats[c])
        }
      ]
    };
  }

  static normalize(value, metric) {
    // Normalize to 0-100 scale based on metric type
    const ranges = {
      PTS: { min: 0, max: 50 },
      REB: { min: 0, max: 20 },
      AST: { min: 0, max: 15 },
      FG_PCT: { min: 0.3, max: 0.7 },
      STL: { min: 0, max: 5 },
      BLK: { min: 0, max: 5 }
    };

    const range = ranges[metric] || { min: 0, max: 100 };
    return ((value - range.min) / (range.max - range.min)) * 100;
  }

  static getMetricLabel(metric) {
    const labels = {
      PTS: 'Points',
      REB: 'Rebonds',
      AST: 'Passes',
      FG_PCT: 'Tirs %',
      FG3_PCT: '3-Points %',
      STL: 'Interceptions',
      BLK: 'Contres',
      TOV: 'Balles perdues'
    };
    return labels[metric] || metric;
  }
}
```

### Performance Optimizations

```javascript
// Memoize expensive calculations
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Apply memoization
MetricsCalculator.enrichGameData = memoize(MetricsCalculator.enrichGameData);

// Web Worker for large datasets
class DataWorker {
  static async processLargeDataset(games) {
    if (games.length < 100) {
      // Process directly
      return MetricsCalculator.enrichGameData(games);
    }

    // Use Web Worker
    return new Promise((resolve) => {
      const worker = new Worker('/js/workers/data-processor.js');
      worker.postMessage({ games });
      worker.onmessage = (e) => {
        resolve(e.data.enriched);
        worker.terminate();
      };
    });
  }
}
```

---

## Responsive Design System

### Mobile-First Breakpoints

```css
/* Base: 320px - 639px (mobile) */
/* sm: 640px - 767px (large mobile) */
/* md: 768px - 1023px (tablet) */
/* lg: 1024px - 1279px (desktop) */
/* xl: 1280px - 1535px (large desktop) */
/* 2xl: 1536px+ (extra large) */
```

### Layout Strategies by Breakpoint

#### Mobile (320px - 767px)

**Priority:** Essential content only, single column

```
┌─────────────────┐
│  Sticky Header  │
├─────────────────┤
│  Summary Card   │ ← Swipeable carousel
│  (1 of 4)       │
├─────────────────┤
│  Primary Chart  │ ← Full width, tap to expand
├─────────────────┤
│  Quick Stats    │ ← Accordion (collapsed)
│  [+] Détails    │
├─────────────────┤
│  CTA Buttons    │ ← Sticky bottom bar
└─────────────────┘
```

**CSS:**
```css
/* Mobile-first base styles */
.container {
  width: 100%;
  padding-inline: var(--space-md); /* 16px */
}

.stats-grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr; /* Single column */
}

.chart-container {
  height: 300px; /* Fixed height for mobile */
  margin-bottom: var(--space-lg);
}

/* Swipeable carousel for stat cards */
.stats-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: var(--space-md);
  -webkit-overflow-scrolling: touch;
}

.stat-card {
  flex: 0 0 85%; /* 85% viewport width */
  scroll-snap-align: start;
}

/* Hide secondary elements on mobile */
.secondary-chart,
.advanced-stats {
  display: none;
}
```

#### Tablet (768px - 1023px)

**Strategy:** 2-column grid, show more data

```
┌───────────────────────────┐
│  Header + Navigation      │
├─────────┬─────────────────┤
│ Summary │  Primary Chart  │
│ Cards   │                 │
│ (2x2)   │                 │
├─────────┴─────────────────┤
│  Secondary Charts (2-col) │
├───────────────────────────┤
│  Detailed Table           │
└───────────────────────────┘
```

**CSS:**
```css
@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns */
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }

  .chart-container {
    height: 350px;
  }

  /* Show secondary elements */
  .secondary-chart {
    display: block;
  }
}
```

#### Desktop (1024px+)

**Strategy:** Full data display, multi-column

```
┌─────────────────────────────────────┐
│  Header + Navigation + Quick Actions│
├────────┬────────────┬───────────────┤
│Summary │  Main      │  Context      │
│Stats   │  Chart     │  Panel        │
│4 cards │  Area      │  (Comparison) │
├────────┴────────────┴───────────────┤
│  Multi-Chart Grid (3 columns)       │
├─────────────────────────────────────┤
│  Full Data Table with Sorting       │
└─────────────────────────────────────┘
```

**CSS:**
```css
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-inline: var(--space-lg);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
  }

  .charts-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .chart-container {
    height: 400px;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 300px 1fr 250px; /* Sidebar, Main, Context */
    gap: var(--space-xl);
  }

  /* Show all advanced features */
  .advanced-stats,
  .detailed-metrics {
    display: block;
  }
}
```

### Touch Optimization

**Minimum Touch Targets:** 44px × 44px (iOS guidelines)

```css
/* Touch-friendly buttons */
.btn,
.interactive-element {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}

/* Increase chart point hit areas on touch devices */
@media (hover: none) and (pointer: coarse) {
  .chart-wrapper canvas {
    cursor: pointer;
  }

  /* Larger touch targets in charts */
  /* Applied via Chart.js config: pointHoverRadius: 12 */
}

/* Swipe gestures */
.swipeable {
  touch-action: pan-x; /* Allow horizontal swipe only */
}
```

### Responsive Tables

**Strategy:** Card layout on mobile, table on desktop

```css
/* Mobile: Card layout */
@media (max-width: 767px) {
  .data-table thead {
    display: none; /* Hide table headers */
  }

  .data-table tbody tr {
    display: block;
    margin-bottom: var(--space-lg);
    border: 1px solid var(--color-neutral);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--bg-secondary);
  }

  .data-table td:before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-secondary);
  }
}

/* Desktop: Standard table */
@media (min-width: 768px) {
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th,
  .data-table td {
    padding: var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--bg-tertiary);
  }
}
```

---

## Visual Design Guidelines

### Color Palette

#### Primary Colors (Lakers Branding)

```css
:root {
  /* Primary - Lakers Gold */
  --color-primary: #FDB927;
  --color-primary-light: #FDBB30;
  --color-primary-dark: #E5A51F;

  /* Secondary - Lakers Purple */
  --color-secondary: #552583;
  --color-secondary-light: #6B2FA0;
  --color-secondary-dark: #3C1E5E;
}
```

**Usage:**
- Primary gold: Action buttons, highlights, active states
- Primary purple: Headers, navigation, primary text on light backgrounds

#### Functional Colors

```css
:root {
  /* Results */
  --color-win: #4CAF50;      /* Green */
  --color-loss: #F44336;     /* Red */
  --color-neutral: #9E9E9E;  /* Gray */

  /* Alerts */
  --color-warning: #FF9800;  /* Orange - injury concerns */
  --color-info: #2196F3;     /* Blue - contextual info */

  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-tertiary: #FAFAFA;

  /* Dark Mode (optional) */
  --bg-dark: #1A1A1A;
  --bg-dark-secondary: #2A2A2A;
}
```

**Accessibility Check:**
```
Lakers Purple (#552583) on White: 9.54:1 ✓ (AAA)
Lakers Gold (#FDB927) on Purple: Test required
Win Green (#4CAF50) on White: 4.52:1 ✓ (AA)
Loss Red (#F44336) on White: 4.66:1 ✓ (AA)
```

### Typography System

#### Font Families

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont,
               'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Roboto Mono', 'SF Mono', Consolas,
               'Liberation Mono', monospace;
}

/* Load Inter font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
```

#### Type Scale

```css
:root {
  /* Scale based on 1rem = 16px */
  --text-xs: 0.75rem;    /* 12px - captions */
  --text-sm: 0.875rem;   /* 14px - small text */
  --text-base: 1rem;     /* 16px - body */
  --text-lg: 1.125rem;   /* 18px - emphasis */
  --text-xl: 1.25rem;    /* 20px - h3 */
  --text-2xl: 1.5rem;    /* 24px - h3 */
  --text-3xl: 2rem;      /* 32px - h2 */
  --text-4xl: 2.5rem;    /* 40px - h1 */
}

/* Responsive type scale */
@media (max-width: 767px) {
  :root {
    --text-4xl: 1.75rem;   /* 28px on mobile */
    --text-3xl: 1.5rem;    /* 24px on mobile */
  }
}
```

#### Typography Styles

```css
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-secondary-dark);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--space-md);
}

h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-2xl); }

/* Stat numbers - tabular figures for alignment */
.stat-value,
.data-table td[data-numeric] {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

### Spacing System

**8px Base Unit**

```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
}
```

**Vertical Rhythm:**
```css
.section {
  margin-bottom: var(--space-2xl); /* 48px between sections */
}

.component {
  margin-bottom: var(--space-xl); /* 32px between components */
}

.element {
  margin-bottom: var(--space-md); /* 16px between elements */
}
```

### Component Styling Examples

#### Stat Card

```css
.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-base),
              box-shadow var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-label {
  color: var(--color-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.value-number {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-secondary-dark);
  line-height: 1;
}

.value-unit {
  font-size: var(--text-base);
  color: var(--color-neutral);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.stat-trend.positive { color: var(--color-win); }
.stat-trend.negative { color: var(--color-loss); }
```

#### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: 12px 24px;
  min-height: 44px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-secondary-dark);
}

.btn-primary:hover {
  background: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: transparent;
  color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
}

.btn-secondary:hover {
  background: var(--color-secondary);
  color: white;
}
```

### Shadow System

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.2);

  /* Colored shadows for emphasis */
  --shadow-primary: 0 4px 16px rgba(253, 185, 39, 0.3);
  --shadow-secondary: 0 4px 16px rgba(85, 37, 131, 0.3);
}
```

---

## Bilingual Support

### I18n Architecture

**Strategy:** Client-side translation with localStorage persistence

#### Translation System

```javascript
// i18n.js - Lightweight translation system
class I18n {
  constructor(defaultLang = 'fr') {
    this.currentLang = this.detectLanguage() || defaultLang;
    this.translations = {};
    this.loadTranslations();
  }

  detectLanguage() {
    // Priority: URL param > localStorage > browser > default
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang) return urlLang;

    const storedLang = localStorage.getItem('preferred-lang');
    if (storedLang) return storedLang;

    const browserLang = navigator.language.split('-')[0];
    return ['fr', 'en'].includes(browserLang) ? browserLang : null;
  }

  async loadTranslations() {
    const response = await fetch(`/locales/${this.currentLang}.json`);
    this.translations = await response.json();
    this.applyTranslations();
  }

  t(key, params = {}) {
    let text = this.getNestedValue(this.translations, key) || key;

    // Replace placeholders: {player} -> actual value
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  applyTranslations() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Translate tooltips
    document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
      const key = el.getAttribute('data-i18n-tooltip');
      el.setAttribute('title', this.t(key));
      el.setAttribute('aria-label', this.t(key));
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', this.t(key));
    });
  }

  switchLanguage(lang) {
    if (this.currentLang === lang) return;

    this.currentLang = lang;
    localStorage.setItem('preferred-lang', lang);

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url);

    this.loadTranslations();
  }
}

// Initialize
const i18n = new I18n();
```

#### Translation Files

**/locales/fr.json**
```json
{
  "header": {
    "title": "Analyse NBA",
    "subtitle": "Statistiques pour paris sportifs"
  },
  "stats": {
    "points": "Points",
    "rebounds": "Rebonds",
    "assists": "Passes décisives",
    "field_goal_pct": "Pourcentage aux tirs",
    "games_played": "Matchs joués",
    "wins": "Victoires",
    "losses": "Défaites",
    "avg_points": "Moyenne de points"
  },
  "scenarios": {
    "with_player": "Avec {player}",
    "without_player": "Sans {player}",
    "home_games": "Matchs à domicile",
    "away_games": "Matchs à l'extérieur",
    "all_games": "Tous les matchs"
  },
  "betting": {
    "prediction": "Prédiction",
    "confidence": "Confiance",
    "over_under": "Plus/Moins",
    "spread": "Écart",
    "edge": "Avantage",
    "recommendation": "Recommandation"
  },
  "actions": {
    "apply": "Appliquer",
    "reset": "Réinitialiser",
    "export": "Exporter",
    "share": "Partager",
    "download": "Télécharger",
    "view_details": "Voir les détails"
  },
  "tooltips": {
    "pts_definition": "Points marqués par le joueur",
    "reb_definition": "Total des rebonds (offensifs + défensifs)",
    "ast_definition": "Passes décisives ayant mené à un panier",
    "fg_pct_definition": "Pourcentage de tirs réussis"
  },
  "dates": {
    "today": "Aujourd'hui",
    "yesterday": "Hier",
    "last_5_games": "5 derniers matchs",
    "last_10_games": "10 derniers matchs",
    "this_season": "Cette saison",
    "custom_range": "Période personnalisée"
  }
}
```

**/locales/en.json**
```json
{
  "header": {
    "title": "NBA Analysis",
    "subtitle": "Statistics for Sports Betting"
  },
  "stats": {
    "points": "Points",
    "rebounds": "Rebounds",
    "assists": "Assists",
    "field_goal_pct": "Field Goal Percentage",
    "games_played": "Games Played",
    "wins": "Wins",
    "losses": "Losses",
    "avg_points": "Average Points"
  },
  // ... rest of translations
}
```

### HTML Translation Attributes

```html
<!-- Static text translation -->
<h1 data-i18n="header.title">Analyse NBA</h1>

<!-- With placeholder replacement -->
<p data-i18n="scenarios.with_player" data-i18n-params='{"player": "Anthony Davis"}'>
  Avec Anthony Davis
</p>

<!-- Tooltip translation -->
<span class="stat-label"
      data-i18n="stats.points"
      data-i18n-tooltip="tooltips.pts_definition">
  Points
</span>

<!-- Form placeholder translation -->
<input type="search"
       data-i18n-placeholder="actions.search"
       placeholder="Rechercher...">
```

### Language Toggle Component

```html
<button id="lang-toggle"
        class="lang-toggle"
        aria-label="Change language">
  <span class="flag-icon flag-fr active"></span>
  <span class="flag-icon flag-en"></span>
</button>

<script>
document.getElementById('lang-toggle').addEventListener('click', () => {
  const newLang = i18n.currentLang === 'fr' ? 'en' : 'fr';
  i18n.switchLanguage(newLang);

  // Update flag icons
  document.querySelectorAll('.flag-icon').forEach(flag => {
    flag.classList.toggle('active');
  });
});
</script>
```

### Date & Number Formatting

```javascript
class Formatter {
  /**
   * Format date based on current language
   */
  static formatDate(date, style = 'long') {
    const locale = i18n.currentLang === 'fr' ? 'fr-FR' : 'en-US';

    const options = {
      short: { month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    return new Date(date).toLocaleDateString(locale, options[style]);
  }

  /**
   * Format number based on current language
   */
  static formatNumber(number, decimals = 1) {
    const locale = i18n.currentLang === 'fr' ? 'fr-FR' : 'en-US';
    return number.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Format percentage
   */
  static formatPercentage(value) {
    const locale = i18n.currentLang === 'fr' ? 'fr-FR' : 'en-US';
    return (value * 100).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + '%';
  }
}
```

**Usage Examples:**
```javascript
// French: "23 octobre 2024"
// English: "October 23, 2024"
Formatter.formatDate('2024-10-23', 'long');

// French: "25,4"
// English: "25.4"
Formatter.formatNumber(25.4);

// French: "45,6%"
// English: "45.6%"
Formatter.formatPercentage(0.456);
```

### Technical Terms Policy

**Keep in English:**
- Stat abbreviations: PTS, REB, AST, FG%, 3P%, FT%, STL, BLK, TOV
- Team abbreviations: LAL, GSW, PHX, etc.
- Game IDs and technical identifiers

**Translate to French:**
- UI labels and buttons
- Section headings
- Explanatory text
- Error messages
- Tooltips and help text

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### 1. Color Contrast Requirements

**Minimum Ratios:**
- Normal text (< 18pt): 4.5:1
- Large text (≥ 18pt or bold 14pt): 3:1
- UI components: 3:1

**Validation:**
```css
/* Test color combinations */
--primary-on-white: #FDB927 on #FFFFFF → 2.8:1 ❌ FAIL
--primary-dark-on-white: #E5A51F on #FFFFFF → 3.2:1 ✓ PASS (large text only)
--secondary-on-white: #552583 on #FFFFFF → 9.54:1 ✓ AAA
--win-on-white: #4CAF50 on #FFFFFF → 4.52:1 ✓ AA
--loss-on-white: #F44336 on #FFFFFF → 4.66:1 ✓ AA
```

**Solution for Lakers Gold:**
```css
/* Use darker gold variant for text */
.text-primary {
  color: var(--color-primary-dark); /* #E5A51F - passes AA for large text */
}

/* Keep bright gold for backgrounds with dark text */
.bg-primary {
  background: var(--color-primary);
  color: var(--color-secondary-dark); /* Dark purple text */
}
```

#### 2. Semantic HTML Structure

```html
<!-- Proper document outline -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation items -->
  </nav>
</header>

<main role="main" id="main-content">
  <article aria-labelledby="report-title">
    <h1 id="report-title">{{report_title}}</h1>

    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading">Statistiques clés</h2>
      <!-- Content -->
    </section>

    <section aria-labelledby="charts-heading">
      <h2 id="charts-heading">Analyse visuelle</h2>
      <!-- Charts -->
    </section>
  </article>
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

#### 3. Chart Accessibility

**Canvas Alternative:**
```html
<div class="chart-container">
  <canvas id="performance-chart"
          role="img"
          aria-label="Graphique linéaire montrant les points par match depuis octobre. Tendance positive avec moyenne de 25.4 points.">
  </canvas>

  <!-- Hidden data table for screen readers -->
  <table class="sr-only" aria-label="Performance data">
    <caption>Points par match - Derniers 10 matchs</caption>
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">Adversaire</th>
        <th scope="col">Points</th>
        <th scope="col">Résultat</th>
      </tr>
    </thead>
    <tbody>
      {{#each games}}
      <tr>
        <td>{{GAME_DATE}}</td>
        <td>{{MATCHUP}}</td>
        <td>{{PTS}}</td>
        <td>{{WL}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

**Chart.js Keyboard Navigation:**
```javascript
// Add keyboard support to charts
function makeChartAccessible(chartInstance, canvasId) {
  const canvas = document.getElementById(canvasId);
  let focusedPoint = -1;

  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'application');

  canvas.addEventListener('keydown', (e) => {
    const dataLength = chartInstance.data.datasets[0].data.length;

    switch(e.key) {
      case 'ArrowRight':
        focusedPoint = Math.min(focusedPoint + 1, dataLength - 1);
        announceDataPoint(chartInstance, focusedPoint);
        break;
      case 'ArrowLeft':
        focusedPoint = Math.max(focusedPoint - 1, 0);
        announceDataPoint(chartInstance, focusedPoint);
        break;
    }
  });
}

function announceDataPoint(chart, index) {
  const dataset = chart.data.datasets[0];
  const label = chart.data.labels[index];
  const value = dataset.data[index];

  // Use ARIA live region
  const announcer = document.getElementById('chart-announcer');
  announcer.textContent = `${label}: ${value} ${dataset.label}`;
}
```

```html
<!-- ARIA live region for announcements -->
<div id="chart-announcer"
     class="sr-only"
     aria-live="polite"
     aria-atomic="true">
</div>
```

#### 4. Keyboard Navigation

**Focus Management:**
```css
/* Visible focus indicators */
*:focus {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
}

/* Custom focus for buttons */
.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(85, 37, 131, 0.5);
}
```

**Skip Links:**
```html
<a href="#main-content" class="skip-link">
  Aller au contenu principal
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-secondary);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

**Tab Order:**
```javascript
// Ensure logical tab order
// Header (1) → Filters (2) → Summary (3) → Charts (4) → Table (5) → Footer (6)

// Manage focus for modals
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const previousFocus = document.activeElement;

  modal.showModal();
  modal.querySelector('button, input, [tabindex="0"]').focus();

  modal.addEventListener('close', () => {
    previousFocus.focus();
  }, { once: true });
}
```

#### 5. ARIA Attributes

**Expandable Sections:**
```html
<button aria-expanded="false"
        aria-controls="details-panel"
        id="details-toggle">
  Voir les détails
  <span aria-hidden="true">▼</span>
</button>

<div id="details-panel"
     aria-labelledby="details-toggle"
     hidden>
  <!-- Details content -->
</div>

<script>
const toggle = document.getElementById('details-toggle');
const panel = document.getElementById('details-panel');

toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', !expanded);
  panel.hidden = expanded;
});
</script>
```

**Live Regions for Dynamic Updates:**
```html
<!-- Score updates -->
<div class="live-score"
     aria-live="polite"
     aria-atomic="true">
  <span id="score-display">Lakers 110 - 105 Warriors</span>
</div>

<!-- Filter results count -->
<div aria-live="polite" aria-atomic="true">
  <span id="results-count">42 matchs trouvés</span>
</div>
```

**Form Labels:**
```html
<div class="form-group">
  <label for="date-range">Période</label>
  <select id="date-range" aria-describedby="date-range-help">
    <option>5 derniers matchs</option>
    <option>10 derniers matchs</option>
  </select>
  <small id="date-range-help" class="help-text">
    Sélectionnez la période d'analyse
  </small>
</div>
```

#### 6. Motion & Animation

**Respect User Preferences:**
```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Disable chart animations */
  .chart-wrapper {
    --chart-animation-duration: 0;
  }
}
```

**Chart.js Configuration:**
```javascript
// Detect motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const chartOptions = {
  animation: {
    duration: prefersReducedMotion ? 0 : 750
  }
};
```

#### 7. Error Handling & Validation

**Accessible Error Messages:**
```html
<div class="form-group">
  <label for="player-name">Nom du joueur</label>
  <input type="text"
         id="player-name"
         aria-invalid="true"
         aria-describedby="player-name-error">
  <div id="player-name-error"
       class="error-message"
       role="alert">
    Veuillez saisir un nom de joueur valide
  </div>
</div>

<style>
.error-message {
  color: var(--color-loss);
  font-size: var(--text-sm);
  margin-top: var(--space-xs);
}

[aria-invalid="true"] {
  border-color: var(--color-loss);
  border-width: 2px;
}
</style>
```

---

## Performance Optimization

### Critical Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Initial Page Load | < 2s | 3G connection baseline |
| Time to Interactive | < 3s | User engagement threshold |
| Chart Rendering | < 500ms | Perceived instant feedback |
| Table Pagination | < 100ms | Smooth interaction |
| Lighthouse Score | > 90 | Industry best practice |

### 1. Resource Loading Strategy

#### Critical CSS Inline

```html
<head>
  <!-- Inline critical CSS (above-fold styles) -->
  <style>
    /* Reset, base typography, grid system */
    /* Header, hero section styles */
    /* Loading skeleton styles */
    /* Maximum 14KB of critical CSS */
  </style>

  <!-- Preload/preconnect for external resources -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">

  <!-- Preload critical fonts -->
  <link rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossorigin>

  <!-- Non-critical CSS with media query -->
  <link rel="stylesheet"
        href="/css/main.css"
        media="print"
        onload="this.media='all'">
</head>
```

#### Script Loading

```html
<!-- Chart.js - defer loading -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        defer>
</script>

<!-- App scripts - defer -->
<script src="/js/app.js" defer></script>

<!-- Non-critical scripts - async -->
<script src="/js/analytics.js" async></script>
```

### 2. Chart.js Optimizations

#### Lazy Rendering

```javascript
// Intersection Observer for lazy chart rendering
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const chartId = entry.target.id;
      renderChart(chartId);
      chartObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '50px' // Start loading 50px before visible
});

// Observe all chart canvases
document.querySelectorAll('.chart-wrapper canvas').forEach(canvas => {
  chartObserver.observe(canvas);
});
```

#### Data Decimation

```javascript
// For large datasets (>100 points), decimate to improve performance
const performanceConfig = {
  parsing: false, // Use pre-parsed data
  normalized: true, // Data already sorted by x-axis
  plugins: {
    decimation: {
      enabled: true,
      algorithm: 'lttb', // Largest Triangle Three Buckets
      samples: 50, // Reduce 500 points to 50 for display
      threshold: 100 // Only apply if > 100 points
    }
  }
};
```

#### Animation Optimization

```javascript
const chartOptions = {
  animation: {
    duration: 750,
    easing: 'easeOutQuart',
    // Disable animations for data updates
    onComplete: function() {
      this.options.animation.duration = 0;
    }
  },
  // Reduce redraws
  responsive: true,
  maintainAspectRatio: false,
  // Optimize rendering
  devicePixelRatio: window.devicePixelRatio > 1 ? 2 : 1
};
```

### 3. Image Optimization

```html
<!-- Team logos - SVG preferred -->
<img src="/assets/teams/lal.svg"
     alt="Los Angeles Lakers logo"
     width="50"
     height="50">

<!-- Player photos - WebP with fallback -->
<picture>
  <source srcset="/assets/players/ad.webp" type="image/webp">
  <img src="/assets/players/ad.jpg"
       alt="Anthony Davis"
       loading="lazy"
       width="200"
       height="300">
</picture>

<!-- Responsive images -->
<img srcset="/assets/hero-400.jpg 400w,
             /assets/hero-800.jpg 800w,
             /assets/hero-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px,
            (max-width: 900px) 800px,
            1200px"
     src="/assets/hero-800.jpg"
     alt="NBA court">
```

### 4. Table Virtualization

```javascript
// Virtual scrolling for large tables (>100 rows)
class VirtualTable {
  constructor(tableId, data, rowHeight = 60) {
    this.table = document.getElementById(tableId);
    this.data = data;
    this.rowHeight = rowHeight;
    this.visibleRows = Math.ceil(window.innerHeight / rowHeight) + 5; // Buffer
    this.scrollTop = 0;

    this.init();
  }

  init() {
    this.table.addEventListener('scroll', () => {
      this.scrollTop = this.table.scrollTop;
      this.render();
    });

    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);
    const endIndex = Math.min(startIndex + this.visibleRows, this.data.length);

    // Only render visible rows
    const visibleData = this.data.slice(startIndex, endIndex);

    const tbody = this.table.querySelector('tbody');
    tbody.innerHTML = '';

    // Add offset for scrolled rows
    const offset = startIndex * this.rowHeight;
    tbody.style.transform = `translateY(${offset}px)`;

    visibleData.forEach(row => {
      tbody.appendChild(this.createRow(row));
    });
  }

  createRow(data) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.date}</td>
      <td>${data.matchup}</td>
      <td>${data.pts}</td>
      <!-- ... more columns -->
    `;
    return tr;
  }
}

// Initialize for tables with >100 rows
if (gameData.length > 100) {
  new VirtualTable('games-table', gameData);
}
```

### 5. Caching Strategy

#### Service Worker

```javascript
// service-worker.js
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DATA_CACHE = `data-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/css/main.css',
  '/js/app.js',
  '/fonts/inter-var.woff2'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    // Network first, fallback to cache
    event.respondWith(networkFirst(event.request));
  } else {
    // Cache first, fallback to network
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return cache.match(request);
  }
}
```

#### Client-Side Data Caching

```javascript
// Memory cache with LRU eviction
class LRUCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return null;

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }
}

// Chart data cache
const chartDataCache = new LRUCache(20);
```

### 6. Bundle Optimization

#### Code Splitting

```javascript
// Dynamic import for chart types
async function loadRadarChart() {
  const { createRadarChart } = await import('./charts/radar.js');
  return createRadarChart;
}

// Load only when needed
document.getElementById('show-radar').addEventListener('click', async () => {
  const createRadar = await loadRadarChart();
  createRadar(data);
});
```

#### Tree Shaking (Vite Config)

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'chart': ['chart.js'],
          'vendor': ['date-fns', 'lodash-es']
        }
      }
    },
    // Enable tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        dead_code: true,
        unused: true
      }
    }
  }
};
```

### 7. Skeleton Screens

```html
<!-- Loading skeleton while data loads -->
<div class="stats-grid skeleton" id="stats-skeleton">
  <div class="stat-card skeleton-card">
    <div class="skeleton-text skeleton-text-sm"></div>
    <div class="skeleton-text skeleton-text-lg"></div>
  </div>
  <!-- Repeat for 4 cards -->
</div>

<style>
.skeleton {
  pointer-events: none;
}

.skeleton-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.skeleton-text {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f5f5f5 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  height: 1em;
  margin-bottom: var(--space-sm);
}

.skeleton-text-sm {
  width: 60%;
  height: 0.875em;
}

.skeleton-text-lg {
  width: 40%;
  height: 2.5em;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>

<script>
// Replace skeleton with real content
function loadStats() {
  fetch('/api/stats')
    .then(res => res.json())
    .then(data => {
      document.getElementById('stats-skeleton').replaceWith(
        renderStatsGrid(data)
      );
    });
}
</script>
```

### 8. Compression

**Server-Side (Flask)**
```python
from flask_compress import Compress

app = Flask(__name__)
Compress(app)

# Configure compression
app.config['COMPRESS_MIMETYPES'] = [
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/javascript'
]
app.config['COMPRESS_LEVEL'] = 6  # Brotli compression
```

**Build-Time Minification**
```bash
# Vite handles minification automatically
npm run build

# Output:
# dist/assets/app-[hash].js (minified)
# dist/assets/main-[hash].css (minified)
```

---

## Export Capabilities

### 1. PDF Export

#### Server-Side Approach (Recommended)

**Flask Endpoint:**
```python
from flask import request, send_file
from playwright.async_api import async_playwright
import asyncio

@app.route('/api/export/pdf', methods=['POST'])
async def export_pdf():
    """
    Generate PDF from rendered HTML report
    """
    data = request.json
    report_url = data.get('url')  # URL of report to export

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto(report_url, wait_until='networkidle')

        # Wait for charts to render
        await page.wait_for_selector('.chart-container canvas')
        await asyncio.sleep(1)  # Extra time for Chart.js

        pdf_buffer = await page.pdf({
            'format': 'A4',
            'print_background': True,
            'margin': {
                'top': '10mm',
                'right': '10mm',
                'bottom': '10mm',
                'left': '10mm'
            },
            'display_header_footer': True,
            'header_template': '<div style="font-size:10px; text-align:center; width:100%;">Stat Discute - NBA Analysis</div>',
            'footer_template': '<div style="font-size:10px; text-align:center; width:100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
        })

        await browser.close()

        return send_file(
            io.BytesIO(pdf_buffer),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'nba-report-{datetime.now().strftime("%Y%m%d")}.pdf'
        )
```

**Client-Side Trigger:**
```javascript
async function exportPDF() {
  const button = document.getElementById('export-pdf');
  button.disabled = true;
  button.textContent = 'Génération du PDF...';

  try {
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: window.location.href
      })
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `nba-report-${Date.now()}.pdf`;
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Erreur lors de l\'export PDF');
  } finally {
    button.disabled = false;
    button.textContent = '📄 Exporter PDF';
  }
}
```

#### Client-Side Approach (Alternative)

```javascript
// Using jsPDF + html2canvas
async function exportPDFClient() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  // Capture charts as images
  const charts = document.querySelectorAll('.chart-container canvas');
  let yPos = 10;

  for (let i = 0; i < charts.length; i++) {
    const canvas = charts[i];
    const imgData = canvas.toDataURL('image/png');

    if (yPos + 100 > 280) {
      doc.addPage();
      yPos = 10;
    }

    doc.addImage(imgData, 'PNG', 10, yPos, 190, 90);
    yPos += 100;
  }

  // Add data table
  doc.autoTable({
    html: '#games-table',
    startY: yPos,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [85, 37, 131], // Lakers purple
      textColor: 255
    }
  });

  doc.save(`nba-report-${Date.now()}.pdf`);
}
```

### 2. Print Stylesheet

```css
@media print {
  /* Hide interactive elements */
  .no-print,
  nav,
  button,
  .filters,
  .chart-download {
    display: none !important;
  }

  /* Reset backgrounds */
  body {
    background: white !important;
    color: black !important;
  }

  /* Optimize for print */
  .container {
    max-width: 100%;
    padding: 0;
  }

  /* Page breaks */
  .chart-container,
  .stat-card {
    page-break-inside: avoid;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  section {
    page-break-before: auto;
  }

  /* Show URLs for links */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  /* Adjust colors for print */
  .stat-card {
    border: 1px solid #ccc;
    box-shadow: none;
  }

  /* Table optimization */
  table {
    page-break-inside: auto;
    font-size: 10pt;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group; /* Repeat on each page */
  }

  /* Chart sizing for print */
  .chart-container {
    height: 200mm;
  }

  /* Adjust font sizes */
  body {
    font-size: 11pt;
  }

  h1 { font-size: 20pt; }
  h2 { font-size: 16pt; }
  h3 { font-size: 14pt; }
}

/* Print button */
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
}
```

### 3. Share Functionality

#### Web Share API

```javascript
async function shareReport() {
  const shareData = {
    title: document.title,
    text: document.querySelector('.report-summary').textContent,
    url: window.location.href
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      console.log('Report shared successfully');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        fallbackShare();
      }
    }
  } else {
    fallbackShare();
  }
}

function fallbackShare() {
  // Copy link to clipboard
  navigator.clipboard.writeText(window.location.href).then(() => {
    showNotification('Lien copié dans le presse-papiers!');
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
```

```css
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--color-secondary);
  color: white;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  transform: translateY(100px);
  opacity: 0;
  transition: all var(--transition-base);
  z-index: var(--z-tooltip);
}

.notification.show {
  transform: translateY(0);
  opacity: 1;
}
```

#### Social Media Meta Tags

```html
<head>
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="Lakers vs Warriors: Analyse de performance">
  <meta property="og:description" content="Anthony Davis domine avec 25.4 PPG et 12.1 RPG. Analyse complète des statistiques.">
  <meta property="og:image" content="https://stat-discute.be/reports/preview-12345.png">
  <meta property="og:url" content="https://stat-discute.be/reports/ad-lebron-2024-10-23">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Stat Discute">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@statdiscute">
  <meta name="twitter:title" content="Lakers vs Warriors: Analyse NBA">
  <meta name="twitter:description" content="AD: 25.4 PPG, 12.1 RPG | LeBron: 23.8 PPG, 8.2 APG">
  <meta name="twitter:image" content="https://stat-discute.be/reports/preview-12345.png">
</head>
```

#### Preview Image Generation

**Server-Side (Puppeteer):**
```python
@app.route('/api/generate-preview/<report_id>')
async def generate_preview(report_id):
    """
    Generate social media preview image
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1200, 'height': 630})

        await page.goto(f'http://localhost:5000/reports/{report_id}')

        # Screenshot specific section
        screenshot = await page.locator('.report-header').screenshot()

        await browser.close()

        # Save preview image
        preview_path = f'static/previews/{report_id}.png'
        with open(preview_path, 'wb') as f:
            f.write(screenshot)

        return jsonify({'preview_url': f'/static/previews/{report_id}.png'})
```

### 4. CSV Export

```javascript
function exportCSV() {
  const data = getCurrentTableData();

  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `nba-stats-${Date.now()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
```

---

## Interactive Features

### 1. Multi-Dimensional Filtering

```javascript
class ReportFilters {
  constructor() {
    this.filters = {
      dateRange: { start: null, end: null },
      scenario: 'all',
      homeAway: 'all',
      opponent: [],
      result: 'all',
      minPoints: 0,
      maxPoints: 100
    };

    this.applyCallbacks = [];
  }

  setDateRange(start, end) {
    this.filters.dateRange = { start: new Date(start), end: new Date(end) };
    return this;
  }

  setScenario(scenario) {
    this.filters.scenario = scenario;
    return this;
  }

  setOpponents(teams) {
    this.filters.opponent = Array.isArray(teams) ? teams : [teams];
    return this;
  }

  applyFilters(games) {
    return games.filter(game => {
      // Date range
      if (this.filters.dateRange.start) {
        const gameDate = new Date(game.GAME_DATE);
        if (gameDate < this.filters.dateRange.start ||
            gameDate > this.filters.dateRange.end) {
          return false;
        }
      }

      // Scenario
      if (this.filters.scenario !== 'all' &&
          game.Scenario !== this.filters.scenario) {
        return false;
      }

      // Home/Away
      if (this.filters.homeAway !== 'all') {
        const isHome = game.MATCHUP.includes('vs.');
        if (this.filters.homeAway === 'home' && !isHome) return false;
        if (this.filters.homeAway === 'away' && isHome) return false;
      }

      // Opponent
      if (this.filters.opponent.length > 0) {
        const opponent = this.extractOpponent(game.MATCHUP);
        if (!this.filters.opponent.includes(opponent)) return false;
      }

      // Result
      if (this.filters.result !== 'all' &&
          game.WL !== this.filters.result) {
        return false;
      }

      // Points range
      if (game.PTS < this.filters.minPoints ||
          game.PTS > this.filters.maxPoints) {
        return false;
      }

      return true;
    });
  }

  onApply(callback) {
    this.applyCallbacks.push(callback);
    return this;
  }

  trigger() {
    this.applyCallbacks.forEach(cb => cb(this.filters));
  }

  reset() {
    this.filters = {
      dateRange: { start: null, end: null },
      scenario: 'all',
      homeAway: 'all',
      opponent: [],
      result: 'all',
      minPoints: 0,
      maxPoints: 100
    };
    this.trigger();
  }

  extractOpponent(matchup) {
    return matchup.split(/vs\.|@/)[1].trim();
  }
}

// Usage
const filters = new ReportFilters();

filters.onApply((activeFilters) => {
  const filtered = filters.applyFilters(allGames);
  updateCharts(filtered);
  updateTable(filtered);
  updateSummaryStats(filtered);
  updateURL(activeFilters);
});

document.getElementById('apply-filters').addEventListener('click', () => {
  filters
    .setDateRange(startDate, endDate)
    .setScenario(scenarioSelect.value)
    .setOpponents(selectedTeams)
    .trigger();
});
```

### 2. Table Sorting

```javascript
class SortableTable {
  constructor(tableId) {
    this.table = document.getElementById(tableId);
    this.data = [];
    this.sortColumn = null;
    this.sortDirection = 'asc';

    this.init();
  }

  init() {
    // Add click handlers to sortable headers
    this.table.querySelectorAll('th.sortable').forEach(header => {
      header.addEventListener('click', () => {
        const column = header.dataset.sort;
        this.sort(column);
      });
    });
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  sort(column) {
    // Toggle direction if same column
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Sort data
    this.data.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle dates
      if (column === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle numbers
      if (typeof aVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle strings
      const comparison = String(aVal).localeCompare(String(bVal));
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.updateSortIndicators(column);
    this.render();
  }

  updateSortIndicators(column) {
    // Remove all sort indicators
    this.table.querySelectorAll('.sort-icon').forEach(icon => {
      icon.textContent = '';
    });

    // Add indicator to sorted column
    const header = this.table.querySelector(`th[data-sort="${column}"]`);
    const icon = header.querySelector('.sort-icon');
    icon.textContent = this.sortDirection === 'asc' ? '▲' : '▼';
  }

  render() {
    const tbody = this.table.querySelector('tbody');
    tbody.innerHTML = '';

    this.data.forEach(row => {
      tbody.appendChild(this.createRow(row));
    });
  }

  createRow(data) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Date">${Formatter.formatDate(data.GAME_DATE, 'short')}</td>
      <td data-label="Adversaire">${data.MATCHUP}</td>
      <td data-label="Résultat">
        <span class="result-badge ${data.WL}">${data.WL === 'W' ? 'V' : 'D'}</span>
      </td>
      <td data-label="Points">${data.PTS}</td>
      <td data-label="Rebonds">${data.REB}</td>
      <td data-label="Passes">${data.AST}</td>
      <td data-label="FG%">${Formatter.formatPercentage(data.FG_PCT)}</td>
      <td data-label="+/-" class="${data.PLUS_MINUS >= 0 ? 'positive' : 'negative'}">
        ${data.PLUS_MINUS > 0 ? '+' : ''}${data.PLUS_MINUS}
      </td>
    `;
    return tr;
  }
}
```

### 3. Chart Interactions

```javascript
// Make charts interactive
function createInteractiveChart(chartId, games) {
  const ctx = document.getElementById(chartId).getContext('2d');

  const chart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const game = games[index];
          showGameModal(game);
        }
      },
      onHover: (event, elements) => {
        event.native.target.style.cursor =
          elements.length > 0 ? 'pointer' : 'default';
      }
    }
  });

  return chart;
}

// Game details modal
function showGameModal(game) {
  const modal = document.getElementById('game-modal');

  modal.querySelector('.modal-title').textContent = game.MATCHUP;
  modal.querySelector('.modal-content').innerHTML = `
    <div class="game-details">
      <div class="detail-row">
        <span class="label">Date:</span>
        <span class="value">${Formatter.formatDate(game.GAME_DATE, 'long')}</span>
      </div>
      <div class="detail-row">
        <span class="label">Résultat:</span>
        <span class="value ${game.WL === 'W' ? 'win' : 'loss'}">
          ${game.WL === 'W' ? 'Victoire' : 'Défaite'}
        </span>
      </div>
      <div class="stats-grid-modal">
        <div class="stat">
          <div class="stat-label">Points</div>
          <div class="stat-value">${game.PTS}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Rebonds</div>
          <div class="stat-value">${game.REB}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Passes</div>
          <div class="stat-value">${game.AST}</div>
        </div>
        <div class="stat">
          <div class="stat-label">FG%</div>
          <div class="stat-value">${Formatter.formatPercentage(game.FG_PCT)}</div>
        </div>
      </div>
      <div class="advanced-stats">
        <h4>Statistiques avancées</h4>
        <table>
          <tr>
            <td>True Shooting %</td>
            <td>${Formatter.formatPercentage(MetricsCalculator.trueShooting(game))}</td>
          </tr>
          <tr>
            <td>Effective FG%</td>
            <td>${Formatter.formatPercentage(MetricsCalculator.effectiveFG(game))}</td>
          </tr>
          <tr>
            <td>Game Score</td>
            <td>${MetricsCalculator.gameScore(game).toFixed(1)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  modal.showModal();
}
```

### 4. URL State Management

```javascript
class URLStateManager {
  static updateURL(filters) {
    const params = new URLSearchParams();

    if (filters.dateRange.start) {
      params.set('start', filters.dateRange.start.toISOString().split('T')[0]);
      params.set('end', filters.dateRange.end.toISOString().split('T')[0]);
    }

    if (filters.scenario !== 'all') {
      params.set('scenario', filters.scenario);
    }

    if (filters.opponent.length > 0) {
      params.set('opponent', filters.opponent.join(','));
    }

    if (filters.result !== 'all') {
      params.set('result', filters.result);
    }

    // Update URL without reload
    const url = new URL(window.location);
    url.search = params.toString();
    window.history.pushState({}, '', url);
  }

  static loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const filters = {};

    if (params.has('start') && params.has('end')) {
      filters.dateRange = {
        start: new Date(params.get('start')),
        end: new Date(params.get('end'))
      };
    }

    if (params.has('scenario')) {
      filters.scenario = params.get('scenario');
    }

    if (params.has('opponent')) {
      filters.opponent = params.get('opponent').split(',');
    }

    if (params.has('result')) {
      filters.result = params.get('result');
    }

    return filters;
  }

  static init(reportFilters) {
    // Load filters from URL on page load
    const urlFilters = this.loadFromURL();
    Object.assign(reportFilters.filters, urlFilters);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const urlFilters = this.loadFromURL();
      Object.assign(reportFilters.filters, urlFilters);
      reportFilters.trigger();
    });
  }
}

// Initialize on page load
URLStateManager.init(filters);
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Deliverables:**
- Base HTML template structure
- CSS architecture with design tokens
- Responsive grid system
- Typography and color system
- Component library (stat cards, buttons, forms)

**Tasks:**
1. Set up project structure
2. Create CSS variable system
3. Implement responsive breakpoints
4. Build reusable components
5. Test across browsers

**Success Criteria:**
- Responsive layout works 320px - 1920px
- All components render correctly
- Accessibility basics in place
- Performance baseline established

### Phase 2: Data Layer (Week 2-3)

**Deliverables:**
- CSV/JSON parsers
- Advanced metrics calculations
- Data transformation pipeline
- Caching implementation

**Tasks:**
1. Implement DataParser class
2. Build MetricsCalculator with formulas
3. Create ScenarioAggregator
4. Set up ChartDataFormatter
5. Add client-side caching

**Success Criteria:**
- Parse AD/LeBron CSV correctly
- Advanced metrics match expected values
- Transformations complete in <100ms
- Cache hit rate >70%

### Phase 3: Chart Integration (Week 3-4)

**Deliverables:**
- All 8 chart type configurations
- Lazy loading implementation
- Chart export functionality
- Mobile touch interactions

**Tasks:**
1. Integrate Chart.js library
2. Implement lazy rendering with Intersection Observer
3. Create chart config templates
4. Add accessibility features (ARIA, keyboard nav)
5. Optimize for mobile touch

**Success Criteria:**
- Charts render in <500ms
- Lazy loading reduces initial load
- All charts keyboard navigable
- Export to PNG works

### Phase 4: Interactivity (Week 4-5)

**Deliverables:**
- Filter system
- Table sorting and pagination
- URL state management
- Comparison controls
- Share functionality

**Tasks:**
1. Build ReportFilters class
2. Implement SortableTable
3. Add URL state persistence
4. Create player comparison UI
5. Integrate Web Share API

**Success Criteria:**
- Filters apply in <200ms
- Table sorts 1000 rows instantly
- URL sharing preserves state
- Share works on mobile

### Phase 5: Export & Polish (Week 5-6)

**Deliverables:**
- PDF export (server-side)
- Print stylesheet
- Accessibility audit fixes
- Performance optimizations
- Cross-browser testing

**Tasks:**
1. Set up Puppeteer PDF generation
2. Create print CSS
3. Run accessibility audit (WAVE, axe)
4. Optimize bundle size
5. Test on real devices

**Success Criteria:**
- PDF exports in <5s
- Print quality matches screen
- WCAG 2.1 AA compliance
- Lighthouse score >90
- Works on iOS/Android

### Phase 6: Bilingual & Documentation (Week 6)

**Deliverables:**
- I18n system implementation
- French/English translations
- Developer documentation
- User guide

**Tasks:**
1. Implement i18n.js
2. Create translation files
3. Add language toggle
4. Document API and components
5. Create usage examples

**Success Criteria:**
- Seamless language switching
- 100% UI translation coverage
- Documentation complete
- Examples functional

---

## Testing Requirements

### 1. Browser Compatibility

**Target Browsers:**
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+ (iOS/macOS)
- Edge 90+

**Testing Matrix:**

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| CSS Variables | ✓ | ✓ | ✓ | ✓ |
| Chart.js | ✓ | ✓ | ✓ | ✓ |
| Web Share API | ✓ | ✗ | ✓ | ✓ |
| Service Worker | ✓ | ✓ | ✓ | ✓ |

### 2. Device Testing

**Physical Devices:**
- iPhone SE (375px - smallest common)
- iPhone 13 Pro (390px)
- iPad Air (820px)
- MacBook Pro (1440px)
- Desktop (1920px)

**Emulation:**
- Chrome DevTools device emulation
- BrowserStack for additional devices

### 3. Accessibility Testing

**Tools:**
- WAVE browser extension
- axe DevTools
- Lighthouse accessibility audit
- NVDA screen reader (Windows)
- VoiceOver (macOS/iOS)

**Checklist:**
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Color contrast meets AA standards
- [ ] Screen reader navigation logical
- [ ] No keyboard traps

### 4. Performance Testing

**Tools:**
- Lighthouse (Chrome DevTools)
- WebPageTest
- Chrome DevTools Performance profiler

**Metrics:**
```
Target Scores (Lighthouse):
- Performance: >90
- Accessibility: 100
- Best Practices: >90
- SEO: >90

Core Web Vitals:
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1
```

### 5. Data Accuracy Testing

**Validation:**
- Manual calculation verification for advanced metrics
- Compare with NBA official stats
- Cross-reference with nba_api results

**Test Cases:**
```javascript
// Example test
describe('MetricsCalculator', () => {
  test('calculates True Shooting correctly', () => {
    const game = {
      PTS: 30,
      FGA: 17,
      FTA: 4
    };

    const ts = MetricsCalculator.trueShooting(game);
    const expected = 30 / (2 * (17 + 0.44 * 4));

    expect(ts).toBeCloseTo(expected, 3);
  });
});
```

### 6. Cross-Browser Visual Regression

**Tool:** Percy or BackstopJS

**Test Scenarios:**
- Homepage desktop/mobile
- Player comparison report
- Chart rendering consistency
- Table layouts
- Modal dialogs

---

## File Structure

```
stat-discute.be/
├── templates/
│   ├── base/
│   │   ├── report-base.html
│   │   └── components/
│   │       ├── stat-card.html
│   │       ├── chart-container.html
│   │       ├── data-table.html
│   │       └── filters.html
│   ├── reports/
│   │   ├── player-comparison.html
│   │   ├── team-performance.html
│   │   ├── matchup-analysis.html
│   │   ├── betting-edge.html
│   │   └── injury-impact.html
│   └── partials/
│       ├── header.html
│       ├── footer.html
│       └── navigation.html
├── static/
│   ├── css/
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   ├── typography.css
│   │   │   └── variables.css
│   │   ├── layout/
│   │   │   ├── grid.css
│   │   │   ├── container.css
│   │   │   └── spacing.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── tables.css
│   │   │   ├── charts.css
│   │   │   ├── forms.css
│   │   │   └── modals.css
│   │   ├── utilities/
│   │   │   ├── colors.css
│   │   │   ├── display.css
│   │   │   └── responsive.css
│   │   ├── print.css
│   │   └── main.css
│   ├── js/
│   │   ├── data/
│   │   │   ├── parsers.js
│   │   │   ├── transformers.js
│   │   │   ├── calculators.js
│   │   │   └── cache.js
│   │   ├── charts/
│   │   │   ├── config.js
│   │   │   ├── renderers.js
│   │   │   ├── interactions.js
│   │   │   └── export.js
│   │   ├── components/
│   │   │   ├── filters.js
│   │   │   ├── sortable-table.js
│   │   │   ├── modal.js
│   │   │   └── notifications.js
│   │   ├── utils/
│   │   │   ├── formatter.js
│   │   │   ├── url-state.js
│   │   │   └── helpers.js
│   │   ├── i18n.js
│   │   ├── app.js
│   │   └── service-worker.js
│   ├── fonts/
│   │   └── inter-var.woff2
│   ├── assets/
│   │   ├── teams/
│   │   │   └── *.svg
│   │   └── images/
│   │       └── logo.svg
│   └── locales/
│       ├── fr.json
│       └── en.json
├── claudedocs/
│   └── HTML_REPORTING_TEMPLATE_SPECIFICATION.md (this file)
├── nba-schedule-api/
│   └── (existing Flask backend)
└── database/
    └── (existing PostgreSQL schema)
```

---

## Quick Start Guide

### For Developers

**1. Set up development environment:**
```bash
cd stat-discute.be
npm install  # Install build tools (Vite)
```

**2. Start Flask backend:**
```bash
cd nba-schedule-api
python3 nba_api_server.py
```

**3. Start Vite dev server:**
```bash
npm run dev
# Opens http://localhost:3000
```

**4. Build for production:**
```bash
npm run build
# Output in dist/
```

### For Designers

**Key Design Files:**
- `/static/css/base/variables.css` - Design tokens
- `/templates/base/report-base.html` - Base template
- `/static/css/components/` - Component styles

**Color Palette:**
- Primary: #FDB927 (Lakers gold)
- Secondary: #552583 (Lakers purple)
- Win: #4CAF50, Loss: #F44336

**Typography:**
- Sans: Inter
- Mono: Roboto Mono
- Scale: 12px to 40px (responsive)

### For Content Creators

**Creating a New Report:**

1. Copy template:
```bash
cp templates/reports/player-comparison.html templates/reports/my-report.html
```

2. Update Flask route:
```python
@app.route('/reports/my-report')
def my_report():
    # Fetch data
    data = get_report_data()
    return render_template('reports/my-report.html', data=data)
```

3. Customize HTML:
```html
{{#extend "base/report-base.html"}}
  {{#block "content"}}
    <!-- Your custom report content -->
  {{/block}}
{{/extend}}
```

---

## Appendix

### A. Advanced Metrics Formulas

**True Shooting Percentage:**
```
TS% = PTS / (2 * (FGA + 0.44 * FTA))
```

**Effective Field Goal Percentage:**
```
eFG% = (FGM + 0.5 * 3PM) / FGA
```

**Game Score (John Hollinger):**
```
GmSc = PTS + 0.4*FGM - 0.7*FGA - 0.4*(FTA-FTM) + 0.7*OREB + 0.3*DREB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV
```

**Usage Rate:**
```
USG% = 100 * ((FGA + 0.44*FTA + TOV) * (Tm_MP / 5)) / (MIN * (Tm_FGA + 0.44*Tm_FTA + Tm_TOV))
```

**Player Efficiency Rating (PER):**
```
PER = (1/MIN) * (3PM + (2/3)*AST + (2-(factor*(Tm_AST/Tm_FGM)))*FGM + (FTM*0.5*(1+(1-(Tm_AST/Tm_FGM))+(2/3)*(Tm_AST/Tm_FGM))) - VOP*TOV - VOP*DRB%*(FGA-FGM) - VOP*0.44*(0.44+(0.56*DRB%))*(FTA-FTM) + VOP*(1-DRB%)*(TRB-ORB) + VOP*DRB%*ORB + VOP*STL + VOP*DRB%*BLK - PF*((lgFT/lgPF)-0.44*(lgFTA/lgPF)*VOP))
```

### B. Basketball Glossary

| Term | French | Definition |
|------|--------|------------|
| Points | Points | Nombre de points marqués |
| Rebounds | Rebonds | Ballons récupérés après un tir manqué |
| Assists | Passes décisives | Passes ayant directement mené à un panier |
| Steals | Interceptions | Ballons volés à l'adversaire |
| Blocks | Contres | Tirs adverses bloqués |
| Turnovers | Balles perdues | Pertes de balle |
| Field Goal % | Pourcentage aux tirs | Taux de réussite aux tirs (hors lancers francs) |
| 3-Point % | Pourcentage à 3-points | Taux de réussite aux tirs à 3 points |
| Free Throw % | Pourcentage aux lancers | Taux de réussite aux lancers francs |
| Plus/Minus | +/- | Différentiel de points quand le joueur est sur le terrain |

### C. Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Support Strategy |
|---------|--------|---------|--------|------|------------------|
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ | Baseline |
| CSS Variables | 49+ | 31+ | 9.1+ | 15+ | Baseline |
| ES6 Modules | 61+ | 60+ | 10.1+ | 16+ | Baseline |
| Intersection Observer | 51+ | 55+ | 12.1+ | 15+ | Baseline |
| Web Share API | 89+ | ✗ | 12.2+ | 93+ | Progressive enhancement |
| Service Worker | 40+ | 44+ | 11.1+ | 17+ | Progressive enhancement |

**Polyfill Strategy:**
- Core features: No polyfills needed (modern baseline)
- Web Share API: Fallback to clipboard copy
- Older browsers: Display upgrade notice

### D. Performance Budget

```yaml
Performance Budget:
  JavaScript:
    total: < 200KB (gzipped)
    main_bundle: < 100KB
    chart_js: < 80KB
    vendor: < 20KB

  CSS:
    total: < 50KB (gzipped)
    critical: < 14KB (inline)
    main: < 36KB

  Fonts:
    inter_var: < 100KB (woff2)

  Images:
    logos: < 5KB each (SVG)
    photos: < 50KB each (WebP)

  Total Page Weight:
    initial_load: < 500KB
    full_report: < 1MB

  Timing:
    ttfb: < 600ms
    fcp: < 1.8s
    lcp: < 2.5s
    tti: < 3.0s
```

---

## Conclusion

This specification provides a comprehensive, production-ready blueprint for implementing an HTML reporting template system optimized for NBA sports betting analytics. The architecture prioritizes:

1. **Mobile-First Performance** - Sub-3s loads on 3G connections
2. **Accessibility Excellence** - WCAG 2.1 AA compliance throughout
3. **Data Accuracy** - Validated advanced metrics calculations
4. **Bilingual Support** - Seamless French/English switching
5. **Export Quality** - Professional PDF and print output
6. **Betting Context** - Analytics tailored for sports betting decisions

**Next Steps:**
1. Validate design with stakeholders
2. Begin Phase 1 implementation
3. Set up CI/CD pipeline
4. Schedule user testing sessions
5. Plan production deployment

**Maintenance:**
This specification should be reviewed quarterly and updated based on:
- User feedback and analytics
- New NBA statistical methodologies
- Browser compatibility changes
- Performance optimization opportunities
- Accessibility guideline updates

---

**Document Version:** 1.0
**Last Updated:** 2025-10-23
**Maintained By:** System Architect
**Review Schedule:** Quarterly
