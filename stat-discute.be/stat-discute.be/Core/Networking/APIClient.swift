//
//  APIClient.swift
//  stat-discute.be
//
//  Core: Networking Layer
//  Production API: GCP Compute Engine (34.140.155.16:3000)
//

import Foundation

// MARK: - API Configuration

enum APIEnvironment {
    case development
    case production

    var baseURL: String {
        switch self {
        case .development:
            return "http://localhost:3000"
        case .production:
            // TODO: Update to HTTPS once SSL certificate is configured
            return "http://34.140.155.16:3000"
        }
    }
}

// MARK: - API Error

enum APIError: LocalizedError {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(statusCode: Int, message: String?)
    case unauthorized
    case notFound
    case rateLimited
    case noData
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .serverError(let code, let message):
            return "Server error (\(code)): \(message ?? "Unknown error")"
        case .unauthorized:
            return "Authentication required"
        case .notFound:
            return "Resource not found"
        case .rateLimited:
            return "Too many requests. Please try again later."
        case .noData:
            return "No data available"
        case .unknown:
            return "An unknown error occurred"
        }
    }
}

// MARK: - API Client

actor APIClient {

    // MARK: - Singleton

    static let shared = APIClient()

    // MARK: - Configuration

    private let environment: APIEnvironment
    private let session: URLSession
    private var authToken: String?

    private var baseURL: String {
        environment.baseURL
    }

    private init() {
        #if DEBUG
        // Use development for local testing
        self.environment = .development
        #else
        self.environment = .production
        #endif

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        self.session = URLSession(configuration: config)
    }

    // MARK: - Auth Token Management

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }

    // MARK: - JSON Decoder

    private var jsonDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        // Handle multiple date formats
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"

        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            // Try ISO8601 first
            if let date = isoFormatter.date(from: dateString) {
                return date
            }

            // Try simple date format
            if let date = dateFormatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date: \(dateString)"
            )
        }

        return decoder
    }

    // MARK: - Request Building

    private func buildRequest(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        queryParams: [String: String]? = nil
    ) throws -> URLRequest {
        var urlString = "\(baseURL)\(endpoint)"

        if let params = queryParams, !params.isEmpty {
            let queryString = params
                .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
                .joined(separator: "&")
            urlString += "?\(queryString)"
        }

        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("StatDiscute-iOS/1.0", forHTTPHeaderField: "User-Agent")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = body
        }

        return request
    }

    // MARK: - Generic Request

    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        queryParams: [String: String]? = nil
    ) async throws -> T {
        let request = try buildRequest(
            endpoint: endpoint,
            method: method,
            body: body,
            queryParams: queryParams
        )

        #if DEBUG
        print("[API] \(method) \(request.url?.absoluteString ?? "")")
        #endif

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.unknown
            }

            #if DEBUG
            print("[API] Status: \(httpResponse.statusCode)")
            if let json = String(data: data, encoding: .utf8) {
                print("[API] Response: \(json.prefix(500))")
            }
            #endif

            switch httpResponse.statusCode {
            case 200..<300:
                break
            case 401:
                throw APIError.unauthorized
            case 404:
                throw APIError.notFound
            case 429:
                throw APIError.rateLimited
            case 400..<500:
                if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = errorJson["error"] as? String {
                    throw APIError.serverError(statusCode: httpResponse.statusCode, message: message)
                }
                throw APIError.serverError(statusCode: httpResponse.statusCode, message: nil)
            case 500..<600:
                throw APIError.serverError(statusCode: httpResponse.statusCode, message: "Server error")
            default:
                throw APIError.unknown
            }

            return try jsonDecoder.decode(T.self, from: data)

        } catch let error as APIError {
            throw error
        } catch let error as DecodingError {
            #if DEBUG
            print("[API] Decoding error: \(error)")
            #endif
            throw APIError.decodingError(error)
        } catch {
            throw APIError.networkError(error)
        }
    }

    // MARK: - Games API

    /// Get recent games from the database
    func getRecentGames(limit: Int = 20) async throws -> [GameAPIResponse] {
        try await request(
            endpoint: "/api/games",
            queryParams: ["limit": "\(limit)"]
        )
    }

    /// Get today's games with totals analysis
    func getTodaysGamesWithAnalysis() async throws -> TotalsAnalysisResponse {
        try await request(endpoint: "/api/betting/totals-analysis")
    }

    /// Get team totals history
    func getTeamTotalsHistory(teamId: Int) async throws -> TeamHistoryResponse {
        try await request(
            endpoint: "/api/betting/totals-analysis",
            queryParams: ["action": "team-history", "teamId": "\(teamId)"]
        )
    }

    // MARK: - Betting Agent API

    /// Run betting agent analysis on a game
    func runBettingAgentAnalysis(
        homeTeam: String,
        awayTeam: String,
        line: Double? = nil
    ) async throws -> BettingAgentResponse {
        var params: [String: String] = [
            "home_team": homeTeam,
            "away_team": awayTeam
        ]
        if let line = line {
            params["line"] = "\(line)"
        }

        return try await request(
            endpoint: "/api/betting/agent/analyze",
            queryParams: params
        )
    }

    /// Get betting agent history
    func getBettingAgentHistory(limit: Int = 20) async throws -> [BettingAgentHistoryItem] {
        try await request(
            endpoint: "/api/betting/agent/history",
            queryParams: ["limit": "\(limit)"]
        )
    }

    // MARK: - My Bets API

    /// Get user's bets
    func getMyBets(action: String? = nil) async throws -> MyBetsResponse {
        var params: [String: String] = [:]
        if let action = action {
            params["action"] = action
        }
        return try await request(
            endpoint: "/api/my-bets",
            queryParams: params.isEmpty ? nil : params
        )
    }

    /// Get bet statistics
    func getBetStats() async throws -> MyBetsResponse {
        try await request(
            endpoint: "/api/my-bets",
            queryParams: ["action": "stats"]
        )
    }

    /// Create a new bet
    func createBet(_ bet: CreateBetRequest) async throws -> MyBetsResponse {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let body = try encoder.encode(bet)

        return try await request(
            endpoint: "/api/my-bets",
            method: "POST",
            body: body
        )
    }

    // MARK: - Teams API

    /// Get all teams
    func getTeams() async throws -> [TeamAPIResponse] {
        try await request(endpoint: "/api/teams")
    }

    /// Get team standings
    func getTeamStandings() async throws -> [TeamStandingsResponse] {
        try await request(endpoint: "/api/teams")
    }

    /// Get team defense stats by position
    func getTeamDefenseZones(teamId: Int) async throws -> TeamDefenseResponse {
        try await request(endpoint: "/api/teams/\(teamId)/defense-zones")
    }

    // MARK: - Players API

    /// Search players
    func searchPlayers(query: String) async throws -> [PlayerAPIResponse] {
        try await request(
            endpoint: "/api/players/search",
            queryParams: ["q": query]
        )
    }

    /// Get player details
    func getPlayer(playerId: Int) async throws -> PlayerDetailResponse {
        try await request(endpoint: "/api/players/\(playerId)")
    }

    // MARK: - Betting Odds API

    /// Get current odds for games
    func getCurrentOdds() async throws -> OddsResponse {
        try await request(endpoint: "/api/betting/odds/current")
    }
}

