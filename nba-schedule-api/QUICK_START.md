# 🚀 GUIDE DE DÉMARRAGE RAPIDE - NBA Schedule API

## Installation en 3 étapes

### 1️⃣ Installer les dépendances

```bash
pip install -r requirements.txt --break-system-packages
```

### 2️⃣ Démarrer le serveur

```bash
python nba_api_server.py
```

Le serveur démarre sur **http://localhost:5000**

### 3️⃣ Tester l'API

Ouvrez votre navigateur à : **http://localhost:5000**

Ou ouvrez le fichier **demo.html** pour voir la démo interactive !

---

## 📱 Endpoints principaux

| Endpoint | Description | Exemple |
|----------|-------------|---------|
| `/api/nba/teams` | Toutes les équipes | http://localhost:5000/api/nba/teams |
| `/api/nba/schedule/today` | Matchs du jour | http://localhost:5000/api/nba/schedule/today |
| `/api/nba/schedule/team/LAL` | Calendrier Lakers | http://localhost:5000/api/nba/schedule/team/LAL |
| `/api/nba/stats/team/LAL` | Stats Lakers | http://localhost:5000/api/nba/stats/team/LAL |

---

## 💻 Exemples de code rapides

### JavaScript (Frontend)

```javascript
const client = new NBAScheduleClient('http://localhost:5000');

// Matchs du jour
const games = await client.getTodaysGames();

// Calendrier d'une équipe
const schedule = await client.getTeamSchedule('LAL');

// Stats d'une équipe
const stats = await client.getTeamStats('LAL');
```

### Python (Backend)

```python
from nba_schedule_api import NBAScheduleAPI

api = NBAScheduleAPI(season='2024-25')

# Toutes les équipes
teams = api.get_all_teams()

# Matchs du jour
todays_games = api.get_todays_games()

# Calendrier Lakers
lakers = api.get_team_schedule('LAL')
```

### cURL (Ligne de commande)

```bash
# Matchs du jour
curl http://localhost:5000/api/nba/schedule/today

# Calendrier Lakers
curl http://localhost:5000/api/nba/schedule/team/LAL

# Stats Lakers
curl http://localhost:5000/api/nba/stats/team/LAL
```

---

## 📊 Analyse pour paris sportifs

```python
from nba_betting_analyzer import NBABettingAnalyzer

analyzer = NBABettingAnalyzer(season='2024-25')

# Prédire le total de points
prediction = analyzer.predict_over_under('LAL', 'GSW', is_team1_home=True)
print(f"Total prédit: {prediction['total_predicted']} points")

# Prédire le vainqueur
winner = analyzer.predict_winner('LAL', 'GSW', is_team1_home=True)
print(f"Vainqueur: {winner['predicted_winner']}")
print(f"Probabilité: {winner['team1_probability']}%")

# Analyser la forme
form = analyzer.analyze_form('LAL', n_games=5)
print(f"Victoires: {form['wins']}/{form['last_games']}")
```

---

## 🎯 Abréviations des équipes

| Conf. Est | Abrév. | Conf. Ouest | Abrév. |
|-----------|--------|-------------|--------|
| Atlanta Hawks | ATL | Dallas Mavericks | DAL |
| Boston Celtics | BOS | Denver Nuggets | DEN |
| Brooklyn Nets | BKN | Golden State Warriors | GSW |
| Charlotte Hornets | CHA | Houston Rockets | HOU |
| Chicago Bulls | CHI | LA Clippers | LAC |
| Cleveland Cavaliers | CLE | Los Angeles Lakers | LAL |
| Detroit Pistons | DET | Memphis Grizzlies | MEM |
| Indiana Pacers | IND | Minnesota Timberwolves | MIN |
| Miami Heat | MIA | New Orleans Pelicans | NOP |
| Milwaukee Bucks | MIL | Oklahoma City Thunder | OKC |
| New York Knicks | NYK | Phoenix Suns | PHX |
| Orlando Magic | ORL | Portland Trail Blazers | POR |
| Philadelphia 76ers | PHI | Sacramento Kings | SAC |
| Toronto Raptors | TOR | San Antonio Spurs | SAS |
| Washington Wizards | WAS | Utah Jazz | UTA |

---

## ⚡ Scripts de démarrage automatique

### Linux/Mac
```bash
bash start.sh
```

### Windows
```powershell
.\start.ps1
```

---

## 🐛 Résolution de problèmes

### L'API ne démarre pas
- Vérifiez que Python 3.7+ est installé : `python --version`
- Installez les dépendances : `pip install -r requirements.txt --break-system-packages`

### Erreur "module not found"
```bash
pip install nba_api pandas flask flask-cors --break-system-packages
```

### Pas de données retournées
- L'API NBA peut bloquer certains hébergeurs cloud
- Fonctionne mieux en développement local
- Vérifiez votre connexion internet

---

## 📚 Documentation complète

Consultez **README.md** pour la documentation complète avec :
- Tous les endpoints disponibles
- Structures de données détaillées
- Exemples avancés
- Bonnes pratiques

---

## 🎓 Exemples de fichiers

- **demo.html** : Interface web interactive avec Chart.js
- **data_examples.json** : Exemples de structures de données
- **nba_betting_analyzer.py** : Analyses avancées pour paris
- **nba_schedule_api.py** : Script Python autonome
- **nba_api_server.py** : Serveur API REST
- **nba-client.js** : Client JavaScript

---

## ✅ Checklist de démarrage

- [ ] Installer Python 3.7+
- [ ] Installer les dépendances (`pip install -r requirements.txt`)
- [ ] Démarrer le serveur (`python nba_api_server.py`)
- [ ] Tester l'API (http://localhost:5000)
- [ ] Ouvrir demo.html dans le navigateur
- [ ] Commencer à coder ! 🚀

---

**Mission** : Proposer l'outil de statistiques sportives dédié aux paris sportifs le plus complet et efficace possible 🎯
