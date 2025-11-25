"""
API Flask pour exposer les données du calendrier NBA
Compatible avec votre application de statistiques sportives

Installation requise:
pip install flask flask-cors nba_api pandas --break-system-packages
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from nba_api.stats.endpoints import leaguegamefinder, scoreboardv2
from nba_api.stats.static import teams
from datetime import datetime
import pandas as pd

app = Flask(__name__)
CORS(app)  # Permettre les requêtes CORS pour votre frontend

# Configuration
CURRENT_SEASON = '2024-25'

def get_all_teams_data():
    """Récupérer toutes les équipes NBA"""
    all_teams = teams.get_teams()
    return [{
        'id': team['id'],
        'full_name': team['full_name'],
        'abbreviation': team['abbreviation'],
        'nickname': team['nickname'],
        'city': team['city'],
        'state': team['state'],
        'year_founded': team['year_founded']
    } for team in all_teams]

@app.route('/api/nba/teams', methods=['GET'])
def get_teams():
    """
    GET /api/nba/teams
    Retourne la liste de toutes les équipes NBA
    """
    try:
        teams_data = get_all_teams_data()
        return jsonify({
            'success': True,
            'count': len(teams_data),
            'data': teams_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/schedule/today', methods=['GET'])
def get_todays_schedule():
    """
    GET /api/nba/schedule/today
    Retourne les matchs du jour avec les scores en direct
    """
    try:
        today = datetime.now()
        scoreboard = scoreboardv2.ScoreboardV2(
            game_date=today.strftime('%Y-%m-%d')
        )
        
        games_df = scoreboard.get_data_frames()[0]
        
        if games_df.empty:
            return jsonify({
                'success': True,
                'count': 0,
                'message': 'Aucun match aujourd\'hui',
                'data': []
            }), 200
        
        games_list = games_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'date': today.strftime('%Y-%m-%d'),
            'count': len(games_list),
            'data': games_list
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/schedule/season', methods=['GET'])
def get_season_schedule():
    """
    GET /api/nba/schedule/season?season=2024-25&type=Regular%20Season
    
    Query params:
    - season: Saison (défaut: 2024-25)
    - type: Type de saison (Regular Season, Playoffs, Pre Season)
    """
    try:
        season = request.args.get('season', CURRENT_SEASON)
        season_type = request.args.get('type', 'Regular Season')
        
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season,
            season_type_nullable=season_type
        )
        
        games_df = gamefinder.get_data_frames()[0]
        
        # Filtrer pour avoir un seul enregistrement par match
        unique_games = games_df.drop_duplicates(subset=['GAME_ID'], keep='first')
        unique_games = unique_games.sort_values('GAME_DATE', ascending=False)
        
        games_list = unique_games.to_dict('records')
        
        return jsonify({
            'success': True,
            'season': season,
            'season_type': season_type,
            'count': len(games_list),
            'data': games_list
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/schedule/team/<team_abbr>', methods=['GET'])
def get_team_schedule(team_abbr):
    """
    GET /api/nba/schedule/team/LAL?season=2024-25
    
    Retourne le calendrier d'une équipe spécifique
    
    Params:
    - team_abbr: Abréviation de l'équipe (LAL, GSW, BOS, etc.)
    
    Query params:
    - season: Saison (défaut: 2024-25)
    """
    try:
        season = request.args.get('season', CURRENT_SEASON)
        
        # Trouver l'équipe
        all_teams = teams.get_teams()
        team = next((t for t in all_teams if t['abbreviation'] == team_abbr.upper()), None)
        
        if not team:
            return jsonify({
                'success': False,
                'error': f'Équipe {team_abbr} non trouvée'
            }), 404
        
        gamefinder = leaguegamefinder.LeagueGameFinder(
            team_id_nullable=team['id'],
            season_nullable=season
        )
        
        games_df = gamefinder.get_data_frames()[0]
        games_df = games_df.sort_values('GAME_DATE', ascending=False)
        
        games_list = games_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'team': {
                'id': team['id'],
                'full_name': team['full_name'],
                'abbreviation': team['abbreviation']
            },
            'season': season,
            'count': len(games_list),
            'data': games_list
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/schedule/range', methods=['GET'])
def get_schedule_by_range():
    """
    GET /api/nba/schedule/range?start=2024-10-01&end=2024-10-31&season=2024-25
    
    Retourne les matchs dans une période donnée
    
    Query params:
    - start: Date de début (YYYY-MM-DD)
    - end: Date de fin (YYYY-MM-DD)
    - season: Saison (défaut: 2024-25)
    """
    try:
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        season = request.args.get('season', CURRENT_SEASON)
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'error': 'Les paramètres start et end sont requis'
            }), 400
        
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season,
            date_from_nullable=start_date,
            date_to_nullable=end_date
        )
        
        games_df = gamefinder.get_data_frames()[0]
        unique_games = games_df.drop_duplicates(subset=['GAME_ID'], keep='first')
        unique_games = unique_games.sort_values('GAME_DATE', ascending=False)
        
        games_list = unique_games.to_dict('records')
        
        return jsonify({
            'success': True,
            'start_date': start_date,
            'end_date': end_date,
            'season': season,
            'count': len(games_list),
            'data': games_list
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/game/<game_id>', methods=['GET'])
def get_game_details(game_id):
    """
    GET /api/nba/game/0022400001
    
    Retourne les détails d'un match spécifique
    
    Params:
    - game_id: ID du match
    """
    try:
        # Récupérer tous les matchs et filtrer par ID
        gamefinder = leaguegamefinder.LeagueGameFinder(
            season_nullable=CURRENT_SEASON
        )
        
        games_df = gamefinder.get_data_frames()[0]
        game = games_df[games_df['GAME_ID'] == game_id]
        
        if game.empty:
            return jsonify({
                'success': False,
                'error': f'Match {game_id} non trouvé'
            }), 404
        
        # Récupérer les deux lignes (une par équipe)
        game_data = game.to_dict('records')
        
        return jsonify({
            'success': True,
            'game_id': game_id,
            'data': game_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/stats/team/<team_abbr>', methods=['GET'])
def get_team_stats(team_abbr):
    """
    GET /api/nba/stats/team/LAL?season=2024-25
    
    Retourne les statistiques d'une équipe pour la saison
    
    Params:
    - team_abbr: Abréviation de l'équipe
    
    Query params:
    - season: Saison (défaut: 2024-25)
    """
    try:
        season = request.args.get('season', CURRENT_SEASON)
        
        # Trouver l'équipe
        all_teams = teams.get_teams()
        team = next((t for t in all_teams if t['abbreviation'] == team_abbr.upper()), None)
        
        if not team:
            return jsonify({
                'success': False,
                'error': f'Équipe {team_abbr} non trouvée'
            }), 404
        
        gamefinder = leaguegamefinder.LeagueGameFinder(
            team_id_nullable=team['id'],
            season_nullable=season
        )
        
        games_df = gamefinder.get_data_frames()[0]
        
        # Calculer les statistiques moyennes
        stats = {
            'games_played': len(games_df),
            'wins': len(games_df[games_df['WL'] == 'W']),
            'losses': len(games_df[games_df['WL'] == 'L']),
            'avg_points': round(games_df['PTS'].mean(), 2),
            'avg_rebounds': round(games_df['REB'].mean(), 2),
            'avg_assists': round(games_df['AST'].mean(), 2),
            'avg_steals': round(games_df['STL'].mean(), 2),
            'avg_blocks': round(games_df['BLK'].mean(), 2),
            'avg_turnovers': round(games_df['TOV'].mean(), 2),
            'fg_pct': round(games_df['FG_PCT'].mean(), 3),
            'fg3_pct': round(games_df['FG3_PCT'].mean(), 3),
            'ft_pct': round(games_df['FT_PCT'].mean(), 3),
            'plus_minus': round(games_df['PLUS_MINUS'].mean(), 2)
        }
        
        return jsonify({
            'success': True,
            'team': {
                'id': team['id'],
                'full_name': team['full_name'],
                'abbreviation': team['abbreviation']
            },
            'season': season,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nba/health', methods=['GET'])
def health_check():
    """Endpoint de santé pour vérifier que l'API fonctionne"""
    return jsonify({
        'success': True,
        'message': 'NBA Schedule API is running',
        'version': '1.0.0',
        'current_season': CURRENT_SEASON
    }), 200

