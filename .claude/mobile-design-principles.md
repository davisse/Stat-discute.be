# Mobile Frontend Design Principles

## Core Philosophy
The user should NEVER have to zoom in to see content. Every element must be visible and readable at default zoom level. Zooming means losing context of other elements on screen.

## Space Maximization Rules

### 1. Edge-to-Edge Layouts on Mobile
- Remove borders, padding, and backgrounds on mobile (`sm:border`, `sm:p-4`, etc.)
- Use negative margins (`-mx-2 sm:mx-0`) to extend content to screen edges
- Page-level padding should be minimal on mobile (`px-2 sm:px-6 md:px-8`)

### 2. Chart/Graph Optimization
- **Reduce axis padding to minimum**: Data points should be as close as possible to chart boundaries
- Padding between max/min values and chart edges should be minimal (3-5% max, not 15%)
- Remove axis labels on mobile if they consume too much space
- Hide legends on mobile or make them compact

### 3. Component Styling Pattern
```tsx
// Mobile-first: no styling, then add on larger screens
<div className="bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg p-2 sm:p-4">

// Edge-to-edge wrapper
<div className="-mx-2 sm:mx-0">
```

### 4. Typography
- Use smaller font sizes on mobile (`text-[9px] sm:text-[10px]`)
- Reduce margins between elements (`mb-0.5 sm:mb-1`)

### 5. Whitespace Management
- Every pixel of horizontal whitespace on mobile is precious
- Vertical scrolling is acceptable; horizontal waste is not
- Data visualization should fill available space, not float in padding

## Implementation Checklist
- [ ] Page padding reduced on mobile
- [ ] Component borders/backgrounds removed on mobile
- [ ] Negative margins applied for edge-to-edge
- [ ] Chart axis padding minimized
- [ ] Labels hidden or compacted on mobile
- [ ] Font sizes responsive