// MARK: - API Response Models

/// Game from /api/games
struct GameAPIResponse: Decodable, Identifiable {
    let gameId: String
    let gameDate: String
    let gameTime: String?
    let homeTeamId: Int
    let awayTeamId: Int
    let homeAbbr: String
    let awayAbbr: String
    let homeTeamName: String?
    let awayTeamName: String?
    let homeScore: Int?
    let awayScore: Int?
    let gameStatus: String
    let season: String

    var id: String { gameId }

    var isLive: Bool {
        gameStatus.lowercased().contains("live") || gameStatus.lowercased().contains("progress")
    }

    var isFinal: Bool {
        gameStatus.lowercased() == "final"
    }
}

/// Totals analysis response from /api/betting/totals-analysis
struct TotalsAnalysisResponse: Decodable {
    let games: [TotalsGameAnalysis]
    let generatedAt: String?
    let message: String?
}

struct TotalsGameAnalysis: Decodable, Identifiable {
    let gameId: String
    let gameDate: String
    let homeTeamId: Int
    let homeAbbr: String
    let homeTeam: String
    let awayTeamId: Int
    let awayAbbr: String
    let awayTeam: String
    let homePpg: Double
    let homeOppPpg: Double
    let homePace: Double
    let homeGames: Int
    let awayPpg: Double
    let awayOppPpg: Double
    let awayPace: Double
    let awayGames: Int
    let line: Double?
    let overOdds: Double?
    let underOdds: Double?
    let projected: Double
    let edge: Double?
    let avgPace: Double
    let verdict: String
    let bookmaker: String?

