//
//  Game.swift
//  stat-discute.be
//
//  Domain Model: NBA Game
//  Uses Production GCP API models from APIClient.swift
//

import Foundation
import SwiftData
import SwiftUI

// MARK: - Game Status Enum

enum GameStatus: String, Codable, CaseIterable {
    case scheduled = "Scheduled"
    case live = "Live"
    case inProgress = "In Progress"
    case final = "Final"
    case postponed = "Postponed"
    case cancelled = "Cancelled"

    var isLive: Bool {
        self == .live || self == .inProgress
    }

    var isFinal: Bool {
        self == .final
    }

    var displayName: String {
        switch self {
        case .scheduled: return "Scheduled"
        case .live, .inProgress: return "LIVE"
        case .final: return "Final"
        case .postponed: return "PPD"
        case .cancelled: return "CAN"
        }
    }
}

// MARK: - Verdict Enum

enum Verdict: String, Codable, CaseIterable {
    case strongOver = "STRONG_OVER"
    case leanOver = "LEAN_OVER"
    case hold = "HOLD"
    case leanUnder = "LEAN_UNDER"
    case strongUnder = "STRONG_UNDER"

    var displayName: String {
        switch self {
        case .strongOver: return "Strong Over"
        case .leanOver: return "Lean Over"
        case .hold: return "Hold"
        case .leanUnder: return "Lean Under"
        case .strongUnder: return "Strong Under"
        }
    }

    var displayText: String { displayName }

    var shortText: String {
        switch self {
        case .strongOver: return "S.O"
        case .leanOver: return "L.O"
        case .hold: return "HOLD"
        case .leanUnder: return "L.U"
        case .strongUnder: return "S.U"
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
        case .strongOver, .leanOver: return .positive
        case .hold: return .warning
        case .leanUnder, .strongUnder: return .negative
        }
    }

    var backgroundColor: Color {
        color.opacity(0.15)
    }

    var isStrong: Bool {
        self == .strongOver || self == .strongUnder
    }

    var isOver: Bool {
        self == .strongOver || self == .leanOver
    }

    var isUnder: Bool {
        self == .strongUnder || self == .leanUnder
    }
}

// MARK: - Game Model (SwiftData for Local Caching)

@Model
final class Game: Identifiable {

    @Attribute(.unique) var gameId: String
    var gameDate: Date
    var gameDateTime: Date?
    var season: String
    var homeTeamId: Int64
    var awayTeamId: Int64
    var homeScore: Int?
    var awayScore: Int?
    var statusRaw: String
    var quarter: Int?
    var clock: String?

    init(
        gameId: String,
        gameDate: Date,
        gameDateTime: Date? = nil,
        season: String,
        homeTeamId: Int64,
        awayTeamId: Int64,
        homeScore: Int? = nil,
        awayScore: Int? = nil,
        statusRaw: String = "Scheduled",
        quarter: Int? = nil,
        clock: String? = nil
    ) {
        self.gameId = gameId
        self.gameDate = gameDate
        self.gameDateTime = gameDateTime
        self.season = season
        self.homeTeamId = homeTeamId
        self.awayTeamId = awayTeamId
        self.homeScore = homeScore
        self.awayScore = awayScore
        self.statusRaw = statusRaw
        self.quarter = quarter
        self.clock = clock
    }

    // MARK: - Computed Properties

    var id: String { gameId }

    var status: GameStatus {
        GameStatus(rawValue: statusRaw) ?? .scheduled
    }

    var isLive: Bool { status.isLive }

    var isFinal: Bool { status.isFinal }

    var total: Int? {
        guard let home = homeScore, let away = awayScore else { return nil }
        return home + away
    }

    var formattedTime: String {
        guard let dateTime = gameDateTime else {
            return "--:--"
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: dateTime)
    }
}
