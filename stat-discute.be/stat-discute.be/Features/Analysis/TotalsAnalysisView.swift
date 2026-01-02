//
//  TotalsAnalysisView.swift
//  stat-discute.be
//
//  Feature: Analysis - Totals Analysis Screen
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 4.2
//  Uses Production GCP API
//

import SwiftUI

// MARK: - Totals Analysis View

struct TotalsAnalysisView: View {

    let game: TotalsGameAnalysis
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            // Background
            Color.appBackground.ignoresSafeArea()

            // Content
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    // Game Header
                    gameHeader

                    // Verdict Section
                    verdictSection

                    // Analysis Details
                    analysisDetails

                    // Team Stats
                    teamStats

                    // Betting Action
                    bettingAction

                    // Footer Spacing
                    Spacer()
                        .frame(height: 40)
                }
                .padding(.top, Spacing.md)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Totals Analysis")
                    .font(Typography.headline)
                    .foregroundColor(.foregroundPrimary)
            }
        }
    }

    // MARK: - Game Header

    private var gameHeader: some View {
        SolidCard {
            VStack(spacing: Spacing.sm) {
                // Teams
                HStack {
                    TeamInfoColumn(abbr: game.awayAbbr, name: game.awayTeam, alignment: .leading)

                    VStack(spacing: 2) {
                        Text("@")
                            .font(Typography.callout)
                            .foregroundColor(.foregroundTertiary)

                        if let line = game.line {
                            Text("O/U \(String(format: "%.1f", line))")
                                .font(Typography.statSmall)
                                .foregroundColor(.accent)
                        }
                    }

                    TeamInfoColumn(abbr: game.homeAbbr, name: game.homeTeam, alignment: .trailing)
                }

                // Game Date
                HStack(spacing: Spacing.xs) {
                    Text(game.formattedDate)
                        .font(Typography.caption1)
                        .foregroundColor(.foregroundSecondary)
                }

                // Verdict
                VerdictBadge(verdict: game.verdictEnum, size: .medium)
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Verdict Section

    private var verdictSection: some View {
        SolidCard {
            VStack(spacing: Spacing.md) {
                // Probability Split
                ProbabilitySplitView(
                    overProbability: game.overProbability,
                    underProbability: game.underProbability,
                    line: game.line ?? 0
                )
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Analysis Details

    private var analysisDetails: some View {
        SolidCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Text("Analysis")
                    .font(Typography.headline)
                    .foregroundColor(.foregroundPrimary)

                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: Spacing.sm) {
                    StatBox(label: "Line", value: game.formattedLine)
                    StatBox(label: "Projected", value: game.formattedProjected)
                    StatBox(
                        label: "Edge",
                        value: game.formattedEdge,
                        valueColor: (game.edge ?? 0) >= 0 ? .positive : .negative
                    )
                    StatBox(label: "Pace", value: String(format: "%.1f", game.avgPace))
                    StatBox(label: "Bookmaker", value: game.bookmaker ?? "N/A")
                    StatBox(label: "Verdict", value: game.verdictEnum.shortText)
                }
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Team Stats

    private var teamStats: some View {
        SolidCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                Text("Team Stats")
                    .font(Typography.headline)
                    .foregroundColor(.foregroundPrimary)

                HStack {
                    TeamStatColumn(
                        team: game.awayAbbr,
                        ppg: game.awayPpg,
                        oppPpg: game.awayOppPpg,
                        pace: game.awayPace,
                        games: game.awayGames
                    )

                    Spacer()

                    Text("vs")
                        .font(Typography.caption1)
                        .foregroundColor(.foregroundTertiary)

                    Spacer()

                    TeamStatColumn(
                        team: game.homeAbbr,
                        ppg: game.homePpg,
                        oppPpg: game.homeOppPpg,
                        pace: game.homePace,
                        games: game.homeGames
                    )
                }
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Betting Action

    private var bettingAction: some View {
        VStack(spacing: Spacing.md) {
            // Recommended Action
            AccentBorderCard {
                VStack(spacing: Spacing.sm) {
                    Text("RECOMMENDED")
                        .font(Typography.caption1)
                        .foregroundColor(.accent)

                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(game.verdictEnum.displayName)
                                .font(Typography.title2)
                                .foregroundColor(.foregroundPrimary)

                            Text("\(Int(game.overProbability * 100))% probability")
                                .font(Typography.callout)
                                .foregroundColor(.foregroundSecondary)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("EDGE")
                                .font(Typography.caption2)
                                .foregroundColor(.foregroundTertiary)

                            Text(game.formattedEdge)
                                .font(Typography.statMedium)
                                .foregroundColor((game.edge ?? 0) >= 0 ? .positive : .negative)
                        }
                    }
                }
            }

            // Log Bet Button
            Button(action: {
                // Navigate to bet logging
            }) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Log This Bet")
                }
                .font(Typography.headline)
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Spacing.md)
                .background(Color.accent)
                .cornerRadius(CornerRadius.medium)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }
}

// MARK: - Team Info Column

private struct TeamInfoColumn: View {
    let abbr: String
    let name: String
    let alignment: HorizontalAlignment

    var body: some View {
        VStack(alignment: alignment, spacing: 4) {
            Text(abbr)
                .font(Typography.title2)
                .fontWeight(.bold)
                .foregroundColor(.foregroundPrimary)

            Text(name)
                .font(Typography.caption2)
                .foregroundColor(.foregroundSecondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: alignment == .leading ? .leading : .trailing)
    }
}

// MARK: - Stat Box

private struct StatBox: View {
    let label: String
    let value: String
    var valueColor: Color = .foregroundPrimary

    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(Typography.caption2)
                .foregroundColor(.foregroundTertiary)

            Text(value)
                .font(Typography.statSmall)
                .foregroundColor(valueColor)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.sm)
        .background(Color.gray6)
        .cornerRadius(CornerRadius.small)
    }
}

// MARK: - Team Stat Column

private struct TeamStatColumn: View {
    let team: String
    let ppg: Double
    let oppPpg: Double
    let pace: Double
    let games: Int

    var body: some View {
        VStack(spacing: Spacing.sm) {
            Text(team)
                .font(Typography.title2)
                .fontWeight(.bold)
                .foregroundColor(.foregroundPrimary)

            VStack(spacing: 4) {
                StatLine(label: "PPG", value: String(format: "%.1f", ppg))
                StatLine(label: "Opp PPG", value: String(format: "%.1f", oppPpg))
                StatLine(label: "Pace", value: String(format: "%.1f", pace))
                StatLine(label: "Games", value: "\(games)")
            }
        }
    }
}

private struct StatLine: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(Typography.caption2)
                .foregroundColor(.foregroundTertiary)
            Spacer()
            Text(value)
                .font(Typography.caption1)
                .foregroundColor(.foregroundPrimary)
        }
    }
}


// MARK: - Preview

#Preview("Totals Analysis") {
    NavigationStack {
        TotalsAnalysisView(game: TotalsGameAnalysis(
            gameId: "0022400123",
            gameDate: "2025-01-15",
            homeTeamId: 1,
            homeAbbr: "LAL",
            homeTeam: "Los Angeles Lakers",
            awayTeamId: 2,
            awayAbbr: "BOS",
            awayTeam: "Boston Celtics",
            homePpg: 115.2,
            homeOppPpg: 112.8,
            homePace: 100.5,
            homeGames: 35,
            awayPpg: 118.5,
            awayOppPpg: 110.2,
            awayPace: 98.2,
            awayGames: 34,
            line: 224.5,
            overOdds: 1.91,
            underOdds: 1.91,
            projected: 228.5,
            edge: 4.0,
            avgPace: 99.35,
            verdict: "STRONG_OVER",
            bookmaker: "pinnacle"
        ))
    }
}
