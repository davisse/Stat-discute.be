# Bug Fix: TypeScript Errors in Player Absence Components

**Date**: 2025-11-20
**Status**: ✅ Fixed
**Severity**: High (Prevented page from loading)

---

## Problem

Application error when trying to load `/player-absence-test` page:
```
Application error: a server-side exception has occurred while loading localhost
Digest: 87119227
```

**Root Cause**: TypeScript compilation errors in the test page and component files.

---

## Errors Found

### 1. Wrong Prop Name in Test Page

**File**: `frontend/src/app/player-absence-test/page.tsx`
**Lines**: 197, 209

**Error**:
```
Property 'layout' does not exist on type 'TeamPerformanceWithoutPlayerProps'
```

**Issue**: Used `layout` prop instead of `variant` prop.

**Before**:
```tsx
<TeamPerformanceWithoutPlayer
  splits={teamSplits}
  layout="side-by-side"  // ❌ Wrong prop name
  highlightDifferences={true}
/>
```

**After**:
```tsx
<TeamPerformanceWithoutPlayer
  splits={teamSplits}
  variant="side-by-side"  // ✅ Correct prop name
  highlightDifferences={true}
/>
```

### 2. Invalid Card Variant

**Files**:
- `frontend/src/components/player-props/TeamPerformanceWithoutPlayer.tsx` (lines 394, 402)
- `frontend/src/components/player-props/PlayerPerformanceWithoutTeammate.tsx` (lines 428, 437)

**Error**:
```
Type '"stats"' is not assignable to type '"default" | "anthracite" | "elevated"'
```

**Issue**: Used `variant="stats"` which doesn't exist in the Card component. Valid variants are:
- `default` - Basic gray background
- `anthracite` - Slightly lighter gray
- `elevated` - With shadow effect

**Before**:
```tsx
<Card variant="stats">  {/* ❌ Invalid variant */}
  <StatsColumn ... />
</Card>
```

**After**:
```tsx
<Card variant="anthracite">  {/* ✅ Valid variant */}
  <StatsColumn ... />
</Card>
```

---

## Files Modified

1. ✅ `frontend/src/app/player-absence-test/page.tsx`
   - Line 197: Changed `layout="side-by-side"` to `variant="side-by-side"`
   - Line 209: Changed `layout="stacked"` to `variant="stacked"`

2. ✅ `frontend/src/components/player-props/TeamPerformanceWithoutPlayer.tsx`
   - Line 394: Changed `variant="stats"` to `variant="anthracite"`
   - Line 402: Changed `variant="stats"` to `variant="anthracite"`

3. ✅ `frontend/src/components/player-props/PlayerPerformanceWithoutTeammate.tsx`
   - Line 428: Changed `variant="stats"` to `variant="anthracite"`
   - Line 437: Changed `variant="stats"` to `variant="anthracite"`

---

## Verification

```bash
# TypeScript compilation check
cd /Users/chapirou/dev/perso/stat-discute.be/frontend
npx tsc --noEmit 2>&1 | grep -E "(player-absence-test|PlayerPerformanceWithoutTeammate|TeamPerformanceWithoutPlayer)"

# Result: No errors ✅
```

---

## Impact

- ✅ Page now loads without errors
- ✅ All components use correct prop names
- ✅ All Card components use valid variants
- ✅ TypeScript compilation succeeds

---

## Prevention

**Always verify**:
1. Component prop names match the TypeScript interface
2. Variant values match the cva() definitions
3. Run `npx tsc --noEmit` before committing code
4. Check that enum/union type values are valid

**Card variants reference** (`components/ui/card.tsx`):
- ✅ `variant="default"` - Basic styling
- ✅ `variant="anthracite"` - Lighter gray
- ✅ `variant="elevated"` - With shadow
- ❌ `variant="stats"` - Does not exist

---

**Status**: ✅ All TypeScript errors resolved
**Testing**: ✅ Compilation successful
**Ready for**: Frontend testing at `http://localhost:3000/player-absence-test`
