# Final Report: NBA Betting Data Analysis

## 1. Objective

The initial objective was to analyze the betting offers for NBA games from the website ps3838.com, extract the data, and understand the structure of the underlying JSON data.

## 2. Process

The following steps were taken to achieve the objective:

1.  **Initial Exploration:** The process began by using Playwright to navigate to the website and identify the network requests that contained the betting data.
2.  **Data Extraction:** It was discovered that the betting data was not in a separate file but embedded as a JSON object within the HTML of the page. A script was created to extract this JSON data.
3.  **Player Props Discovery:** The initial JSON did not contain player props. A `curl` command was used to fetch a more comprehensive JSON object that included player props and other markets.
4.  **JSON Analysis and Mapping:** The new JSON structure was analyzed to understand the mapping between the data and the different betting markets. This included identifying the keys for game information, main markets (moneyline, spread, total), and player props.
5.  **Verification:** The mapped JSON structure was verified against the HTML of the website to ensure accuracy.

## 3. Findings

The analysis resulted in a complete mapping of the JSON structure for the betting markets. Here is a summary of the key findings:

### Game Information

*   **Path:** `e[3]`
*   **Details:** This list contains the basic game information.
    *   `e[3][0]`: Game ID
    *   `e[3][1]`: Away Team Name
    *   `e[3][2]`: Home Team Name
    *   `e[3][4]`: Start Time (in milliseconds since epoch)

### Main Markets (Full Game)

*   **Path:** `e[3][8]['0']`
*   **Details:** This list contains the main betting markets for the full game, including moneyline, spread, and total.

### Player Props and Other Markets

*   **Path:** `e[3][8]['4']`
*   **Details:** This is a list that contains various market types, including player props and other game props. Each element in the list is a dictionary that represents a market group.
*   **Market Group (`se` key):**
    *   `cg`: The category of the market (e.g., "Player Props", "Game Props", "General", "Half").
    *   `se`: A list of the specific betting markets within that category.
*   **Specific Betting Market:**
    *   `n`: The name of the market (e.g., "Aaron Nesmith (3 Point FG)").
    *   `un`: The unit of the market (e.g., "ThreePointFieldGoals").
    *   `bt`: The bet type (e.g., "OVER_UNDER").
    *   `l`: A list of the betting offers (e.g., Over and Under).
*   **Betting Offer:**
    *   `n`: The name of the offer (e.g., "Over", "Under").
    *   `h`: The handicap or line (e.g., 2.5 for 3-pointers).
    *   `p`: The price or odds of the offer.

## 4. Generated Files

The following files were created during this process and are located in the `/Users/chapirou/dev/perso/stat-discute.be/4.BETTING/` directory:

*   `all_markets.json`: The full JSON response containing all betting markets.
*   `page_snapshot.html`: An HTML snapshot of the game-specific page.
*   `nba_betting_analysis.md`: A markdown file containing the extracted betting odds for the games.
*   `json_structure_mapping.md`: A markdown file with a detailed mapping of the JSON structure.
*   `final_report.md`: This report.
