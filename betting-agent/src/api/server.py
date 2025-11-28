"""
FastAPI server exposing Monte Carlo simulation for NBA totals betting.

Run with:
    uvicorn src.api.server:app --reload --port 8001
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import asyncpg
import os
from dotenv import load_dotenv

from src.tools.monte_carlo import (
    monte_carlo_totals_simulation,
    scenario_analysis,
    sensitivity_analysis,
    calculate_ev_metrics,
    full_monte_carlo_analysis,
)

load_dotenv()


def american_to_decimal(american_odds: float) -> float:
    """Convert American odds to decimal odds."""
    if american_odds is None:
        return 1.91  # Default to -110 equivalent
    if american_odds >= 100:
        return 1 + (american_odds / 100)
    else:
        return 1 + (100 / abs(american_odds))


app = FastAPI(
    title="NBA Betting Agent API",
    description="Monte Carlo simulation and betting analysis for NBA games",
    version="1.0.0",
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class MonteCarloRequest(BaseModel):
    """Request for Monte Carlo simulation."""
    home_projection: float = Field(..., description="Home team expected points")
    away_projection: float = Field(..., description="Away team expected points")
    home_std_dev: float = Field(default=10.0, description="Home team scoring std dev")
    away_std_dev: float = Field(default=10.0, description="Away team scoring std dev")
    total_line: float = Field(..., description="Betting line for over/under")
    over_odds: float = Field(default=1.91, description="Decimal odds for over")
    under_odds: float = Field(default=1.91, description="Decimal odds for under")
    n_sims: int = Field(default=10000, description="Number of simulations")
    include_scenarios: bool = Field(default=True, description="Include scenario analysis")
    include_sensitivity: bool = Field(default=True, description="Include sensitivity analysis")


class GameTotalsRequest(BaseModel):
    """Request for batch game totals analysis."""
    game_id: str
    home_team_abbr: str
    away_team_abbr: str
    home_ppg: float
    home_opp_ppg: float
    home_std_dev: Optional[float] = 10.0
    away_ppg: float
    away_opp_ppg: float
    away_std_dev: Optional[float] = 10.0
    total_line: Optional[float] = None
    over_odds: Optional[float] = 1.91
    under_odds: Optional[float] = 1.91


class BatchTotalsRequest(BaseModel):
    """Request for analyzing multiple games."""
    games: list[GameTotalsRequest]
    n_sims: int = Field(default=10000, description="Simulations per game")


# Database pool
db_pool: Optional[asyncpg.Pool] = None


async def get_db_pool():
    """Get or create database connection pool."""
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 5432)),
            database=os.getenv("DB_NAME", "nba_stats"),
            user=os.getenv("DB_USER", "chapirou"),
            password=os.getenv("DB_PASSWORD", ""),
            min_size=1,
            max_size=5,
        )
    return db_pool


@app.on_event("startup")
async def startup():
    """Initialize database pool on startup."""
    await get_db_pool()


@app.on_event("shutdown")
async def shutdown():
    """Close database pool on shutdown."""
    global db_pool
    if db_pool:
        await db_pool.close()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "nba-betting-agent"}


@app.post("/api/monte-carlo/simulate")
async def run_monte_carlo(request: MonteCarloRequest):
    """
    Run full Monte Carlo simulation for a single game.

    Returns probability distributions, EV metrics, and scenario analysis.
    """
    try:
        result = full_monte_carlo_analysis(
            t1_projection=request.home_projection,
            t2_projection=request.away_projection,
            t1_std_dev=request.home_std_dev,
            t2_std_dev=request.away_std_dev,
            total_line=request.total_line,
            direction="under" if request.home_projection + request.away_projection < request.total_line else "over",
            over_odds=request.over_odds,
            under_odds=request.under_odds,
            n_sims=request.n_sims,
            include_scenarios=request.include_scenarios,
            include_sensitivity=request.include_sensitivity,
        )
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/monte-carlo/batch")
async def run_batch_monte_carlo(request: BatchTotalsRequest):
    """
    Run Monte Carlo simulation for multiple games.

    Returns analysis for each game including probabilities and recommendations.
    """
    try:
        results = []

        for game in request.games:
            # Calculate projections (simple average of PPG and OppPPG allowed)
            home_projection = (game.home_ppg + game.away_opp_ppg) / 2
            away_projection = (game.away_ppg + game.home_opp_ppg) / 2
            total_projection = home_projection + away_projection

            # Skip if no betting line available
            if game.total_line is None:
                results.append({
                    "game_id": game.game_id,
                    "home_abbr": game.home_team_abbr,
                    "away_abbr": game.away_team_abbr,
                    "projected": round(total_projection, 1),
                    "line": None,
                    "monte_carlo": None,
                    "error": "No betting line available"
                })
                continue

            # Run Monte Carlo simulation
            mc_result = monte_carlo_totals_simulation(
                t1_projection=home_projection,
                t2_projection=away_projection,
                t1_std_dev=game.home_std_dev or 10.0,
                t2_std_dev=game.away_std_dev or 10.0,
                total_line=game.total_line,
                n_sims=request.n_sims,
            )

            # Calculate EV metrics
            ev_metrics = calculate_ev_metrics(
                p_over=mc_result["p_over"],
                p_under=mc_result["p_under"],
                over_odds=game.over_odds or 1.91,
                under_odds=game.under_odds or 1.91,
            )

            # Determine verdict based on edge
            edge_over = ev_metrics["edge_over"]
            edge_under = ev_metrics["edge_under"]

            if edge_under > 0.08:
                verdict = "STRONG_UNDER"
            elif edge_under > 0.03:
                verdict = "LEAN_UNDER"
            elif edge_over > 0.08:
                verdict = "STRONG_OVER"
            elif edge_over > 0.03:
                verdict = "LEAN_OVER"
            else:
                verdict = "NEUTRAL"

            results.append({
                "game_id": game.game_id,
                "home_abbr": game.home_team_abbr,
                "away_abbr": game.away_team_abbr,
                "projected": round(total_projection, 1),
                "line": game.total_line,
                "monte_carlo": {
                    "p_over": mc_result["p_over"],
                    "p_under": mc_result["p_under"],
                    "mean_total": mc_result["mean_total"],
                    "std_total": mc_result["std_total"],
                    "percentiles": mc_result["percentiles"],
                    "ci_95_over": mc_result["ci_95_over"],
                    "ci_95_under": mc_result["ci_95_under"],
                },
                "ev_metrics": {
                    "ev_over": ev_metrics["ev_over"],
                    "ev_under": ev_metrics["ev_under"],
                    "edge_over": round(edge_over * 100, 1),  # Convert to percentage
                    "edge_under": round(edge_under * 100, 1),
                    "kelly_over": ev_metrics["kelly_over_fractional"],
                    "kelly_under": ev_metrics["kelly_under_fractional"],
                    "recommended_bet": ev_metrics["recommended_bet"],
                },
                "verdict": verdict,
            })

        return {
            "success": True,
            "n_games": len(results),
            "n_sims_per_game": request.n_sims,
            "games": results,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tonight/totals")
async def get_tonight_totals_analysis():
    """
    Fetch tonight's games from database and run Monte Carlo analysis.

    This is the main endpoint for the totals analysis page.
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            # Get current season
            season_row = await conn.fetchrow("""
                SELECT season_id FROM seasons WHERE is_current = true LIMIT 1
            """)
            current_season = season_row["season_id"] if season_row else "2025-26"

            # Get team stats (PPG, OppPPG, and StdDev for variance)
            team_stats = await conn.fetch("""
                WITH team_avgs AS (
                    SELECT
                        t.team_id,
                        t.abbreviation,
                        t.full_name,
                        COUNT(DISTINCT tgs.game_id) as games,
                        AVG(tgs.points) as ppg,
                        STDDEV(tgs.points) as points_std,
                        AVG(tgs.pace) as pace
                    FROM team_game_stats tgs
                    JOIN teams t ON tgs.team_id = t.team_id
                    JOIN games g ON tgs.game_id = g.game_id
                    WHERE g.season = $1
                    GROUP BY t.team_id, t.abbreviation, t.full_name
                ),
                opp_avgs AS (
                    SELECT
                        t.team_id,
                        AVG(opp.points) as opp_ppg,
                        STDDEV(opp.points) as opp_points_std
                    FROM team_game_stats tgs
                    JOIN games g ON tgs.game_id = g.game_id
                    JOIN teams t ON tgs.team_id = t.team_id
                    JOIN team_game_stats opp ON opp.game_id = tgs.game_id AND opp.team_id != tgs.team_id
                    WHERE g.season = $1
                    GROUP BY t.team_id
                )
                SELECT
                    ta.team_id,
                    ta.abbreviation,
                    ta.full_name,
                    ta.games,
                    ta.ppg,
                    ta.points_std,
                    ta.pace,
                    oa.opp_ppg,
                    oa.opp_points_std
                FROM team_avgs ta
                JOIN opp_avgs oa ON ta.team_id = oa.team_id
            """, current_season)

            # Create team stats lookup
            stats_lookup = {}
            for team in team_stats:
                stats_lookup[team["team_id"]] = {
                    "abbreviation": team["abbreviation"],
                    "full_name": team["full_name"],
                    "games": team["games"],
                    "ppg": float(team["ppg"]) if team["ppg"] else 110.0,
                    "points_std": float(team["points_std"]) if team["points_std"] else 10.0,
                    "opp_ppg": float(team["opp_ppg"]) if team["opp_ppg"] else 110.0,
                    "opp_points_std": float(team["opp_points_std"]) if team["opp_points_std"] else 10.0,
                    "pace": float(team["pace"]) if team["pace"] else 100.0,
                }

            # Get tonight's games with betting lines
            games = await conn.fetch("""
                SELECT DISTINCT ON (g.game_id)
                    g.game_id,
                    g.game_date,
                    g.home_team_id,
                    g.away_team_id,
                    ht.abbreviation as home_abbr,
                    ht.full_name as home_team,
                    at.abbreviation as away_abbr,
                    at.full_name as away_team,
                    bl.total as line,
                    bl.over_odds,
                    bl.under_odds,
                    bl.bookmaker
                FROM games g
                JOIN teams ht ON g.home_team_id = ht.team_id
                JOIN teams at ON g.away_team_id = at.team_id
                LEFT JOIN betting_lines bl ON bl.game_id = g.game_id AND bl.total IS NOT NULL
                WHERE g.game_date = CURRENT_DATE
                ORDER BY g.game_id, bl.recorded_at DESC
            """)

            if not games:
                return {
                    "success": True,
                    "message": "No games scheduled for today",
                    "games": [],
                }

            # Run Monte Carlo for each game
            results = []
            for game in games:
                home_stats = stats_lookup.get(game["home_team_id"])
                away_stats = stats_lookup.get(game["away_team_id"])

                if not home_stats or not away_stats:
                    continue

                # Calculate projections using pace-adjusted method
                home_projection = (home_stats["ppg"] + away_stats["opp_ppg"]) / 2
                away_projection = (away_stats["ppg"] + home_stats["opp_ppg"]) / 2
                total_projection = home_projection + away_projection

                # Use team variance (std dev) for Monte Carlo
                home_std = max(home_stats["points_std"], 8.0)  # Floor at 8
                away_std = max(away_stats["points_std"], 8.0)

                total_line = float(game["line"]) if game["line"] else None
                # Convert American odds to decimal (e.g., -110 -> 1.91)
                over_odds_american = float(game["over_odds"]) if game["over_odds"] else -110
                under_odds_american = float(game["under_odds"]) if game["under_odds"] else -110
                over_odds = american_to_decimal(over_odds_american)
                under_odds = american_to_decimal(under_odds_american)

                game_result = {
                    "game_id": game["game_id"],
                    "game_date": str(game["game_date"]),
                    "home_team_id": game["home_team_id"],
                    "home_abbr": game["home_abbr"],
                    "home_team": game["home_team"],
                    "away_team_id": game["away_team_id"],
                    "away_abbr": game["away_abbr"],
                    "away_team": game["away_team"],
                    "home_ppg": round(home_stats["ppg"], 1),
                    "home_opp_ppg": round(home_stats["opp_ppg"], 1),
                    "home_std": round(home_std, 1),
                    "home_games": home_stats["games"],
                    "away_ppg": round(away_stats["ppg"], 1),
                    "away_opp_ppg": round(away_stats["opp_ppg"], 1),
                    "away_std": round(away_std, 1),
                    "away_games": away_stats["games"],
                    "avg_pace": round((home_stats["pace"] + away_stats["pace"]) / 2, 1),
                    "projected": round(total_projection, 1),
                    "line": total_line,
                    "over_odds": over_odds,
                    "under_odds": under_odds,
                    "bookmaker": game["bookmaker"],
                }

                # Run Monte Carlo if we have a betting line
                if total_line:
                    mc_result = monte_carlo_totals_simulation(
                        t1_projection=home_projection,
                        t2_projection=away_projection,
                        t1_std_dev=home_std,
                        t2_std_dev=away_std,
                        total_line=total_line,
                        n_sims=10000,
                    )

                    ev_metrics = calculate_ev_metrics(
                        p_over=mc_result["p_over"],
                        p_under=mc_result["p_under"],
                        over_odds=over_odds,
                        under_odds=under_odds,
                    )

                    # Determine verdict from Monte Carlo probabilities
                    edge_over = ev_metrics["edge_over"]
                    edge_under = ev_metrics["edge_under"]

                    if edge_under > 0.08:
                        verdict = "STRONG_UNDER"
                    elif edge_under > 0.03:
                        verdict = "LEAN_UNDER"
                    elif edge_over > 0.08:
                        verdict = "STRONG_OVER"
                    elif edge_over > 0.03:
                        verdict = "LEAN_OVER"
                    else:
                        verdict = "NEUTRAL"

                    game_result.update({
                        "monte_carlo": {
                            "p_over": mc_result["p_over"],
                            "p_under": mc_result["p_under"],
                            "mean_total": mc_result["mean_total"],
                            "median_total": mc_result["median_total"],
                            "std_total": mc_result["std_total"],
                            "percentiles": mc_result["percentiles"],
                            "ci_95_over": mc_result["ci_95_over"],
                            "ci_95_under": mc_result["ci_95_under"],
                            "ot_games_pct": mc_result["ot_games_pct"],
                        },
                        "ev_metrics": {
                            "ev_over": round(ev_metrics["ev_over"] * 100, 2),  # As percentage
                            "ev_under": round(ev_metrics["ev_under"] * 100, 2),
                            "edge_over": round(edge_over * 100, 1),
                            "edge_under": round(edge_under * 100, 1),
                            "kelly_over": round(ev_metrics["kelly_over_fractional"] * 100, 2),
                            "kelly_under": round(ev_metrics["kelly_under_fractional"] * 100, 2),
                            "recommended_bet": ev_metrics["recommended_bet"],
                        },
                        "verdict": verdict,
                        "edge": round((mc_result["mean_total"] - total_line), 1),
                    })
                else:
                    # No line available - use simple projection
                    simple_edge = total_projection - 220  # Approximate average NBA total
                    game_result.update({
                        "monte_carlo": None,
                        "ev_metrics": None,
                        "verdict": "NO_LINE",
                        "edge": None,
                    })

                results.append(game_result)

            # Sort by absolute edge
            results.sort(key=lambda x: abs(x.get("edge") or 0), reverse=True)

            return {
                "success": True,
                "n_games": len(results),
                "n_simulations": 10000,
                "games": results,
                "methodology": {
                    "projection": "(Home PPG + Away OppPPG) / 2 + (Away PPG + Home OppPPG) / 2",
                    "simulation": "Correlated bivariate normal with 10K iterations",
                    "overtime": "6% probability, +12 points average",
                    "correlation": "0.5 score correlation between teams",
                },
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
