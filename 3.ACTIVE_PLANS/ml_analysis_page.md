# ML Analysis Page Implementation Plan

## Overview
Create a comprehensive ML Analysis dashboard for NBA totals betting predictions, integrating the existing Python ML pipeline with the Next.js frontend.

**User Selections:**
- Content: Full Dashboard (Tonight's picks + backtest results + feature importance + model comparison)
- Data Source: API calls Python scripts

---

## Phase 1: API Route Layer

### 1.1 Create `/api/ml/predictions` Route
**File:** `frontend/src/app/api/ml/predictions/route.ts`

**Functionality:**
- Execute `predict_tonight.py` via child_process
- Parse Python script output (capture stdout)
- Return structured JSON response

**Response Schema:**
```typescript
interface PredictionsResponse {
  date: string
  games: {
    matchup: string
    gameId: string
    line: number
    prediction: 'OVER' | 'UNDER'
    confidence: number
    probOver: number
    logisticProb: number
    xgboostProb: number
    odds: number
    expectedValue: number
  }[]
  highConfidencePicks: GamePrediction[]  // confidence >= 58%
  modelInfo: {
    trainingSamples: number
    features: number
    seasons: string[]
  }
}
```

### 1.2 Create `/api/ml/backtest` Route
**File:** `frontend/src/app/api/ml/backtest/route.ts`

**Functionality:**
- Execute `backtest_walk_forward.py` or read cached results
- Return backtest metrics by confidence threshold

**Response Schema:**
```typescript
interface BacktestResponse {
  thresholds: {
    threshold: number
    accuracy: number
    roi: number
    totalBets: number
    wins: number
    losses: number
    profit: number
  }[]
  byModel: {
    logistic: ModelMetrics
    xgboost: ModelMetrics
    ensemble: ModelMetrics
  }
  features: {
    name: string
    importance: number
    category: string
  }[]
}
```

### 1.3 Create `/api/ml/results` Route
**File:** `frontend/src/app/api/ml/results/route.ts`

**Functionality:**
- Query database for recent predictions vs actual results
- Calculate hit rate by date range

---

## Phase 2: Python Script Modifications

### 2.1 Add JSON Output Mode to `predict_tonight.py`
**File:** `1.DATABASE/etl/ml/predict_tonight.py`

**Changes:**
- Add `--json` flag for JSON output
- Add `--output` flag for file output path
- Structure output for API consumption

```python
if args.json:
    output = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'games': predictions,
        'highConfidencePicks': [p for p in predictions if p['confidence'] >= 0.58],
        'modelInfo': {
            'trainingSamples': len(X_train),
            'features': len(feature_names),
            'seasons': available_seasons
        }
    }
    print(json.dumps(output))
```

### 2.2 Create `backtest_summary.py` Script
**File:** `1.DATABASE/etl/ml/backtest_summary.py`

**Purpose:** Generate backtest summary JSON for API consumption
- Load cached backtest results or run quick summary
- Output feature importance rankings
- Output metrics by confidence threshold

---

## Phase 3: Frontend Page & Components

### 3.1 Create ML Analysis Page
**File:** `frontend/src/app/ml-analysis/page.tsx`

**Layout (4 sections):**
```
┌─────────────────────────────────────────────────────┐
│              Tonight's Predictions                   │
│  ┌─────────────────────────────────────────────┐    │
│  │ Table: Matchup | Line | Pick | Conf | EV    │    │
│  │ Highlighted: High confidence picks           │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Backtest Performance          │  Model Comparison  │
│  ┌──────────────────────┐      │  ┌──────────────┐  │
│  │ ROI by Threshold     │      │  │ Bar Chart    │  │
│  │ (Line Chart)         │      │  │ Log vs XGB   │  │
│  └──────────────────────┘      │  └──────────────┘  │
├─────────────────────────────────────────────────────┤
│              Feature Importance                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ Horizontal Bar Chart - Top 15 Features       │    │
│  │ Grouped by category (color coded)            │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 3.2 Create Components

**PredictionsTable Component:**
- `frontend/src/components/ml/PredictionsTable.tsx`
- Sortable columns
- Confidence color gradient (green = high)
- EV calculation display
- High confidence row highlighting

**ROIChart Component:**
- `frontend/src/components/ml/ROIChart.tsx`
- Line chart showing ROI by confidence threshold
- Highlight optimal threshold zone
- Based on existing BarChart patterns

**ModelComparisonChart Component:**
- `frontend/src/components/ml/ModelComparisonChart.tsx`
- Grouped bar chart: Logistic vs XGBoost vs Ensemble
- Metrics: Accuracy, ROI, Sharpe

**FeatureImportanceChart Component:**
- `frontend/src/components/ml/FeatureImportanceChart.tsx`
- Horizontal bar chart
- Category color coding (5 categories)
- Top 15 features

### 3.3 Client/Server Component Strategy
- **Server Component:** Page wrapper, initial data fetch
- **Client Components:** Interactive charts, refresh button, filters

---

## Phase 4: Data Integration

### 4.1 Types Definition
**File:** `frontend/src/types/ml.ts`

```typescript
export interface GamePrediction {
  matchup: string
  gameId: string
  line: number
  prediction: 'OVER' | 'UNDER'
  confidence: number
  probOver: number
  logisticProb: number
  xgboostProb: number
  odds: number
  expectedValue: number
}

export interface BacktestThreshold {
  threshold: number
  accuracy: number
  roi: number
  totalBets: number
  profit: number
}

export interface FeatureImportance {
  name: string
  importance: number
  category: 'team_performance' | 'rest_schedule' | 'matchup' | 'trends' | 'context'
}
```

### 4.2 API Client Functions
**File:** `frontend/src/lib/ml-api.ts`

```typescript
export async function fetchPredictions(): Promise<PredictionsResponse>
export async function fetchBacktest(): Promise<BacktestResponse>
export async function fetchResults(days: number): Promise<ResultsResponse>
```

---

## Phase 5: Styling & Polish

### 5.1 Design Token Integration
- Use monochrome color system from design-tokens.ts
- Confidence gradient: gray-300 (low) → white (high)
- Category colors for feature importance chart
- Consistent spacing (8px grid)

### 5.2 Loading States
- Skeleton components during Python script execution
- Progress indicator for long-running backtests

### 5.3 Error Handling
- Display error states for failed API calls
- Fallback UI when no games today

---

## Implementation Order

1. **Phase 2.1** - Modify predict_tonight.py for JSON output
2. **Phase 1.1** - Create /api/ml/predictions route
3. **Phase 3.1** - Create basic page with PredictionsTable
4. **Phase 2.2** - Create backtest_summary.py
5. **Phase 1.2** - Create /api/ml/backtest route
6. **Phase 3.2** - Add ROI and Model Comparison charts
7. **Phase 3.2** - Add Feature Importance chart
8. **Phase 5** - Polish and loading states

---

## File Summary

### New Files:
- `frontend/src/app/ml-analysis/page.tsx`
- `frontend/src/app/api/ml/predictions/route.ts`
- `frontend/src/app/api/ml/backtest/route.ts`
- `frontend/src/app/api/ml/results/route.ts`
- `frontend/src/components/ml/PredictionsTable.tsx`
- `frontend/src/components/ml/ROIChart.tsx`
- `frontend/src/components/ml/ModelComparisonChart.tsx`
- `frontend/src/components/ml/FeatureImportanceChart.tsx`
- `frontend/src/types/ml.ts`
- `frontend/src/lib/ml-api.ts`
- `1.DATABASE/etl/ml/backtest_summary.py`

### Modified Files:
- `1.DATABASE/etl/ml/predict_tonight.py` (add --json flag)
- `frontend/src/components/layout/AppLayout.tsx` (add nav item)

---

## Success Criteria

- [ ] Tonight's predictions display with all 7 columns
- [ ] High confidence picks highlighted (>=58%)
- [ ] ROI chart shows clear threshold optimization
- [ ] Model comparison shows Logistic vs XGBoost vs Ensemble
- [ ] Feature importance shows top 15 with categories
- [ ] Page loads in <5 seconds (cached backtest data)
- [ ] Refresh button triggers new predictions
- [ ] Mobile responsive layout
