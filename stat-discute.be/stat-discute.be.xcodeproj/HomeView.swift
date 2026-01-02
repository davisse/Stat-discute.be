//
//  HomeView.swift
//  stat-discute.be
//
//  Feature: Home - Landing Screen with Branding
//  Modern homepage with logo and quick access
//

import SwiftUI

// MARK: - Home View

struct HomeView: View {
    
    @State private var viewModel = TodayViewModel()
    @State private var isLogoAnimating = false
    
    var body: some View {
        ZStack {
            // Background
            Color.appBackground.ignoresSafeArea()
            
            // Content
            ScrollView {
                VStack(spacing: Spacing.xxl) {
                    // Hero Section with Logo
                    heroSection
                    
                    // Quick Stats Overview
                    if !viewModel.games.isEmpty {
                        quickStatsSection
                    }
                    
                    // Today's Featured Games
                    if !viewModel.topValuePlays.isEmpty {
                        featuredGamesSection
                    }
                    
                    // Loading State
                    if viewModel.isLoading && viewModel.games.isEmpty {
                        loadingSection
                    }
                    
                    // Error State
                    if let error = viewModel.error {
                        errorSection(error)
                    }
                    
                    // Footer spacing for tab bar
                    Spacer()
                        .frame(height: 100)
                }
                .padding(.top, Spacing.xl)
            }
            .refreshable {
                await viewModel.refreshGames()
            }
        }
        .task {
            await viewModel.loadGames()
        }
        .onAppear {
            withAnimation(.spring(response: 1.0, dampingFraction: 0.6)) {
                isLogoAnimating = true
            }
        }
    }
    
    // MARK: - Hero Section
    
    private var heroSection: some View {
        VStack(spacing: Spacing.lg) {
            // Logo
            logoView
            
            // Tagline
            VStack(spacing: Spacing.xs) {
                Text("Smart NBA Betting")
                    .font(Typography.title2)
                    .foregroundColor(.foregroundPrimary)
                
                Text("Data-driven insights for totals betting")
                    .font(Typography.callout)
                    .foregroundColor(.foregroundSecondary)
                    .multilineTextAlignment(.center)
            }
            
            // Today's Date Badge
            HStack(spacing: Spacing.xs) {
                Image(systemName: "calendar")
                    .font(.system(size: 14, weight: .semibold))
                
                Text(viewModel.formattedDate)
                    .font(Typography.subhead)
                    .fontWeight(.semibold)
            }
            .foregroundColor(.foregroundPrimary)
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm)
            .background(
                Capsule()
                    .fill(.ultraThinMaterial)
                    .overlay(
                        Capsule()
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            )
        }
        .padding(.horizontal, Spacing.screenHorizontal)
    }
    
    // MARK: - Logo View
    
    private var logoView: some View {
        ZStack {
            // Glow effect
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color.accent.opacity(0.3),
                            Color.accent.opacity(0.1),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 40,
                        endRadius: 120
                    )
                )
                .frame(width: 240, height: 240)
                .blur(radius: 20)
                .opacity(isLogoAnimating ? 1 : 0)
            
            // Logo container
            ZStack {
                // Outer ring
                Circle()
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color.accent,
                                Color.monteCarlo
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 3
                    )
                    .frame(width: 120, height: 120)
                