    var id: String { gameId }

    var verdictEnum: Verdict {
        switch verdict {
        case "STRONG_OVER": return .strongOver
        case "LEAN_OVER": return .leanOver
        case "STRONG_UNDER": return .strongUnder
        case "LEAN_UNDER": return .leanUnder
        default: return .hold
        }
    }

    // MARK: - Formatted Properties

    var formattedDate: String {
        // Parse "2025-01-15" format
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"

        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "MMM d, yyyy"

        if let date = inputFormatter.date(from: gameDate) {
            return outputFormatter.string(from: date)
        }
        return gameDate
    }

    var formattedLine: String {
        guard let line = line else { return "N/A" }
        return String(format: "%.1f", line)
    }

    var formattedProjected: String {
        String(format: "%.1f", projected)
    }

    var formattedEdge: String {
        guard let edge = edge else { return "N/A" }
        let sign = edge >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.1f", edge))"
    }

    // MARK: - Probability Calculations

    var overProbability: Double {
        // Simple probability based on edge and line
        guard let line = line, let edge = edge else { return 0.5 }

        // If projected > line, over is more likely
        let diff = projected - line
        // Clamp between 0.1 and 0.9
        let prob = 0.5 + (diff / 20.0)
        return min(0.9, max(0.1, prob))
    }

    var underProbability: Double {
        1.0 - overProbability
    }
}

struct TeamHistoryResponse: Decodable {
    let history: [TeamGameHistory]
}

struct TeamGameHistory: Decodable, Identifiable {
    let gameId: String
    let gameDate: String
    let location: String
    let opponent: String
    let teamPoints: Int
    let oppPoints: Int
    let total: Int
    let pace: Double?

    var id: String { gameId }
}

/// Betting agent response
struct BettingAgentResponse: Decodable {
    let analysis: BettingAgentAnalysis?
    let error: String?
}

struct BettingAgentAnalysis: Decodable {
    let homeTeam: String
    let awayTeam: String
    let line: Double?
    let verdict: String
    let confidence: Double
    let overProbability: Double
    let underProbability: Double
    let projectedTotal: Double
    let factors: [String]
    let recommendation: String
}

struct BettingAgentHistoryItem: Decodable, Identifiable {
    let id: Int
    let homeTeam: String
    let awayTeam: String
    let line: Double?
    let verdict: String
    let actualTotal: Int?
    let result: String?
    let createdAt: String
}

/// My bets response
struct MyBetsResponse: Decodable {
    let bets: [BetAPIResponse]?
    let stats: BetStatsAPIResponse?
    let message: String?
}

