//
//  Verdict.swift
//  stat-discute.be
//
//  Core Models: Betting Verdict & Related Types
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.4
//

import SwiftUI

// MARK: - Verdict Enum

enum Verdict: String, CaseIterable, Hashable {
    case strongOver = "STRONG_OVER"
    case leanOver = "LEAN_OVER"
    case hold = "HOLD"
    case leanUnder = "LEAN_UNDER"
    case strongUnder = "STRONG_UNDER"

    var displayText: String {
        switch self {
        case .strongOver: return "STRONG OVER"
        case .leanOver: return "LEAN OVER"
        case .hold: return "HOLD"
        case .leanUnder: return "LEAN UNDER"
        case .strongUnder: return "STRONG UNDER"
        }
    }

    var shortText: String {
        switch self {
        case .strongOver: return "STR O"
        case .leanOver: return "LEAN O"
        case .hold: return "HOLD"
        case .leanUnder: return "LEAN U"
        case .strongUnder: return "STR U"
        }
    }

    var icon: String {
        switch self {
        case .strongOver: return "arrow.up.circle.fill"
        case .leanOver: return "arrow.up.circle"
        case .hold: return "minus.circle"
        case .leanUnder: return "arrow.down.circle"
        case .strongUnder: return "arrow.down.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .strongOver: return .verdictStrongOver
        case .leanOver: return .verdictLeanOver
        case .hold: return .verdictHold
        case .leanUnder: return .verdictLeanUnder
        case .strongUnder: return .verdictStrongUnder
        }
    }

    var backgroundColor: Color {
        color.opacity(0.15)
    }

    var isStrong: Bool {
        switch self {
        case .strongOver, .strongUnder:
            return true
        default:
            return false
        }
    }

    var isOver: Bool {
        switch self {
        case .strongOver, .leanOver:
            return true
        default:
            return false
        }
    }

    var isUnder: Bool {
        switch self {
        case .strongUnder, .leanUnder:
            return true
        default:
            return false
        }
    }
}

// MARK: - Confidence Level

enum ConfidenceLevel: String, CaseIterable {
    case low = "LOW"
    case medium = "MEDIUM"
    case high = "HIGH"
    case veryHigh = "VERY_HIGH"

    var displayText: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .veryHigh: return "Very High"
        }
    }

    var color: Color {
        switch self {
        case .low: return .gray2
        case .medium: return .warning
        case .high: return .positive
        case .veryHigh: return .monteCarlo
        }
    }

    static func from(value: Double) -> ConfidenceLevel {
        switch value {
        case 0..<0.25: return .low
        case 0.25..<0.5: return .medium
        case 0.5..<0.75: return .high
        default: return .veryHigh
        }
    }
}

// MARK: - Bet Result

enum BetResult: String, CaseIterable {
    case won = "WON"
    case lost = "LOST"
    case push = "PUSH"
    case pending = "PENDING"
    case voided = "VOIDED"

    var displayText: String {
        rawValue.capitalized
    }

    var icon: String {
        switch self {
        case .won: return "checkmark.circle.fill"
        case .lost: return "xmark.circle.fill"
        case .push: return "equal.circle.fill"
        case .pending: return "clock.circle.fill"
        case .voided: return "slash.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .won: return .positive
        case .lost: return .negative
        case .push: return .gray1
        case .pending: return .accent
        case .voided: return .gray2
        }
    }
}

// MARK: - Bet Type

enum BetType: String, CaseIterable {
    case over = "OVER"
    case under = "UNDER"
    case spread = "SPREAD"
    case moneyline = "MONEYLINE"

    var displayText: String {
        rawValue.capitalized
    }

    var icon: String {
        switch self {
        case .over: return "arrow.up"
        case .under: return "arrow.down"
        case .spread: return "plusminus"
        case .moneyline: return "dollarsign"
        }
    }
}

// MARK: - Game Status

enum GameStatus: String {
    case scheduled = "SCHEDULED"
    case live = "LIVE"
    case final = "FINAL"
    case postponed = "POSTPONED"
    case cancelled = "CANCELLED"

    var displayText: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .live: return "Live"
        case .final: return "Final"
        case .postponed: return "Postponed"
        case .cancelled: return "Cancelled"
        }
    }

    var color: Color {
        switch self {
        case .scheduled: return .accent
        case .live: return .negative
        case .final: return .foregroundSecondary
        case .postponed: return .warning
        case .cancelled: return .gray2
        }
    }

    var isLive: Bool {
        self == .live
    }

    var isFinal: Bool {
        self == .final
    }
}
