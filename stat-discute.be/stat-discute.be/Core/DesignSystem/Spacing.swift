//
//  Spacing.swift
//  stat-discute.be
//
//  Design System: Spacing & Layout Tokens
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.1
//

import SwiftUI

// MARK: - Spacing System (8pt Grid)

enum Spacing {

    // MARK: - Base Unit

    /// Base unit: 8pt
    static let unit: CGFloat = 8

    // MARK: - Named Spacing

    /// 4pt - Half unit
    static let xxs: CGFloat = 4

    /// 8pt - 1 unit
    static let xs: CGFloat = 8

    /// 12pt - 1.5 units
    static let sm: CGFloat = 12

    /// 16pt - 2 units (default padding)
    static let md: CGFloat = 16

    /// 20pt - 2.5 units
    static let lg: CGFloat = 20

    /// 24pt - 3 units (section gap)
    static let xl: CGFloat = 24

    /// 32pt - 4 units
    static let xxl: CGFloat = 32

    /// 40pt - 5 units
    static let xxxl: CGFloat = 40

    /// 48pt - 6 units
    static let huge: CGFloat = 48

    // MARK: - Screen Margins

    /// Leading/Trailing margin: 16pt
    static let screenHorizontal: CGFloat = 16

    /// Top margin (below safe area): 8pt
    static let screenTop: CGFloat = 8

    /// Bottom margin (above tab bar): 16pt
    static let screenBottom: CGFloat = 16

    // MARK: - Card Spacing

    /// Card internal padding: 16pt
    static let cardPadding: CGFloat = 16

    /// Element gap within card: 12pt
    static let cardElementGap: CGFloat = 12

    /// Card corner radius: 16pt
    static let cardRadius: CGFloat = 16

    // MARK: - Component Spacing

    /// Text line spacing: 4pt
    static let textLineSpacing: CGFloat = 4

    /// Icon-text gap: 8pt
    static let iconTextGap: CGFloat = 8

    /// Button internal padding horizontal: 16pt
    static let buttonPaddingH: CGFloat = 16

    /// Button internal padding vertical: 12pt
    static let buttonPaddingV: CGFloat = 12

    // MARK: - Touch Targets

    /// Minimum touch target: 44pt (Apple HIG)
    static let touchTarget: CGFloat = 44

    /// Tab bar height: 49pt + safe area
    static let tabBarHeight: CGFloat = 49
}

// MARK: - Corner Radius

enum CornerRadius {
    /// 8pt - Small components
    static let small: CGFloat = 8

    /// 12pt - Medium components
    static let medium: CGFloat = 12

    /// 16pt - Cards
    static let large: CGFloat = 16

    /// 24pt - Sheets, large modals
    static let xlarge: CGFloat = 24

    /// Full circle
    static let full: CGFloat = .infinity

    /// Pill shape (same as full, for semantic clarity)
    static let pill: CGFloat = .infinity
}

// MARK: - Shadow

enum AppShadow {

    struct ShadowStyle {
        let color: Color
        let radius: CGFloat
        let x: CGFloat
        let y: CGFloat
    }

    /// Subtle shadow for cards
    static let small = ShadowStyle(
        color: Color.black.opacity(0.15),
        radius: 4,
        x: 0,
        y: 2
    )

    /// Medium shadow for elevated content
    static let medium = ShadowStyle(
        color: Color.black.opacity(0.2),
        radius: 8,
        x: 0,
        y: 4
    )

    /// Large shadow for modals
    static let large = ShadowStyle(
        color: Color.black.opacity(0.25),
        radius: 16,
        x: 0,
        y: 8
    )
}

// MARK: - View Extension for Shadows

extension View {
    func appShadow(_ style: AppShadow.ShadowStyle) -> some View {
        self.shadow(
            color: style.color,
            radius: style.radius,
            x: style.x,
            y: style.y
        )
    }
}

// MARK: - Edge Insets Helper

extension EdgeInsets {
    /// Standard screen margins
    static let screenMargins = EdgeInsets(
        top: Spacing.screenTop,
        leading: Spacing.screenHorizontal,
        bottom: Spacing.screenBottom,
        trailing: Spacing.screenHorizontal
    )

    /// Card internal padding
    static let cardPadding = EdgeInsets(
        top: Spacing.cardPadding,
        leading: Spacing.cardPadding,
        bottom: Spacing.cardPadding,
        trailing: Spacing.cardPadding
    )
}
