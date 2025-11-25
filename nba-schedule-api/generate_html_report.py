"""
HTML Report Generator for NBA Statistics
Generates interactive Chart.js reports from CSV data
"""

import pandas as pd
import json
from datetime import datetime
from pathlib import Path
import os

class NBAReportGenerator:
    """Generate HTML reports with Chart.js visualizations from NBA statistics data."""

    def __init__(self, template_path='templates/nba_report_base.html'):
        """Initialize the report generator with a template."""
        self.template_path = template_path
        with open(template_path, 'r', encoding='utf-8') as f:
            self.template = f.read()

    def load_csv_data(self, csv_path):
        """Load and parse CSV data."""
        return pd.read_csv(csv_path)

    def generate_summary_cards(self, stats_dict):
        """Generate HTML for summary stat cards."""
        cards_html = ""

        for key, value in stats_dict.items():
            label = value.get('label', key)
            stat_value = value.get('value', 0)
            change = value.get('change', None)
            change_text = value.get('change_text', '')

            change_html = ""
            if change is not None:
                change_class = "positive" if change > 0 else "negative"
                change_symbol = "▲" if change > 0 else "▼"
                change_html = f'<div class="stat-card__change stat-card__change--{change_class}">{change_symbol} {change_text}</div>'

            cards_html += f'''
            <div class="stat-card">
                <div class="stat-card__label">{label}</div>
                <div class="stat-card__value">{stat_value}</div>
                {change_html}
            </div>
            '''

        return cards_html

    def generate_line_chart(self, chart_id, title, description, labels, datasets):
        """Generate a line chart section with Chart.js."""
        datasets_json = json.dumps(datasets)
        labels_json = json.dumps(labels)

        return f'''
        <div class="chart-section">
            <div class="chart-section__header">
                <h3 class="chart-section__title">{title}</h3>
                <p class="chart-section__description">{description}</p>
            </div>
            <div class="chart-container">
                <canvas id="{chart_id}" role="img" aria-label="{title}"></canvas>
            </div>
        </div>

        <script>
        (function() {{
            const ctx = document.getElementById('{chart_id}').getContext('2d');
            new Chart(ctx, {{
                type: 'line',
                data: {{
                    labels: {labels_json},
                    datasets: {datasets_json}
                }},
                options: {{
                    ...RESPONSIVE_OPTIONS,
                    scales: {{
                        y: {{
                            beginAtZero: false,
                            ticks: {{
                                color: textColor
                            }},
                            grid: {{
                                color: gridColor
                            }}
                        }},
                        x: {{
                            ticks: {{
                                color: textColor
                            }},
                            grid: {{
                                display: false
                            }}
                        }}
                    }}
                }}
            }});
        }})();
        </script>
        '''

    def generate_bar_chart(self, chart_id, title, description, labels, datasets):
        """Generate a bar chart section with Chart.js."""
        datasets_json = json.dumps(datasets)
        labels_json = json.dumps(labels)

        return f'''
        <div class="chart-section">
            <div class="chart-section__header">
                <h3 class="chart-section__title">{title}</h3>
                <p class="chart-section__description">{description}</p>
            </div>
            <div class="chart-container">
                <canvas id="{chart_id}" role="img" aria-label="{title}"></canvas>
            </div>
        </div>

        <script>
        (function() {{
            const ctx = document.getElementById('{chart_id}').getContext('2d');
            new Chart(ctx, {{
                type: 'bar',
                data: {{
                    labels: {labels_json},
                    datasets: {datasets_json}
                }},
                options: {{
                    ...RESPONSIVE_OPTIONS,
                    scales: {{
                        y: {{
                            beginAtZero: true,
                            ticks: {{
                                color: textColor
                            }},
                            grid: {{
                                color: gridColor
                            }}
                        }},
                        x: {{
                            ticks: {{
                                color: textColor
                            }},
                            grid: {{
                                display: false
                            }}
                        }}
                    }}
                }}
            }});
        }})();
        </script>
        '''

    def generate_radar_chart(self, chart_id, title, description, labels, datasets):
        """Generate a radar chart section with Chart.js."""
        datasets_json = json.dumps(datasets)
        labels_json = json.dumps(labels)

        return f'''
        <div class="chart-section">
            <div class="chart-section__header">
                <h3 class="chart-section__title">{title}</h3>
                <p class="chart-section__description">{description}</p>
            </div>
            <div class="chart-container">
                <canvas id="{chart_id}" role="img" aria-label="{title}"></canvas>
            </div>
        </div>

        <script>
        (function() {{
            const ctx = document.getElementById('{chart_id}').getContext('2d');
            new Chart(ctx, {{
                type: 'radar',
                data: {{
                    labels: {labels_json},
                    datasets: {datasets_json}
                }},
                options: {{
                    ...RESPONSIVE_OPTIONS,
                    scales: {{
                        r: {{
                            beginAtZero: true,
                            pointLabels: {{
                                color: textColor,
                                font: {{
                                    size: 12
                                }}
                            }},
                            ticks: {{
                                color: textColor,
                                backdropColor: 'transparent'
                            }},
                            grid: {{
                                color: gridColor
                            }},
                            angleLines: {{
                                color: gridColor
                            }}
                        }}
                    }}
                }}
            }});
        }})();
        </script>
        '''

    def generate_data_table(self, title, dataframe, columns=None):
        """Generate an HTML table from pandas DataFrame."""
        if columns:
            df = dataframe[columns]
        else:
            df = dataframe

        # Start table HTML
        table_html = f'''
        <div class="table-container">
            <h3 class="mb-lg">{title}</h3>
            <table>
                <thead>
                    <tr>
        '''

        # Add headers
        for col in df.columns:
            table_html += f'<th>{col}</th>'

        table_html += '''
                    </tr>
                </thead>
                <tbody>
        '''

        # Add rows
        for _, row in df.iterrows():
            # Check if it's a win or loss for highlighting
            row_class = ''
            if 'WL' in df.columns:
                row_class = 'table-highlight--win' if row['WL'] == 'W' else 'table-highlight--loss'

            table_html += f'<tr class="{row_class}">'

            for col in df.columns:
                value = row[col]
                # Format numeric columns
                if pd.api.types.is_numeric_dtype(df[col]) and col not in ['GAME_DATE']:
                    if isinstance(value, float):
                        value = f'{value:.3f}' if value < 1 else f'{value:.1f}'
                    table_html += f'<td class="table-numeric">{value}</td>'
                else:
                    table_html += f'<td>{value}</td>'

            table_html += '</tr>'

        table_html += '''
                </tbody>
            </table>
        </div>
        '''

        return table_html

    def generate_report(self, **kwargs):
        """
        Generate complete HTML report.

        Args:
            report_title: Main title
            report_subtitle: Subtitle
            report_type: Type of report (e.g., "Player Comparison")
            date_range: Date range string
            league: League name (e.g., "NBA")
            meta_badges: Additional badge HTML
            summary_cards: Dictionary of summary statistics
            charts_content: Chart HTML sections
            tables_content: Table HTML sections
            generation_timestamp: Timestamp string
            additional_styles: Extra CSS
            additional_scripts: Extra JavaScript
        """

        report_html = self.template

        # Fill in all placeholders
        placeholders = {
            'meta_description': kwargs.get('meta_description', 'NBA Statistics Report'),
            'report_title': kwargs.get('report_title', 'NBA Report'),
            'report_subtitle': kwargs.get('report_subtitle', ''),
            'report_type': kwargs.get('report_type', 'Analysis'),
            'date_range': kwargs.get('date_range', ''),
            'league': kwargs.get('league', 'NBA'),
            'meta_badges': kwargs.get('meta_badges', ''),
            'summary_cards': kwargs.get('summary_cards', ''),
            'charts_content': kwargs.get('charts_content', ''),
            'tables_content': kwargs.get('tables_content', ''),
            'generation_timestamp': kwargs.get('generation_timestamp', f'Généré le {datetime.now().strftime("%d/%m/%Y à %H:%M")}'),
            'additional_styles': kwargs.get('additional_styles', ''),
            'additional_scripts': kwargs.get('additional_scripts', '')
        }

        for key, value in placeholders.items():
            report_html = report_html.replace('{{' + key + '}}', str(value))

        return report_html

    def save_report(self, html_content, output_path):
        """Save HTML report to file."""
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"✅ Report saved to: {output_path}")
        return output_path


def main():
    """Example usage of the report generator."""
    generator = NBAReportGenerator()

    # Example: Load CSV data
    csv_path = '../0.SCRIPTS-EXPORTS/data/ad_lebron_comparison_2025-10-23.csv'
    df = generator.load_csv_data(csv_path)

    print(f"Loaded {len(df)} games from CSV")
    print(f"Columns: {df.columns.tolist()}")

    # Example summary stats
    summary_stats = {
        'total_games': {
            'label': 'Total Games',
            'value': len(df)
        },
        'avg_points': {
            'label': 'Average Points',
            'value': f"{df['PTS'].mean():.1f}"
        }
    }

    summary_html = generator.generate_summary_cards(summary_stats)

    # Generate report
    html = generator.generate_report(
        report_title="Example NBA Report",
        report_subtitle="Test Report Generation",
        summary_cards=summary_html
    )

    # Save report
    output_path = '../0.SCRIPTS-EXPORTS/reports/test_report.html'
    generator.save_report(html, output_path)


if __name__ == '__main__':
    main()
