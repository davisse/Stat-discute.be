//
//  stat_discute_beApp.swift
//  stat-discute.be
//
//  Main App Entry Point
//  Reference: IOS_MASTER_IMPLEMENTATION_PLAN.md
//

import SwiftUI
import SwiftData

@main
struct stat_discute_beApp: App {

    // MARK: - SwiftData Container

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Team.self,
            Game.self,
            UserBet.self
        ])
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false,
            cloudKitDatabase: .none
        )

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    // MARK: - App Body

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .preferredColorScheme(.dark)
        }
        .modelContainer(sharedModelContainer)
    }
}
