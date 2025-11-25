"""
Script pour récupérer le calendrier complet des matchs NBA
via l'API officielle NBA Stats

Installation requise:
pip install nba_api pandas requests --break-system-packages
"""

from nba_api.stats.endpoints import leaguegamefinder, scoreboardv2
from nba_api.stats.static import teams
from datetime import datetime, timedelta
import pandas as pd
import json
import time

class NBAScheduleAPI:
    """Classe pour gérer la récupération du calendrier NBA"""
    
    def __init__(self, season='2024-25'):
        """
        Initialiser avec la saison souhaitée
        Format: '2024-25' pour la saison 2024-2025
        """
        self.season = season
        self.all_teams = teams.get_teams()
    
    def get_all_teams(self):
        """Récupérer tous les teams NBA"""
        teams_data = []
        for team in self.all_teams:
            teams_data.append({
                'id': team['id'],
                'full_name': team['full_name'],
                'abbreviation': team['abbreviation'],
                'nickname': team['nickname'],
                'city': team['city'],
                'state': team['state'],
                'year_founded': team['year_founded']
            })
        return teams_data
    
    def get_season_schedule(self):
        """
        Récupérer le calendrier complet de la saison
        Retourne tous les matchs de toutes les équipes
        """
        print(f"📅 Récupération du calendrier pour la saison {self.season}...")
        
        # Utiliser LeagueGameFinder pour obtenir tous les matchs
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=self.season,
            season_type_nullable='Regular Season'  # ou 'Playoffs', 'Pre Season'
        )
        
        games_df = gamefinder.get_data_frames()[0]
        
        # Chaque match apparaît 2 fois (une fois par équipe)
        # On va filtrer pour n'avoir qu'une occurrence par match
        games_df = games_df.sort_values('GAME_DATE')
        unique_games = games_df.drop_duplicates(subset=['GAME_ID'], keep='first')
        
        print(f"✅ {len(unique_games)} matchs trouvés")
        
        return self._format_schedule(unique_games)
    
    def get_todays_games(self):
        """Récupérer les matchs du jour avec scores en direct"""
        print("🏀 Récupération des matchs du jour...")
        
        today = datetime.now()
        scoreboard = scoreboardv2.ScoreboardV2(
            game_date=today.strftime('%Y-%m-%d')
        )
        
        games = scoreboard.get_data_frames()[0]
        
        if games.empty:
            print("❌ Aucun match aujourd'hui")
            return []
        
        print(f"✅ {len(games)} match(s) aujourd'hui")
        return self._format_scoreboard(games)
    
    def get_games_by_date_range(self, start_date, end_date):
        """
        Récupérer les matchs dans une période donnée
        
        Args:
            start_date (str): Date de début au format 'YYYY-MM-DD'
            end_date (str): Date de fin au format 'YYYY-MM-DD'
        """
        print(f"📅 Récupération des matchs du {start_date} au {end_date}...")
        
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=self.season,
            date_from_nullable=start_date,
            date_to_nullable=end_date
        )
        
        games_df = gamefinder.get_data_frames()[0]
        unique_games = games_df.drop_duplicates(subset=['GAME_ID'], keep='first')
        
        print(f"✅ {len(unique_games)} matchs trouvés")
        return self._format_schedule(unique_games)
    
    def get_team_schedule(self, team_abbreviation):
        """
        Récupérer le calendrier d'une équipe spécifique
        
        Args:
            team_abbreviation (str): Abréviation de l'équipe (ex: 'LAL', 'GSW', 'BOS')
        """
        # Trouver l'équipe
        team = next((t for t in self.all_teams if t['abbreviation'] == team_abbreviation), None)
        
        if not team:
            print(f"❌ Équipe {team_abbreviation} non trouvée")
            return []
        
        print(f"📅 Récupération du calendrier de {team['full_name']}...")
        
        gamefinder = leaguegamefinder.LeagueGameFinder(
            team_id_nullable=team['id'],
            season_nullable=self.season
        )
        
        games_df = gamefinder.get_data_frames()[0]
        
        print(f"✅ {len(games_df)} matchs trouvés")
        return self._format_team_schedule(games_df, team['full_name'])
    
    def _format_schedule(self, games_df):
        """Formater les données du calendrier"""
        schedule = []
        
        for _, game in games_df.iterrows():
            # Extraire les noms des équipes depuis le MATCHUP
            matchup = game['MATCHUP']
            
            schedule.append({
                'game_id': game['GAME_ID'],
                'game_date': game['GAME_DATE'],
                'season_id': game['SEASON_ID'],
                'matchup': matchup,
                'team_id': game['TEAM_ID'],
                'team_name': game['TEAM_NAME'],
                'points': game.get('PTS', 0),
                'result': game.get('WL', 'N/A'),
                'plus_minus': game.get('PLUS_MINUS', 0)
            })
        
        return schedule
    
    def _format_team_schedule(self, games_df, team_name):
        """Formater le calendrier d'une équipe"""
        schedule = []
        
        for _, game in games_df.iterrows():
            schedule.append({
                'game_id': game['GAME_ID'],
                'game_date': game['GAME_DATE'],
                'matchup': game['MATCHUP'],
                'home_away': '@' if '@' in game['MATCHUP'] else 'vs',
                'opponent': self._extract_opponent(game['MATCHUP'], team_name),
                'result': game.get('WL', 'N/A'),
                'points': game.get('PTS', 0),
                'opponent_points': self._calculate_opponent_points(game),
                'plus_minus': game.get('PLUS_MINUS', 0),
                'fg_pct': game.get('FG_PCT', 0),
                'fg3_pct': game.get('FG3_PCT', 0),
                'ft_pct': game.get('FT_PCT', 0),
                'rebounds': game.get('REB', 0),
                'assists': game.get('AST', 0),
                'steals': game.get('STL', 0),
                'blocks': game.get('BLK', 0),
                'turnovers': game.get('TOV', 0)
            })
        
        return schedule
    
    def _format_scoreboard(self, games_df):
        """Formater les matchs du jour"""
        games = []
        
        for _, game in games_df.iterrows():
            games.append({
                'game_id': game['GAME_ID'],
                'game_date': game['GAME_DATE_EST'],
                'game_status': game['GAME_STATUS_TEXT'],
                'home_team': game['HOME_TEAM_ID'],
                'visitor_team': game['VISITOR_TEAM_ID'],
                'home_score': game.get('PTS_HOME', 0),
                'visitor_score': game.get('PTS_AWAY', 0)
            })
        
        return games
    
    def _extract_opponent(self, matchup, team_name):
        """Extraire le nom de l'adversaire depuis le matchup"""
        # Le format est généralement "TEAM @ OPPONENT" ou "TEAM vs. OPPONENT"
        parts = matchup.replace(' vs. ', ' @ ').split(' @ ')
        for part in parts:
            if team_name not in part:
                return part.strip()
        return "Unknown"
    
    def _calculate_opponent_points(self, game):
        """Calculer les points de l'adversaire"""
        team_points = game.get('PTS', 0)
        plus_minus = game.get('PLUS_MINUS', 0)
        return team_points - plus_minus
    
    def export_to_json(self, data, filename):
        """Exporter les données en JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"💾 Données exportées vers {filename}")
    
    def export_to_csv(self, data, filename):
        """Exporter les données en CSV"""
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"💾 Données exportées vers {filename}")


def main():
    """Fonction principale pour tester l'API"""
    
    # Initialiser l'API pour la saison 2024-25
    nba_api = NBAScheduleAPI(season='2024-25')
    
    print("\n" + "="*60)
    print("🏀 NBA SCHEDULE API - RÉCUPÉRATION DES DONNÉES")
    print("="*60 + "\n")
    
    # 1. Récupérer toutes les équipes
    print("\n1️⃣  LISTE DES ÉQUIPES NBA")
    print("-" * 60)
    teams_data = nba_api.get_all_teams()
    print(f"Nombre d'équipes: {len(teams_data)}")
    for i, team in enumerate(teams_data[:5], 1):
        print(f"  {i}. {team['full_name']} ({team['abbreviation']})")
    print(f"  ... et {len(teams_data) - 5} autres équipes")
    
    # Exporter les équipes
    nba_api.export_to_json(teams_data, 'nba_teams.json')
    
    # 2. Récupérer les matchs du jour
    print("\n2️⃣  MATCHS DU JOUR")
    print("-" * 60)
    todays_games = nba_api.get_todays_games()
    if todays_games:
        nba_api.export_to_json(todays_games, 'nba_todays_games.json')
    
    # 3. Récupérer le calendrier d'une équipe (exemple: Lakers)
    print("\n3️⃣  CALENDRIER D'UNE ÉQUIPE (Lakers)")
    print("-" * 60)
    lakers_schedule = nba_api.get_team_schedule('LAL')
    if lakers_schedule:
        print(f"Premiers matchs:")
        for i, game in enumerate(lakers_schedule[:5], 1):
            print(f"  {i}. {game['game_date']} - {game['matchup']} ({game['result']})")
        nba_api.export_to_json(lakers_schedule, 'nba_lakers_schedule.json')
        nba_api.export_to_csv(lakers_schedule, 'nba_lakers_schedule.csv')
    
    # 4. Récupérer les matchs d'une période
    print("\n4️⃣  MATCHS D'UNE PÉRIODE (Octobre 2024)")
    print("-" * 60)
    october_games = nba_api.get_games_by_date_range('2024-10-01', '2024-10-31')
    if october_games:
        print(f"Premiers matchs d'octobre:")
        for i, game in enumerate(october_games[:5], 1):
            print(f"  {i}. {game['game_date']} - {game['matchup']}")
        nba_api.export_to_json(october_games, 'nba_october_games.json')
    
    # 5. Récupérer le calendrier complet de la saison
    print("\n5️⃣  CALENDRIER COMPLET DE LA SAISON 2024-25")
    print("-" * 60)
    print("⚠️  Cette opération peut prendre quelques minutes...")
    
    # Note: Décommenter la ligne ci-dessous pour récupérer tout le calendrier
    # full_schedule = nba_api.get_season_schedule()
    # nba_api.export_to_json(full_schedule, 'nba_full_schedule_2024-25.json')
    # nba_api.export_to_csv(full_schedule, 'nba_full_schedule_2024-25.csv')
    
    print("\n" + "="*60)
    print("✅ RÉCUPÉRATION TERMINÉE")
    print("="*60 + "\n")
    
    print("📁 Fichiers générés:")
    print("  - nba_teams.json")
    print("  - nba_todays_games.json (si matchs aujourd'hui)")
    print("  - nba_lakers_schedule.json/csv")
    print("  - nba_october_games.json")
    print("\n💡 Pour récupérer le calendrier complet, décommentez la section 5️⃣")


if __name__ == "__main__":
    main()