struct BetAPIResponse: Decodable, Identifiable {
    let id: Int
    let gameId: String
    let homeTeam: String
    let awayTeam: String
    let gameDate: String
    let betType: String
    let selection: String
    let lineValue: Double
    let oddsDecimal: Double
    let stakeUnits: Double
    let result: String?
    let actualTotal: Double?
    let profitLoss: Double?
    let confidenceRating: Int?
    let notes: String?
    let createdAt: String
}

struct BetStatsAPIResponse: Decodable {
    let totalBets: Int
    let wonBets: Int
    let lostBets: Int
    let pushBets: Int
    let pendingBets: Int
    let winRate: Double
    let totalUnitsWagered: Double
    let totalProfitLoss: Double
    let roi: Double
}

/// Team response
struct TeamAPIResponse: Decodable, Identifiable {
    let teamId: Int
    let abbreviation: String
    let fullName: String
    let city: String
    let nickname: String
    let conference: String?
    let division: String?

    var id: Int { teamId }
}

/// Team standings response
struct TeamStandingsResponse: Decodable, Identifiable {
    let teamId: String
    let fullName: String
    let abbreviation: String
    let wins: String
    let losses: String
    let winPct: String
    let pointsAvg: String
    let pointsAllowedAvg: String
    let pointDiff: String

    var id: String { teamId }

    // Convert string values to appropriate types for display
    var winsInt: Int { Int(wins) ?? 0 }
    var lossesInt: Int { Int(losses) ?? 0 }
    var winPctDouble: Double { Double(winPct) ?? 0.0 }
    var pointsAvgDouble: Double { Double(pointsAvg) ?? 0.0 }
    var pointsAllowedAvgDouble: Double { Double(pointsAllowedAvg) ?? 0.0 }
    var pointDiffDouble: Double { Double(pointDiff) ?? 0.0 }

    var winPercentage: String {
        String(format: "%.1f%%", winPctDouble * 100)
    }

    var record: String {
        "\(winsInt)-\(lossesInt)"
    }

    var pointsPerGame: String {
        String(format: "%.1f", pointsAvgDouble)
    }

    var differentialFormatted: String {
        let sign = pointDiffDouble > 0 ? "+" : ""
        return "\(sign)\(String(format: "%.1f", pointDiffDouble))"
    }
}

struct TeamDefenseResponse: Decodable {
    let team: TeamAPIResponse
    let defenseByPosition: [PositionDefense]
}

struct PositionDefense: Decodable, Identifiable {
    let position: String
    let pointsAllowed: Double
    let gamesPlayed: Int

    var id: String { position }
}

/// Player response
struct PlayerAPIResponse: Decodable, Identifiable {
    let playerId: Int
    let fullName: String
    let teamId: Int?
    let teamAbbr: String?
    let position: String?

    var id: Int { playerId }
}

struct PlayerDetailResponse: Decodable {
    let player: PlayerAPIResponse
    let stats: PlayerStatsResponse?
}

struct PlayerStatsResponse: Decodable {
    let gamesPlayed: Int
    let pointsPerGame: Double
    let reboundsPerGame: Double
    let assistsPerGame: Double
    let minutesPerGame: Double
}

/// Odds response
struct OddsResponse: Decodable {
    let odds: [GameOdds]
    let updatedAt: String?
}

struct GameOdds: Decodable, Identifiable {
    let gameId: String
    let homeTeam: String
    let awayTeam: String
    let total: Double?
    let overOdds: Double?
    let underOdds: Double?
    let spread: Double?
    let homeSpreadOdds: Double?
    let awaySpreadOdds: Double?
    let homeMoneyline: Int?
    let awayMoneyline: Int?
    let bookmaker: String

    var id: String { gameId }
}

// MARK: - Request Models

struct CreateBetRequest: Encodable {
    let gameId: String
    let homeTeam: String
    let awayTeam: String
    let gameDate: String
    let betType: String
    let selection: String
    let lineValue: Double
    let oddsDecimal: Double
    let stakeUnits: Double
    let confidenceRating: Int?
    let notes: String?
}
