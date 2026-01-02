//
//  BetCard.swift
//  stat-discute.be
//
//  Feature: My Bets - Bet Card Component
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 4.3
//  Uses Production GCP API
//

import SwiftUI

// MARK: - Bet Card

struct BetCard: View {

    let bet: BetAPIResponse
    let onTap: () -> Void

    var body: some View {
        TappableCard(action: onTap) {
            VStack(spacing: Spacing.sm) {
                // Header: Teams + Result
                HStack {
                    // Teams
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(bet.awayTeam) @ \(bet.homeTeam)")
                            .font(Typography.callout)
                            .foregroundColor(.foregroundPrimary)

                        Text(bet.gameDateFormatted)
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundSecondary)
                    }

                    Spacer()

                    // Result Badge
                    BetResultBadge(result: bet.resultEnum)
                }

                Divider()
                    .background(Color.separator)

                // Bet Details
                HStack {
                    // Selection
                    VStack(alignment: .leading, spacing: 2) {
                        Text(bet.betType.uppercased())
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        HStack(spacing: 4) {
                            Text(bet.selection.uppercased())
                                .font(Typography.headline)
                                .foregroundColor(.foregroundPrimary)

                            Text(String(format: "%.1f", bet.lineValue))
                                .font(Typography.statSmall)
                                .foregroundColor(.accent)
                        }
                    }

                    Spacer()

                    // Stake & Odds
                    VStack(alignment: .center, spacing: 2) {
                        Text("STAKE")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        Text("\(String(format: "%.1f", bet.stakeUnits))u")
                            .font(Typography.statSmall)
                            .foregroundColor(.foregroundPrimary)
                    }

                    Spacer()

                    // P/L or Potential
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(bet.resultEnum == .pending ? "POTENTIAL" : "P/L")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        if bet.resultEnum == .pending {
                            Text("+\(String(format: "%.2f", bet.stakeUnits * (bet.oddsDecimal - 1)))u")
                                .font(Typography.statSmall)
                                .foregroundColor(.foregroundSecondary)
                        } else if let pl = bet.profitLoss {
                            Text(formatPL(pl))
                                .font(Typography.statSmall)
                                .foregroundColor(pl >= 0 ? .positive : .negative)
                        }
                    }
                }

                // Confidence (if set)
                if let confidence = bet.confidenceRating, confidence > 0 {
                    HStack {
                        Text("Confidence")
                            .font(Typography.caption2)
                            .foregroundColor(.foregroundTertiary)

                        Spacer()

                        ConfidenceStars(rating: confidence)
                    }
                }
            }
        }
    }

    private func formatPL(_ value: Double) -> String {
        let sign = value >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.2f", value))u"
    }
}

// MARK: - Confidence Stars

struct ConfidenceStars: View {

    let rating: Int
    let maxRating: Int = 5

    var body: some View {
        HStack(spacing: 2) {
            ForEach(1...maxRating, id: \.self) { index in
                Image(systemName: index <= rating ? "star.fill" : "star")
                    .font(.system(size: 10))
                    .foregroundColor(index <= rating ? .accent : .gray4)
            }
        }
    }
}

// MARK: - Bet Detail Sheet

struct BetDetailSheet: View {

