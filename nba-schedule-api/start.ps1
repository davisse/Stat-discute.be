# Script de démarrage rapide pour NBA Schedule API (Windows)
# Usage: .\start.ps1

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🏀 NBA SCHEDULE API - DÉMARRAGE RAPIDE         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Python est installé
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if ($null -eq $pythonCmd) {
    Write-Host "❌ Python 3 n'est pas installé" -ForegroundColor Red
    Write-Host "   Installez Python 3.7+ depuis https://python.org" -ForegroundColor Yellow
    exit 1
}

$pythonVersion = & $pythonCmd --version
Write-Host "✅ $pythonVersion trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier si pip est installé
$pipCmd = $null
if (Get-Command pip -ErrorAction SilentlyContinue) {
    $pipCmd = "pip"
} elseif (Get-Command pip3 -ErrorAction SilentlyContinue) {
    $pipCmd = "pip3"
}

if ($null -eq $pipCmd) {
    Write-Host "❌ pip n'est pas installé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ pip trouvé" -ForegroundColor Green
Write-Host ""

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre quelques minutes la première fois)" -ForegroundColor Gray
Write-Host ""

& $pipCmd install -r requirements.txt --break-system-packages --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Que voulez-vous faire ?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Démarrer le serveur API Flask (recommandé)"
Write-Host "2. Tester le script Python autonome"
Write-Host "3. Ouvrir la démo HTML"
Write-Host "4. Quitter"
Write-Host ""
$choice = Read-Host "Votre choix (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Démarrage du serveur API Flask..." -ForegroundColor Green
        Write-Host "   URL: http://localhost:5000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Appuyez sur CTRL+C pour arrêter le serveur" -ForegroundColor Gray
        Write-Host ""
        & $pythonCmd nba_api_server.py
    }
    "2" {
        Write-Host ""
        Write-Host "🧪 Exécution du script de test..." -ForegroundColor Green
        Write-Host ""
        & $pythonCmd nba_schedule_api.py
    }
    "3" {
        Write-Host ""
        Write-Host "🌐 Ouverture de la démo..." -ForegroundColor Green
        Write-Host ""
        Start-Process "demo.html"
        Write-Host ""
        Write-Host "⚠️  N'oubliez pas de démarrer le serveur API (option 1) pour que la démo fonctionne !" -ForegroundColor Yellow
    }
    "4" {
        Write-Host ""
        Write-Host "👋 Au revoir !" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}
