/**
 * Module JavaScript pour interagir avec l'API NBA Stats
 * Compatible avec votre application web de statistiques sportives
 * 
 * Utilisation:
 * import { NBAScheduleClient } from './nba-client.js';
 * const client = new NBAScheduleClient('http://localhost:5000');
 */

class NBAScheduleClient {
    constructor(baseURL = 'http://localhost:5000') {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Effectuer une requête HTTP avec gestion du cache
     */
    async request(endpoint, useCache = true) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Vérifier le cache
        if (useCache && this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (Date.now() - cached.timestamp < this.cacheExpiration) {
                console.log(`📦 Cache hit: ${endpoint}`);
                return cached.data;
            }
        }

        try {
            console.log(`🌐 Fetching: ${endpoint}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Mettre en cache
            if (useCache && data.success) {
                this.cache.set(url, {
                    data: data,
                    timestamp: Date.now()
                });
            }
            
            return data;
        } catch (error) {
            console.error(`❌ Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Vider le cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    // ==================== ÉQUIPES ====================

    /**
     * Récupérer toutes les équipes NBA
     * @returns {Promise<Object>} Liste des équipes
     */
    async getTeams() {
        return this.request('/api/nba/teams');
    }

    /**
     * Trouver une équipe par son abréviation
     * @param {string} abbr - Abréviation de l'équipe (ex: 'LAL')
     * @returns {Promise<Object>} Données de l'équipe
     */
    async findTeam(abbr) {
        const response = await this.getTeams();
        if (response.success) {
            return response.data.find(t => t.abbreviation === abbr.toUpperCase());
        }
        return null;
    }

    // ==================== CALENDRIER ====================

    /**
     * Récupérer les matchs du jour
     * @returns {Promise<Object>} Matchs du jour avec scores
     */
    async getTodaysGames() {
        return this.request('/api/nba/schedule/today', false); // Ne pas mettre en cache
    }

    /**
     * Récupérer le calendrier complet de la saison
     * @param {string} season - Saison (ex: '2024-25')
     * @param {string} type - Type de saison ('Regular Season', 'Playoffs', etc.)
     * @returns {Promise<Object>} Calendrier de la saison
     */
    async getSeasonSchedule(season = '2024-25', type = 'Regular Season') {
        return this.request(`/api/nba/schedule/season?season=${season}&type=${encodeURIComponent(type)}`);
    }

    /**
     * Récupérer le calendrier d'une équipe
     * @param {string} teamAbbr - Abréviation de l'équipe (ex: 'LAL')
     * @param {string} season - Saison (ex: '2024-25')
     * @returns {Promise<Object>} Calendrier de l'équipe
     */
    async getTeamSchedule(teamAbbr, season = '2024-25') {
        return this.request(`/api/nba/schedule/team/${teamAbbr}?season=${season}`);
    }

    /**
     * Récupérer les matchs dans une période
     * @param {string} startDate - Date de début (YYYY-MM-DD)
     * @param {string} endDate - Date de fin (YYYY-MM-DD)
     * @param {string} season - Saison (ex: '2024-25')
     * @returns {Promise<Object>} Matchs de la période
     */
    async getScheduleByRange(startDate, endDate, season = '2024-25') {
        return this.request(`/api/nba/schedule/range?start=${startDate}&end=${endDate}&season=${season}`);
    }

    /**
     * Récupérer les matchs de la semaine en cours
     * @returns {Promise<Object>} Matchs de la semaine
     */
    async getThisWeekGames() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const start = startOfWeek.toISOString().split('T')[0];
        const end = endOfWeek.toISOString().split('T')[0];

        return this.getScheduleByRange(start, end);
    }

    /**
     * Récupérer les matchs du mois en cours
     * @returns {Promise<Object>} Matchs du mois
     */
    async getThisMonthGames() {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        return this.getScheduleByRange(start, end);
    }

    // ==================== DÉTAILS DE MATCH ====================

    /**
     * Récupérer les détails d'un match
     * @param {string} gameId - ID du match
     * @returns {Promise<Object>} Détails du match
     */
    async getGameDetails(gameId) {
        return this.request(`/api/nba/game/${gameId}`);
    }

    // ==================== STATISTIQUES ====================

    /**
     * Récupérer les statistiques d'une équipe
     * @param {string} teamAbbr - Abréviation de l'équipe
     * @param {string} season - Saison (ex: '2024-25')
     * @returns {Promise<Object>} Statistiques de l'équipe
     */
    async getTeamStats(teamAbbr, season = '2024-25') {
        return this.request(`/api/nba/stats/team/${teamAbbr}?season=${season}`);
    }

    // ==================== HELPERS ====================

    /**
     * Formater une date en format français
     * @param {string} dateString - Date au format ISO
     * @returns {string} Date formatée
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Formater une heure
     * @param {string} dateString - Date au format ISO
     * @returns {string} Heure formatée
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Déterminer si une équipe joue à domicile ou à l'extérieur
     * @param {string} matchup - String du matchup (ex: 'LAL vs. GSW' ou 'LAL @ GSW')
     * @param {string} teamAbbr - Abréviation de l'équipe
     * @returns {string} 'home' ou 'away'
     */
    getHomeAway(matchup, teamAbbr) {
        if (matchup.includes('vs.')) {
            return matchup.startsWith(teamAbbr) ? 'home' : 'away';
        } else if (matchup.includes('@')) {
            return matchup.startsWith(teamAbbr) ? 'away' : 'home';
        }
        return 'unknown';
    }

    /**
     * Extraire le nom de l'adversaire depuis le matchup
     * @param {string} matchup - String du matchup
     * @param {string} teamAbbr - Abréviation de l'équipe
     * @returns {string} Abréviation de l'adversaire
     */
    getOpponent(matchup, teamAbbr) {
        const parts = matchup.replace(' vs. ', ' @ ').split(' @ ');
        for (const part of parts) {
            if (!part.includes(teamAbbr)) {
                return part.trim();
            }
        }
        return 'Unknown';
    }
}

// ==================== EXEMPLE D'UTILISATION ====================

/**
 * Exemple d'utilisation du client NBA
 */
async function exempleUtilisation() {
    const client = new NBAScheduleClient('http://localhost:5000');

    try {
        console.log('🏀 NBA Schedule Client - Exemples\n');

        // 1. Récupérer toutes les équipes
        console.log('1️⃣ Récupération des équipes...');
        const teams = await client.getTeams();
        console.log(`✅ ${teams.count} équipes trouvées`);
        console.log('Premières équipes:', teams.data.slice(0, 3).map(t => t.full_name));

        // 2. Matchs du jour
        console.log('\n2️⃣ Matchs du jour...');
        const today = await client.getTodaysGames();
        if (today.count > 0) {
            console.log(`✅ ${today.count} match(s) aujourd'hui`);
        } else {
            console.log('❌ Aucun match aujourd\'hui');
        }

        // 3. Calendrier des Lakers
        console.log('\n3️⃣ Calendrier des Lakers...');
        const lakersSchedule = await client.getTeamSchedule('LAL');
        console.log(`✅ ${lakersSchedule.count} matchs pour les Lakers`);
        console.log('Prochain match:', lakersSchedule.data[0]);

        // 4. Statistiques des Lakers
        console.log('\n4️⃣ Stats des Lakers...');
        const lakersStats = await client.getTeamStats('LAL');
        console.log('✅ Statistiques:', lakersStats.stats);

        // 5. Matchs de la semaine
        console.log('\n5️⃣ Matchs de cette semaine...');
        const weekGames = await client.getThisWeekGames();
        console.log(`✅ ${weekGames.count} matchs cette semaine`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// ==================== INTEGRATION AVEC CHART.JS ====================

/**
 * Fonction pour créer un graphique des performances d'une équipe
 * Compatible avec Chart.js (mentionné dans votre intro)
 */
function createPerformanceChart(games, canvasId) {
    const dates = games.map(g => new Date(g.GAME_DATE).toLocaleDateString('fr-FR'));
    const points = games.map(g => g.PTS);
    const results = games.map(g => g.WL === 'W' ? 'green' : 'red');

    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Points par match',
                data: points,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBackgroundColor: results,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance de l\'équipe'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Points'
                    }
                }
            }
        }
    });
}

// ==================== EXPORT ====================

// Pour utilisation en module ES6
export { NBAScheduleClient };

// Pour utilisation classique (navigateur)
if (typeof window !== 'undefined') {
    window.NBAScheduleClient = NBAScheduleClient;
    window.createPerformanceChart = createPerformanceChart;
}

// Pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NBAScheduleClient };
}