                // Inner background
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 110, height: 110)
                
                // Logo content - You can replace this with an Image asset
                VStack(spacing: 4) {
                    // Basketball icon
                    Image(systemName: "basketball.fill")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color.accent, Color.monteCarlo],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    // App name
                    Text("StatDiscute")
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundColor(.foregroundPrimary)
                        .tracking(0.5)
                }
            }
            .scaleEffect(isLogoAnimating ? 1.0 : 0.8)
            .rotation3DEffect(
                .degrees(isLogoAnimating ? 0 : -180),
                axis: (x: 0, y: 1, z: 0)
            )
        }
    }
    
    // MARK: - Quick Stats Section
    
    private var quickStatsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("Today's Overview")
                .font(Typography.title3)
                .foregroundColor(.foregroundPrimary)
                .padding(.horizontal, Spacing.screenHorizontal)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.md) {
                    // Total Games
                    StatCard(
                        title: "Games",
                        value: "\(viewModel.games.count)",
                        icon: "basketball",
                        color: .accent
                    )
                    
                    // Live Games
                    if !viewModel.liveGames.isEmpty {
                        StatCard(
                            title: "Live",
                            value: "\(viewModel.liveGames.count)",
                            icon: "antenna.radiowaves.left.and.right",
                            color: .positive
                        )
                    }
                    
                    // Top Plays
                    if !viewModel.topValuePlays.isEmpty {
                        StatCard(
                            title: "Value Plays",
                            value: "\(viewModel.topValuePlays.count)",
                            icon: "chart.line.uptrend.xyaxis",
                            color: .monteCarlo
                        )
                    }
                    
                    // Upcoming
                    StatCard(
                        title: "Upcoming",
                        value: "\(viewModel.upcomingGames.count)",
                        icon: "clock",
                        color: .warning
                    )
                }
                .padding(.horizontal, Spacing.screenHorizontal)
            }
        }
    }
    
    // MARK: - Featured Games Section
    
    private var featuredGamesSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text("Top Value Plays")
                        .font(Typography.title3)
                        .foregroundColor(.foregroundPrimary)
                    
                    Text("Best opportunities today")
                        .font(Typography.footnote)
                        .foregroundColor(.foregroundSecondary)
                }
                
                Spacer()
                
                // View All button
                NavigationLink(destination: TodayView()) {
                    HStack(spacing: 4) {
                        Text("View All")
                            .font(Typography.subhead)
                            .fontWeight(.semibold)
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .bold))
                    }
                    .foregroundColor(.accent)
                }
            }
            .padding(.horizontal, Spacing.screenHorizontal)
            
            // Featured Game Cards
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.md) {
                    ForEach(viewModel.topValuePlays.prefix(3)) { game in
                        FeaturedGameCard(game: game)
                            .onTapGesture {
                                viewModel.selectedGame = game
                            }
                    }
                }
                .padding(.horizontal, Spacing.screenHorizontal)
            }
        }
        .sheet(item: $viewModel.selectedGame) { game in
            GameAnalysisSheet(game: game)
        }
    }
    
    // MARK: - Loading Section
    
    private var loadingSection: some View {
        VStack(spacing: Spacing.md) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(.accent)
            
            Text("Loading today's games...")
                .font(Typography.callout)
                .foregroundColor(.foregroundSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.xxl)
    }
    
    // MARK: - Error Section
    
    private func errorSection(_ error: String) -> some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundColor(.warning)
            
            Text("Unable to load games")
                .font(Typography.headline)
                .foregroundColor(.foregroundPrimary)
            
            Text(error)
                .font(Typography.callout)
                .foregroundColor(.foregroundSecondary)
                .multilineTextAlignment(.center)
            
            Button("Try Again") {
                Task {
                    await viewModel.refreshGames()
                }
            }
            .buttonStyle(PrimaryButtonStyle())
            .padding(.top, Spacing.sm)
        }
        .padding(.horizontal, Spacing.screenHorizontal)
        .padding(.vertical, Spacing.xxl)
    }
}

// MARK: - Stat Card Component

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(color)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(Typography.statMedium)
                    .foregroundColor(.foregroundPrimary)
                
                Text(title)
                    .font(Typography.caption1)
                    .foregroundColor(.foregroundSecondary)
            }
        }
        .frame(width: 120)
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.lg)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                        .stroke(color.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - Featured Game Card Component

struct FeaturedGameCard: View {
    let game: TotalsGameAnalysis
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(game.awayAbbr)
                        .font(Typography.headline)
                        .foregroundColor(.foregroundPrimary)
                    
                    Text("@")
                        .font(Typography.caption1)
                        .foregroundColor(.foregroundSecondary)
                    
                    Text(game.homeAbbr)
                        .font(Typography.headline)
                        .foregroundColor(.foregroundPrimary)
                }
                
                Spacer()
                
                VerdictBadge(verdict: game.verdictEnum, size: .large)
            }
            
            Divider()
                .background(Color.separator)
            
            // Stats
            HStack(spacing: Spacing.lg) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Line")
                        .font(Typography.caption1)
                        .foregroundColor(.foregroundSecondary)
                    
                    Text(game.formattedLine)
                        .font(Typography.statSmall)
                        .foregroundColor(.foregroundPrimary)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Projected")
                        .font(Typography.caption1)
                        .foregroundColor(.foregroundSecondary)
                    
                    Text(game.formattedProjected)
                        .font(Typography.statSmall)
                        .foregroundColor(.accent)
                }
                
                if let edge = game.edge {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Edge")
                            .font(Typography.caption1)
                            .foregroundColor(.foregroundSecondary)
                        
                        Text(game.formattedEdge)
                            .font(Typography.statSmall)
                            .foregroundColor(edge > 0 ? .positive : .negative)
                    }
                }
            }
        }
        .frame(width: 280)
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.lg)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
    }
}

// MARK: - Primary Button Style

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Typography.headline)
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.lg)
            .padding(.vertical, Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.md)
                    .fill(Color.accent)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3), value: configuration.isPressed)
    }
}

// MARK: - Preview

#Preview("Home View") {
    HomeView()
}

#Preview("Stat Card") {
    ZStack {
        Color.appBackground.ignoresSafeArea()
        
        HStack {
            StatCard(title: "Games", value: "12", icon: "basketball", color: .accent)
            StatCard(title: "Live", value: "3", icon: "antenna.radiowaves.left.and.right", color: .positive)
        }
        .padding()
    }
}
