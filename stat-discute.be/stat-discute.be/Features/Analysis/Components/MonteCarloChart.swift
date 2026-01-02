//
//  MonteCarloChart.swift
//  stat-discute.be
//
//  Feature: Analysis - Monte Carlo Distribution Chart
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 4.2
//

import SwiftUI
import Charts

// MARK: - Monte Carlo Data Types

struct MonteCarloDataPoint: Identifiable {
    let id = UUID()
    let total: Double
    let probability: Double
}

struct PercentileMarker: Identifiable {
    let id = UUID()
    let percentile: Int
    let value: Double
    let label: String
}

// MARK: - Monte Carlo Chart

struct MonteCarloChart: View {

    let data: [MonteCarloDataPoint]
    let line: Double
    let mean: Double
    let overProbability: Double
    let percentileMarkers: [PercentileMarker]

    @State private var selectedPoint: MonteCarloDataPoint?
    @State private var showAnnotation = false

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Chart Header
            HStack {
                Text("Distribution")
                    .font(Typography.headline)
                    .foregroundColor(.foregroundPrimary)

                Spacer()

                HStack(spacing: Spacing.sm) {
                    LegendItem(color: .monteCarlo, label: "Simulated")
                    LegendItem(color: .accent, label: "Line")
                }
            }

            // Main Chart
            Chart {
                // Distribution Area
                ForEach(data) { point in
                    AreaMark(
                        x: .value("Total", point.total),
                        y: .value("Probability", point.probability)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.monteCarlo.opacity(0.6), .monteCarlo.opacity(0.1)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .interpolationMethod(.catmullRom)
                }

                // Distribution Line
                ForEach(data) { point in
                    LineMark(
                        x: .value("Total", point.total),
                        y: .value("Probability", point.probability)
                    )
                    .foregroundStyle(Color.monteCarlo)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .interpolationMethod(.catmullRom)
                }

                // Betting Line (Vertical)
                RuleMark(x: .value("Line", line))
                    .foregroundStyle(Color.accent)
                    .lineStyle(StrokeStyle(lineWidth: 2, dash: [5, 5]))
                    .annotation(position: .top, alignment: .center) {
                        Text("Line: \(line, specifier: "%.1f")")
                            .font(Typography.caption2)
                            .foregroundColor(.accent)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.accent.opacity(0.2))
                            .cornerRadius(4)
                    }

                // Mean Line (Vertical)
                RuleMark(x: .value("Mean", mean))
                    .foregroundStyle(Color.monteCarlo)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .annotation(position: .bottom, alignment: .center) {
                        Text("Mean: \(mean, specifier: "%.1f")")
                            .font(Typography.caption2)
                            .foregroundColor(.monteCarlo)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.monteCarlo.opacity(0.2))
                            .cornerRadius(4)
                    }

                // Selected Point Indicator
                if let selected = selectedPoint {
                    PointMark(
                        x: .value("Total", selected.total),
                        y: .value("Probability", selected.probability)
                    )
                    .foregroundStyle(Color.white)
                    .symbolSize(100)
                }
            }
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 5)) { value in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                        .foregroundStyle(Color.gray4)
                    AxisValueLabel()
                        .font(Typography.caption2)
                        .foregroundStyle(Color.foregroundSecondary)
                }
            }
            .chartYAxis {
                AxisMarks { _ in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                        .foregroundStyle(Color.gray4)
                }
            }
            .chartXAxisLabel(position: .bottom) {
                Text("Projected Total Points")
                    .font(Typography.caption2)
                    .foregroundColor(.foregroundTertiary)
            }
            .chartOverlay { proxy in
                GeometryReader { geometry in
                    Rectangle()
                        .fill(Color.clear)
                        .contentShape(Rectangle())
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { value in
                                    let x = value.location.x
                                    if let total: Double = proxy.value(atX: x) {
                                        selectedPoint = data.min(by: {
                                            abs($0.total - total) < abs($1.total - total)
                                        })
                                    }
                                }
                                .onEnded { _ in
                                    selectedPoint = nil
                                }
                        )
                }
            }
            .frame(height: 200)

            // Percentile Markers
            if !percentileMarkers.isEmpty {
                PercentileRow(markers: percentileMarkers)
            }
        }
    }
}

// MARK: - Legend Item

private struct LegendItem: View {
    let color: Color
    let label: String

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)

            Text(label)
                .font(Typography.caption2)
                .foregroundColor(.foregroundSecondary)
        }
    }
}

// MARK: - Percentile Row

private struct PercentileRow: View {
    let markers: [PercentileMarker]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(markers) { marker in
                VStack(spacing: 2) {
                    Text(marker.label)
                        .font(Typography.caption2)
                        .foregroundColor(.foregroundTertiary)

                    Text("\(marker.value, specifier: "%.1f")")
                        .font(Typography.statSmall)
                        .foregroundColor(.foregroundPrimary)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, Spacing.sm)
        .background(Color.gray6)
        .cornerRadius(CornerRadius.small)
    }
}

// MARK: - Probability Split View

struct ProbabilitySplitView: View {

