//
//  PerformanceDashboard.swift
//  stat-discute.be
//
//  Feature: My Bets - Performance Dashboard Components
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 4.3
//  Uses Production GCP API
//

import SwiftUI

// MARK: - Performance Summary Card

struct PerformanceSummaryCard: View {

    let stats: BetStatsAPIResponse

    var body: some View {
        SolidCard {
            VStack(spacing: Spacing.md) {
                // Header
                HStack {
                    Text("Performance")
                        .font(Typography.headline)
                        .foregroundColor(.foregroundPrimary)

                    Spacer()

                    // Record Badge
                    RecordBadge(
                        won: stats.wonBets,
                        lost: stats.lostBets,
                        push: stats.pushBets
                    )
                }

                // Main Stats
                HStack(spacing: Spacing.lg) {
                    // P/L
                    VStack(alignment: .leading, spacing: 4) {
                        Text("P/L")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        Text(formatProfitLoss(stats.totalProfitLoss))
                            .font(Typography.statLarge)
                            .foregroundColor(stats.totalProfitLoss >= 0 ? .positive : .negative)

                        Text("units")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundSecondary)
                    }

                    Spacer()

                    // Win Rate
                    VStack(alignment: .center, spacing: 4) {
                        Text("Win Rate")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        Text("\(Int(stats.winRate))%")
                            .font(Typography.statLarge)
                            .foregroundColor(.foregroundPrimary)

                        Text("\(stats.wonBets)-\(stats.lostBets)")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundSecondary)
                    }

                    Spacer()

                    // ROI
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("ROI")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        Text(formatROI(stats.roi))
                            .font(Typography.statLarge)
                            .foregroundColor(stats.roi >= 0 ? .positive : .negative)

                        Text("return")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundSecondary)
                    }
                }

                // Progress Bar (Win Rate Visual)
                WinRateBar(
                    won: stats.wonBets,
                    lost: stats.lostBets,
                    push: stats.pushBets
                )
            }
        }
    }

    private func formatProfitLoss(_ value: Double) -> String {
        let sign = value >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.1f", value))"
    }

    private func formatROI(_ value: Double) -> String {
        let sign = value >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.1f", value))%"
    }
}

// MARK: - Record Badge

struct RecordBadge: View {

    let won: Int
    let lost: Int
    let push: Int

    private var isWinning: Bool {
        won > lost
    }

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: isWinning ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                .font(.system(size: 12))

            Text("\(won)W-\(lost)L")
                .font(Typography.badge)
        }
        .foregroundColor(isWinning ? .positive : .negative)
        .padding(.horizontal, Spacing.sm)
        .padding(.vertical, 4)
        .background(
            (isWinning ? Color.positive : Color.negative).opacity(0.15)
        )
        .cornerRadius(CornerRadius.pill)
    }
}

// MARK: - Win Rate Bar

struct WinRateBar: View {

    let won: Int
    let lost: Int
    let push: Int

    private var total: Int {
        won + lost + push
    }

    private var wonPercent: Double {
        total > 0 ? Double(won) / Double(total) : 0
    }

    private var lostPercent: Double {
        total > 0 ? Double(lost) / Double(total) : 0
    }

    private var pushPercent: Double {
        total > 0 ? Double(push) / Double(total) : 0
    }

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 2) {
                // Won
                if wonPercent > 0 {
                    Rectangle()
                        .fill(Color.positive)
                        .frame(width: geometry.size.width * wonPercent)
                }

                // Push
                if pushPercent > 0 {
                    Rectangle()
                        .fill(Color.foregroundTertiary)
                        .frame(width: geometry.size.width * pushPercent)
                }

                // Lost
                if lostPercent > 0 {
                    Rectangle()
                        .fill(Color.negative)
                        .frame(width: geometry.size.width * lostPercent)
                }
            }
            .cornerRadius(2)
        }
        .frame(height: 6)
    }
}

// MARK: - Stats Grid

struct StatsGrid: View {

    let stats: BetStatsAPIResponse

    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: Spacing.sm) {
            StatGridItem(
                label: "Total Bets",
                value: "\(stats.totalBets)",
                icon: "number"
            )

            StatGridItem(
                label: "Units Wagered",
                value: String(format: "%.1f", stats.totalUnitsWagered),
                icon: "dollarsign.circle"
            )

            StatGridItem(
                label: "Pending",
                value: "\(stats.pendingBets)",
                icon: "clock"
            )

            StatGridItem(
                label: "Won",
                value: "\(stats.wonBets)",
                valueColor: .positive,
                icon: "checkmark.circle"
            )

            StatGridItem(
                label: "Lost",
                value: "\(stats.lostBets)",
                valueColor: .negative,
                icon: "xmark.circle"
            )

            StatGridItem(
                label: "Push",
                value: "\(stats.pushBets)",
                icon: "equal.circle"
            )
        }
    }
}

// MARK: - Stat Grid Item

private struct StatGridItem: View {

    let label: String
    let value: String
    var valueColor: Color = .foregroundPrimary
    let icon: String

    var body: some View {
        VStack(spacing: Spacing.xs) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 10))
                Text(label)
                    .font(Typography.caption2)
            }
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

// MARK: - Filter Chips

struct BetFilterChips: View {

    @Binding var selectedFilter: BetFilter
    let counts: [BetFilter: Int]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.xs) {
                ForEach(BetFilter.allCases) { filter in
                    FilterChip(
                        filter: filter,
                        count: counts[filter] ?? 0,
                        isSelected: selectedFilter == filter,
                        action: {
                            withAnimation(.spring(response: 0.3)) {
                                selectedFilter = filter
                            }
                        }
                    )
                }
            }
            .padding(.horizontal, Spacing.screenHorizontal)
        }
    }
}

private struct FilterChip: View {

    let filter: BetFilter
    let count: Int
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(filter.displayName)
                    .font(Typography.caption1)

                Text("(\(count))")
                    .font(Typography.caption2)
            }
            .foregroundColor(isSelected ? .black : .foregroundSecondary)
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.xs)
            .background(isSelected ? Color.accent : Color.gray5)
            .cornerRadius(CornerRadius.pill)
        }
        .buttonStyle(PlainButtonStyle())
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}

// MARK: - Preview

#Preview("Performance Dashboard") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        ScrollView {
            VStack(spacing: Spacing.lg) {
                PerformanceSummaryCard(stats: BetStatsAPIResponse(
                    totalBets: 25,
                    wonBets: 14,
                    lostBets: 9,
                    pushBets: 2,
                    pendingBets: 3,
                    winRate: 60.9,
                    totalUnitsWagered: 50.0,
                    totalProfitLoss: 8.5,
                    roi: 17.0
                ))

                SolidCard {
                    StatsGrid(stats: BetStatsAPIResponse(
                        totalBets: 25,
                        wonBets: 14,
                        lostBets: 9,
                        pushBets: 2,
                        pendingBets: 3,
                        winRate: 60.9,
                        totalUnitsWagered: 50.0,
                        totalProfitLoss: 8.5,
                        roi: 17.0
                    ))
                }
            }
            .padding(Spacing.screenHorizontal)
        }
    }
}
