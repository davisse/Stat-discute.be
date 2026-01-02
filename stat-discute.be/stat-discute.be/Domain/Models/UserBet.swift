//
//  UserBet.swift
//  stat-discute.be
//
//  Domain Model: User Bet Tracking
//  Uses Production GCP API models from APIClient.swift
//

import Foundation
import SwiftData
import SwiftUI

// MARK: - Bet Type Enum

enum BetType: String, Codable, CaseIterable {
    case totalOver = "total_over"
    case totalUnder = "total_under"
    case spreadHome = "spread_home"
    case spreadAway = "spread_away"
    case moneylineHome = "ml_home"
    case moneylineAway = "ml_away"
    case prop = "prop"

    var displayName: String {
        switch self {
        case .totalOver: return "Over"
        case .totalUnder: return "Under"
        case .spreadHome: return "Spread (Home)"
        case .spreadAway: return "Spread (Away)"
        case .moneylineHome: return "ML (Home)"
        case .moneylineAway: return "ML (Away)"
        case .prop: return "Prop"
        }
    }

    var shortName: String {
        switch self {
        case .totalOver: return "O"
        case .totalUnder: return "U"
        case .spreadHome, .spreadAway: return "SPR"
        case .moneylineHome, .moneylineAway: return "ML"
        case .prop: return "PROP"
        }
    }
}

// MARK: - Bet Result Enum

enum BetResult: String, Codable, CaseIterable {
    case pending = "pending"
    case won = "won"
    case lost = "lost"
    case push = "push"

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .won: return "Won"
        case .lost: return "Lost"
        case .push: return "Push"
        }
    }

    var displayText: String { displayName }

    var shortName: String {
        switch self {
        case .pending: return "-"
        case .won: return "W"
        case .lost: return "L"
        case .push: return "P"
        }
    }

    var icon: String {
        switch self {
        case .pending: return "clock"
        case .won: return "checkmark.circle.fill"
        case .lost: return "xmark.circle.fill"
        case .push: return "minus.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .pending: return .foregroundSecondary
        case .won: return .positive
        case .lost: return .negative
        case .push: return .warning
        }
    }
}

// MARK: - UserBet Model (SwiftData for Local Caching)

@Model
final class UserBet: Identifiable {

    @Attribute(.unique) var betId: Int
    var betDate: Date
    var gameId: String
    var homeTeamAbbr: String
    var awayTeamAbbr: String
    var gameDateTime: Date

    var betTypeRaw: String
    var selection: String
    var lineValue: Double
    var oddsDecimal: Double
    var oddsAmerican: Int?
    var stakeUnits: Double

    var resultRaw: String?
    var actualTotal: Double?
    var profitLoss: Double?

    var confidenceRating: Int?
    var notes: String?

    init(
        betId: Int,
        betDate: Date,
        gameId: String,
        homeTeamAbbr: String,
        awayTeamAbbr: String,
        gameDateTime: Date,
        betTypeRaw: String,
        selection: String,
        lineValue: Double,
        oddsDecimal: Double,
        oddsAmerican: Int? = nil,
        stakeUnits: Double = 1.0,
        resultRaw: String? = nil,
        actualTotal: Double? = nil,
        profitLoss: Double? = nil,
        confidenceRating: Int? = nil,
        notes: String? = nil
    ) {
        self.betId = betId
        self.betDate = betDate
        self.gameId = gameId
        self.homeTeamAbbr = homeTeamAbbr
        self.awayTeamAbbr = awayTeamAbbr
        self.gameDateTime = gameDateTime
        self.betTypeRaw = betTypeRaw
        self.selection = selection
        self.lineValue = lineValue
        self.oddsDecimal = oddsDecimal
        self.oddsAmerican = oddsAmerican
        self.stakeUnits = stakeUnits
        self.resultRaw = resultRaw
        self.actualTotal = actualTotal
        self.profitLoss = profitLoss
        self.confidenceRating = confidenceRating
        self.notes = notes
    }

    // MARK: - Computed Properties

    var id: Int { betId }

    var betType: BetType {
        BetType(rawValue: betTypeRaw) ?? .totalOver
    }

    var result: BetResult? {
        guard let raw = resultRaw else { return nil }
        return BetResult(rawValue: raw)
    }

    var isPending: Bool {
        result == nil || result == .pending
    }

    var isWin: Bool {
        result == .won
    }

    var isLoss: Bool {
        result == .lost
    }

    var matchupText: String {
        "\(awayTeamAbbr) @ \(homeTeamAbbr)"
    }

    var formattedOdds: String {
        String(format: "%.2f", oddsDecimal)
    }

    var formattedLine: String {
        String(format: "%.1f", lineValue)
    }

    var formattedProfitLoss: String {
        guard let pl = profitLoss else { return "-" }
        return String(format: "%+.2f", pl)
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: betDate)
    }
}
