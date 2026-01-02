//
//  TodayView.swift
//  stat-discute.be
//
//  Feature: Today - Home Page
//

import SwiftUI

// MARK: - Today View

struct TodayView: View {

    var body: some View {
        ZStack {
            // Background
            Color.appBackground.ignoresSafeArea()

            // Content
            VStack {
                // Empty fresh start
                Text("Home")
                    .font(Typography.display)
                    .foregroundColor(.foregroundPrimary)

                Spacer()
            }
            .padding(Spacing.screenHorizontal)
        }
    }
}

// MARK: - Preview

#Preview("Today View") {
    TodayView()
}