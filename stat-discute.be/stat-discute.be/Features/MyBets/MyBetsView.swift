//
//  MyBetsView.swift
//  stat-discute.be
//
//  Feature: My Bets - Main Screen
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 4.3
//  Uses Production GCP API
//

import SwiftUI

// MARK: - My Bets View

struct MyBetsView: View {

    @State private var viewModel = MyBetsViewModel()
    @State private var showAddBet = false

    var body: some View {
        ZStack {
            // Background
            Color.appBackground.ignoresSafeArea()

            // Content
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.xl) {
                    // Header
                    headerSection

                    // Performance Dashboard
                    if let stats = viewModel.stats {
                        performanceSection(stats)
                    }

                    // Filter Chips
                    BetFilterChips(
                        selectedFilter: Binding(
                            get: { viewModel.selectedFilter },
                            set: { viewModel.setFilter($0) }
                        ),
                        counts: viewModel.filterCounts
                    )

                    // Bets List
                    betsListSection

                    // Loading State
                    if viewModel.isLoading && viewModel.bets.isEmpty {
                        loadingSection
                    }

                    // Empty State
                    if !viewModel.isLoading && viewModel.filteredBets.isEmpty {
                        emptySection
                    }

                    // Error State
                    if let error = viewModel.error, viewModel.bets.isEmpty {
                        errorSection(error)
                    }

                    // Footer spacing for tab bar
                    Spacer()
                        .frame(height: 100)
                }
                .padding(.top, Spacing.md)
            }
            .refreshable {
                await viewModel.refreshData()
            }

            // Floating Add Button
            VStack {
                Spacer()

                HStack {
                    Spacer()

                    Button(action: {
                        showAddBet = true
                    }) {
                        Image(systemName: "plus")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(.black)
                            .frame(width: 56, height: 56)
                            .background(Color.accent)
                            .clipShape(Circle())
                            .shadow(color: .accent.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    .padding(.trailing, Spacing.screenHorizontal)
                    .padding(.bottom, 120) // Above tab bar
                }
            }
        }
        .task {
            await viewModel.loadData()
        }
        .sheet(item: $viewModel.selectedBet) { bet in
            BetDetailSheet(bet: bet)
        }
        .sheet(isPresented: $showAddBet) {
            AddBetSheet()
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xxs) {
            Text("My Bets")
                .font(Typography.display)
                .foregroundColor(.foregroundPrimary)

            if let stats = viewModel.stats {
                Text("\(stats.totalBets) total bets - \(stats.pendingBets) pending")
                    .font(Typography.callout)
                    .foregroundColor(.foregroundSecondary)
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Performance Section

    private func performanceSection(_ stats: BetStatsAPIResponse) -> some View {
        VStack(spacing: Spacing.md) {
            PerformanceSummaryCard(stats: stats)
                .padding(.horizontal, Spacing.screenHorizontal)

            SolidCard {
                StatsGrid(stats: stats)
            }
            .padding(.horizontal, Spacing.screenHorizontal)
        }
    }

    // MARK: - Bets List Section

    private var betsListSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            if !viewModel.filteredBets.isEmpty {
                Text("Recent Bets")
                    .font(Typography.title3)
                    .foregroundColor(.foregroundPrimary)
                    .padding(.horizontal, Spacing.screenHorizontal)

                VStack(spacing: Spacing.sm) {
                    ForEach(viewModel.filteredBets, id: \.id) { bet in
                        BetCard(bet: bet) {
                            viewModel.selectBet(bet)
                        }
                    }
                }
                .padding(.horizontal, Spacing.screenHorizontal)
            }
        }
    }

    // MARK: - Loading Section

    private var loadingSection: some View {
        VStack(spacing: Spacing.lg) {
            ForEach(0..<3, id: \.self) { _ in
                SkeletonCard()
            }
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Empty Section

    private var emptySection: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: viewModel.selectedFilter == .all ? "dollarsign.circle" : "line.3.horizontal.decrease.circle")
                .font(.system(size: 48))
                .foregroundColor(.foregroundTertiary)

            Text(viewModel.selectedFilter == .all ? "No Bets Yet" : "No \(viewModel.selectedFilter.displayName) Bets")
                .font(Typography.title2)
                .foregroundColor(.foregroundPrimary)

            Text(viewModel.selectedFilter == .all
                 ? "Start tracking your bets to see performance analytics"
                 : "No bets match this filter")
                .font(Typography.callout)
                .foregroundColor(.foregroundSecondary)
                .multilineTextAlignment(.center)

            if viewModel.selectedFilter == .all {
                Button(action: {
                    showAddBet = true
                }) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                        Text("Add Your First Bet")
                    }
                    .font(Typography.headline)
                    .foregroundColor(.accent)
                }
                .padding(.top, Spacing.sm)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .padding(.horizontal, Spacing.screenHorizontal)
    }

    // MARK: - Error Section

    private func errorSection(_ error: Error) -> some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.warning)

            Text("Unable to Load Bets")
                .font(Typography.title2)
                .foregroundColor(.foregroundPrimary)

            Text(error.localizedDescription)
                .font(Typography.callout)
                .foregroundColor(.foregroundSecondary)
                .multilineTextAlignment(.center)

            Button(action: {
                Task {
                    await viewModel.loadData()
                }
            }) {
                Text("Try Again")
                    .font(Typography.headline)
                    .foregroundColor(.accent)
            }
            .padding(.top, Spacing.sm)
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.screenHorizontal)
    }
}

// MARK: - Add Bet Sheet (Placeholder)

struct AddBetSheet: View {

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                VStack(spacing: Spacing.lg) {
                    Image(systemName: "plus.circle")
                        .font(.system(size: 64))
                        .foregroundColor(.accent)

                    Text("Add New Bet")
                        .font(Typography.title1)
                        .foregroundColor(.foregroundPrimary)

                    Text("Coming soon: Log bets from games or manually enter your wagers")
                        .font(Typography.callout)
                        .foregroundColor(.foregroundSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Spacing.xl)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.foregroundSecondary)
                }
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }
}

// MARK: - Preview

#Preview("My Bets View") {
    MyBetsView()
}
