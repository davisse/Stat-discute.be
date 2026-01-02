"""DebateRoom node - Adversarial Bull vs Bear debate"""
from src.models.state import AgentState


class BullAgent:
    """
    The Bull Agent makes the strongest case FOR the bet.

    Arguments based on:
    - Positive edge indicators
    - Recent team form
    - Home court advantage
    - Historical ATS performance
    - Four Factors advantages
    """

    def generate_arguments(self, state: AgentState) -> list[dict]:
        """Generate pro-bet arguments from available data"""
        arguments = []

        game_data = state.get("game_data") or {}
        quant_result = state.get("quant_result") or {}

        team1 = game_data.get("team1", {})
        team1_stats = team1.get("stats_l10", {})
        team1_name = team1.get("abbreviation", "Selection")

        edge = quant_result.get("edge", 0)
        cover_prob = quant_result.get("cover_probability", 0.5)
        projected_margin = quant_result.get("projected_margin")
        kelly = quant_result.get("kelly_fraction", 0)

        # Argument 1: Positive Edge
        if edge > 0:
            arguments.append({
                "type": "edge",
                "strength": min(edge * 10, 1.0),  # Scale edge to 0-1 strength
                "text": f"Calculated edge of {edge*100:.1f}% exceeds the 5% vig, indicating mathematical value.",
                "evidence": f"Edge = {edge*100:.1f}%, Implied break-even ~52.4%"
            })

        # Argument 2: Cover Probability
        if cover_prob > 0.55:
            arguments.append({
                "type": "probability",
                "strength": (cover_prob - 0.5) * 2,  # Scale 0.5-1.0 to 0-1
                "text": f"Model projects {cover_prob*100:.0f}% probability of covering the spread.",
                "evidence": f"Cover probability derived from L10 margin differential"
            })

        # Argument 3: Home Court Advantage
        is_home = team1.get("is_home", False)
        if is_home:
            arguments.append({
                "type": "situational",
                "strength": 0.6,
                "text": f"{team1_name} plays at home with ~3 point historical advantage.",
                "evidence": "NBA home court advantage averages 2.5-3.5 points"
            })

        # Argument 4: Recent Form
        avg_margin = team1_stats.get("avg_margin", 0)
        if avg_margin and float(avg_margin) > 3:
            arguments.append({
                "type": "form",
                "strength": min(float(avg_margin) / 10, 1.0),
                "text": f"{team1_name} averaging +{float(avg_margin):.1f} margin over last 10 games.",
                "evidence": f"L10 average margin: {float(avg_margin):.1f} points"
            })

        # Argument 5: Kelly Sizing
        if kelly > 0.01:
            arguments.append({
                "type": "sizing",
                "strength": min(kelly * 10, 1.0),
                "text": f"Kelly criterion suggests {kelly*100:.1f}% bankroll allocation.",
                "evidence": f"Quarter-Kelly sizing indicates positive expected value"
            })

        # Argument 6: Projected Margin vs Line
        line = game_data.get("line")
        if projected_margin is not None and line is not None:
            cover_margin = projected_margin - float(line)
            if cover_margin > 0:
                arguments.append({
                    "type": "projection",
                    "strength": min(cover_margin / 5, 1.0),
                    "text": f"Projected margin ({projected_margin:+.1f}) exceeds line ({line:+.1f}) by {cover_margin:.1f} points.",
                    "evidence": f"Projection based on L10 performance differential"
                })

        # Argument 7: Four Factors Advantage
        four_factors = quant_result.get("four_factors", {})
        net_diff = four_factors.get("edge_breakdown", {}).get("net_rating_diff", 0)
        if net_diff and net_diff > 3:
            arguments.append({
                "type": "efficiency",
                "strength": min(net_diff / 10, 1.0),
                "text": f"Net rating differential of +{net_diff:.1f} points per 100 possessions.",
                "evidence": f"Based on L10 offensive and defensive efficiency"
            })

        # Argument 8: Narrative Factors (Phase 6)
        narrative_adj = state.get("narrative_adjustment", {})
        net_narrative = narrative_adj.get("net_adjustment", 0)
        narrative_factors = narrative_adj.get("factors", [])

        if net_narrative > 0:
            arguments.append({
                "type": "narrative",
                "strength": min(abs(net_narrative) / 5, 0.9),
                "text": f"Narrative factors favor selection by {net_narrative:+.1f} points.",
                "evidence": "; ".join(narrative_factors[:2]) if narrative_factors else "Schedule/rest advantages"
            })

        # Argument 9: Rest Advantage
        news_data = state.get("news_data", [])
        rest_items = [n for n in news_data if n.get("category") == "rest"]
        for item in rest_items[:1]:  # Only strongest
            if team1_name in item.get("headline", ""):
                arguments.append({
                    "type": "rest",
                    "strength": 0.7,
                    "text": f"{team1_name} has significant rest advantage.",
                    "evidence": item.get("headline", "Rest advantage detected")
                })

        # Argument 10: Opponent Fatigue
        fatigue_items = [n for n in news_data if n.get("category") == "fatigue"]
        for item in fatigue_items[:1]:
            team2_name = game_data.get("team2", {}).get("abbreviation", "")
            if team2_name and team2_name in item.get("headline", ""):
                arguments.append({
                    "type": "opponent_fatigue",
                    "strength": 0.8,
                    "text": f"Opponent {team2_name} on back-to-back, expect fatigue impact.",
                    "evidence": "B2B games historically worth ~3 points against spread"
                })

        # ============ TOTALS-SPECIFIC ARGUMENTS ============
        bet_type = game_data.get("bet_type", "spread")
        if bet_type == "total":
            direction = game_data.get("direction", "over")
            total_line = game_data.get("total_line")
            projected_total = quant_result.get("projected_total")

            # Argument T1: Projected Total vs Line
            if projected_total is not None and total_line is not None:
                margin = projected_total - float(total_line)
                if direction == "under":
                    margin = -margin

                if margin > 0:
                    arguments.append({
                        "type": "totals_projection",
                        "strength": min(abs(margin) / 10, 1.0),
                        "text": f"Projected total ({projected_total:.1f}) {'exceeds' if direction == 'over' else 'is below'} line ({total_line}) by {abs(margin):.1f} points.",
                        "evidence": f"Based on matchup analysis of offensive/defensive efficiency"
                    })

            # Argument T2: High/Low Scoring Teams
            t1_ppg = team1_stats.get("ppg", 0)
            t2_ppg = game_data.get("team2", {}).get("stats_l10", {}).get("ppg", 0)
            if t1_ppg and t2_ppg:
                avg_combined = (float(t1_ppg) + float(t2_ppg))
                if direction == "over" and avg_combined > 230:
                    arguments.append({
                        "type": "scoring_trend",
                        "strength": min((avg_combined - 220) / 20, 0.9),
                        "text": f"Both teams are high-scoring: combined L10 average of {avg_combined:.1f} points.",
                        "evidence": f"{team1_name}: {float(t1_ppg):.1f} PPG, Opponent: {float(t2_ppg):.1f} PPG"
                    })
                elif direction == "under" and avg_combined < 220:
                    arguments.append({
                        "type": "scoring_trend",
                        "strength": min((220 - avg_combined) / 20, 0.9),
                        "text": f"Both teams are low-scoring: combined L10 average of {avg_combined:.1f} points.",
                        "evidence": f"{team1_name}: {float(t1_ppg):.1f} PPG, Opponent: {float(t2_ppg):.1f} PPG"
                    })

            # Argument T3: Pace Factor
            pace_adj = quant_result.get("pace_adjustment", 0)
            if direction == "over" and pace_adj > 1:
                arguments.append({
                    "type": "pace",
                    "strength": min(pace_adj / 3, 0.8),
                    "text": f"Pace adjustment adds +{pace_adj:.1f} points to projection.",
                    "evidence": "Both teams play above league-average pace"
                })
            elif direction == "under" and pace_adj < -1:
                arguments.append({
                    "type": "pace",
                    "strength": min(abs(pace_adj) / 3, 0.8),
                    "text": f"Pace adjustment removes {abs(pace_adj):.1f} points from projection.",
                    "evidence": "Both teams play below league-average pace"
                })

            # Argument T4: Defensive Matchup
            t1_opp_ppg = team1_stats.get("opp_ppg", 0)
            t2_opp_ppg = game_data.get("team2", {}).get("stats_l10", {}).get("opp_ppg", 0)
            if t1_opp_ppg and t2_opp_ppg:
                avg_def = (float(t1_opp_ppg) + float(t2_opp_ppg)) / 2
                if direction == "over" and avg_def > 115:
                    arguments.append({
                        "type": "defense",
                        "strength": 0.7,
                        "text": f"Weak defensive matchup: teams allowing avg {avg_def:.1f} PPG.",
                        "evidence": "Poor defenses correlate with higher-scoring games"
                    })
                elif direction == "under" and avg_def < 108:
                    arguments.append({
                        "type": "defense",
                        "strength": 0.7,
                        "text": f"Strong defensive matchup: teams allowing only avg {avg_def:.1f} PPG.",
                        "evidence": "Strong defenses correlate with lower-scoring games"
                    })

        # ============ PLAYER PROP-SPECIFIC ARGUMENTS ============
        if bet_type == "player_prop":
            player_data = game_data.get("player", {})
            player_name = player_data.get("full_name", "Player")
            stat_type = game_data.get("stat_type", "points")
            direction = game_data.get("direction", "over")
            prop_line = game_data.get("line")

            # Get player averages
            season_avg = player_data.get("season_averages", {})
            l5_avg = player_data.get("last_5_averages", {})
            l10_avg = player_data.get("recent_games_avg", {})

            # Argument P1: Projection vs Line
            projection = quant_result.get("projection")
            if projection is not None and prop_line is not None:
                margin = projection - float(prop_line)
                if direction == "under":
                    margin = -margin

                if margin > 0:
                    arguments.append({
                        "type": "prop_projection",
                        "strength": min(abs(margin) / 5, 1.0),
                        "text": f"Projection ({projection:.1f}) {'exceeds' if direction == 'over' else 'is below'} line ({prop_line}) by {abs(margin):.1f}.",
                        "evidence": f"Based on weighted L5/L10/Season averages with opponent adjustment"
                    })

            # Argument P2: Hot Streak (L5 > Season)
            stat_key = stat_type if stat_type in season_avg else "points"
            l5_val = l5_avg.get(stat_key, 0)
            season_val = season_avg.get(stat_key, 0)

            if l5_val and season_val:
                l5_val = float(l5_val)
                season_val = float(season_val)
                if direction == "over" and l5_val > season_val * 1.1:
                    arguments.append({
                        "type": "hot_streak",
                        "strength": min((l5_val - season_val) / season_val * 2, 0.9),
                        "text": f"{player_name} is hot: L5 avg ({l5_val:.1f}) exceeds season avg ({season_val:.1f}).",
                        "evidence": f"Recent form suggests {stat_type} production trending up"
                    })
                elif direction == "under" and l5_val < season_val * 0.9:
                    arguments.append({
                        "type": "cold_streak",
                        "strength": min((season_val - l5_val) / season_val * 2, 0.9),
                        "text": f"{player_name} is cold: L5 avg ({l5_val:.1f}) below season avg ({season_val:.1f}).",
                        "evidence": f"Recent slump suggests {stat_type} production trending down"
                    })

            # Argument P3: Favorable Defensive Matchup
            opp_defense = game_data.get("opponent_defense", {})
            def_factor = opp_defense.get("factor", 1.0)
            if direction == "over" and def_factor > 1.05:
                arguments.append({
                    "type": "matchup_favorable",
                    "strength": min((def_factor - 1.0) * 5, 0.85),
                    "text": f"Favorable matchup: opponent allows {((def_factor - 1) * 100):.0f}% more {stat_type} than average.",
                    "evidence": "Opponent defensive weakness creates scoring opportunity"
                })
            elif direction == "under" and def_factor < 0.95:
                arguments.append({
                    "type": "matchup_favorable",
                    "strength": min((1.0 - def_factor) * 5, 0.85),
                    "text": f"Tough matchup: opponent allows {((1 - def_factor) * 100):.0f}% fewer {stat_type} than average.",
                    "evidence": "Elite defender limits production in this matchup"
                })

            # Argument P4: Minutes Stability
            minutes_data = player_data.get("minutes_data", {})
            avg_mins = minutes_data.get("avg_minutes", 0)
            if avg_mins and float(avg_mins) >= 32:
                arguments.append({
                    "type": "minutes_secure",
                    "strength": 0.65,
                    "text": f"{player_name} averaging {float(avg_mins):.1f} minutes - secure role in rotation.",
                    "evidence": "High minutes = more opportunity for production"
                })

            # Argument P5: Monte Carlo Confidence
            mc_result = quant_result.get("mc_result", {})
            p_over = mc_result.get("p_over", 0.5)
            p_under = mc_result.get("p_under", 0.5)
            prob = p_over if direction == "over" else p_under

            if prob > 0.55:
                arguments.append({
                    "type": "simulation",
                    "strength": (prob - 0.5) * 2,
                    "text": f"Monte Carlo simulation: {prob * 100:.0f}% probability of hitting {direction.upper()}.",
                    "evidence": f"Based on {mc_result.get('n_sims', 10000)} simulations with variance modeling"
                })

            # Argument P6: Home Game Boost
            is_home = game_data.get("is_home", False)
            if is_home and direction == "over":
                arguments.append({
                    "type": "home_boost",
                    "strength": 0.55,
                    "text": f"{player_name} plays at home - slight statistical boost expected.",
                    "evidence": "Home players average ~2-3% better statistical production"
                })

        # Sort by strength and take top 5
        arguments.sort(key=lambda x: x["strength"], reverse=True)
        return arguments[:5]


