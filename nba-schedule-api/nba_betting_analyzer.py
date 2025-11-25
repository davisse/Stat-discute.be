"""
Module d'analyse avancée pour les paris sportifs NBA
Fonctionnalités: tendances, prédictions, analyse face-à-face

Installation requise:
pip install nba_api pandas numpy scipy scikit-learn --break-system-packages
"""

from nba_api.stats.endpoints import leaguegamefinder
from nba_api.stats.static import teams
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict

class NBABettingAnalyzer:
    """Analyseur avancé pour les paris sportifs NBA"""
    
    def __init__(self, season='2024-25'):
        self.season = season
        self.all_teams = teams.get_teams()
        self.cache = {}
    
    def get_team_games(self, team_abbr, n_games=None):
        """
        Récupérer les matchs d'une équipe
        
        Args:
            team_abbr: Abréviation de l'équipe
            n_games: Nombre de matchs à récupérer (None = tous)
        """
        cache_key = f"{team_abbr}_{self.season}"
        
        if cache_key in self.cache:
            games = self.cache[cache_key]
        else:
            team = next((t for t in self.all_teams if t['abbreviation'] == team_abbr), None)
            if not team:
                return None
            
            gamefinder = leaguegamefinder.LeagueGameFinder(
                team_id_nullable=team['id'],
                season_nullable=self.season
            )
            
            games = gamefinder.get_data_frames()[0]
            games = games.sort_values('GAME_DATE', ascending=False)
            self.cache[cache_key] = games
        
        if n_games:
            return games.head(n_games)
        return games
    
    def analyze_form(self, team_abbr, n_games=5):
        """
        Analyser la forme récente d'une équipe
        
        Returns:
            dict avec statistiques de forme
        """
        games = self.get_team_games(team_abbr, n_games)
        
        if games is None or games.empty:
            return None
        
        wins = len(games[games['WL'] == 'W'])
        losses = len(games[games['WL'] == 'L'])
        
        # Tendance des points
        pts_trend = games['PTS'].values
        pts_increasing = np.polyfit(range(len(pts_trend)), pts_trend, 1)[0] > 0
        
        return {
            'team': team_abbr,
            'last_games': n_games,
            'wins': wins,
            'losses': losses,
            'win_rate': wins / n_games,
            'avg_points': round(games['PTS'].mean(), 2),
            'avg_points_allowed': round(games['PTS'].mean() - games['PLUS_MINUS'].mean(), 2),
            'avg_plus_minus': round(games['PLUS_MINUS'].mean(), 2),
            'points_trend': 'increasing' if pts_increasing else 'decreasing',
            'avg_fg_pct': round(games['FG_PCT'].mean(), 3),
            'avg_fg3_pct': round(games['FG3_PCT'].mean(), 3),
            'last_5_results': games['WL'].head(5).tolist()
        }
    
    def home_away_split(self, team_abbr):
        """
        Analyser la performance domicile vs extérieur
        
        Returns:
            dict avec stats domicile et extérieur
        """
        games = self.get_team_games(team_abbr)
        
        if games is None or games.empty:
            return None
        
        # Identifier domicile vs extérieur
        home_games = games[~games['MATCHUP'].str.contains('@')]
        away_games = games[games['MATCHUP'].str.contains('@')]
        
        return {
            'team': team_abbr,
            'home': {
                'games': len(home_games),
                'wins': len(home_games[home_games['WL'] == 'W']),
                'win_rate': len(home_games[home_games['WL'] == 'W']) / len(home_games) if len(home_games) > 0 else 0,
                'avg_points': round(home_games['PTS'].mean(), 2) if len(home_games) > 0 else 0,
                'avg_plus_minus': round(home_games['PLUS_MINUS'].mean(), 2) if len(home_games) > 0 else 0
            },
            'away': {
                'games': len(away_games),
                'wins': len(away_games[away_games['WL'] == 'W']),
                'win_rate': len(away_games[away_games['WL'] == 'W']) / len(away_games) if len(away_games) > 0 else 0,
                'avg_points': round(away_games['PTS'].mean(), 2) if len(away_games) > 0 else 0,
                'avg_plus_minus': round(away_games['PLUS_MINUS'].mean(), 2) if len(away_games) > 0 else 0
            }
        }
    
    def head_to_head(self, team1_abbr, team2_abbr):
        """
        Analyser l'historique des confrontations entre deux équipes
        
        Returns:
            dict avec historique et tendances
        """
        games1 = self.get_team_games(team1_abbr)
        
        if games1 is None or games1.empty:
            return None
        
        # Filtrer les matchs contre team2
        h2h_games = games1[games1['MATCHUP'].str.contains(team2_abbr)]
        
        if h2h_games.empty:
            return {
                'team1': team1_abbr,
                'team2': team2_abbr,
                'games_played': 0,
                'message': 'Aucune confrontation cette saison'
            }
        
        wins = len(h2h_games[h2h_games['WL'] == 'W'])
        
        return {
            'team1': team1_abbr,
            'team2': team2_abbr,
            'games_played': len(h2h_games),
            'team1_wins': wins,
            'team2_wins': len(h2h_games) - wins,
            'avg_points_team1': round(h2h_games['PTS'].mean(), 2),
            'avg_plus_minus': round(h2h_games['PLUS_MINUS'].mean(), 2),
            'last_5_results': h2h_games['WL'].head(5).tolist()
        }
    
    def predict_over_under(self, team1_abbr, team2_abbr, is_team1_home=True):
        """
        Prédire le total de points (over/under)
        
        Args:
            team1_abbr: Première équipe
            team2_abbr: Deuxième équipe
            is_team1_home: team1 joue à domicile
            
        Returns:
            dict avec prédiction
        """
        # Récupérer les formes récentes
        form1 = self.analyze_form(team1_abbr, 10)
        form2 = self.analyze_form(team2_abbr, 10)
        
        if not form1 or not form2:
            return None
        
        # Récupérer les splits domicile/extérieur
        split1 = self.home_away_split(team1_abbr)
        split2 = self.home_away_split(team2_abbr)
        
        # Calculer la prédiction
        if is_team1_home:
            team1_predicted = split1['home']['avg_points']
            team2_predicted = split2['away']['avg_points']
        else:
            team1_predicted = split1['away']['avg_points']
            team2_predicted = split2['home']['avg_points']
        
        # Ajuster avec la forme récente
        team1_predicted = (team1_predicted + form1['avg_points']) / 2
        team2_predicted = (team2_predicted + form2['avg_points']) / 2
        
        total_predicted = team1_predicted + team2_predicted
        
        return {
            'team1': team1_abbr,
            'team2': team2_abbr,
            'team1_home': is_team1_home,
            'team1_predicted_points': round(team1_predicted, 1),
            'team2_predicted_points': round(team2_predicted, 1),
            'total_predicted': round(total_predicted, 1),
            'confidence': self._calculate_confidence(form1, form2),
            'factors': {
                'team1_form': form1['win_rate'],
                'team2_form': form2['win_rate'],
                'team1_trend': form1['points_trend'],
                'team2_trend': form2['points_trend']
            }
        }
    
    def predict_winner(self, team1_abbr, team2_abbr, is_team1_home=True):
        """
        Prédire le vainqueur d'un match
        
        Returns:
            dict avec prédiction et probabilité
        """
        # Récupérer les analyses
        form1 = self.analyze_form(team1_abbr, 10)
        form2 = self.analyze_form(team2_abbr, 10)
        split1 = self.home_away_split(team1_abbr)
        split2 = self.home_away_split(team2_abbr)
        h2h = self.head_to_head(team1_abbr, team2_abbr)
        
        # Calculer les scores de force
        if is_team1_home:
            team1_strength = (
                form1['win_rate'] * 0.4 +
                split1['home']['win_rate'] * 0.3 +
                form1['avg_plus_minus'] / 20 * 0.3
            )
            team2_strength = (
                form2['win_rate'] * 0.4 +
                split2['away']['win_rate'] * 0.3 +
                form2['avg_plus_minus'] / 20 * 0.3
            )
        else:
            team1_strength = (
                form1['win_rate'] * 0.4 +
                split1['away']['win_rate'] * 0.3 +
                form1['avg_plus_minus'] / 20 * 0.3
            )
            team2_strength = (
                form2['win_rate'] * 0.4 +
                split2['home']['win_rate'] * 0.3 +
                form2['avg_plus_minus'] / 20 * 0.3
            )
        
        # Ajuster avec avantage domicile
        if is_team1_home:
            team1_strength += 0.1
        else:
            team2_strength += 0.1
        
        # Calculer les probabilités
        total_strength = team1_strength + team2_strength
        team1_prob = team1_strength / total_strength
        team2_prob = team2_strength / total_strength
        
        winner = team1_abbr if team1_prob > team2_prob else team2_abbr
        confidence = max(team1_prob, team2_prob)
        
        return {
            'team1': team1_abbr,
            'team2': team2_abbr,
            'predicted_winner': winner,
            'team1_probability': round(team1_prob * 100, 1),
            'team2_probability': round(team2_prob * 100, 1),
            'confidence_level': self._get_confidence_level(confidence),
            'factors': {
                'team1_form': form1['win_rate'],
                'team2_form': form2['win_rate'],
                'home_advantage': is_team1_home,
                'h2h_games': h2h['games_played'] if h2h else 0
            }
        }
    
    def analyze_betting_trends(self, team_abbr, stat='PTS', n_games=20):
        """
        Analyser les tendances pour les paris (over/under sur stats)
        
        Args:
            team_abbr: Équipe
            stat: Statistique à analyser (PTS, REB, AST, etc.)
            n_games: Nombre de matchs à analyser
            
        Returns:
            dict avec tendances et recommandations
        """
        games = self.get_team_games(team_abbr, n_games)
        
        if games is None or games.empty:
            return None
        
        values = games[stat].values
        mean = np.mean(values)
        std = np.std(values)
        
        # Calculer la tendance
        trend_coef = np.polyfit(range(len(values)), values, 1)[0]
        
        # Calculer les streaks
        over_streak = 0
        under_streak = 0
        for val in values:
            if val > mean:
                over_streak += 1
                under_streak = 0
            else:
                under_streak += 1
                over_streak = 0
        
        return {
            'team': team_abbr,
            'stat': stat,
            'games_analyzed': n_games,
            'average': round(mean, 2),
            'std_dev': round(std, 2),
            'trend': 'increasing' if trend_coef > 0 else 'decreasing',
            'trend_strength': round(abs(trend_coef), 2),
            'consistency': 'high' if std < mean * 0.1 else 'medium' if std < mean * 0.2 else 'low',
            'recent_over_rate': round(sum(1 for v in values[:5] if v > mean) / 5, 2),
            'recommendation': self._get_betting_recommendation(values, mean, trend_coef)
        }
    
    def _calculate_confidence(self, form1, form2):
        """Calculer le niveau de confiance de la prédiction"""
        # Plus les équipes ont des formes similaires, moins on est confiant
        diff = abs(form1['win_rate'] - form2['win_rate'])
        
        if diff > 0.6:
            return 'high'
        elif diff > 0.3:
            return 'medium'
        else:
            return 'low'
    
    def _get_confidence_level(self, probability):
        """Convertir une probabilité en niveau de confiance"""
        if probability > 0.7:
            return 'very high'
        elif probability > 0.6:
            return 'high'
        elif probability > 0.55:
            return 'medium'
        else:
            return 'low'
    
    def _get_betting_recommendation(self, values, mean, trend):
        """Recommandation de pari basée sur les tendances"""
        recent_avg = np.mean(values[:5])
        
        if trend > 0 and recent_avg > mean:
            return 'OVER (tendance haussière)'
        elif trend < 0 and recent_avg < mean:
            return 'UNDER (tendance baissière)'
        elif recent_avg > mean * 1.1:
            return 'OVER (forme récente forte)'
        elif recent_avg < mean * 0.9:
            return 'UNDER (forme récente faible)'
        else:
            return 'NEUTRAL (pas de tendance claire)'


