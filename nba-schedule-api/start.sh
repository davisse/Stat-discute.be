#!/bin/bash

# Script de démarrage rapide pour NBA Schedule API
# Usage: bash start.sh

echo "╔════════════════════════════════════════════════════════╗"
echo "║        🏀 NBA SCHEDULE API - DÉMARRAGE RAPIDE         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    echo "   Installez Python 3.7+ depuis https://python.org"
    exit 1
fi

echo "✅ Python $(python3 --version) trouvé"
echo ""

# Vérifier si pip est installé
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo "❌ pip n'est pas installé"
    exit 1
fi

echo "✅ pip trouvé"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
echo "   (Cela peut prendre quelques minutes la première fois)"
echo ""

pip install -r requirements.txt --break-system-packages --quiet

if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées avec succès"
else
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "🎯 Que voulez-vous faire ?"
echo ""
echo "1. Démarrer le serveur API Flask (recommandé)"
echo "2. Tester le script Python autonome"
echo "3. Ouvrir la démo HTML"
echo "4. Quitter"
echo ""
read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Démarrage du serveur API Flask..."
        echo "   URL: http://localhost:5000"
        echo ""
        echo "   Appuyez sur CTRL+C pour arrêter le serveur"
        echo ""
        python3 nba_api_server.py
        ;;
    2)
        echo ""
        echo "🧪 Exécution du script de test..."
        echo ""
        python3 nba_schedule_api.py
        ;;
    3)
        echo ""
        echo "🌐 Ouverture de la démo..."
        echo ""
        if command -v open &> /dev/null; then
            open demo.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open demo.html
        elif command -v start &> /dev/null; then
            start demo.html
        else
            echo "   Ouvrez manuellement le fichier demo.html dans votre navigateur"
        fi
        echo ""
        echo "⚠️  N'oubliez pas de démarrer le serveur API (option 1) pour que la démo fonctionne !"
        ;;
    4)
        echo ""
        echo "👋 Au revoir !"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Choix invalide"
        exit 1
        ;;
esac