@app.route('/', methods=['GET'])
def index():
    """Page d'accueil avec la documentation de l'API"""
    return jsonify({
        'name': 'NBA Schedule API',
        'version': '1.0.0',
        'description': 'API pour récupérer le calendrier et les statistiques NBA',
        'endpoints': {
            'GET /api/nba/health': 'Vérifier l\'état de l\'API',
            'GET /api/nba/teams': 'Liste de toutes les équipes',
            'GET /api/nba/schedule/today': 'Matchs du jour',
            'GET /api/nba/schedule/season': 'Calendrier de la saison',
            'GET /api/nba/schedule/team/{abbr}': 'Calendrier d\'une équipe',
            'GET /api/nba/schedule/range': 'Matchs dans une période',
            'GET /api/nba/game/{id}': 'Détails d\'un match',
            'GET /api/nba/stats/team/{abbr}': 'Statistiques d\'une équipe'
        },
        'documentation': 'https://github.com/swar/nba_api'
    }), 200

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════════╗
    ║          🏀 NBA SCHEDULE API - DÉMARRAGE              ║
    ╚════════════════════════════════════════════════════════╝
    
    📡 Serveur démarré sur: http://localhost:5000
    📚 Documentation: http://localhost:5000
    
    🔗 Endpoints disponibles:
       - GET /api/nba/teams
       - GET /api/nba/schedule/today
       - GET /api/nba/schedule/season
       - GET /api/nba/schedule/team/{abbr}
       - GET /api/nba/schedule/range
       - GET /api/nba/game/{id}
       - GET /api/nba/stats/team/{abbr}
    
    ⏹️  Appuyez sur CTRL+C pour arrêter le serveur
    """)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
