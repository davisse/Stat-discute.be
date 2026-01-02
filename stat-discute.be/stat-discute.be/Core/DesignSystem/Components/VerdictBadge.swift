//
//  VerdictBadge.swift
//  stat-discute.be
//
//  Core Component: Betting Verdict Display
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.4
//

import SwiftUI

// MARK: - Verdict Badge (Large Hero)

struct VerdictBadge: View {

    let verdict: Verdict
    var size: Size = .large
    var showIcon: Bool = true

    enum Size {
        case small   // For table cells, compact views
        case medium  // For cards
        case large   // For hero display

        var fontSize: Font {
            switch self {
            case .small: return Typography.badge
            case .medium: return Typography.badgeLarge
            case .large: return Typography.headline
            }
        }

        var iconSize: CGFloat {
            switch self {
            case .small: return 10
            case .medium: return 14
            case .large: return 18
            }
        }

        var paddingH: CGFloat {
            switch self {
            case .small: return 8
            case .medium: return 12
            case .large: return 16
            }
        }

        var paddingV: CGFloat {
            switch self {
            case .small: return 4
            case .medium: return 6
            case .large: return 10
            }
        }

        var cornerRadius: CGFloat {
            switch self {
            case .small: return 6
            case .medium: return 8
            case .large: return 12
            }
        }
    }

    var body: some View {
        HStack(spacing: 6) {
            if showIcon {
                Image(systemName: verdict.icon)
                    .font(.system(size: size.iconSize, weight: .bold))
            }

            Text(size == .small ? verdict.shortText : verdict.displayText)
                .font(size.fontSize)
                .fontWeight(.bold)
                .tracking(0.5)
        }
        .foregroundColor(verdict.color)
        .padding(.horizontal, size.paddingH)
        .padding(.vertical, size.paddingV)
        .background(
            RoundedRectangle(cornerRadius: size.cornerRadius)
                .fill(verdict.backgroundColor)
        )
    }
}

// MARK: - Verdict Badge Pill (Compact)

struct VerdictPill: View {

    let verdict: Verdict

    var body: some View {
        Text(verdict.shortText)
            .font(Typography.badge)
            .fontWeight(.bold)
            .tracking(0.5)
            .foregroundColor(verdict.color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(verdict.backgroundColor)
            )
    }
}

// MARK: - Confidence Indicator

struct ConfidenceIndicator: View {

    let confidence: ConfidenceLevel
    var showLabel: Bool = true

    var body: some View {
        HStack(spacing: 6) {
            // Dots indicator
            HStack(spacing: 3) {
                ForEach(0..<4) { index in
                    Circle()
                        .fill(index < confidenceLevel ? confidence.color : Color.gray3)
                        .frame(width: 6, height: 6)
                }
            }

            if showLabel {
                Text(confidence.displayText)
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)
            }
        }
    }

    private var confidenceLevel: Int {
        switch confidence {
        case .low: return 1
        case .medium: return 2
        case .high: return 3
        case .veryHigh: return 4
        }
    }
}

// MARK: - Bet Result Badge

struct BetResultBadge: View {

    let result: BetResult
    var size: VerdictBadge.Size = .medium

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: result.icon)
                .font(.system(size: size.iconSize, weight: .bold))

            Text(result.displayText.uppercased())
                .font(size.fontSize)
                .fontWeight(.bold)
                .tracking(0.5)
        }
        .foregroundColor(result.color)
        .padding(.horizontal, size.paddingH)
        .padding(.vertical, size.paddingV)
        .background(
            RoundedRectangle(cornerRadius: size.cornerRadius)
                .fill(result.color.opacity(0.15))
        )
    }
}

// MARK: - Live Indicator

struct LiveIndicator: View {

    @State private var isAnimating = false

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(Color.negative)
                .frame(width: 6, height: 6)
                .scaleEffect(isAnimating ? 1.2 : 1.0)
                .opacity(isAnimating ? 0.6 : 1.0)

            Text("LIVE")
                .font(Typography.badge)
                .fontWeight(.bold)
                .tracking(0.5)
                .foregroundColor(.negative)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(Color.negative.opacity(0.15))
        )
        .onAppear {
            withAnimation(
                .easeInOut(duration: 0.8)
                .repeatForever(autoreverses: true)
            ) {
                isAnimating = true
            }
        }
    }
}

// MARK: - Preview

#Preview("Verdict Badges") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        VStack(spacing: Spacing.lg) {
            // Large Badges
            Text("Large Badges")
                .font(Typography.caption1)
                .foregroundColor(.foregroundSecondary)

            HStack(spacing: Spacing.sm) {
                VerdictBadge(verdict: .strongOver, size: .large)
                VerdictBadge(verdict: .leanUnder, size: .large)
            }

            // Medium Badges
            Text("Medium Badges")
                .font(Typography.caption1)
                .foregroundColor(.foregroundSecondary)

            HStack(spacing: Spacing.sm) {
                ForEach(Verdict.allCases, id: \.self) { verdict in
                    VerdictBadge(verdict: verdict, size: .medium)
                }
            }

            // Small Pills
            Text("Small Pills")
                .font(Typography.caption1)
                .foregroundColor(.foregroundSecondary)

            HStack(spacing: Spacing.xs) {
                ForEach(Verdict.allCases, id: \.self) { verdict in
                    VerdictPill(verdict: verdict)
                }
            }

            // Confidence Indicators
            Text("Confidence Levels")
                .font(Typography.caption1)
                .foregroundColor(.foregroundSecondary)

            VStack(spacing: Spacing.xs) {
                ForEach(ConfidenceLevel.allCases, id: \.self) { level in
                    ConfidenceIndicator(confidence: level)
                }
            }

            // Bet Results
            Text("Bet Results")
                .font(Typography.caption1)
                .foregroundColor(.foregroundSecondary)

            HStack(spacing: Spacing.sm) {
                ForEach(BetResult.allCases, id: \.self) { result in
                    BetResultBadge(result: result, size: .small)
                }
            }

            // Live Indicator
            LiveIndicator()
        }
        .padding(Spacing.screenHorizontal)
    }
}