def example_analysis():
    """Exemples d'utilisation de l'analyseur"""
    
    analyzer = NBABettingAnalyzer(season='2024-25')
    
    print("🏀 ANALYSE AVANCÉE POUR PARIS SPORTIFS NBA")
    print("=" * 60)
    
    # 1. Analyse de forme
    print("\n📊 1. ANALYSE DE FORME (Lakers - 5 derniers matchs)")
    print("-" * 60)
    form = analyzer.analyze_form('LAL', 5)
    if form:
        print(f"Équipe: {form['team']}")
        print(f"Bilan: {form['wins']}V - {form['losses']}D (Win rate: {form['win_rate']:.1%})")
        print(f"Points moyens: {form['avg_points']}")
        print(f"+/-: {form['avg_plus_minus']}")
        print(f"Tendance points: {form['points_trend']}")
    
    # 2. Domicile vs Extérieur
    print("\n🏠 2. DOMICILE vs EXTÉRIEUR (Lakers)")
    print("-" * 60)
    split = analyzer.home_away_split('LAL')
    if split:
        print(f"À domicile: {split['home']['wins']}V - {split['home']['games']-split['home']['wins']}D")
        print(f"  Points moyens: {split['home']['avg_points']}")
        print(f"À l'extérieur: {split['away']['wins']}V - {split['away']['games']-split['away']['wins']}D")
        print(f"  Points moyens: {split['away']['avg_points']}")
    
    # 3. Face-à-face
    print("\n⚔️  3. FACE-À-FACE (Lakers vs Warriors)")
    print("-" * 60)
    h2h = analyzer.head_to_head('LAL', 'GSW')
    if h2h and h2h['games_played'] > 0:
        print(f"Matchs joués: {h2h['games_played']}")
        print(f"LAL: {h2h['team1_wins']}V | GSW: {h2h['team2_wins']}V")
        print(f"Points moyens LAL: {h2h['avg_points_team1']}")
    
    # 4. Prédiction Over/Under
    print("\n🎯 4. PRÉDICTION OVER/UNDER (Lakers vs Warriors)")
    print("-" * 60)
    prediction = analyzer.predict_over_under('LAL', 'GSW', is_team1_home=True)
    if prediction:
        print(f"Lakers (domicile): {prediction['team1_predicted_points']} points")
        print(f"Warriors (extérieur): {prediction['team2_predicted_points']} points")
        print(f"TOTAL PRÉDIT: {prediction['total_predicted']} points")
        print(f"Confiance: {prediction['confidence']}")
    
    # 5. Prédiction du vainqueur
    print("\n🏆 5. PRÉDICTION DU VAINQUEUR")
    print("-" * 60)
    winner = analyzer.predict_winner('LAL', 'GSW', is_team1_home=True)
    if winner:
        print(f"Vainqueur prédit: {winner['predicted_winner']}")
        print(f"Probabilité LAL: {winner['team1_probability']}%")
        print(f"Probabilité GSW: {winner['team2_probability']}%")
        print(f"Niveau de confiance: {winner['confidence_level']}")
    
    # 6. Tendances de paris
    print("\n📈 6. TENDANCES DE PARIS (Points des Lakers)")
    print("-" * 60)
    trends = analyzer.analyze_betting_trends('LAL', 'PTS', 10)
    if trends:
        print(f"Moyenne: {trends['average']} points")
        print(f"Écart-type: {trends['std_dev']}")
        print(f"Tendance: {trends['trend']} ({trends['trend_strength']})")
        print(f"Consistance: {trends['consistency']}")
        print(f"Recommandation: {trends['recommendation']}")
    
    print("\n" + "=" * 60)
    print("✅ Analyse terminée")


if __name__ == "__main__":
    example_analysis()
