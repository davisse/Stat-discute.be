"""
Generate Anthony Davis vs LeBron James Impact Analysis HTML Report
Creates interactive Chart.js visualization report from analysis data
"""

import pandas as pd
from datetime import datetime
from generate_html_report import NBAReportGenerator
import os

def analyze_ad_lebron_data(csv_path):
    """Analyze the AD vs LeBron CSV data and return formatted statistics."""

    # Load data
    df = pd.read_csv(csv_path)

    # Separate scenarios
    with_lebron = df[df['Scenario'] == 'With LeBron']
    without_lebron = df[df['Scenario'] == 'Without LeBron']

    # Calculate key statistics
    stats = {
        'total_games': len(df),
        'with_lebron_games': len(with_lebron),
        'without_lebron_games': len(without_lebron),

        'with_lebron_ppg': with_lebron['PTS'].mean(),
        'without_lebron_ppg': without_lebron['PTS'].mean(),

        'with_lebron_fga': with_lebron['FGA'].mean(),
        'without_lebron_fga': without_lebron['FGA'].mean(),

        'with_lebron_fg_pct': with_lebron['FG_PCT'].mean(),
        'without_lebron_fg_pct': without_lebron['FG_PCT'].mean(),

        'with_lebron_min': with_lebron['MIN'].mean(),
        'without_lebron_min': without_lebron['MIN'].mean(),

        'with_lebron_30plus': len(with_lebron[with_lebron['PTS'] >= 30]),
        'without_lebron_30plus': len(without_lebron[without_lebron['PTS'] >= 30]),

        'ppg_difference': without_lebron['PTS'].mean() - with_lebron['PTS'].mean(),
        'ppg_pct_change': ((without_lebron['PTS'].mean() - with_lebron['PTS'].mean()) / with_lebron['PTS'].mean()) * 100,

        'fga_difference': without_lebron['FGA'].mean() - with_lebron['FGA'].mean(),

        'with_lebron_df': with_lebron,
        'without_lebron_df': without_lebron
    }

    return stats