class BearAgent:
    """
    The Bear Agent makes the strongest case AGAINST the bet.

    Arguments based on:
    - Small sample size concerns
    - Regression to mean
    - Market efficiency
    - Risk factors
    - Counter-indicators
    """

    def generate_arguments(self, state: AgentState, bull_arguments: list[dict]) -> list[dict]:
        """Generate anti-bet arguments, directly countering Bull's points"""
        arguments = []

        game_data = state.get("game_data") or {}
        quant_result = state.get("quant_result") or {}
        errors = state.get("errors", [])
        missing_info = state.get("missing_info", [])

        team2 = game_data.get("team2", {})
        team2_stats = team2.get("stats_l10", {})
        team2_name = team2.get("abbreviation", "Opponent")

        edge = quant_result.get("edge", 0)
        cover_prob = quant_result.get("cover_probability", 0.5)

        # Counter-Argument 1: Sample Size Warning
        arguments.append({
            "type": "methodology",
            "strength": 0.7,
            "text": "L10 sample size is insufficient for reliable projections; variance dominates.",
            "evidence": "10 games represents ~12% of NBA season, high standard error"
        })

        # Counter-Argument 2: Regression to Mean
        arguments.append({
            "type": "statistical",
            "strength": 0.6,
            "text": "Recent performance likely inflated; regression to season mean expected.",
            "evidence": "Hot/cold streaks are poor predictors of future performance"
        })

        # Counter-Argument 3: Market Efficiency
        if edge < 0.05:
            arguments.append({
                "type": "market",
                "strength": 0.8,
                "text": f"Edge of {edge*100:.1f}% is within market noise; sharps have likely priced this correctly.",
                "evidence": "NBA spreads are among the most efficient betting markets"
            })

        # Counter-Argument 4: Opponent Strength
        opp_margin = team2_stats.get("avg_margin", 0)
        if opp_margin and float(opp_margin) > 0:
            arguments.append({
                "type": "opponent",
                "strength": min(float(opp_margin) / 10, 0.8),
                "text": f"{team2_name} has been competitive with +{float(opp_margin):.1f} average margin.",
                "evidence": f"Opponent L10 margin: {float(opp_margin):.1f}"
            })

        # Counter-Argument 5: Data Quality Issues
        if errors or missing_info:
            arguments.append({
                "type": "data_quality",
                "strength": 0.9,
                "text": f"Analysis has {len(errors)} errors and {len(missing_info)} missing data points.",
                "evidence": f"Issues: {', '.join(errors[:2]) if errors else 'Missing: ' + ', '.join(missing_info[:2])}"
            })

        # Counter-Argument 6: Low Cover Probability
        if cover_prob < 0.6:
            arguments.append({
                "type": "probability",
                "strength": 0.7,
                "text": f"Cover probability of {cover_prob*100:.0f}% is barely above coin flip.",
                "evidence": "Need >60% model confidence for actionable edge"
            })

        # Counter-Argument 7: No News/Injury Data OR Negative Narrative
        news_data = state.get("news_data", [])
        narrative_adj = state.get("narrative_adjustment", {})
        net_narrative = narrative_adj.get("net_adjustment", 0)

        if not news_data:
            arguments.append({
                "type": "information",
                "strength": 0.5,
                "text": "No injury or news data factored in; hidden risks possible.",
                "evidence": "Late scratches can move lines 2-4 points"
            })

        # Counter-Argument 7b: Selection on B2B
        team1_name = game_data.get("team1", {}).get("abbreviation", "Selection")
        fatigue_items = [n for n in news_data if n.get("category") == "fatigue"]
        for item in fatigue_items[:1]:
            if team1_name in item.get("headline", ""):
                arguments.append({
                    "type": "fatigue",
                    "strength": 0.85,
                    "text": f"{team1_name} on back-to-back; fatigue typically costs 3+ points.",
                    "evidence": "B2B teams cover at only ~45% rate historically"
                })

        # Counter-Argument 7c: Opponent Has Rest Advantage
        rest_items = [n for n in news_data if n.get("category") == "rest"]
        for item in rest_items[:1]:
            if team2_name in item.get("headline", ""):
                arguments.append({
                    "type": "opponent_rest",
                    "strength": 0.75,
                    "text": f"{team2_name} well-rested with significant days off advantage.",
                    "evidence": item.get("headline", "Rest advantage for opponent")
                })

        # Counter-Argument 7d: Negative Narrative Overall
        if net_narrative < -1:
            narrative_factors = narrative_adj.get("factors", [])
            arguments.append({
                "type": "narrative_negative",
                "strength": min(abs(net_narrative) / 5, 0.9),
                "text": f"Narrative factors against selection by {abs(net_narrative):.1f} points.",
                "evidence": "; ".join(narrative_factors[:2]) if narrative_factors else "Schedule/situation disadvantages"
            })

        # Counter-Argument 7e: Injury Reports Found
        injury_items = [n for n in news_data if n.get("category") == "injury" and n.get("sentiment") == "NEGATIVE"]
        if injury_items:
            arguments.append({
                "type": "injuries",
                "strength": 0.8,
                "text": f"Injury concerns detected: {len(injury_items)} negative injury report(s) found.",
                "evidence": injury_items[0].get("headline", "Injury news")[:100]
            })

        # ============ TOTALS-SPECIFIC COUNTER-ARGUMENTS ============
        bet_type = game_data.get("bet_type", "spread")
        if bet_type == "total":
            direction = game_data.get("direction", "over")
            total_line = game_data.get("total_line")
            projected_total = quant_result.get("projected_total")

            # Counter T1: Totals Volatility
            arguments.append({
                "type": "totals_volatility",
                "strength": 0.75,
                "text": "Game totals have higher variance than spreads; 12-point standard deviation is common.",
                "evidence": "Totals markets are harder to predict due to pace and late-game dynamics"
            })

            # Counter T2: Projection Margin
            if projected_total is not None and total_line is not None:
                margin = abs(projected_total - float(total_line))
                if margin < 5:
                    arguments.append({
                        "type": "thin_margin",
                        "strength": 0.8,
                        "text": f"Projection margin of only {margin:.1f} points is within normal variance.",
                        "evidence": "Need 5+ point margin for meaningful totals edge"
                    })

            # Counter T3: Opposing Pace/Scoring Context
            team1_stats = game_data.get("team1", {}).get("stats_l10", {})
            team2_stats = game_data.get("team2", {}).get("stats_l10", {})
            t1_ppg = team1_stats.get("ppg", 0)
            t2_ppg = team2_stats.get("ppg", 0)

            if t1_ppg and t2_ppg:
                avg_combined = float(t1_ppg) + float(t2_ppg)
                if direction == "over" and avg_combined < 225:
                    arguments.append({
                        "type": "scoring_counter",
                        "strength": 0.7,
                        "text": f"Combined L10 scoring ({avg_combined:.1f}) doesn't strongly support OVER.",
                        "evidence": "Teams have been scoring at or below average pace"
                    })
                elif direction == "under" and avg_combined > 225:
                    arguments.append({
                        "type": "scoring_counter",
                        "strength": 0.7,
                        "text": f"Combined L10 scoring ({avg_combined:.1f}) doesn't strongly support UNDER.",
                        "evidence": "Teams have been scoring above average"
                    })

            # Counter T4: Garbage Time Risk
            if direction == "over":
                arguments.append({
                    "type": "garbage_time",
                    "strength": 0.55,
                    "text": "Blowout games often see slower pace in 4th quarter, reducing total scoring.",
                    "evidence": "Garbage time can cost 5-10 points vs. competitive projections"
                })
            else:
                arguments.append({
                    "type": "close_game",
                    "strength": 0.55,
                    "text": "Close games often see intentional fouling late, inflating totals.",
                    "evidence": "Foul-heavy endings can add 5-10 points to game totals"
                })

            # Counter T5: Small Sample PPG
            arguments.append({
                "type": "totals_sample",
                "strength": 0.65,
                "text": "Team scoring averages are highly volatile; L10 may not reflect true pace.",
                "evidence": "PPG can swing 10+ points based on opponent schedule"
            })

        # ============ PLAYER PROP-SPECIFIC COUNTER-ARGUMENTS ============
        if bet_type == "player_prop":
            player_data = game_data.get("player", {})
            player_name = player_data.get("full_name", "Player")
            stat_type = game_data.get("stat_type", "points")
            direction = game_data.get("direction", "over")
            prop_line = game_data.get("line")

            # Counter P1: Minutes Variance Risk
            arguments.append({
                "type": "minutes_variance",
                "strength": 0.75,
                "text": f"Minutes variance is the #1 risk: DNP, injury, blowout benching all derail props.",
                "evidence": "~10% of games see unexpected minutes reduction (injury, foul trouble, blowout)"
            })

            # Counter P2: Regression to Mean
            season_avg = player_data.get("season_averages", {})
            l5_avg = player_data.get("last_5_averages", {})
            stat_key = stat_type if stat_type in season_avg else "points"
            l5_val = l5_avg.get(stat_key, 0)
            season_val = season_avg.get(stat_key, 0)

            if l5_val and season_val:
                l5_val = float(l5_val)
                season_val = float(season_val)
                if direction == "over" and l5_val > season_val * 1.05:
                    arguments.append({
                        "type": "regression",
                        "strength": 0.7,
                        "text": f"{player_name}'s recent L5 ({l5_val:.1f}) is above season average ({season_val:.1f}) - regression likely.",
                        "evidence": "Hot streaks are poor predictors; mean reversion is strong in player stats"
                    })
                elif direction == "under" and l5_val < season_val * 0.95:
                    arguments.append({
                        "type": "regression",
                        "strength": 0.7,
                        "text": f"{player_name}'s recent L5 ({l5_val:.1f}) is below season average ({season_val:.1f}) - bounce back possible.",
                        "evidence": "Cold streaks often end suddenly; betting on continued slump is risky"
                    })

            # Counter P3: Tough/Favorable Matchup (opposite of direction)
            opp_defense = game_data.get("opponent_defense", {})
            def_factor = opp_defense.get("factor", 1.0)
            if direction == "over" and def_factor < 0.97:
                arguments.append({
                    "type": "matchup_tough",
                    "strength": min((1.0 - def_factor) * 5, 0.8),
                    "text": f"Tough matchup: opponent allows {((1 - def_factor) * 100):.0f}% fewer {stat_type} than average.",
                    "evidence": "Elite defense limits production opportunities"
                })
            elif direction == "under" and def_factor > 1.03:
                arguments.append({
                    "type": "matchup_weak",
                    "strength": min((def_factor - 1.0) * 5, 0.8),
                    "text": f"Weak defense: opponent allows {((def_factor - 1) * 100):.0f}% more {stat_type} - upside exists.",
                    "evidence": "Poor defense creates scoring opportunities that may exceed projection"
                })

            # Counter P4: Small Sample Size for Player Stats
            arguments.append({
                "type": "prop_sample_size",
                "strength": 0.65,
                "text": "Player prop projections rely on L5/L10 data - high variance in small samples.",
                "evidence": "Individual player stats are MORE volatile than team stats; need 20+ games for reliable patterns"
            })

            # Counter P5: Line Already Efficient
            if prop_line is not None:
                arguments.append({
                    "type": "market_efficiency",
                    "strength": 0.6,
                    "text": f"Prop markets are sharp; {prop_line} line likely accounts for most factors.",
                    "evidence": "Vegas limits props quickly on sharp action - inefficiencies are rare"
                })

            # Counter P6: Game Script Risk
            if direction == "over":
                arguments.append({
                    "type": "game_script",
                    "strength": 0.55,
                    "text": "Blowout risk: if team gets big lead or trails badly, star minutes get cut.",
                    "evidence": "~15% of games are blowouts where starters play <28 minutes"
                })
            else:
                arguments.append({
                    "type": "game_script",
                    "strength": 0.55,
                    "text": "Close game risk: overtime or extended minutes in close games inflate stats.",
                    "evidence": "~8% of games go to OT or have star playing 40+ minutes"
                })

            # Counter P7: Back-to-Back Impact on Props
            news_data = state.get("news_data", [])
            fatigue_items = [n for n in news_data if n.get("category") == "fatigue"]
            team1_name = game_data.get("team1", {}).get("abbreviation", "")
            player_team = player_data.get("team_abbreviation", team1_name)

            for item in fatigue_items[:1]:
                if player_team and player_team in item.get("headline", ""):
                    arguments.append({
                        "type": "prop_b2b",
                        "strength": 0.8,
                        "text": f"{player_name}'s team on B2B - expect ~5% reduction in statistical output.",
                        "evidence": "Back-to-back games historically reduce individual stats 3-7%"
                    })
                    break

        # Counter-Argument 8: Against Bull's Strongest Point
        if bull_arguments:
            strongest_bull = bull_arguments[0]
            if strongest_bull["type"] == "edge":
                arguments.append({
                    "type": "counter",
                    "strength": 0.75,
                    "text": "Calculated edge relies on L10 data which may not reflect true team strength.",
                    "evidence": "Opponent schedule strength not factored"
                })
            elif strongest_bull["type"] == "form":
                arguments.append({
                    "type": "counter",
                    "strength": 0.75,
                    "text": "Hot streak is unsustainable; teams historically regress after strong runs.",
                    "evidence": "Betting against hot teams is a documented +EV strategy"
                })

        # Sort by strength and take top 5
        arguments.sort(key=lambda x: x["strength"], reverse=True)
        return arguments[:5]


