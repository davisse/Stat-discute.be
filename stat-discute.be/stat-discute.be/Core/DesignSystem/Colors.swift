//
//  Colors.swift
//  stat-discute.be
//
//  Design System: Color Tokens
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.3
//

import SwiftUI

// MARK: - Color Extension

extension Color {

    // MARK: - Backgrounds

    /// App background - Pure black for dark mode focus
    static let appBackground = Color(hex: "000000")

    /// Elevated surfaces - Cards, sheets
    static let backgroundElevated = Color(hex: "1C1C1E")

    /// Secondary background - Grouped content
    static let backgroundSecondary = Color(hex: "2C2C2E")

    /// Tertiary background - Subtle elevation
    static let backgroundTertiary = Color(hex: "3A3A3C")

    // MARK: - Foreground

    /// Primary text - Pure white
    static let foregroundPrimary = Color.white

    /// Secondary text - 60% opacity
    static let foregroundSecondary = Color.white.opacity(0.6)

    /// Tertiary text - 30% opacity
    static let foregroundTertiary = Color.white.opacity(0.3)

    // MARK: - Semantic Colors

    /// Positive - Wins, overs, profit
    static let positive = Color(hex: "30D158")

    /// Negative - Losses, unders, loss
    static let negative = Color(hex: "FF453A")

    /// Warning - Caution, pending
    static let warning = Color(hex: "FF9F0A")

    /// Accent - Interactive elements
    static let accent = Color(hex: "0A84FF")

    /// Monte Carlo - MC-specific features
    static let monteCarlo = Color(hex: "BF5AF2")

    // MARK: - Grays (iOS System)

    static let gray1 = Color(hex: "8E8E93")
    static let gray2 = Color(hex: "636366")
    static let gray3 = Color(hex: "48484A")
    static let gray4 = Color(hex: "3A3A3C")
    static let gray5 = Color(hex: "2C2C2E")
    static let gray6 = Color(hex: "1C1C1E")

    // MARK: - Separator

    static let separator = Color.white.opacity(0.15)

    // MARK: - Verdict Colors

    static let verdictStrongOver = Color(hex: "30D158")
    static let verdictLeanOver = Color(hex: "30D158").opacity(0.7)
    static let verdictHold = Color(hex: "8E8E93")
    static let verdictLeanUnder = Color(hex: "FF453A").opacity(0.7)
    static let verdictStrongUnder = Color(hex: "FF453A")

    // MARK: - Color Blind Safe Alternatives

    static let positiveColorBlind = Color(hex: "0A84FF")  // Blue
    static let negativeColorBlind = Color(hex: "FF9F0A")  // Orange

    // MARK: - Hex Initializer

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Color Scheme Helper

struct AppColors {
    let colorBlindMode: Bool

    init(colorBlindMode: Bool = false) {
        self.colorBlindMode = colorBlindMode
    }

    var positive: Color {
        colorBlindMode ? .positiveColorBlind : .positive
    }

    var negative: Color {
        colorBlindMode ? .negativeColorBlind : .negative
    }
}

// MARK: - Environment Key for Color Blind Mode

struct ColorBlindModeKey: EnvironmentKey {
    static let defaultValue: Bool = false
}

extension EnvironmentValues {
    var colorBlindMode: Bool {
        get { self[ColorBlindModeKey.self] }
        set { self[ColorBlindModeKey.self] = newValue }
    }
}
