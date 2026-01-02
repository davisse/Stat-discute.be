//
//  Team.swift
//  stat-discute.be
//
//  Domain Model: NBA Team
//  Uses Production GCP API models from APIClient.swift
//

import Foundation
import SwiftData

// MARK: - Team Model (SwiftData for Local Caching)

@Model
final class Team: Identifiable {

    @Attribute(.unique) var teamId: Int64
    var fullName: String
    var abbreviation: String
    var nickname: String
    var city: String
    var yearFounded: Int?

    init(
        teamId: Int64,
        fullName: String,
        abbreviation: String,
        nickname: String,
        city: String,
        yearFounded: Int? = nil
    ) {
        self.teamId = teamId
        self.fullName = fullName
        self.abbreviation = abbreviation
        self.nickname = nickname
        self.city = city
        self.yearFounded = yearFounded
    }

    // MARK: - Computed Properties

    var displayName: String {
        abbreviation
    }

    var id: Int64 {
        teamId
    }
}
