# 🏀 NBA Schedule API - Documentation Complète

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Architecture](#architecture)
4. [Utilisation](#utilisation)
5. [Endpoints API](#endpoints-api)
6. [Exemples de code](#exemples-de-code)
7. [Intégration frontend](#intégration-frontend)
8. [Données disponibles](#données-disponibles)
9. [Limites et considérations](#limites-et-considérations)

---

## 🎯 Introduction

Cette API permet de récupérer le calendrier complet des matchs NBA, les statistiques des équipes et des joueurs via l'API officielle **NBA Stats**.

### Fonctionnalités principales

- ✅ Récupération du calendrier complet NBA/WNBA
- ✅ Matchs en temps réel (scores live)
- ✅ Statistiques détaillées par équipe
- ✅ Historique des matchs par période
- ✅ API REST facilement intégrable
- ✅ Cache intelligent pour optimiser les performances
- ✅ Compatible avec Chart.js pour les visualisations

---

## 📦 Installation

### Prérequis

- Python 3.7+
- pip

### Installation des dépendances

```bash
# Installation des packages Python
pip install nba_api pandas requests flask flask-cors --break-system-packages
```

### Structure des fichiers

```
nba-schedule-api/
├── nba_schedule_api.py      # Script Python autonome
├── nba_api_server.py         # Serveur Flask API REST
├── nba-client.js             # Client JavaScript
├── demo.html                 # Page de démonstration
└── README.md                 # Documentation
```

---

## 🏗️ Architecture

### 1. Script Python autonome (`nba_schedule_api.py`)

Script pour utilisation directe ou automatisation.

```python
from nba_schedule_api import NBAScheduleAPI

api = NBAScheduleAPI(season='2024-25')
teams = api.get_all_teams()
schedule = api.get_season_schedule()
```

### 2. API REST (`nba_api_server.py`)

Serveur Flask qui expose les données via des endpoints HTTP.

```bash
python nba_api_server.py
# Serveur démarré sur http://localhost:5000
```

### 3. Client JavaScript (`nba-client.js`)

Module JavaScript pour consommer l'API depuis le frontend.

```javascript
const client = new NBAScheduleClient('http://localhost:5000');
const games = await client.getTodaysGames();
```

---

## 🚀 Utilisation

### Démarrage rapide

#### 1. Lancer le serveur API

```bash
python nba_api_server.py
```

#### 2. Tester l'API

Ouvrez votre navigateur à `http://localhost:5000`

#### 3. Utiliser la démo

Ouvrez `demo.html` dans votre navigateur après avoir démarré le serveur.

---

## 📡 Endpoints API

### Base URL

```
http://localhost:5000/api/nba
```

### Liste des endpoints

#### 1. Health Check

```http
GET /api/nba/health
```

**Réponse:**
```json
{
  "success": true,
  "message": "NBA Schedule API is running",
  "version": "1.0.0",
  "current_season": "2024-25"
}
```

---

#### 2. Toutes les équipes

```http
GET /api/nba/teams
```

**Réponse:**
```json
{
  "success": true,
  "count": 30,
  "data": [
    {
      "id": 1610612738,
      "full_name": "Boston Celtics",
      "abbreviation": "BOS",
      "nickname": "Celtics",
      "city": "Boston",
      "state": "Massachusetts",
      "year_founded": 1946
    },
    ...
  ]
}
```

---

#### 3. Matchs du jour

```http
GET /api/nba/schedule/today
```

**Réponse:**
```json
{
  "success": true,
  "date": "2024-10-23",
  "count": 5,
  "data": [
    {
      "game_id": "0022400001",
      "game_date": "2024-10-23",
      "home_team": 1610612738,
      "visitor_team": 1610612752,
      "home_score": 105,
      "visitor_score": 98,
      "game_status": "Final"
    },
    ...
  ]
}
```

---

#### 4. Calendrier de la saison

```http
GET /api/nba/schedule/season?season=2024-25&type=Regular%20Season
```

**Paramètres:**
- `season` (optionnel): Saison (défaut: 2024-25)
- `type` (optionnel): Type de saison
  - `Regular Season` (défaut)
  - `Playoffs`
  - `Pre Season`

**Réponse:**
```json
{
  "success": true,
  "season": "2024-25",
  "season_type": "Regular Season",
  "count": 1230,
  "data": [...]
}
```

---

#### 5. Calendrier d'une équipe

```http
GET /api/nba/schedule/team/LAL?season=2024-25
```

**Paramètres:**
- `team_abbr` (requis): Abréviation de l'équipe (LAL, GSW, BOS, etc.)
- `season` (optionnel): Saison (défaut: 2024-25)

**Réponse:**
```json
{
  "success": true,
  "team": {
    "id": 1610612747,
    "full_name": "Los Angeles Lakers",
    "abbreviation": "LAL"
  },
  "season": "2024-25",
  "count": 82,
  "data": [
    {
      "GAME_ID": "0022400001",
      "GAME_DATE": "2024-10-22",
      "MATCHUP": "LAL vs. GSW",
      "WL": "W",
      "PTS": 110,
      "REB": 45,
      "AST": 25,
      "FG_PCT": 0.485,
      ...
    },
    ...
  ]
}
```

---

#### 6. Matchs par période

```http
GET /api/nba/schedule/range?start=2024-10-01&end=2024-10-31&season=2024-25
```

**Paramètres:**
- `start` (requis): Date de début (YYYY-MM-DD)
- `end` (requis): Date de fin (YYYY-MM-DD)
- `season` (optionnel): Saison (défaut: 2024-25)

---

#### 7. Détails d'un match

```http
GET /api/nba/game/0022400001
```

**Réponse:**
```json
{
  "success": true,
  "game_id": "0022400001",
  "data": [
    {
      "TEAM_ID": 1610612747,
      "TEAM_NAME": "Los Angeles Lakers",
      "GAME_DATE": "2024-10-22",
      "MATCHUP": "LAL vs. GSW",
      "WL": "W",
      "PTS": 110,
      "FG_PCT": 0.485,
      "FG3_PCT": 0.389,
      "FT_PCT": 0.850,
      "REB": 45,
      "AST": 25,
      "STL": 8,
      "BLK": 5,
      "TOV": 12,
      ...
    },
    {
      "TEAM_ID": 1610612744,
      "TEAM_NAME": "Golden State Warriors",
      ...
    }
  ]
}
```

---

#### 8. Statistiques d'une équipe

```http
GET /api/nba/stats/team/LAL?season=2024-25
```

**Réponse:**
```json
{
  "success": true,
  "team": {
    "id": 1610612747,
    "full_name": "Los Angeles Lakers",
    "abbreviation": "LAL"
  },
  "season": "2024-25",
  "stats": {
    "games_played": 5,
    "wins": 3,
    "losses": 2,
    "avg_points": 112.4,
    "avg_rebounds": 44.2,
    "avg_assists": 24.6,
    "avg_steals": 7.8,
    "avg_blocks": 5.2,
    "avg_turnovers": 13.4,
    "fg_pct": 0.478,
    "fg3_pct": 0.365,
    "ft_pct": 0.812,
    "plus_minus": 5.6
  }
}
```

---

## 💻 Exemples de code

### Python - Script autonome

```python
from nba_schedule_api import NBAScheduleAPI

# Initialiser l'API
api = NBAScheduleAPI(season='2024-25')

# 1. Récupérer toutes les équipes
teams = api.get_all_teams()
print(f"Nombre d'équipes: {len(teams)}")

# 2. Matchs du jour
todays_games = api.get_todays_games()
print(f"Matchs aujourd'hui: {len(todays_games)}")

# 3. Calendrier des Lakers
lakers_schedule = api.get_team_schedule('LAL')
print(f"Matchs des Lakers: {len(lakers_schedule)}")

# 4. Matchs d'octobre
october_games = api.get_games_by_date_range('2024-10-01', '2024-10-31')
print(f"Matchs en octobre: {len(october_games)}")

# 5. Exporter en JSON
api.export_to_json(teams, 'teams.json')
api.export_to_csv(lakers_schedule, 'lakers_schedule.csv')
```

---

### JavaScript - Client Web

```javascript
// Initialiser le client
const client = new NBAScheduleClient('http://localhost:5000');

// Récupérer les matchs du jour
async function afficherMatchsDuJour() {
    try {
        const response = await client.getTodaysGames();
        
        if (response.success && response.count > 0) {
            response.data.forEach(game => {
                console.log(`Match: ${game.home_team} vs ${game.visitor_team}`);
                console.log(`Score: ${game.home_score} - ${game.visitor_score}`);
            });
        } else {
            console.log('Aucun match aujourd\'hui');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Récupérer les stats d'une équipe
async function afficherStatsEquipe(teamAbbr) {
    try {
        const response = await client.getTeamStats(teamAbbr);
        
        if (response.success) {
            console.log(`Équipe: ${response.team.full_name}`);
            console.log(`Victoires: ${response.stats.wins}`);
            console.log(`Défaites: ${response.stats.losses}`);
            console.log(`Moyenne de points: ${response.stats.avg_points}`);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Utilisation
afficherMatchsDuJour();
afficherStatsEquipe('LAL');
```

---

### JavaScript - Intégration avec Chart.js

```javascript
async function creerGraphiquePerformance(teamAbbr) {
    const client = new NBAScheduleClient('http://localhost:5000');
    
    // Récupérer les matchs de l'équipe
    const response = await client.getTeamSchedule(teamAbbr);
    const games = response.data.slice(0, 10).reverse();
    
    // Préparer les données
    const dates = games.map(g => new Date(g.GAME_DATE).toLocaleDateString('fr-FR'));
    const points = games.map(g => g.PTS);
    const colors = games.map(g => g.WL === 'W' ? 'green' : 'red');
    
    // Créer le graphique
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Points par match',
                data: points,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBackgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Créer le graphique pour les Lakers
creerGraphiquePerformance('LAL');
```

---

### cURL - Exemples de requêtes

```bash
# Matchs du jour
curl http://localhost:5000/api/nba/schedule/today

# Calendrier des Lakers
curl http://localhost:5000/api/nba/schedule/team/LAL

# Stats des Lakers
curl http://localhost:5000/api/nba/stats/team/LAL

# Matchs d'octobre
curl "http://localhost:5000/api/nba/schedule/range?start=2024-10-01&end=2024-10-31"
```

---

## 🎨 Intégration frontend

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>NBA Stats</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="nba-client.js"></script>
</head>
<body>
    <div id="stats"></div>
    <canvas id="chart"></canvas>
    
    <script>
        const client = new NBAScheduleClient('http://localhost:5000');
        
        async function init() {
            // Charger les stats
            const stats = await client.getTeamStats('LAL');
            document.getElementById('stats').innerHTML = `
                <h2>${stats.team.full_name}</h2>
                <p>Victoires: ${stats.stats.wins}</p>
                <p>Défaites: ${stats.stats.losses}</p>
            `;
            
            // Créer le graphique
            const schedule = await client.getTeamSchedule('LAL');
            // ... créer le graphique avec Chart.js
        }
        
        init();
    </script>
</body>
</html>
```

---

## 📊 Données disponibles

### Statistiques par match

| Champ | Description |
|-------|-------------|
| `GAME_ID` | ID unique du match |
| `GAME_DATE` | Date du match (YYYY-MM-DD) |
| `MATCHUP` | Format: "TEAM vs. OPPONENT" ou "TEAM @ OPPONENT" |
| `WL` | Résultat: "W" (victoire) ou "L" (défaite) |
| `PTS` | Points marqués |
| `FGM` / `FGA` / `FG_PCT` | Tirs réussis / tentés / pourcentage |
| `FG3M` / `FG3A` / `FG3_PCT` | Tirs à 3 points |
| `FTM` / `FTA` / `FT_PCT` | Lancers francs |
| `OREB` / `DREB` / `REB` | Rebonds offensifs / défensifs / totaux |
| `AST` | Passes décisives |
| `STL` | Interceptions |
| `BLK` | Contres |
| `TOV` | Pertes de balle |
| `PF` | Fautes personnelles |
| `PLUS_MINUS` | +/- (différence de points) |

### Abréviations des équipes

| Équipe | Abréviation |
|--------|-------------|
| Atlanta Hawks | ATL |
| Boston Celtics | BOS |
| Brooklyn Nets | BKN |
| Charlotte Hornets | CHA |
| Chicago Bulls | CHI |
| Cleveland Cavaliers | CLE |
| Dallas Mavericks | DAL |
| Denver Nuggets | DEN |
| Detroit Pistons | DET |
| Golden State Warriors | GSW |
| Houston Rockets | HOU |
| Indiana Pacers | IND |
| LA Clippers | LAC |
| Los Angeles Lakers | LAL |
| Memphis Grizzlies | MEM |
| Miami Heat | MIA |
| Milwaukee Bucks | MIL |
| Minnesota Timberwolves | MIN |
| New Orleans Pelicans | NOP |
| New York Knicks | NYK |
| Oklahoma City Thunder | OKC |
| Orlando Magic | ORL |
| Philadelphia 76ers | PHI |
| Phoenix Suns | PHX |
| Portland Trail Blazers | POR |
| Sacramento Kings | SAC |
| San Antonio Spurs | SAS |
| Toronto Raptors | TOR |
| Utah Jazz | UTA |
| Washington Wizards | WAS |

---

## ⚠️ Limites et considérations

### Restrictions de l'API NBA

1. **Rate limiting**: L'API NBA peut limiter le nombre de requêtes
   - Utilisez le cache intelligent intégré
   - Limitez les appels répétés

2. **Blocage d'IP**: Certains hébergeurs cloud (AWS, Heroku) peuvent être bloqués
   - Fonctionne mieux en développement local
   - Utilisez un VPN si nécessaire

3. **Disponibilité des données**:
   - Les matchs futurs peuvent ne pas avoir de statistiques
   - Les scores live peuvent avoir un délai de ~30 secondes
   - Les statistiques finales sont mises à jour après le match

### Bonnes pratiques

1. **Utiliser le cache**:
```javascript
// Le cache expire après 5 minutes
const client = new NBAScheduleClient();
client.cacheExpiration = 10 * 60 * 1000; // 10 minutes
```

2. **Gérer les erreurs**:
```javascript
try {
    const data = await client.getTeamSchedule('LAL');
} catch (error) {
    console.error('Erreur:', error);
    // Gérer l'erreur (message utilisateur, retry, etc.)
}
```

3. **Optimiser les requêtes**:
```javascript
// Mauvais: appeler l'API pour chaque équipe séparément
for (const team of teams) {
    await client.getTeamSchedule(team);
}

// Bon: récupérer toute la saison puis filtrer
const season = await client.getSeasonSchedule();
// Filtrer localement
```

---

## 🔗 Ressources

- [nba_api GitHub](https://github.com/swar/nba_api) - Documentation officielle
- [NBA.com Stats](https://stats.nba.com) - Site officiel
- [Chart.js Documentation](https://www.chartjs.org/docs/) - Graphiques
- [Flask Documentation](https://flask.palletsprojects.com/) - Framework API

---

## 📝 License

Ce projet utilise l'API publique NBA Stats. Assurez-vous de respecter les conditions d'utilisation de la NBA.

---

## 🤝 Support

Pour toute question ou problème:
1. Vérifiez que le serveur API est démarré
2. Consultez les logs d'erreur dans la console
3. Assurez-vous d'avoir la dernière version de `nba_api`

---

**Mission**: Proposer l'outil de statistiques sportives dédié aux paris sportifs le plus complet et efficace possible 🎯
