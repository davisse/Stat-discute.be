//
//  Typography.swift
//  stat-discute.be
//
//  Design System: Typography Tokens
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.2
//

import SwiftUI

// MARK: - Typography

enum Typography {

    // MARK: - Display & Titles

    /// 34pt Bold - Screen titles
    static let display = Font.system(size: 34, weight: .bold, design: .default)

    /// 28pt Bold - Section headers
    static let title1 = Font.system(size: 28, weight: .bold, design: .default)

    /// 22pt Bold - Card titles
    static let title2 = Font.system(size: 22, weight: .bold, design: .default)

    /// 20pt Semibold - Subsections
    static let title3 = Font.system(size: 20, weight: .semibold, design: .default)

    // MARK: - Body Text

    /// 17pt Semibold - Emphasis
    static let headline = Font.system(size: 17, weight: .semibold, design: .default)

    /// 17pt Regular - Default text
    static let body = Font.system(size: 17, weight: .regular, design: .default)

    /// 16pt Regular - Secondary
    static let callout = Font.system(size: 16, weight: .regular, design: .default)

    /// 15pt Regular - Tertiary
    static let subhead = Font.system(size: 15, weight: .regular, design: .default)

    // MARK: - Small Text

    /// 13pt Regular - Captions
    static let footnote = Font.system(size: 13, weight: .regular, design: .default)

    /// 12pt Regular - Labels
    static let caption1 = Font.system(size: 12, weight: .regular, design: .default)

    /// 11pt Regular - Fine print
    static let caption2 = Font.system(size: 11, weight: .regular, design: .default)

    // MARK: - Stat Numbers (Monospace)

    /// 32pt Bold Mono - Hero numbers
    static let statLarge = Font.system(size: 32, weight: .bold, design: .monospaced)

    /// 24pt Bold Mono - Key metrics
    static let statMedium = Font.system(size: 24, weight: .bold, design: .monospaced)

    /// 17pt Semibold Mono - Table values
    static let statSmall = Font.system(size: 17, weight: .semibold, design: .monospaced)

    /// 14pt Medium Mono - Secondary stats
    static let statTiny = Font.system(size: 14, weight: .medium, design: .monospaced)

    // MARK: - Badge Text

    /// 11pt Bold - Verdict text in badges
    static let badge = Font.system(size: 11, weight: .bold, design: .default)

    /// 13pt Bold - Larger badges
    static let badgeLarge = Font.system(size: 13, weight: .bold, design: .default)
}

// MARK: - Text Style Modifier

struct TypographyModifier: ViewModifier {
    let font: Font
    let color: Color
    let tracking: CGFloat

    init(font: Font, color: Color = .foregroundPrimary, tracking: CGFloat = 0) {
        self.font = font
        self.color = color
        self.tracking = tracking
    }

    func body(content: Content) -> some View {
        content
            .font(font)
            .foregroundColor(color)
            .tracking(tracking)
    }
}

// MARK: - View Extension for Typography

extension View {

    func displayStyle() -> some View {
        modifier(TypographyModifier(font: Typography.display, tracking: -0.4))
    }

    func title1Style() -> some View {
        modifier(TypographyModifier(font: Typography.title1, tracking: -0.4))
    }

    func title2Style() -> some View {
        modifier(TypographyModifier(font: Typography.title2, tracking: -0.3))
    }

    func title3Style() -> some View {
        modifier(TypographyModifier(font: Typography.title3, tracking: -0.2))
    }

    func headlineStyle() -> some View {
        modifier(TypographyModifier(font: Typography.headline, tracking: -0.2))
    }

    func bodyStyle() -> some View {
        modifier(TypographyModifier(font: Typography.body))
    }

    func calloutStyle() -> some View {
        modifier(TypographyModifier(font: Typography.callout))
    }

    func subheadStyle() -> some View {
        modifier(TypographyModifier(font: Typography.subhead))
    }

    func footnoteStyle() -> some View {
        modifier(TypographyModifier(font: Typography.footnote, color: .foregroundSecondary))
    }

    func caption1Style() -> some View {
        modifier(TypographyModifier(font: Typography.caption1, color: .foregroundSecondary))
    }

    func caption2Style() -> some View {
        modifier(TypographyModifier(font: Typography.caption2, color: .foregroundTertiary))
    }

    func statLargeStyle() -> some View {
        modifier(TypographyModifier(font: Typography.statLarge))
    }

    func statMediumStyle() -> some View {
        modifier(TypographyModifier(font: Typography.statMedium))
    }

    func statSmallStyle() -> some View {
        modifier(TypographyModifier(font: Typography.statSmall))
    }

    func badgeStyle() -> some View {
        modifier(TypographyModifier(font: Typography.badge, tracking: 0.5))
    }
}
