//
//  ProbabilityBar.swift
//  stat-discute.be
//
//  Core Component: Over/Under Probability Visualization
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.4
//

import SwiftUI

// MARK: - Probability Bar

struct ProbabilityBar: View {

    let overProbability: Double  // 0.0 - 1.0
    let underProbability: Double // 0.0 - 1.0
    var showLabels: Bool = true
    var height: CGFloat = 8
    var animated: Bool = true

    @State private var animatedOver: Double = 0
    @State private var animatedUnder: Double = 0

    private var overPercentage: Int {
        Int(round(overProbability * 100))
    }

    private var underPercentage: Int {
        Int(round(underProbability * 100))
    }

    var body: some View {
        VStack(spacing: Spacing.xs) {
            // Labels row
            if showLabels {
                HStack {
                    HStack(spacing: 4) {
                        Text("OVER")
                            .font(Typography.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(.foregroundSecondary)
                        Text("\(overPercentage)%")
                            .font(Typography.statTiny)
                            .foregroundColor(.positive)
                    }

                    Spacer()

                    HStack(spacing: 4) {
                        Text("\(underPercentage)%")
                            .font(Typography.statTiny)
                            .foregroundColor(.negative)
                        Text("UNDER")
                            .font(Typography.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(.foregroundSecondary)
                    }
                }
            }

            // Bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background
                    RoundedRectangle(cornerRadius: height / 2)
                        .fill(Color.gray5)
                        .frame(height: height)

                    // Over portion (left side, green)
                    RoundedRectangle(cornerRadius: height / 2)
                        .fill(
                            LinearGradient(
                                colors: [.positive, .positive.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(
                            width: geometry.size.width * (animated ? animatedOver : overProbability),
                            height: height
                        )

                    // Under portion (right side, red) - positioned from right
                    HStack {
                        Spacer()
                        RoundedRectangle(cornerRadius: height / 2)
                            .fill(
                                LinearGradient(
                                    colors: [.negative.opacity(0.8), .negative],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(
                                width: geometry.size.width * (animated ? animatedUnder : underProbability),
                                height: height
                            )
                    }
                }
            }
            .frame(height: height)
        }
        .onAppear {
            if animated {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    animatedOver = overProbability
                    animatedUnder = underProbability
                }
            }
        }
        .onChange(of: overProbability) { _, newValue in
            if animated {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                    animatedOver = newValue
                }
            }
        }
        .onChange(of: underProbability) { _, newValue in
            if animated {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                    animatedUnder = newValue
                }
            }
        }
    }
}

// MARK: - Simple Progress Bar

struct ProgressBar: View {

    let progress: Double  // 0.0 - 1.0
    var color: Color = .accent
    var backgroundColor: Color = .gray5
    var height: CGFloat = 4
    var animated: Bool = true

    @State private var animatedProgress: Double = 0

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(backgroundColor)
                    .frame(height: height)

                // Progress
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(color)
                    .frame(
                        width: geometry.size.width * (animated ? animatedProgress : progress),
                        height: height
                    )
            }
        }
        .frame(height: height)
        .onAppear {
            if animated {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    animatedProgress = progress
                }
            }
        }
    }
}

// MARK: - Stat Comparison Bar

struct StatComparisonBar: View {

    let leftValue: Double
    let rightValue: Double
    let leftLabel: String
    let rightLabel: String
    var leftColor: Color = .positive
    var rightColor: Color = .negative
    var height: CGFloat = 24

    private var total: Double {
        leftValue + rightValue
    }

    private var leftRatio: Double {
        guard total > 0 else { return 0.5 }
        return leftValue / total
    }

    var body: some View {
        VStack(spacing: Spacing.xxs) {
            // Labels
            HStack {
                Text(leftLabel)
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)

                Spacer()

                Text(rightLabel)
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)
            }

            // Bar with values
            GeometryReader { geometry in
                HStack(spacing: 2) {
                    // Left side
                    ZStack {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(leftColor)
                        Text(String(format: "%.1f", leftValue))
                            .font(Typography.caption1)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                    .frame(width: max(40, geometry.size.width * leftRatio - 1))

                    // Right side
                    ZStack {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(rightColor)
                        Text(String(format: "%.1f", rightValue))
                            .font(Typography.caption1)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                    .frame(width: max(40, geometry.size.width * (1 - leftRatio) - 1))
                }
            }
            .frame(height: height)
        }
    }
}

// MARK: - Preview

#Preview("Probability Bars") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        VStack(spacing: Spacing.xl) {
            // Standard probability bar
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text("Probability Bar")
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)

                ProbabilityBar(
                    overProbability: 0.42,
                    underProbability: 0.58
                )
            }

            // No labels
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text("Without Labels")
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)

                ProbabilityBar(
                    overProbability: 0.68,
                    underProbability: 0.32,
                    showLabels: false,
                    height: 12
                )
            }

            // Progress bar
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text("Progress Bar")
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)

                ProgressBar(progress: 0.75, color: .monteCarlo)
            }

            // Stat comparison
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text("Stat Comparison")
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)

                StatComparisonBar(
                    leftValue: 115.4,
                    rightValue: 108.2,
                    leftLabel: "Off Rtg",
                    rightLabel: "Def Rtg"
                )
            }
        }
        .padding(Spacing.screenHorizontal)
    }
}
