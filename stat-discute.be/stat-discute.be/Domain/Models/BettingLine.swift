//
//  BettingLine.swift
//  stat-discute.be
//
//  Domain Model: Betting Lines & Analysis
//  Uses Production GCP API models from APIClient.swift
//

import Foundation
import SwiftUI

// MARK: - Confidence Level Enum

enum ConfidenceLevel: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case veryHigh = "very_high"

    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .veryHigh: return "Very High"
        }
    }

    var displayText: String { displayName }

    var stars: Int {
        switch self {
        case .low: return 1
        case .medium: return 2
        case .high: return 3
        case .veryHigh: return 4
        }
    }

    var color: Color {
        switch self {
        case .low: return .foregroundTertiary
        case .medium: return .warning
        case .high: return .positive
        case .veryHigh: return .accent
        }
    }
}

// MARK: - Analysis Factor

struct AnalysisFactor: Codable, Identifiable {
    var id: String { name }
    let name: String
    let impact: Double
    let description: String

    var isPositive: Bool {
        impact >= 0
    }

    var formattedImpact: String {
        let sign = impact >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.1f", impact * 100))%"
    }
}
