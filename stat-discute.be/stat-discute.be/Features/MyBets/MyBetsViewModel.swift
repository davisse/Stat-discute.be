//
//  MyBetsViewModel.swift
//  stat-discute.be
//
//  Feature: My Bets - ViewModel
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 4.3
//  Uses Production GCP API
//

import Foundation
import SwiftUI

// MARK: - My Bets ViewModel

@MainActor
@Observable
final class MyBetsViewModel {

    // MARK: - State

    private(set) var betsState: ViewState<[BetAPIResponse]> = .idle
    private(set) var statsState: ViewState<BetStatsAPIResponse> = .idle
    private(set) var selectedFilter: BetFilter = .all
    var selectedBet: BetAPIResponse?

    var bets: [BetAPIResponse] {
        betsState.data ?? []
    }

    var stats: BetStatsAPIResponse? {
        statsState.data
    }

    var isLoading: Bool {
        betsState.isLoading || statsState.isLoading
    }

    var error: Error? {
        betsState.error ?? statsState.error
    }

    var filteredBets: [BetAPIResponse] {
        switch selectedFilter {
        case .all:
            return bets
        case .pending:
            return bets.filter { $0.resultEnum == .pending }
        case .won:
            return bets.filter { $0.resultEnum == .won }
        case .lost:
            return bets.filter { $0.resultEnum == .lost }
        case .pushed:
            return bets.filter { $0.resultEnum == .push }
        }
    }

    var filterCounts: [BetFilter: Int] {
        [
            .all: bets.count,
            .pending: bets.filter { $0.resultEnum == .pending }.count,
            .won: bets.filter { $0.resultEnum == .won }.count,
            .lost: bets.filter { $0.resultEnum == .lost }.count,
            .pushed: bets.filter { $0.resultEnum == .push }.count
        ]
    }

    // MARK: - Actions

    func loadData() async {
        guard !isLoading else { return }

        betsState = .loading
        statsState = .loading

        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadBets() }
            group.addTask { await self.loadStats() }
        }
    }

    func refreshData() async {
        if let currentBets = betsState.data {
            betsState = .refreshing(currentBets)
        }
        if let currentStats = statsState.data {
            statsState = .refreshing(currentStats)
        }

        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadBets() }
            group.addTask { await self.loadStats() }
        }
    }

    private func loadBets() async {
        do {
            let response = try await APIClient.shared.getMyBets()
            betsState = .loaded(response.bets ?? [])
        } catch {
            if let current = betsState.data {
                betsState = .loaded(current)
            } else {
                betsState = .error(error)
            }
        }
    }

    private func loadStats() async {
        do {
            let response = try await APIClient.shared.getBetStats()
            if let stats = response.stats {
                statsState = .loaded(stats)
            } else {
                // Create default stats if none returned
                statsState = .loaded(BetStatsAPIResponse(
                    totalBets: 0,
                    wonBets: 0,
                    lostBets: 0,
                    pushBets: 0,
                    pendingBets: 0,
                    winRate: 0,
                    totalUnitsWagered: 0,
                    totalProfitLoss: 0,
                    roi: 0
                ))
            }
        } catch {
            if let current = statsState.data {
                statsState = .loaded(current)
            } else {
                statsState = .error(error)
            }
        }
    }

    func setFilter(_ filter: BetFilter) {
        selectedFilter = filter
    }

    func selectBet(_ bet: BetAPIResponse) {
        selectedBet = bet
    }

    func clearSelectedBet() {
        selectedBet = nil
    }
}

// MARK: - Bet Filter

enum BetFilter: String, CaseIterable, Identifiable {
    case all
    case pending
    case won
    case lost
    case pushed

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .all: return "All"
        case .pending: return "Pending"
        case .won: return "Won"
        case .lost: return "Lost"
        case .pushed: return "Push"
        }
    }
}

// MARK: - BetAPIResponse Extensions

extension BetAPIResponse {

    var resultEnum: BetResult {
        guard let result = result else { return .pending }
        switch result.lowercased() {
        case "won", "win": return .won
        case "lost", "loss": return .lost
        case "push": return .push
        default: return .pending
        }
    }

    var gameDateFormatted: String {
        // Parse date string (yyyy-MM-dd format)
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"

        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "MMM d"

        if let date = inputFormatter.date(from: gameDate) {
            return outputFormatter.string(from: date)
        }
        return gameDate
    }

    var gameDate_Date: Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: gameDate) ?? Date()
    }
}
