//
//  AppTabBar.swift
//  stat-discute.be
//
//  Core Navigation: Floating Tab Bar
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 2.1
//

import SwiftUI

// MARK: - Tab Item Enum

enum AppTab: String, CaseIterable, Identifiable {
    case home
    case analysis
    case bets
    case more

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: return "Home"
        case .analysis: return "Analysis"
        case .bets: return "My Bets"
        case .more: return "More"
        }
    }

    var icon: String {
        switch self {
        case .home: return "house"
        case .analysis: return "chart.bar.xaxis"
        case .bets: return "dollarsign.circle"
        case .more: return "ellipsis"
        }
    }

    var selectedIcon: String {
        switch self {
        case .home: return "house.fill"
        case .analysis: return "chart.bar.xaxis.ascending"
        case .bets: return "dollarsign.circle.fill"
        case .more: return "ellipsis.circle.fill"
        }
    }
}

// MARK: - Floating Tab Bar

struct FloatingTabBar: View {

    @Binding var selectedTab: AppTab
    let onTabTapped: ((AppTab) -> Void)?

    init(selectedTab: Binding<AppTab>, onTabTapped: ((AppTab) -> Void)? = nil) {
        self._selectedTab = selectedTab
        self.onTabTapped = onTabTapped
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(AppTab.allCases) { tab in
                TabBarItem(
                    tab: tab,
                    isSelected: selectedTab == tab,
                    action: {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            selectedTab = tab
                        }
                        onTabTapped?(tab)
                    }
                )
            }
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
        .padding(.horizontal, Spacing.xl)
        .padding(.bottom, Spacing.xs)
    }
}

// MARK: - Tab Bar Item

struct TabBarItem: View {

    let tab: AppTab
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: isSelected ? tab.selectedIcon : tab.icon)
                    .font(.system(size: 20, weight: isSelected ? .semibold : .regular))
                    .symbolEffect(.bounce, value: isSelected)

                Text(tab.title)
                    .font(Typography.caption2)
                    .fontWeight(isSelected ? .medium : .regular)
            }
            .foregroundColor(isSelected ? .white : .foregroundSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.xs)
        }
        .buttonStyle(PlainButtonStyle())
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}

// MARK: - Main Tab View Container

struct MainTabView: View {

    @State private var selectedTab: AppTab = .home

    var body: some View {
        ZStack(alignment: .bottom) {
            // Tab Content
            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(AppTab.home)

                AnalysisView()
                    .tag(AppTab.analysis)

                MyBetsView()
                    .tag(AppTab.bets)

                MoreView()
                    .tag(AppTab.more)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            // Floating Tab Bar
            FloatingTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - View Wrappers for Tab Navigation

struct HomeView: View {
    var body: some View {
        TodayView()
    }
}

struct AnalysisView: View {
    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()
            VStack(spacing: Spacing.lg) {
                Text("Analysis")
                    .font(Typography.display)
                    .foregroundColor(.foregroundPrimary)

                Text("Select a game to analyze")
                    .font(Typography.body)
                    .foregroundColor(.foregroundSecondary)
            }
        }
    }
}

struct MoreView: View {
    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()
            Text("More")
                .font(Typography.display)
                .foregroundColor(.foregroundPrimary)
        }
    }
}

// MARK: - Preview

#Preview("Tab Bar") {
    MainTabView()
}

#Preview("Floating Tab Bar Only") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        VStack {
            Spacer()
            FloatingTabBar(selectedTab: .constant(.home))
        }
    }
}