    let overProbability: Double
    let underProbability: Double
    let line: Double

    var body: some View {
        VStack(spacing: Spacing.md) {
            // Header
            Text("Probability Split")
                .font(Typography.headline)
                .foregroundColor(.foregroundPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Split Bars
            HStack(spacing: Spacing.lg) {
                // Over
                ProbabilityColumn(
                    label: "OVER",
                    value: line,
                    probability: overProbability,
                    color: .positive
                )

                // Divider
                Rectangle()
                    .fill(Color.gray4)
                    .frame(width: 1)

                // Under
                ProbabilityColumn(
                    label: "UNDER",
                    value: line,
                    probability: underProbability,
                    color: .negative
                )
            }
            .padding(Spacing.md)
            .background(Color.gray6)
            .cornerRadius(CornerRadius.medium)
        }
    }
}

private struct ProbabilityColumn: View {
    let label: String
    let value: Double
    let probability: Double
    let color: Color

    var body: some View {
        VStack(spacing: Spacing.sm) {
            Text(label)
                .font(Typography.caption1)
                .foregroundColor(.foregroundTertiary)

            Text("\(value, specifier: "%.1f")")
                .font(Typography.statMedium)
                .foregroundColor(.foregroundPrimary)

            // Probability Circle
            ZStack {
                Circle()
                    .stroke(Color.gray4, lineWidth: 6)

                Circle()
                    .trim(from: 0, to: probability)
                    .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6), value: probability)

                Text("\(Int(probability * 100))%")
                    .font(Typography.statSmall)
                    .foregroundColor(color)
            }
            .frame(width: 80, height: 80)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Factors List

struct FactorsList: View {

    let factors: [AnalysisFactor]

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text("Key Factors")
                .font(Typography.headline)
                .foregroundColor(.foregroundPrimary)

            VStack(spacing: Spacing.xs) {
                ForEach(factors, id: \.name) { factor in
                    FactorRow(factor: factor)
                }
            }
        }
    }
}

private struct FactorRow: View {
    let factor: AnalysisFactor

    var impactColor: Color {
        if factor.impact > 0 {
            return .positive
        } else if factor.impact < 0 {
            return .negative
        } else {
            return .foregroundSecondary
        }
    }

    var impactText: String {
        let sign = factor.impact > 0 ? "+" : ""
        return "\(sign)\(Int(factor.impact * 100))%"
    }

    var body: some View {
        HStack(spacing: Spacing.sm) {
            // Impact Indicator
            Text(impactText)
                .font(Typography.statSmall)
                .foregroundColor(impactColor)
                .frame(width: 50, alignment: .trailing)

            // Factor Info
            VStack(alignment: .leading, spacing: 2) {
                Text(factor.name)
                    .font(Typography.callout)
                    .foregroundColor(.foregroundPrimary)

                Text(factor.description)
                    .font(Typography.caption2)
                    .foregroundColor(.foregroundSecondary)
            }

            Spacer()
        }
        .padding(Spacing.sm)
        .background(Color.gray6)
        .cornerRadius(CornerRadius.small)
    }
}

// MARK: - Preview

#Preview("Monte Carlo Chart") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        ScrollView {
            VStack(spacing: Spacing.lg) {
                SolidCard {
                    MonteCarloChart(
                        data: generateSampleData(),
                        line: 224.5,
                        mean: 226.8,
                        overProbability: 0.58,
                        percentileMarkers: [
                            PercentileMarker(percentile: 10, value: 210.5, label: "10th"),
                            PercentileMarker(percentile: 25, value: 218.2, label: "25th"),
                            PercentileMarker(percentile: 50, value: 226.8, label: "Median"),
                            PercentileMarker(percentile: 75, value: 235.4, label: "75th"),
                            PercentileMarker(percentile: 90, value: 243.1, label: "90th")
                        ]
                    )
                }

                SolidCard {
                    ProbabilitySplitView(
                        overProbability: 0.58,
                        underProbability: 0.42,
                        line: 224.5
                    )
                }

                SolidCard {
                    FactorsList(factors: [
                        AnalysisFactor(name: "Pace", impact: 0.12, description: "Both teams play above average pace"),
                        AnalysisFactor(name: "Rest", impact: 0.08, description: "Home team on 2 days rest"),
                        AnalysisFactor(name: "Defense", impact: -0.05, description: "Away team ranks 8th in defensive rating")
                    ])
                }
            }
            .padding(Spacing.screenHorizontal)
        }
    }
}

private func generateSampleData() -> [MonteCarloDataPoint] {
    let mean = 226.8
    let stdDev = 12.5
    var points: [MonteCarloDataPoint] = []

    for i in 0...50 {
        let x = (mean - 50) + (Double(i) * 2)
        let coefficient = 1.0 / (stdDev * sqrt(2.0 * .pi))
        let exponent = -pow(x - mean, 2) / (2.0 * pow(stdDev, 2))
        let probability = coefficient * exp(exponent)
        points.append(MonteCarloDataPoint(total: x, probability: probability))
    }

    return points
}