class DebateRoomNode:
    """
    The Debate Room implements adversarial reasoning.

    Process:
    1. Bull generates pro-bet arguments from data
    2. Bear generates counter-arguments, responding to Bull
    3. Compute debate score (Bull strength - Bear strength)
    4. Record full debate transcript for Judge

    This eliminates confirmation bias by forcing counter-arguments.
    """

    def __init__(self):
        self.bull = BullAgent()
        self.bear = BearAgent()

    async def __call__(self, state: AgentState) -> AgentState:
        """Execute adversarial debate"""
        errors = list(state.get("errors", []))

        # Generate arguments
        bull_arguments = self.bull.generate_arguments(state)
        bear_arguments = self.bear.generate_arguments(state, bull_arguments)

        # Calculate debate scores
        bull_score = sum(arg["strength"] for arg in bull_arguments) / max(len(bull_arguments), 1)
        bear_score = sum(arg["strength"] for arg in bear_arguments) / max(len(bear_arguments), 1)
        debate_edge = bull_score - bear_score

        # Format transcript
        debate_transcript = self._format_transcript(
            bull_arguments, bear_arguments,
            bull_score, bear_score, debate_edge
        )

        # Determine winner and generate summary
        winner = "BULL" if debate_edge > 0.1 else ("BEAR" if debate_edge < -0.1 else "NEUTRAL")
        summary = self._generate_summary(bull_arguments, bear_arguments, winner)

        # Store structured debate result
        debate_result = {
            "bull_arguments": bull_arguments,
            "bear_arguments": bear_arguments,
            "bull_score": round(bull_score, 3),
            "bear_score": round(bear_score, 3),
            "debate_edge": round(debate_edge, 3),
            "winner": winner,
            "summary": summary,
        }

        return {
            **state,
            "current_node": "debate_room",
            "debate_transcript": debate_transcript,
            "debate_result": debate_result,
            "errors": errors,
        }

    def _generate_summary(
        self,
        bull_args: list[dict],
        bear_args: list[dict],
        winner: str
    ) -> dict:
        """Generate plain language summary of debate outcome"""

        # Get top Bull arguments (strength >= 0.6)
        strong_bull = [a for a in bull_args if a["strength"] >= 0.6]
        # Get top Bear arguments (strength >= 0.7)
        strong_bear = [a for a in bear_args if a["strength"] >= 0.7]

        # Build Bull summary
        bull_points = []
        for arg in strong_bull[:3]:
            if arg["type"] == "edge":
                bull_points.append(f"strong mathematical edge")
            elif arg["type"] == "form":
                bull_points.append(f"dominant recent form")
            elif arg["type"] == "projection":
                bull_points.append(f"projection exceeds line")
            elif arg["type"] == "probability":
                bull_points.append(f"high cover probability")
            elif arg["type"] == "efficiency":
                bull_points.append(f"efficiency advantage")
            elif arg["type"] == "situational":
                bull_points.append(f"home court advantage")
            elif arg["type"] == "narrative":
                bull_points.append(f"favorable situation (rest/schedule)")
            elif arg["type"] == "rest":
                bull_points.append(f"rest advantage")
            elif arg["type"] == "opponent_fatigue":
                bull_points.append(f"opponent fatigue")
            # Totals-specific Bull points
            elif arg["type"] == "totals_projection":
                bull_points.append(f"projected total exceeds line")
            elif arg["type"] == "scoring_trend":
                bull_points.append(f"high-scoring matchup")
            elif arg["type"] == "pace":
                bull_points.append(f"favorable pace")
            elif arg["type"] == "defense":
                bull_points.append(f"defensive matchup advantage")
            # Player prop-specific Bull points
            elif arg["type"] == "prop_projection":
                bull_points.append(f"projection exceeds line")
            elif arg["type"] == "hot_streak":
                bull_points.append(f"recent hot streak")
            elif arg["type"] == "cold_streak":
                bull_points.append(f"recent cold streak supports under")
            elif arg["type"] == "matchup_favorable":
                bull_points.append(f"favorable defensive matchup")
            elif arg["type"] == "minutes_secure":
                bull_points.append(f"secure minutes role")
            elif arg["type"] == "simulation":
                bull_points.append(f"strong Monte Carlo probability")
            elif arg["type"] == "home_boost":
                bull_points.append(f"home game statistical boost")

        # Build Bear summary
        bear_points = []
        for arg in strong_bear[:3]:
            if arg["type"] == "methodology":
                bear_points.append(f"small sample size (L10)")
            elif arg["type"] == "statistical":
                bear_points.append(f"regression risk")
            elif arg["type"] == "market":
                bear_points.append(f"market efficiency")
            elif arg["type"] == "data_quality":
                bear_points.append(f"missing data")
            elif arg["type"] == "opponent":
                bear_points.append(f"strong opponent")
            elif arg["type"] == "probability":
                bear_points.append(f"low cover probability")
            elif arg["type"] == "fatigue":
                bear_points.append(f"selection fatigue (B2B)")
            elif arg["type"] == "opponent_rest":
                bear_points.append(f"opponent rest advantage")
            elif arg["type"] == "injuries":
                bear_points.append(f"injury concerns")
            elif arg["type"] == "narrative_negative":
                bear_points.append(f"unfavorable situation")
            # Totals-specific Bear points
            elif arg["type"] == "totals_volatility":
                bear_points.append(f"high totals variance")
            elif arg["type"] == "thin_margin":
                bear_points.append(f"thin projection margin")
            elif arg["type"] == "scoring_counter":
                bear_points.append(f"scoring trend concern")
            elif arg["type"] == "garbage_time":
                bear_points.append(f"garbage time risk")
            elif arg["type"] == "close_game":
                bear_points.append(f"close game risk")
            elif arg["type"] == "totals_sample":
                bear_points.append(f"volatile PPG averages")
            # Player prop-specific Bear points
            elif arg["type"] == "minutes_variance":
                bear_points.append(f"minutes variance risk")
            elif arg["type"] == "regression":
                bear_points.append(f"regression to mean")
            elif arg["type"] == "matchup_tough":
                bear_points.append(f"tough defensive matchup")
            elif arg["type"] == "matchup_weak":
                bear_points.append(f"weak defense upside risk")
            elif arg["type"] == "prop_sample_size":
                bear_points.append(f"small sample size")
            elif arg["type"] == "market_efficiency":
                bear_points.append(f"efficient prop market")
            elif arg["type"] == "game_script":
                bear_points.append(f"game script risk")
            elif arg["type"] == "prop_b2b":
                bear_points.append(f"back-to-back fatigue")

        # Generate verdict text
        if winner == "BULL":
            bull_text = ", ".join(bull_points) if bull_points else "positive indicators"
            bear_text = ", ".join(bear_points) if bear_points else "minor concerns"
            verdict = f"✅ BET SUPPORTED: {bull_text.capitalize()} outweigh {bear_text}"
        elif winner == "BEAR":
            bull_text = ", ".join(bull_points) if bull_points else "some positives"
            bear_text = ", ".join(bear_points) if bear_points else "significant concerns"
            verdict = f"❌ PASS RECOMMENDED: {bear_text.capitalize()} outweigh {bull_text}"
        else:
            bull_text = ", ".join(bull_points) if bull_points else "mixed signals"
            bear_text = ", ".join(bear_points) if bear_points else "valid concerns"
            verdict = f"⚖️ MIXED SIGNALS: {bull_text.capitalize()} vs {bear_text}"

        return {
            "verdict": verdict,
            "bull_strengths": bull_points,
            "bear_concerns": bear_points,
            "winner": winner,
        }

    def _format_transcript(
        self,
        bull_args: list[dict],
        bear_args: list[dict],
        bull_score: float,
        bear_score: float,
        debate_edge: float
    ) -> str:
        """Format debate for storage and review"""

        winner = "BULL" if debate_edge > 0.1 else ("BEAR" if debate_edge < -0.1 else "NEUTRAL")
        summary = self._generate_summary(bull_args, bear_args, winner)

        bull_text = "\n".join([
            f"  • [{arg['type'].upper()}] {arg['text']}\n    Evidence: {arg['evidence']}"
            for arg in bull_args
        ])

        bear_text = "\n".join([
            f"  • [{arg['type'].upper()}] {arg['text']}\n    Evidence: {arg['evidence']}"
            for arg in bear_args
        ])

        return f"""
══════════════════════════════════════════════════════════════
                    ADVERSARIAL DEBATE
══════════════════════════════════════════════════════════════

🐂 BULL CASE (Why Bet)
──────────────────────────────────────────────────────────────
{bull_text}

🐻 BEAR CASE (Why Pass)
──────────────────────────────────────────────────────────────
{bear_text}

══════════════════════════════════════════════════════════════
                      VERDICT
══════════════════════════════════════════════════════════════
{summary['verdict']}

Bull strengths: {', '.join(summary['bull_strengths']) or 'None compelling'}
Bear concerns:  {', '.join(summary['bear_concerns']) or 'None significant'}
══════════════════════════════════════════════════════════════
""".strip()


# Functional interface for LangGraph
async def debate_room_node(state: AgentState) -> AgentState:
    """DebateRoom node function for LangGraph"""
    node = DebateRoomNode()
    return await node(state)