def generate_ad_lebron_html_report(csv_path, output_path):
    """Generate complete HTML report for AD vs LeBron analysis."""

    # Get script directory for absolute paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(script_dir, 'templates', 'nba_report_base.html')

    # Initialize generator
    generator = NBAReportGenerator(template_path=template_path)

    # Analyze data (convert to absolute path if relative)
    if not os.path.isabs(csv_path):
        csv_path = os.path.abspath(csv_path)
    stats = analyze_ad_lebron_data(csv_path)

    # ==================== Summary Cards ====================
    summary_cards_dict = {
        'total_games': {
            'label': 'Total de Matchs',
            'value': f"{stats['total_games']}",
            'change': None
        },
        'with_lebron_games': {
            'label': 'Avec LeBron',
            'value': f"{stats['with_lebron_games']}",
            'change': None
        },
        'without_lebron_games': {
            'label': 'Sans LeBron',
            'value': f"{stats['without_lebron_games']}",
            'change': None
        },
        'ppg_difference': {
            'label': 'Différence PPG',
            'value': f"{stats['ppg_difference']:+.2f}",
            'change': stats['ppg_difference'],
            'change_text': f"{stats['ppg_pct_change']:+.1f}%"
        },
        'with_lebron_ppg': {
            'label': 'PPG Avec LeBron',
            'value': f"{stats['with_lebron_ppg']:.1f}",
            'change': None
        },
        'without_lebron_ppg': {
            'label': 'PPG Sans LeBron',
            'value': f"{stats['without_lebron_ppg']:.1f}",
            'change': None
        }
    }

    summary_cards_html = generator.generate_summary_cards(summary_cards_dict)

    # ==================== Chart 1: Points Par Matchs (Bar) ====================
    bar_chart = generator.generate_bar_chart(
        chart_id='chart_ppg_comparison',
        title='Moyenne de Points Par Match',
        description='Comparaison de la production offensive d\'Anthony Davis avec et sans LeBron James',
        labels=['Avec LeBron', 'Sans LeBron'],
        datasets=[{
            'label': 'Points Par Match',
            'data': [stats['with_lebron_ppg'], stats['without_lebron_ppg']],
            'backgroundColor': ['rgba(85, 37, 131, 0.8)', 'rgba(253, 185, 39, 0.8)'],
            'borderColor': ['#552583', '#FDB927'],
            'borderWidth': 2
        }]
    )

    # ==================== Chart 2: Shooting Efficiency (Grouped Bar) ====================
    efficiency_chart = generator.generate_bar_chart(
        chart_id='chart_efficiency',
        title='Efficacité au Tir',
        description='Pourcentage de réussite au tir et volume de tentatives',
        labels=['FG%', 'Tentatives/Match', 'Minutes/Match'],
        datasets=[
            {
                'label': 'Avec LeBron',
                'data': [stats['with_lebron_fg_pct'] * 100, stats['with_lebron_fga'], stats['with_lebron_min']],
                'backgroundColor': 'rgba(85, 37, 131, 0.8)',
                'borderColor': '#552583',
                'borderWidth': 2
            },
            {
                'label': 'Sans LeBron',
                'data': [stats['without_lebron_fg_pct'] * 100, stats['without_lebron_fga'], stats['without_lebron_min']],
                'backgroundColor': 'rgba(253, 185, 39, 0.8)',
                'borderColor': '#FDB927',
                'borderWidth': 2
            }
        ]
    )

    # ==================== Chart 3: Game-by-Game Points Trend ====================
    # Get games without LeBron
    without_df = stats['without_lebron_df'].sort_values('GAME_DATE')

    trend_chart = generator.generate_line_chart(
        chart_id='chart_trend',
        title='Performance Match par Match (Sans LeBron)',
        description='Points marqués par Anthony Davis dans chaque match où LeBron James était absent',
        labels=without_df['MATCHUP'].tolist(),
        datasets=[{
            'label': 'Points',
            'data': without_df['PTS'].tolist(),
            'borderColor': '#FDB927',
            'backgroundColor': 'rgba(253, 185, 39, 0.2)',
            'borderWidth': 3,
            'fill': True,
            'tension': 0.4,
            'pointRadius': 5,
            'pointHoverRadius': 7,
            'pointBackgroundColor': '#FDB927',
            'pointBorderColor': '#552583',
            'pointBorderWidth': 2
        }]
    )

    # ==================== Chart 4: Performance Radar ====================
    with_stats = stats['with_lebron_df']
    without_stats = stats['without_lebron_df']

    radar_chart = generator.generate_radar_chart(
        chart_id='chart_radar',
        title='Profil de Performance Multidimensionnel',
        description='Comparaison des statistiques moyennes sur plusieurs catégories',
        labels=['Points', 'Rebonds', 'Passes', 'FG%', 'Minutes'],
        datasets=[
            {
                'label': 'Avec LeBron',
                'data': [
                    with_stats['PTS'].mean(),
                    with_stats['REB'].mean(),
                    with_stats['AST'].mean(),
                    with_stats['FG_PCT'].mean() * 100,
                    with_stats['MIN'].mean()
                ],
                'borderColor': '#552583',
                'backgroundColor': 'rgba(85, 37, 131, 0.2)',
                'borderWidth': 2,
                'pointBackgroundColor': '#552583',
                'pointBorderColor': '#fff',
                'pointHoverBackgroundColor': '#fff',
                'pointHoverBorderColor': '#552583'
            },
            {
                'label': 'Sans LeBron',
                'data': [
                    without_stats['PTS'].mean(),
                    without_stats['REB'].mean(),
                    without_stats['AST'].mean(),
                    without_stats['FG_PCT'].mean() * 100,
                    without_stats['MIN'].mean()
                ],
                'borderColor': '#FDB927',
                'backgroundColor': 'rgba(253, 185, 39, 0.2)',
                'borderWidth': 2,
                'pointBackgroundColor': '#FDB927',
                'pointBorderColor': '#fff',
                'pointHoverBackgroundColor': '#fff',
                'pointHoverBorderColor': '#FDB927'
            }
        ]
    )

    # Combine all charts
    charts_content = bar_chart + efficiency_chart + trend_chart + radar_chart

    # ==================== Data Tables ====================
    # Table 1: Games without LeBron
    without_lebron_table = generator.generate_data_table(
        title='Matchs Sans LeBron James - Performances Détaillées',
        dataframe=stats['without_lebron_df'].sort_values('GAME_DATE'),
        columns=['GAME_DATE', 'MATCHUP', 'WL', 'MIN', 'PTS', 'FGM', 'FGA', 'FG_PCT', 'REB', 'AST', 'PLUS_MINUS']
    )

    # Table 2: Comparison summary
    comparison_data = pd.DataFrame({
        'Métrique': [
            'Matchs Joués',
            'Points/Match',
            'Tentatives/Match',
            'FG%',
            'Rebonds/Match',
            'Passes/Match',
            'Minutes/Match',
            'Matchs 30+ pts',
            'Matchs 30+ pts %'
        ],
        'Avec LeBron': [
            stats['with_lebron_games'],
            f"{stats['with_lebron_ppg']:.1f}",
            f"{stats['with_lebron_fga']:.1f}",
            f"{stats['with_lebron_fg_pct']:.3f}",
            f"{with_stats['REB'].mean():.1f}",
            f"{with_stats['AST'].mean():.1f}",
            f"{stats['with_lebron_min']:.1f}",
            stats['with_lebron_30plus'],
            f"{(stats['with_lebron_30plus'] / stats['with_lebron_games'] * 100):.1f}%"
        ],
        'Sans LeBron': [
            stats['without_lebron_games'],
            f"{stats['without_lebron_ppg']:.1f}",
            f"{stats['without_lebron_fga']:.1f}",
            f"{stats['without_lebron_fg_pct']:.3f}",
            f"{without_stats['REB'].mean():.1f}",
            f"{without_stats['AST'].mean():.1f}",
            f"{stats['without_lebron_min']:.1f}",
            stats['without_lebron_30plus'],
            f"{(stats['without_lebron_30plus'] / stats['without_lebron_games'] * 100):.1f}%"
        ],
        'Différence': [
            '',
            f"{stats['ppg_difference']:+.1f}",
            f"{stats['fga_difference']:+.1f}",
            f"{(stats['without_lebron_fg_pct'] - stats['with_lebron_fg_pct']):.3f}",
            f"{(without_stats['REB'].mean() - with_stats['REB'].mean()):+.1f}",
            f"{(without_stats['AST'].mean() - with_stats['AST'].mean()):+.1f}",
            f"{(stats['without_lebron_min'] - stats['with_lebron_min']):+.1f}",
            '',
            ''
        ]
    })

    comparison_table = generator.generate_data_table(
        title='Tableau Comparatif Complet',
        dataframe=comparison_data
    )

    tables_content = comparison_table + without_lebron_table

    # ==================== Generate Final Report ====================
    html_report = generator.generate_report(
        meta_description='Analyse comparative de la performance d\'Anthony Davis avec et sans LeBron James - Saison 2023-24 Lakers',
        report_title='Anthony Davis: Impact de l\'Absence de LeBron James',
        report_subtitle='Analyse Comparative de Performance - Saison 2023-24 Lakers',
        report_type='Comparaison de Joueurs',
        date_range='2023-24 Regular Season',
        league='NBA',
        meta_badges='<span class="meta-badge">🏀 Lakers</span><span class="meta-badge">👤 Anthony Davis</span>',
        summary_cards=summary_cards_html,
        charts_content=charts_content,
        tables_content=tables_content,
        generation_timestamp=f'Généré le {datetime.now().strftime("%d/%m/%Y à %H:%M")} | Données: NBA.com via nba_api'
    )

    # Save report
    generator.save_report(html_report, output_path)

    # Print summary
    print("\n" + "="*70)
    print("📊 RAPPORT HTML GÉNÉRÉ AVEC SUCCÈS")
    print("="*70)
    print(f"Titre: Anthony Davis vs LeBron James Impact Analysis")
    print(f"Matchs analysés: {stats['total_games']}")
    print(f"Avec LeBron: {stats['with_lebron_games']} matchs ({stats['with_lebron_ppg']:.1f} PPG)")
    print(f"Sans LeBron: {stats['without_lebron_games']} matchs ({stats['without_lebron_ppg']:.1f} PPG)")
    print(f"Différence: {stats['ppg_difference']:+.2f} PPG ({stats['ppg_pct_change']:+.1f}%)")
    print(f"\n📁 Fichier: {output_path}")
    print(f"📊 Graphiques: 4 (Bar, Line, Radar)")
    print(f"📋 Tableaux: 2 (Comparaison, Matchs détaillés)")
    print("="*70)

    return output_path


if __name__ == '__main__':
    # Paths (absolute)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    csv_path = os.path.join(project_root, '0.SCRIPTS-EXPORTS', 'data', 'ad_lebron_comparison_2025-10-23.csv')
    output_path = os.path.join(project_root, '0.SCRIPTS-EXPORTS', 'reports', 'ad_lebron_impact_analysis_2025-10-23.html')

    print("🚀 Génération du rapport HTML Anthony Davis vs LeBron James...")
    print(f"📂 Source CSV: {csv_path}")

    # Generate report
    report_path = generate_ad_lebron_html_report(csv_path, output_path)

    print(f"\n✅ Rapport HTML complet généré avec succès!")
    print(f"🌐 Ouvrir dans le navigateur: file://{os.path.abspath(report_path)}")
