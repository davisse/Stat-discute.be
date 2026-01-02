# Home View Logo Customization Guide

## Overview

The new `HomeView.swift` includes a branded homepage with an animated logo. Currently, it uses a basketball icon as a placeholder. Follow this guide to add your custom logo.

## Current Implementation

The logo is rendered in `HomeView.swift` in the `logoView` computed property (around line 97):

```swift
private var logoView: some View {
    ZStack {
        // Glow effect
        Circle()
            .fill(...)
        
        // Logo container with SF Symbol placeholder
        ZStack {
            Circle().stroke(...)
            Circle().fill(.ultraThinMaterial)
            
            // 👇 THIS IS WHERE YOU CUSTOMIZE
            VStack(spacing: 4) {
                Image(systemName: "basketball.fill")  // Replace this!
                    .font(.system(size: 40, weight: .bold))
                
                Text("StatDiscute")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
            }
        }
    }
}
```

## Option 1: Use Your Custom Logo Image (Recommended)

### Step 1: Add Logo to Asset Catalog

1. Open your Xcode project
2. Navigate to **Assets.xcassets** in the Project Navigator
3. Click the **+** button at the bottom
4. Select **"New Image Set"**
5. Name it **"AppLogo"**
6. Drag your logo files into the appropriate slots:
   - 1x: Your logo at base resolution (e.g., 120x120 pt)
   - 2x: Double resolution (e.g., 240x240 px)
   - 3x: Triple resolution (e.g., 360x360 px)

**Recommended logo specs:**
- Format: PNG with transparency
- Size: 120x120 points base size
- Style: Works well on dark backgrounds
- File sizes: Keep under 100KB each

### Step 2: Update the Code

Replace the logo content in `HomeView.swift`:

```swift
// Replace this section:
VStack(spacing: 4) {
    Image(systemName: "basketball.fill")
        .font(.system(size: 40, weight: .bold))
        .foregroundStyle(...)
    
    Text("StatDiscute")
        .font(.system(size: 14, weight: .bold, design: .rounded))
        .foregroundColor(.foregroundPrimary)
}

// With this:
Image("AppLogo")  // References your asset
    .resizable()
    .scaledToFit()
    .frame(width: 80, height: 80)
```

If you want to keep the app name below the logo:

```swift
VStack(spacing: 8) {
    Image("AppLogo")
        .resizable()
        .scaledToFit()
        .frame(width: 80, height: 80)
    
    Text("StatDiscute")
        .font(.system(size: 14, weight: .bold, design: .rounded))
        .foregroundColor(.foregroundPrimary)
}
```

## Option 2: Use a Different SF Symbol

If you want to use a different system icon temporarily:

```swift
Image(systemName: "chart.line.uptrend.xyaxis.circle.fill")
    .font(.system(size: 40, weight: .bold))
    .foregroundStyle(...)
```

Browse SF Symbols app (included with Xcode) for options.

## Option 3: Advanced - Custom Shape Logo

For vector-based logos drawn in code:

```swift
LogoShape()
    .fill(
        LinearGradient(
            colors: [Color.accent, Color.monteCarlo],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    )
    .frame(width: 80, height: 80)

// Define your custom shape
struct LogoShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        // Add your custom drawing code here
        return path
    }
}
```

## Customizing the Logo Container

### Adjust Size

Change the frame sizes in the `logoView`:

```swift
// Outer ring
Circle()
    .stroke(...)
    .frame(width: 120, height: 120)  // Change these

// Inner background  
Circle()
    .fill(.ultraThinMaterial)
    .frame(width: 110, height: 110)  // Change these
```

### Change Colors

The logo uses a gradient. Customize it:

```swift
LinearGradient(
    colors: [
        Color.accent,      // Blue by default
        Color.monteCarlo   // Purple by default
    ],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
)
```

Or use solid colors:

```swift
// Replace .foregroundStyle(...) with:
.foregroundColor(.accent)
// or
.foregroundColor(.white)
```

### Adjust Glow Effect

Modify the glow intensity:

```swift
RadialGradient(
    colors: [
        Color.accent.opacity(0.3),  // Stronger glow: increase opacity
        Color.accent.opacity(0.1),  // Softer glow: decrease opacity
        Color.clear
    ],
    center: .center,
    startRadius: 40,    // Closer glow: decrease
    endRadius: 120      // Wider glow: increase
)
.blur(radius: 20)       // More blur: increase
```

## Testing Your Changes

After making changes:

1. Build and run your app (Cmd + R)
2. The logo will animate on first appearance
3. Test on different devices to ensure sizing looks good
4. Check in both light/dark mode if applicable

## Animation

The logo has a scale + rotation animation on appear. Customize in `onAppear`:

```swift
.onAppear {
    withAnimation(.spring(response: 1.0, dampingFraction: 0.6)) {
        isLogoAnimating = true
    }
}
```

Adjust:
- `response`: Speed (lower = faster)
- `dampingFraction`: Bounciness (lower = more bounce)

---

## Questions?

The logo is in `HomeView.swift` around line 97-170. Feel free to experiment with the design!