    let bet: BetAPIResponse
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: Spacing.lg) {
                        // Header
                        VStack(spacing: Spacing.sm) {
                            Text("\(bet.awayTeam) @ \(bet.homeTeam)")
                                .font(Typography.title1)
                                .foregroundColor(.foregroundPrimary)

                            Text(bet.gameDateFormatted)
                                .font(Typography.callout)
                                .foregroundColor(.foregroundSecondary)

                            BetResultBadge(result: bet.resultEnum)
                                .scaleEffect(1.2)
                        }
                        .padding(.top, Spacing.md)

                        // Bet Info Card
                        SolidCard {
                            VStack(spacing: Spacing.md) {
                                DetailRow(label: "Bet Type", value: bet.betType.capitalized)
                                DetailRow(label: "Selection", value: "\(bet.selection.uppercased()) \(String(format: "%.1f", bet.lineValue))")
                                DetailRow(label: "Odds", value: String(format: "%.2f", bet.oddsDecimal))
                                DetailRow(label: "Stake", value: "\(String(format: "%.1f", bet.stakeUnits)) units")

                                if let actualTotal = bet.actualTotal {
                                    Divider().background(Color.separator)
                                    DetailRow(label: "Actual Total", value: String(format: "%.0f", actualTotal))
                                }

                                if let pl = bet.profitLoss {
                                    DetailRow(
                                        label: "Profit/Loss",
                                        value: formatPL(pl),
                                        valueColor: pl >= 0 ? .positive : .negative
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, Spacing.screenHorizontal)

                        // Confidence
                        if let confidence = bet.confidenceRating, confidence > 0 {
                            SolidCard {
                                HStack {
                                    Text("Confidence Rating")
                                        .font(Typography.callout)
                                        .foregroundColor(.foregroundPrimary)

                                    Spacer()

                                    ConfidenceStars(rating: confidence)
                                }
                            }
                            .padding(.horizontal, Spacing.screenHorizontal)
                        }

                        // Notes
                        if let notes = bet.notes, !notes.isEmpty {
                            SolidCard {
                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    Text("Notes")
                                        .font(Typography.headline)
                                        .foregroundColor(.foregroundPrimary)

                                    Text(notes)
                                        .font(Typography.body)
                                        .foregroundColor(.foregroundSecondary)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .padding(.horizontal, Spacing.screenHorizontal)
                        }

                        Spacer()
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.accent)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    private func formatPL(_ value: Double) -> String {
        let sign = value >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.2f", value)) units"
    }
}

// MARK: - Detail Row

private struct DetailRow: View {
    let label: String
    let value: String
    var valueColor: Color = .foregroundPrimary

    var body: some View {
        HStack {
            Text(label)
                .font(Typography.callout)
                .foregroundColor(.foregroundSecondary)

            Spacer()

            Text(value)
                .font(Typography.callout)
                .foregroundColor(valueColor)
        }
    }
}

// MARK: - Preview

#Preview("Bet Cards") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        ScrollView {
            VStack(spacing: Spacing.md) {
                BetCard(
                    bet: BetAPIResponse(
                        id: 1,
                        gameId: "0022400123",
                        homeTeam: "LAL",
                        awayTeam: "BOS",
                        gameDate: "2025-01-15",
                        betType: "totals",
                        selection: "over",
                        lineValue: 224.5,
                        oddsDecimal: 1.91,
                        stakeUnits: 2.0,
                        result: "won",
                        actualTotal: 228,
                        profitLoss: 1.82,
                        confidenceRating: 4,
                        notes: "Strong pace matchup",
                        createdAt: "2025-01-15T10:00:00Z"
                    ),
                    onTap: {}
                )

                BetCard(
                    bet: BetAPIResponse(
                        id: 2,
                        gameId: "0022400124",
                        homeTeam: "MIA",
                        awayTeam: "NYK",
                        gameDate: "2025-01-16",
                        betType: "totals",
                        selection: "under",
                        lineValue: 210.5,
                        oddsDecimal: 1.87,
                        stakeUnits: 1.5,
                        result: nil,
                        actualTotal: nil,
                        profitLoss: nil,
                        confidenceRating: 3,
                        notes: nil,
                        createdAt: "2025-01-16T10:00:00Z"
                    ),
                    onTap: {}
                )
            }
            .padding(Spacing.screenHorizontal)
        }
    }
}

// MARK: - Skeleton Card

struct SkeletonCard: View {
    @State private var isAnimating = false

    var body: some View {
        SolidCard {
            VStack(spacing: Spacing.sm) {
                // Header placeholder
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 160, height: 14)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 80, height: 10)
                    }

                    Spacer()

                    RoundedRectangle(cornerRadius: CornerRadius.pill)
                        .fill(Color.gray5)
                        .frame(width: 60, height: 24)
                }

                Divider()
                    .background(Color.separator.opacity(0.3))

                // Details placeholders
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 40, height: 10)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 60, height: 14)
                    }

                    Spacer()

                    VStack(alignment: .center, spacing: 4) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 40, height: 10)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 50, height: 14)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 4) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 40, height: 10)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray5)
                            .frame(width: 45, height: 14)
                    }
                }
            }
        }
        .opacity(isAnimating ? 0.5 : 1.0)
        .animation(
            Animation.easeInOut(duration: 1.0)
                .repeatForever(autoreverses: true),
            value: isAnimating
        )
        .onAppear {
            isAnimating = true
        }
    }
}
