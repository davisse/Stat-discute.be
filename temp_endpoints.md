--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/franchiseplayers.md ---

# FranchisePlayers
##### [nba_api/stats/endpoints/franchiseplayers.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/franchiseplayers.py)

##### Endpoint URL
>[https://stats.nba.com/stats/franchiseplayers](https://stats.nba.com/stats/franchiseplayers)

##### Valid URL
>[https://stats.nba.com/stats/franchiseplayers?LeagueID=00&PerMode=Totals&SeasonType=Regular+Season&TeamID=1610612739](https://stats.nba.com/stats/franchiseplayers?LeagueID=00&PerMode=Totals&SeasonType=Regular+Season&TeamID=1610612739)

## Parameters
| API Parameter Name                                                                                                  | Python Parameter Variable |                                                                    Pattern                                                                    | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------|---------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)     | league_id                 |                                                                                                                                               |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)       | per_mode_detailed         | `^(Totals)\|(PerGame)\|(MinutesPer)\|(Per48)\|(Per40)\|(Per36)\|(PerMinute)\|(PerPossession)\|(PerPlay)\|(Per100Possessions)\|(Per100Plays)$` |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType) | season_type_all_star      |                                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                           |   `Y`    |          | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)         | team_id                   |                                                                                                                                               |   `Y`    |          | 

## Data Sets
#### FranchisePlayers `franchise_players`
```text
['LEAGUE_ID', 'TEAM_ID', 'TEAM', 'PERSON_ID', 'PLAYER', 'SEASON_TYPE', 'ACTIVE_WITH_TEAM', 'GP', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'PF', 'STL', 'TOV', 'BLK', 'PTS']
```


## JSON
```json
{
    "data_sets": {
        "FranchisePlayers": [
            "LEAGUE_ID",
            "TEAM_ID",
            "TEAM",
            "PERSON_ID",
            "PLAYER",
            "SEASON_TYPE",
            "ACTIVE_WITH_TEAM",
            "GP",
            "FGM",
            "FGA",
            "FG_PCT",
            "FG3M",
            "FG3A",
            "FG3_PCT",
            "FTM",
            "FTA",
            "FT_PCT",
            "OREB",
            "DREB",
            "REB",
            "AST",
            "PF",
            "STL",
            "TOV",
            "BLK",
            "PTS"
        ]
    },
    "endpoint": "FranchisePlayers",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "LeagueID": null,
        "PerMode": "^(Totals)|(PerGame)|(MinutesPer)|(Per48)|(Per40)|(Per36)|(PerMinute)|(PerPossession)|(PerPlay)|(Per100Possessions)|(Per100Plays)$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "TeamID": null
    },
    "parameters": [
        "LeagueID",
        "PerMode",
        "SeasonType",
        "TeamID"
    ],
    "required_parameters": [
        "LeagueID",
        "PerMode",
        "SeasonType",
        "TeamID"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/gamerotation.md ---

# GameRotation
##### [nba_api/stats/endpoints/gamerotation.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/gamerotation.py)

##### Endpoint URL
>[https://stats.nba.com/stats/gamerotation](https://stats.nba.com/stats/gamerotation)

##### Valid URL
>[https://stats.nba.com/stats/gamerotation?GameID=0021700807&LeagueID=00](https://stats.nba.com/stats/gamerotation?GameID=0021700807&LeagueID=00)

## Parameters
| API Parameter Name                                                                                              | Python Parameter Variable |  Pattern   | Required | Nullable |
|-----------------------------------------------------------------------------------------------------------------|---------------------------|:----------:|:--------:|:--------:|
| [_**GameID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameID)     | game_id                   | `^\d{10}$` |   `Y`    |          | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID) | league_id                 |            |   `Y`    |          | 

## Data Sets
#### AwayTeam `away_team`
```text
['GAME_ID', 'TEAM_ID', 'TEAM_CITY', 'TEAM_NAME', 'PERSON_ID', 'PLAYER_FIRST', 'PLAYER_LAST', 'IN_TIME_REAL', 'OUT_TIME_REAL', 'PLAYER_PTS', 'PT_DIFF', 'USG_PCT']
```

#### HomeTeam `home_team`
```text
['GAME_ID', 'TEAM_ID', 'TEAM_CITY', 'TEAM_NAME', 'PERSON_ID', 'PLAYER_FIRST', 'PLAYER_LAST', 'IN_TIME_REAL', 'OUT_TIME_REAL', 'PLAYER_PTS', 'PT_DIFF', 'USG_PCT']
```


## JSON
```json
{
    "data_sets": {
        "AwayTeam": [
            "GAME_ID",
            "TEAM_ID",
            "TEAM_CITY",
            "TEAM_NAME",
            "PERSON_ID",
            "PLAYER_FIRST",
            "PLAYER_LAST",
            "IN_TIME_REAL",
            "OUT_TIME_REAL",
            "PLAYER_PTS",
            "PT_DIFF",
            "USG_PCT"
        ],
        "HomeTeam": [
            "GAME_ID",
            "TEAM_ID",
            "TEAM_CITY",
            "TEAM_NAME",
            "PERSON_ID",
            "PLAYER_FIRST",
            "PLAYER_LAST",
            "IN_TIME_REAL",
            "OUT_TIME_REAL",
            "PLAYER_PTS",
            "PT_DIFF",
            "USG_PCT"
        ]
    },
    "endpoint": "GameRotation",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "GameID": "^\d{10}$",
        "LeagueID": null
    },
    "parameters": [
        "GameID",
        "LeagueID"
    ],
    "required_parameters": [
        "GameID",
        "LeagueID"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/glalumboxscoresimilarityscore.md ---

# GLAlumBoxScoreSimilarityScore
##### [nba_api/stats/endpoints/glalumboxscoresimilarityscore.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/glalumboxscoresimilarityscore.py)

##### Endpoint URL
>[https://stats.nba.com/stats/glalumboxscoresimilarityscore](https://stats.nba.com/stats/glalumboxscoresimilarityscore)

##### Valid URL
>[https://stats.nba.com/stats/glalumboxscoresimilarityscore?Person1Id=202681&Person1LeagueId=00&Person1Season=2019&Person1SeasonType=Regular+Season&Person2Id=203078&Person2LeagueId=00&Person2Season=2019&Person2SeasonType=Regular+Season](https://stats.nba.com/stats/glalumboxscoresimilarityscore?Person1Id=202681&Person1LeagueId=00&Person1Season=2019&Person1SeasonType=Regular+Season&Person2Id=203078&Person2LeagueId=00&Person2Season=2019&Person2SeasonType=Regular+Season)

## Parameters
| API Parameter Name                                                                                                                | Python Parameter Variable | Pattern | Required | Nullable |
|-----------------------------------------------------------------------------------------------------------------------------------|---------------------------|:-------:|:--------:|:--------:|
| [_**Person1Id**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person1Id)                 | person1_id                |         |   `Y`    |          | 
| [_**Person1LeagueId**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person1LeagueId)     | person1_league_id         |         |   `Y`    |          | 
| [_**Person1Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person1Season)         | person1_season_year       |         |   `Y`    |          | 
| [_**Person1SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person1SeasonType) | person1_season_type       |         |   `Y`    |          | 
| [_**Person2Id**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person2Id)                 | person2_id                |         |   `Y`    |          | 
| [_**Person2LeagueId**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person2LeagueId)     | person2_league_id         |         |   `Y`    |          | 
| [_**Person2Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person2Season)         | person2_season_year       |         |   `Y`    |          | 
| [_**Person2SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Person2SeasonType) | person2_season_type       |         |   `Y`    |          | 

## Data Sets
#### GLeagueAlumBoxScoreSimilarityScores `g_league_alum_box_score_similarity_scores`
```text
['PERSON_2_ID', 'PERSON_2', 'TEAM_ID', 'SIMILARITY_SCORE']
```


## JSON
```json
{
    "data_sets": {
        "GLeagueAlumBoxScoreSimilarityScores": [
            "PERSON_2_ID",
            "PERSON_2",
            "TEAM_ID",
            "SIMILARITY_SCORE"
        ]
    },
    "endpoint": "GLAlumBoxScoreSimilarityScore",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "Person1Id": null,
        "Person1LeagueId": null,
        "Person1Season": null,
        "Person1SeasonType": null,
        "Person2Id": null,
        "Person2LeagueId": null,
        "Person2Season": null,
        "Person2SeasonType": null
    },
    "parameters": [
        "Person1Id",
        "Person1LeagueId",
        "Person1Season",
        "Person1SeasonType",
        "Person2Id",
        "Person2LeagueId",
        "Person2Season",
        "Person2SeasonType"
    ],
    "required_parameters": [
        "Person1Id",
        "Person1LeagueId",
        "Person1Season",
        "Person1SeasonType",
        "Person2Id",
        "Person2LeagueId",
        "Person2Season",
        "Person2SeasonType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/homepageleaders.md ---

# HomePageLeaders
##### [nba_api/stats/endpoints/homepageleaders.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/homepageleaders.py)

##### Endpoint URL
>[https://stats.nba.com/stats/homepageleaders](https://stats.nba.com/stats/homepageleaders)

##### Valid URL
>[https://stats.nba.com/stats/homepageleaders?GameScope=Season&LeagueID=00&PlayerOrTeam=Team&PlayerScope=All+Players&Season=2019-20&SeasonType=Regular+Season&StatCategory=Points](https://stats.nba.com/stats/homepageleaders?GameScope=Season&LeagueID=00&PlayerOrTeam=Team&PlayerScope=All+Players&Season=2019-20&SeasonType=Regular+Season&StatCategory=Points)

## Parameters
| API Parameter Name                                                                                                      | Python Parameter Variable |                                                         Pattern                                                         | Required | Nullable |
|-------------------------------------------------------------------------------------------------------------------------|---------------------------|:-----------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)       | game_scope_detailed       |                                     `^(Season)\|(Last 10)\|(Yesterday)\|(Finals)$`                                      |   `Y`    |          | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)         | league_id                 |                                                        `^\d{2}$`                                                        |   `Y`    |          | 
| [_**PlayerOrTeam**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerOrTeam) | player_or_team            |                                                  `^(Player)\|(Team)$`                                                   |   `Y`    |          | 
| [_**PlayerScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerScope)   | player_scope              |                                              `^(All Players)\|(Rookies)$`                                               |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)             | season                    |                                                                                                                         |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)     | season_type_playoffs      |                                     `^(Regular Season)\|(Pre Season)\|(Playoffs)$`                                      |   `Y`    |          | 
| [_**StatCategory**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StatCategory) | stat_category             | `^(Points)\|(Rebounds)\|(Assists)\|(Defense)\|(Clutch)\|(Playmaking)\|(Efficiency)\|(Fast Break)\|(Scoring Breakdown)$` |   `Y`    |          | 

## Data Sets
#### HomePageLeaders `home_page_leaders`
```text
['RANK', 'TEAM_ID', 'TEAM_NAME', 'TEAM_ABBREVIATION', 'PTS', 'FG_PCT', 'FG3_PCT', 'FT_PCT', 'EFG_PCT', 'TS_PCT', 'PTS_PER48']
```

#### LeagueAverage `league_average`
```text
['PTS', 'FG_PCT', 'FG3_PCT', 'FT_PCT', 'EFG_PCT', 'TS_PCT', 'PTS_PER48']
```

#### LeagueMax `league_max`
```text
['PTS', 'FG_PCT', 'FG3_PCT', 'FT_PCT', 'EFG_PCT', 'TS_PCT', 'PTS_PER48']
```


## JSON
```json
{
    "data_sets": {
        "HomePageLeaders": [
            "RANK",
            "TEAM_ID",
            "TEAM_NAME",
            "TEAM_ABBREVIATION",
            "PTS",
            "FG_PCT",
            "FG3_PCT",
            "FT_PCT",
            "EFG_PCT",
            "TS_PCT",
            "PTS_PER48"
        ],
        "LeagueAverage": [
            "PTS",
            "FG_PCT",
            "FG3_PCT",
            "FT_PCT",
            "EFG_PCT",
            "TS_PCT",
            "PTS_PER48"
        ],
        "LeagueMax": [
            "PTS",
            "FG_PCT",
            "FG3_PCT",
            "FT_PCT",
            "EFG_PCT",
            "TS_PCT",
            "PTS_PER48"
        ]
    },
    "endpoint": "HomePageLeaders",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "GameScope": "^(Season)|(Last 10)|(Yesterday)|(Finals)$",
        "LeagueID": "^\d{2}$",
        "PlayerOrTeam": "^(Player)|(Team)$",
        "PlayerScope": "^(All Players)|(Rookies)$",
        "Season": null,
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)$",
        "StatCategory": "^(Points)|(Rebounds)|(Assists)|(Defense)|(Clutch)|(Playmaking)|(Efficiency)|(Fast Break)|(Scoring Breakdown)$"
    },
    "parameters": [
        "GameScope",
        "LeagueID",
        "PlayerOrTeam",
        "PlayerScope",
        "Season",
        "SeasonType",
        "StatCategory"
    ],
    "required_parameters": [
        "GameScope",
        "LeagueID",
        "PlayerOrTeam",
        "PlayerScope",
        "Season",
        "SeasonType",
        "StatCategory"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/homepagev2.md ---

# HomePageV2
##### [nba_api/stats/endpoints/homepagev2.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/homepagev2.py)

##### Endpoint URL
>[https://stats.nba.com/stats/homepagev2](https://stats.nba.com/stats/homepagev2)

##### Valid URL
>[https://stats.nba.com/stats/homepagev2?GameScope=Season&LeagueID=00&PlayerOrTeam=Team&PlayerScope=All+Players&Season=2019-20&SeasonType=Regular+Season&StatType=Traditional](https://stats.nba.com/stats/homepagev2?GameScope=Season&LeagueID=00&PlayerOrTeam=Team&PlayerScope=All+Players&Season=2019-20&SeasonType=Regular+Season&StatType=Traditional)

## Parameters
| API Parameter Name                                                                                                      | Python Parameter Variable |                    Pattern                     | Required | Nullable |
|-------------------------------------------------------------------------------------------------------------------------|---------------------------|:----------------------------------------------:|:--------:|:--------:|
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)       | game_scope_detailed       | `^(Season)\|(Last 10)\|(Yesterday)\|(Finals)$` |   `Y`    |          | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)         | league_id                 |                   `^\d{2}$`                    |   `Y`    |          | 
| [_**PlayerOrTeam**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerOrTeam) | player_or_team            |              `^(Player)\|(Team)$`              |   `Y`    |          | 
| [_**PlayerScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerScope)   | player_scope              |          `^(All Players)\|(Rookies)$`          |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)             | season                    |                                                |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)     | season_type_playoffs      | `^(Regular Season)\|(Pre Season)\|(Playoffs)$` |   `Y`    |          | 
| [_**StatType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StatType)         | stat_type                 |   `^(Traditional)\|(Advanced)\|(Tracking)$`    |   `Y`    |          | 

## Data Sets
#### HomePageStat1 `home_page_stat1`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'PTS']
```

#### HomePageStat2 `home_page_stat2`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'REB']
```

#### HomePageStat3 `home_page_stat3`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'AST']
```

#### HomePageStat4 `home_page_stat4`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'STL']
```

#### HomePageStat5 `home_page_stat5`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'FG_PCT']
```

#### HomePageStat6 `home_page_stat6`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'FT_PCT']
```

#### HomePageStat7 `home_page_stat7`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'FG3_PCT']
```

#### HomePageStat8 `home_page_stat8`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'BLK']
```


## JSON
```json
{
    "data_sets": {
        "HomePageStat1": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "PTS"
        ],
        "HomePageStat2": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "REB"
        ],
        "HomePageStat3": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "AST"
        ],
        "HomePageStat4": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "STL"
        ],
        "HomePageStat5": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "FG_PCT"
        ],
        "HomePageStat6": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "FT_PCT"
        ],
        "HomePageStat7": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "FG3_PCT"
        ],
        "HomePageStat8": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "BLK"
        ]
    },
    "endpoint": "HomePageV2",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "GameScope": "^(Season)|(Last 10)|(Yesterday)|(Finals)$",
        "LeagueID": "^\d{2}$",
        "PlayerOrTeam": "^(Player)|(Team)$",
        "PlayerScope": "^(All Players)|(Rookies)$",
        "Season": null,
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)$",
        "StatType": "^(Traditional)|(Advanced)|(Tracking)$"
    },
    "parameters": [
        "GameScope",
        "LeagueID",
        "PlayerOrTeam",
        "PlayerScope",
        "Season",
        "SeasonType",
        "StatType"
    ],
    "required_parameters": [
        "GameScope",
        "LeagueID",
        "PlayerOrTeam",
        "PlayerScope",
        "Season",
        "SeasonType",
        "StatType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/hustlestatsboxscore.md ---

# HustleStatsBoxScore
##### [nba_api/stats/endpoints/hustlestatsboxscore.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/hustlestatsboxscore.py)

##### Endpoint URL
>[https://stats.nba.com/stats/hustlestatsboxscore](https://stats.nba.com/stats/hustlestatsboxscore)

##### Valid URL
>[https://stats.nba.com/stats/hustlestatsboxscore?GameID=0021700807](https://stats.nba.com/stats/hustlestatsboxscore?GameID=0021700807)

## Parameters
| API Parameter Name                                                                                          | Python Parameter Variable |  Pattern   | Required | Nullable |
|-------------------------------------------------------------------------------------------------------------|---------------------------|:----------:|:--------:|:--------:|
| [_**GameID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameID) | game_id                   | `^\d{10}$` |   `Y`    |          | 

## Data Sets
#### HustleStatsAvailable `hustle_stats_available`
```text
['GAME_ID', 'HUSTLE_STATUS']
```

#### PlayerStats `player_stats`
```text
['GAME_ID', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_CITY', 'PLAYER_ID', 'PLAYER_NAME', 'START_POSITION', 'COMMENT', 'MINUTES', 'PTS', 'CONTESTED_SHOTS', 'CONTESTED_SHOTS_2PT', 'CONTESTED_SHOTS_3PT', 'DEFLECTIONS', 'CHARGES_DRAWN', 'SCREEN_ASSISTS', 'SCREEN_AST_PTS', 'OFF_LOOSE_BALLS_RECOVERED', 'DEF_LOOSE_BALLS_RECOVERED', 'LOOSE_BALLS_RECOVERED', 'OFF_BOXOUTS', 'DEF_BOXOUTS', 'BOX_OUT_PLAYER_TEAM_REBS', 'BOX_OUT_PLAYER_REBS', 'BOX_OUTS']
```

#### TeamStats `team_stats`
```text
['GAME_ID', 'TEAM_ID', 'TEAM_NAME', 'TEAM_ABBREVIATION', 'TEAM_CITY', 'MINUTES', 'PTS', 'CONTESTED_SHOTS', 'CONTESTED_SHOTS_2PT', 'CONTESTED_SHOTS_3PT', 'DEFLECTIONS', 'CHARGES_DRAWN', 'SCREEN_ASSISTS', 'SCREEN_AST_PTS', 'OFF_LOOSE_BALLS_RECOVERED', 'DEF_LOOSE_BALLS_RECOVERED', 'LOOSE_BALLS_RECOVERED', 'OFF_BOXOUTS', 'DEF_BOXOUTS', 'BOX_OUT_PLAYER_TEAM_REBS', 'BOX_OUT_PLAYER_REBS', 'BOX_OUTS']
```


## JSON
```json
{
    "data_sets": {
        "HustleStatsAvailable": [
            "GAME_ID",
            "HUSTLE_STATUS"
        ],
        "PlayerStats": [
            "GAME_ID",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_CITY",
            "PLAYER_ID",
            "PLAYER_NAME",
            "START_POSITION",
            "COMMENT",
            "MINUTES",
            "PTS",
            "CONTESTED_SHOTS",
            "CONTESTED_SHOTS_2PT",
            "CONTESTED_SHOTS_3PT",
            "DEFLECTIONS",
            "CHARGES_DRAWN",
            "SCREEN_ASSISTS",
            "SCREEN_AST_PTS",
            "OFF_LOOSE_BALLS_RECOVERED",
            "DEF_LOOSE_BALLS_RECOVERED",
            "LOOSE_BALLS_RECOVERED",
            "OFF_BOXOUTS",
            "DEF_BOXOUTS",
            "BOX_OUT_PLAYER_TEAM_REBS",
            "BOX_OUT_PLAYER_REBS",
            "BOX_OUTS"
        ],
        "TeamStats": [
            "GAME_ID",
            "TEAM_ID",
            "TEAM_NAME",
            "TEAM_ABBREVIATION",
            "TEAM_CITY",
            "MINUTES",
            "PTS",
            "CONTESTED_SHOTS",
            "CONTESTED_SHOTS_2PT",
            "CONTESTED_SHOTS_3PT",
            "DEFLECTIONS",
            "CHARGES_DRAWN",
            "SCREEN_ASSISTS",
            "SCREEN_AST_PTS",
            "OFF_LOOSE_BALLS_RECOVERED",
            "DEF_LOOSE_BALLS_RECOVERED",
            "LOOSE_BALLS_RECOVERED",
            "OFF_BOXOUTS",
            "DEF_BOXOUTS",
            "BOX_OUT_PLAYER_TEAM_REBS",
            "BOX_OUT_PLAYER_REBS",
            "BOX_OUTS"
        ]
    },
    "endpoint": "HustleStatsBoxScore",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "GameID": "^\d{10}$"
    },
    "parameters": [
        "GameID"
    ],
    "required_parameters": [
        "GameID"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/infographicfanduelplayer.md ---

# InfographicFanDuelPlayer
##### [nba_api/stats/endpoints/infographicfanduelplayer.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/infographicfanduelplayer.py)

##### Endpoint URL
>[https://stats.nba.com/stats/infographicfanduelplayer](https://stats.nba.com/stats/infographicfanduelplayer)

##### Valid URL
>[https://stats.nba.com/stats/infographicfanduelplayer?GameID=0021700807](https://stats.nba.com/stats/infographicfanduelplayer?GameID=0021700807)

## Parameters
| API Parameter Name                                                                                          | Python Parameter Variable |  Pattern   | Required | Nullable |
|-------------------------------------------------------------------------------------------------------------|---------------------------|:----------:|:--------:|:--------:|
| [_**GameID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameID) | game_id                   | `^\d{10}$` |   `Y`    |          | 

## Data Sets
#### FanDuelPlayer `fan_duel_player`
```text
['PLAYER_ID', 'PLAYER_NAME', 'TEAM_ID', 'TEAM_NAME', 'TEAM_ABBREVIATION', 'JERSEY_NUM', 'PLAYER_POSITION', 'LOCATION', 'FAN_DUEL_PTS', 'NBA_FANTASY_PTS', 'USG_PCT', 'MIN', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PTS', 'PLUS_MINUS']
```


## JSON
```json
{
    "data_sets": {
        "FanDuelPlayer": [
            "PLAYER_ID",
            "PLAYER_NAME",
            "TEAM_ID",
            "TEAM_NAME",
            "TEAM_ABBREVIATION",
            "JERSEY_NUM",
            "PLAYER_POSITION",
            "LOCATION",
            "FAN_DUEL_PTS",
            "NBA_FANTASY_PTS",
            "USG_PCT",
            "MIN",
            "FGM",
            "FGA",
            "FG_PCT",
            "FG3M",
            "FG3A",
            "FG3_PCT",
            "FTM",
            "FTA",
            "FT_PCT",
            "OREB",
            "DREB",
            "REB",
            "AST",
            "TOV",
            "STL",
            "BLK",
            "BLKA",
            "PF",
            "PFD",
            "PTS",
            "PLUS_MINUS"
        ]
    },
    "endpoint": "InfographicFanDuelPlayer",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "GameID": "^\d{10}$"
    },
    "parameters": [
        "GameID"
    ],
    "required_parameters": [
        "GameID"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/iststandings.md ---

# ISTStandings
##### [nba_api/stats/endpoints/iststandings.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/idststandings.py)

##### Endpoint URL
>[https://stats.nba.com/stats/iststandings](https://stats.nba.com/stats/iststandings)

##### Valid URL
>[https://stats.nba.com/stats/iststandings?LeagueID=00&Season=2023-24&Section=group](https://stats.nba.com/stats/iststandings?LeagueID=00&Season=2023-24&Section=group)

## Parameters
| API Parameter Name                                                                                              | Python Parameter Variable |         Pattern         |  Required   | Nullable |
|-----------------------------------------------------------------------------------------------------------------|---------------------------|:-----------------------:|:-----------:|:--------:|
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID) | league_id                 |        `^\d{2}$`        |     `Y`     |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)     | season                    |                         |     `Y`     |          |
| [_**Section**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Section)   | section                   | `^(group)\|(wildcard)$` |     `Y`     |          |

## Data Sets
#### Standings `standings`
```text
["leagueId", "seasonYear", "teamId", "teamCity", "teamName", "teamAbbreviation", "teamSlug", "conference", "istGroup", "clinchIndicator", "clinchedIstKnockout", "clinchedIstGroup", "clinchedIstWildcard", "istWildcardRank", "istGroupRank", "istKnockoutRank", "wins", "losses", "pct", "istGroupGb", "istWildcardGb", "diff", "pts", "oppPts", "gameId1", "opponentTeamAbbreviation1", "location1", "gameStatus1", "gameStatusText1", "outcome1", "gameId2", "opponentTeamAbbreviation2", "location2", "gameStatus2", "gameStatusText2", "outcome2", "gameId3", "opponentTeamAbbreviation3", "location3", "gameStatus3", "gameStatusText3", "outcome3", "gameId4", "opponentTeamAbbreviation4", "location4", "gameStatus4", "gameStatusText4", "outcome4"]
```


## JSON
```json
{
    "data_sets": {
        "Standings": [
            "leagueId",
            "seasonYear",
            "teamId",
            "teamCity",
            "teamName",
            "teamAbbreviation",
            "teamSlug",
            "conference",
            "istGroup",
            "clinchIndicator",
            "clinchedIstKnockout",
            "clinchedIstGroup",
            "clinchedIstWildcard",
            "istWildcardRank",
            "istGroupRank",
            "istKnockoutRank",
            "wins",
            "losses",
            "pct",
            "istGroupGb",
            "istWildcardGb",
            "diff",
            "pts",
            "oppPts",
            "gameId1",
            "opponentTeamAbbreviation1",
            "location1",
            "gameStatus1",
            "gameStatusText1",
            "outcome1",
            "gameId2",
            "opponentTeamAbbreviation2",
            "location2",
            "gameStatus2",
            "gameStatusText2",
            "outcome2",
            "gameId3",
            "opponentTeamAbbreviation3",
            "location3",
            "gameStatus3",
            "gameStatusText3",
            "outcome3",
            "gameId4",
            "opponentTeamAbbreviation4",
            "location4",
            "gameStatus4",
            "gameStatusText4",
            "outcome4"
        ]
    },
    "endpoint": "ISTStandings",
    "last_validated_date": "2023-11-08",
    "nullable_parameters": [
    ],
    "parameter_patterns": {
        "LeagueID": "^\d{2}$",
        "Season": "^\d{4}-\d{2}$",
        "Section": "^(group)|(wildcard)$"
    },
    "parameters": [
        "LeagueID",
        "Season",
        "Section"
    ],
    "required_parameters": [
        "LeagueID",
        "Season",
        "Section"
    ],
    "status": "success"
}
```

Last validated 2023-11-08

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaderstiles.md ---

# LeadersTiles
##### [nba_api/stats/endpoints/leaderstiles.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaderstiles.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaderstiles](https://stats.nba.com/stats/leaderstiles)

##### Valid URL
>[https://stats.nba.com/stats/leaderstiles?GameScope=Season&LeagueID=00&PlayerOrTeam=Team&PlayerScope=All+Players&Season=2019-20&SeasonType=Regular+Season&Stat=PTS](https://stats.nba.com/stats/leaderstiles?GameScope=Season&LeagueID=00&PlayerOrTeam=Team&PlayerScope=All+Players&Season=2019-20&SeasonType=Regular+Season&Stat=PTS)

## Parameters
| API Parameter Name                                                                                                      | Python Parameter Variable |                               Pattern                                | Required | Nullable |
|-------------------------------------------------------------------------------------------------------------------------|---------------------------|:--------------------------------------------------------------------:|:--------:|:--------:|
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)       | game_scope_detailed       |            `^(Season)\|(Last 10)\|(Yesterday)\|(Finals)$`            |   `Y`    |          | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)         | league_id                 |                              `^\d{2}$`                               |   `Y`    |          | 
| [_**PlayerOrTeam**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerOrTeam) | player_or_team            |                         `^(Player)\|(Team)$`                         |   `Y`    |          | 
| [_**PlayerScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerScope)   | player_scope              |                     `^(All Players)\|(Rookies)$`                     |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)             | season                    |                                                                      |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)     | season_type_playoffs      |            `^(Regular Season)\|(Pre Season)\|(Playoffs)$`            |   `Y`    |          | 
| [_**Stat**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Stat)                 | stat                      | `^(PTS)\|(REB)\|(AST)\|(FG_PCT)\|(FT_PCT)\|(FG3_PCT)\|(STL)\|(BLK)$` |   `Y`    |          | 

## Data Sets
#### AllTimeSeasonHigh `all_time_season_high`
```text
['TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'SEASON_YEAR', 'PTS']
```

#### LastSeasonHigh `last_season_high`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'PTS']
```

#### LeadersTiles `leaders_tiles`
```text
['RANK', 'TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'PTS']
```

#### LowSeasonHigh `low_season_high`
```text
['TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'SEASON_YEAR', 'PTS']
```


## JSON
```json
{
    "data_sets": {
        "AllTimeSeasonHigh": [
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "SEASON_YEAR",
            "PTS"
        ],
        "LastSeasonHigh": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "PTS"
        ],
        "LeadersTiles": [
            "RANK",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "PTS"
        ],
        "LowSeasonHigh": [
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "SEASON_YEAR",
            "PTS"
        ]
    },
    "endpoint": "LeadersTiles",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [],
    "parameter_patterns": {
        "GameScope": "^(Season)|(Last 10)|(Yesterday)|(Finals)$",
        "LeagueID": "^\d{2}$",
        "PlayerOrTeam": "^(Player)|(Team)$",
        "PlayerScope": "^(All Players)|(Rookies)$",
        "Season": null,
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)$",
        "Stat": "^(PTS)|(REB)|(AST)|(FG_PCT)|(FT_PCT)|(FG3_PCT)|(STL)|(BLK)$"
    },
    "parameters": [
        "GameScope",
        "LeagueID",
        "PlayerOrTeam",
        "PlayerScope",
        "Season",
        "SeasonType",
        "Stat"
    ],
    "required_parameters": [
        "GameScope",
        "LeagueID",
        "PlayerOrTeam",
        "PlayerScope",
        "Season",
        "SeasonType",
        "Stat"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashlineups.md ---

# LeagueDashLineups
##### [nba_api/stats/endpoints/leaguedashlineups.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashlineups.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashlineups](https://stats.nba.com/stats/leaguedashlineups)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashlineups?Conference=&DateFrom=&DateTo=&Division=&GameSegment=&GroupQuantity=5&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlusMinus=N&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&TeamID=&VsConference=&VsDivision=](https://stats.nba.com/stats/leaguedashlineups?Conference=&DateFrom=&DateTo=&Division=&GameSegment=&GroupQuantity=5&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlusMinus=N&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&TeamID=&VsConference=&VsDivision=)

## Parameters
| API Parameter Name                                                                                                          | Python Parameter Variable     |                                                                    Pattern                                                                    | Required | Nullable |
|-----------------------------------------------------------------------------------------------------------------------------|-------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**GroupQuantity**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GroupQuantity)   | group_quantity                |                                                                                                                                               |   `Y`    |          | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)         | last_n_games                  |                                                                                                                                               |   `Y`    |          | 
| [_**MeasureType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#MeasureType)       | measure_type_detailed_defense |                           `^(Base)\|(Advanced)\|(Misc)\|(Four Factors)\|(Scoring)\|(Opponent)\|(Usage)\|(Defense)$`                           |   `Y`    |          | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                   | month                         |                                                                                                                                               |   `Y`    |          | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID) | opponent_team_id              |                                                                                                                                               |   `Y`    |          | 
| [_**PaceAdjust**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PaceAdjust)         | pace_adjust                   |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)               | per_mode_detailed             | `^(Totals)\|(PerGame)\|(MinutesPer)\|(Per48)\|(Per40)\|(Per36)\|(PerMinute)\|(PerPossession)\|(PerPlay)\|(Per100Possessions)\|(Per100Plays)$` |   `Y`    |          | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                 | period                        |                                                                                                                                               |   `Y`    |          | 
| [_**PlusMinus**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlusMinus)           | plus_minus                    |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Rank**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Rank)                     | rank                          |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                 | season                        |                                                                                                                                               |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)         | season_type_all_star          |                                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                           |   `Y`    |          | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)         | vs_division_nullable          |                        `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`                         |   `Y`    |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)     | vs_conference_nullable        |                                                             `^((East)\|(West))?$`                                                             |   `Y`    |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                 | team_id_nullable              |                                                                                                                                               |          |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange) | shot_clock_range_nullable     |                 `((24-22)\|(22-18 Very Early)\|(18-15 Early)\|(15-7 Average)\|(7-4 Late)\|(4-0 Very Late)\|(ShotClock Off))?`                 |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)   | season_segment_nullable       |                                                    `^((Post All-Star)\|(Pre All-Star))?$`                                                     |   `Y`    |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)               | po_round_nullable             |                                                                                                                                               |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)               | outcome_nullable              |                                                                `^((W)\|(L))?$`                                                                |   `Y`    |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)             | location_nullable             |                                                             `^((Home)\|(Road))?$`                                                             |   `Y`    |   `Y`    | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)             | league_id_nullable            |                                                                                                                                               |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)       | game_segment_nullable         |                                                `^((First Half)\|(Overtime)\|(Second Half))?$`                                                 |   `Y`    |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)             | division_simple_nullable      |                                 `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                                  |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                 | date_to_nullable              |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)             | date_from_nullable            |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)         | conference_nullable           |                                                              `((East)\|(West))?`                                                              |          |   `Y`    | 

## Data Sets
#### Lineups `lineups`
```text
['GROUP_SET', 'GROUP_ID', 'GROUP_NAME', 'TEAM_ID', 'TEAM_ABBREVIATION', 'GP', 'W', 'L', 'W_PCT', 'MIN', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PTS', 'PLUS_MINUS', 'GP_RANK', 'W_RANK', 'L_RANK', 'W_PCT_RANK', 'MIN_RANK', 'FGM_RANK', 'FGA_RANK', 'FG_PCT_RANK', 'FG3M_RANK', 'FG3A_RANK', 'FG3_PCT_RANK', 'FTM_RANK', 'FTA_RANK', 'FT_PCT_RANK', 'OREB_RANK', 'DREB_RANK', 'REB_RANK', 'AST_RANK', 'TOV_RANK', 'STL_RANK', 'BLK_RANK', 'BLKA_RANK', 'PF_RANK', 'PFD_RANK', 'PTS_RANK', 'PLUS_MINUS_RANK']
```


## JSON
```json
{
    "data_sets": {
        "Lineups": [
            "GROUP_SET",
            "GROUP_ID",
            "GROUP_NAME",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "GP",
            "W",
            "L",
            "W_PCT",
            "MIN",
            "FGM",
            "FGA",
            "FG_PCT",
            "FG3M",
            "FG3A",
            "FG3_PCT",
            "FTM",
            "FTA",
            "FT_PCT",
            "OREB",
            "DREB",
            "REB",
            "AST",
            "TOV",
            "STL",
            "BLK",
            "BLKA",
            "PF",
            "PFD",
            "PTS",
            "PLUS_MINUS",
            "GP_RANK",
            "W_RANK",
            "L_RANK",
            "W_PCT_RANK",
            "MIN_RANK",
            "FGM_RANK",
            "FGA_RANK",
            "FG_PCT_RANK",
            "FG3M_RANK",
            "FG3A_RANK",
            "FG3_PCT_RANK",
            "FTM_RANK",
            "FTA_RANK",
            "FT_PCT_RANK",
            "OREB_RANK",
            "DREB_RANK",
            "REB_RANK",
            "AST_RANK",
            "TOV_RANK",
            "STL_RANK",
            "BLK_RANK",
            "BLKA_RANK",
            "PF_RANK",
            "PFD_RANK",
            "PTS_RANK",
            "PLUS_MINUS_RANK"
        ]
    },
    "endpoint": "LeagueDashLineups",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "GameSegment",
        "LeagueID",
        "Location",
        "Outcome",
        "PORound",
        "SeasonSegment",
        "ShotClockRange",
        "TeamID",
        "VsConference",
        "VsDivision"
    ],
    "parameter_patterns": {
        "Conference": "((East)|(West))?",
        "DateFrom": null,
        "DateTo": null,
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "GroupQuantity": null,
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "MeasureType": "^(Base)|(Advanced)|(Misc)|(Four Factors)|(Scoring)|(Opponent)|(Usage)|(Defense)$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PaceAdjust": "^(Y)|(N)$",
        "PerMode": "^(Totals)|(PerGame)|(MinutesPer)|(Per48)|(Per40)|(Per36)|(PerMinute)|(PerPossession)|(PerPlay)|(Per100Possessions)|(Per100Plays)$",
        "Period": null,
        "PlusMinus": "^(Y)|(N)$",
        "Rank": "^(Y)|(N)$",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": "((24-22)|(22-18 Very Early)|(18-15 Early)|(15-7 Average)|(7-4 Late)|(4-0 Very Late)|(ShotClock Off))?",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$"
    },
    "parameters": [
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "GameSegment",
        "GroupQuantity",
        "LastNGames",
        "LeagueID",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlusMinus",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "TeamID",
        "VsConference",
        "VsDivision"
    ],
    "required_parameters": [
        "DateFrom",
        "DateTo",
        "GameSegment",
        "GroupQuantity",
        "LastNGames",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlusMinus",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "VsConference",
        "VsDivision"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashoppptshot.md ---

# LeagueDashOppPtShot
##### [nba_api/stats/endpoints/leaguedashoppptshot.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashoppptshot.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashoppptshot](https://stats.nba.com/stats/leaguedashoppptshot)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashoppptshot?CloseDefDistRange=&Conference=&DateFrom=&DateTo=&Division=&DribbleRange=&GameSegment=&GeneralRange=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&ShotDistRange=&TeamID=&TouchTimeRange=&VsConference=&VsDivision=](https://stats.nba.com/stats/leaguedashoppptshot?CloseDefDistRange=&Conference=&DateFrom=&DateTo=&Division=&DribbleRange=&GameSegment=&GeneralRange=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&ShotDistRange=&TeamID=&TouchTimeRange=&VsConference=&VsDivision=)

## Parameters
| API Parameter Name                                                                                                                | Python Parameter Variable     |                                            Pattern                                             | Required | Nullable |
|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------|:----------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                   | league_id                     |                                           `^\d{2}$`                                            |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                     | per_mode_simple               |                                    `^(Totals)\|(PerGame)$`                                     |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                       | season                        |                                                                                                |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)               | season_type_all_star          |                   `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                   |   `Y`    |          | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)               | vs_division_nullable          | `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$` |          |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)           | vs_conference_nullable        |                                     `^((East)\|(West))?$`                                      |          |   `Y`    | 
| [_**TouchTimeRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TouchTimeRange)       | touch_time_range_nullable     |                                                                                                |          |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                       | team_id_nullable              |                                                                                                |          |   `Y`    | 
| [_**ShotDistRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotDistRange)         | shot_dist_range_nullable      |                                                                                                |          |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)       | shot_clock_range_nullable     |                                                                                                |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)         | season_segment_nullable       |                             `^((Post All-Star)\|(Pre All-Star))?$`                             |          |   `Y`    | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                       | period_nullable               |                                                                                                |          |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                     | po_round_nullable             |                                                                                                |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                     | outcome_nullable              |                                        `^((W)\|(L))?$`                                         |          |   `Y`    | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)       | opponent_team_id_nullable     |                                                                                                |          |   `Y`    | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                         | month_nullable                |                                                                                                |          |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                   | location_nullable             |                                     `^((Home)\|(Road))?$`                                      |          |   `Y`    | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)               | last_n_games_nullable         |                                                                                                |          |   `Y`    | 
| [_**GeneralRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GeneralRange)           | general_range_nullable        |                                                                                                |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)             | game_segment_nullable         |                         `^((First Half)\|(Overtime)\|(Second Half))?$`                         |          |   `Y`    | 
| [_**DribbleRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DribbleRange)           | dribble_range_nullable        |                                                                                                |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                   | division_nullable             | `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$` |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                       | date_to_nullable              |                                                                                                |          |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                   | date_from_nullable            |                                                                                                |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)               | conference_nullable           |                                     `^((East)\|(West))?$`                                      |          |   `Y`    | 
| [_**CloseDefDistRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#CloseDefDistRange) | close_def_dist_range_nullable |                                                                                                |          |   `Y`    | 

## Data Sets
#### LeagueDashPTShots `league_dash_ptshots`
```text
['TEAM_ID', 'TEAM_NAME', 'TEAM_ABBREVIATION', 'GP', 'G', 'FGA_FREQUENCY', 'FGM', 'FGA', 'FG_PCT', 'EFG_PCT', 'FG2A_FREQUENCY', 'FG2M', 'FG2A', 'FG2_PCT', 'FG3A_FREQUENCY', 'FG3M', 'FG3A', 'FG3_PCT']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPTShots": [
            "TEAM_ID",
            "TEAM_NAME",
            "TEAM_ABBREVIATION",
            "GP",
            "G",
            "FGA_FREQUENCY",
            "FGM",
            "FGA",
            "FG_PCT",
            "EFG_PCT",
            "FG2A_FREQUENCY",
            "FG2M",
            "FG2A",
            "FG2_PCT",
            "FG3A_FREQUENCY",
            "FG3M",
            "FG3A",
            "FG3_PCT"
        ]
    },
    "endpoint": "LeagueDashOppPtShot",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "CloseDefDistRange",
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "DribbleRange",
        "GameSegment",
        "GeneralRange",
        "LastNGames",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "Period",
        "SeasonSegment",
        "ShotClockRange",
        "ShotDistRange",
        "TeamID",
        "TouchTimeRange",
        "VsConference",
        "VsDivision"
    ],
    "parameter_patterns": {
        "CloseDefDistRange": null,
        "Conference": "^((East)|(West))?$",
        "DateFrom": null,
        "DateTo": null,
        "Division": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "DribbleRange": null,
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "GeneralRange": null,
        "LastNGames": null,
        "LeagueID": "^\d{2}$",
        "Location": "^((Home)|(Road))?$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PerMode": "^(Totals)|(PerGame)$",
        "Period": null,
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": null,
        "ShotDistRange": null,
        "TeamID": null,
        "TouchTimeRange": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$"
    },
    "parameters": [
        "CloseDefDistRange",
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "DribbleRange",
        "GameSegment",
        "GeneralRange",
        "LastNGames",
        "LeagueID",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PerMode",
        "Period",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "ShotDistRange",
        "TeamID",
        "TouchTimeRange",
        "VsConference",
        "VsDivision"
    ],
    "required_parameters": [
        "LeagueID",
        "PerMode",
        "Season",
        "SeasonType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashplayerbiostats.md ---

# LeagueDashPlayerBioStats
##### [nba_api/stats/endpoints/leaguedashplayerbiostats.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashplayerbiostats.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashplayerbiostats](https://stats.nba.com/stats/leaguedashplayerbiostats)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashplayerbiostats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&PlayerExperience=&PlayerPosition=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashplayerbiostats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&PlayerExperience=&PlayerPosition=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable             |                                                    Pattern                                                    | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|:-------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id                             |                                                                                                               |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_simple                       |                                            `^(Totals)\|(PerGame)$`                                            |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                                |                                                                                                               |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star                  |                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                           |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                     | weight_nullable                       |                                                                                                               |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable                  |        `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`         |          |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable                |                                             `^((East)\|(West))?$`                                             |          |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable                      |                                                                                                               |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable                |                                           `((Starters)\|(Bench))?`                                            |          |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)     | shot_clock_range_nullable             | `((24-22)\|(22-18 Very Early)\|(18-15 Early)\|(15-7 Average)\|(7-4 Late)\|(4-0 Very Late)\|(ShotClock Off))?` |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable               |                                    `^((Post All-Star)\|(Pre All-Star))?$`                                     |          |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_abbreviation_nullable |                                `((F)\|(C)\|(G)\|(C-F)\|(F-C)\|(F-G)\|(G-F))?`                                 |          |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable            |                                     `((Rookie)\|(Sophomore)\|(Veteran))?`                                     |          |   `Y`    | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                     | period_nullable                       |                                                                                                               |          |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable                     |                                                                                                               |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable                      |                                                `^((W)\|(L))?$`                                                |          |   `Y`    | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id_nullable             |                                                                                                               |          |   `Y`    | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month_nullable                        |                                                                                                               |          |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable                     |                                             `^((Home)\|(Road))?$`                                             |          |   `Y`    | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games_nullable                 |                                                                                                               |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                     | height_nullable                       |                                                                                                               |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)           | game_segment_nullable                 |                                `^((First Half)\|(Overtime)\|(Second Half))?$`                                 |          |   `Y`    | 
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)               | game_scope_simple_nullable            |                                          `((Yesterday)\|(Last 10))?`                                          |          |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)               | draft_year_nullable                   |                                                                                                               |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)               | draft_pick_nullable                   |                                                                                                               |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_simple_nullable              |                 `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                  |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable                      |                                                                                                               |          |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable                    |                                                                                                               |          |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                   | country_nullable                      |                                                                                                               |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable                   |                                              `((East)\|(West))?`                                              |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                   | college_nullable                      |                                                                                                               |          |   `Y`    | 

## Data Sets
#### LeagueDashPlayerBioStats `league_dash_player_bio_stats`
```text
['PLAYER_ID', 'PLAYER_NAME', 'TEAM_ID', 'TEAM_ABBREVIATION', 'AGE', 'PLAYER_HEIGHT', 'PLAYER_HEIGHT_INCHES', 'PLAYER_WEIGHT', 'COLLEGE', 'COUNTRY', 'DRAFT_YEAR', 'DRAFT_ROUND', 'DRAFT_NUMBER', 'GP', 'PTS', 'REB', 'AST', 'NET_RATING', 'OREB_PCT', 'DREB_PCT', 'USG_PCT', 'TS_PCT', 'AST_PCT']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPlayerBioStats": [
            "PLAYER_ID",
            "PLAYER_NAME",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "AGE",
            "PLAYER_HEIGHT",
            "PLAYER_HEIGHT_INCHES",
            "PLAYER_WEIGHT",
            "COLLEGE",
            "COUNTRY",
            "DRAFT_YEAR",
            "DRAFT_ROUND",
            "DRAFT_NUMBER",
            "GP",
            "PTS",
            "REB",
            "AST",
            "NET_RATING",
            "OREB_PCT",
            "DREB_PCT",
            "USG_PCT",
            "TS_PCT",
            "AST_PCT"
        ]
    },
    "endpoint": "LeagueDashPlayerBioStats",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LastNGames",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "College": null,
        "Conference": "((East)|(West))?",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "DraftPick": null,
        "DraftYear": null,
        "GameScope": "((Yesterday)|(Last 10))?",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "Height": null,
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PerMode": "^(Totals)|(PerGame)$",
        "Period": null,
        "PlayerExperience": "((Rookie)|(Sophomore)|(Veteran))?",
        "PlayerPosition": "((F)|(C)|(G)|(C-F)|(F-C)|(F-G)|(G-F))?",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": "((24-22)|(22-18 Very Early)|(18-15 Early)|(15-7 Average)|(7-4 Late)|(4-0 Very Late)|(ShotClock Off))?",
        "StarterBench": "((Starters)|(Bench))?",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "LeagueID",
        "PerMode",
        "Season",
        "SeasonType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashplayerclutch.md ---

# LeagueDashPlayerClutch
##### [nba_api/stats/endpoints/leaguedashplayerclutch.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashplayerclutch.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashplayerclutch](https://stats.nba.com/stats/leaguedashplayerclutch)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashplayerclutch?AheadBehind=Ahead+or+Behind&ClutchTime=Last+5+Minutes&College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&PointDiff=5&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashplayerclutch?AheadBehind=Ahead+or+Behind&ClutchTime=Last+5+Minutes&College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&PointDiff=5&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable             |                                                                    Pattern                                                                    | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**AheadBehind**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#AheadBehind)           | ahead_behind                          |                                          `^((Ahead or Behind)\|(Behind or Tied)\|(Ahead or Tied))?$`                                          |   `Y`    |          | 
| [_**ClutchTime**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ClutchTime)             | clutch_time                           |     `^((Last 5 Minutes)\|(Last 4 Minutes)\|(Last 3 Minutes)\|(Last 2 Minutes)\|(Last 1 Minute)\|(Last 30 Seconds)\|(Last 10 Seconds))?$`      |   `Y`    |          | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games                          |                                                                                                                                               |   `Y`    |          | 
| [_**MeasureType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#MeasureType)           | measure_type_detailed_defense         |                           `^(Base)\|(Advanced)\|(Misc)\|(Four Factors)\|(Scoring)\|(Opponent)\|(Usage)\|(Defense)$`                           |   `Y`    |          | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month                                 |                                                                                                                                               |   `Y`    |          | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id                      |                                                                                                                                               |   `Y`    |          | 
| [_**PaceAdjust**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PaceAdjust)             | pace_adjust                           |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_detailed                     | `^(Totals)\|(PerGame)\|(MinutesPer)\|(Per48)\|(Per40)\|(Per36)\|(PerMinute)\|(PerPossession)\|(PerPlay)\|(Per100Possessions)\|(Per100Plays)$` |   `Y`    |          | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                     | period                                |                                                                                                                                               |   `Y`    |          | 
| [_**PlusMinus**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlusMinus)               | plus_minus                            |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PointDiff**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PointDiff)               | point_diff                            |                                                                                                                                               |   `Y`    |          | 
| [_**Rank**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Rank)                         | rank                                  |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                                |                                                                                                                                               |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star                  |                                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                           |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                     | weight_nullable                       |                                                                                                                                               |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable                  |                        `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`                         |   `Y`    |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable                |                                                             `^((East)\|(West))?$`                                                             |   `Y`    |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable                |                                                           `((Starters)\|(Bench))?`                                                            |   `Y`    |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)     | shot_clock_range_nullable             |                 `((24-22)\|(22-18 Very Early)\|(18-15 Early)\|(15-7 Average)\|(7-4 Late)\|(4-0 Very Late)\|(ShotClock Off))?`                 |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable               |                                                    `^((Post All-Star)\|(Pre All-Star))?$`                                                     |   `Y`    |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_abbreviation_nullable |                                                `((F)\|(C)\|(G)\|(C-F)\|(F-C)\|(F-G)\|(G-F))?`                                                 |   `Y`    |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable            |                                                     `((Rookie)\|(Sophomore)\|(Veteran))?`                                                     |   `Y`    |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable                     |                                                                                                                                               |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable                      |                                                                `^((W)\|(L))?$`                                                                |   `Y`    |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable                     |                                                             `^((Home)\|(Road))?$`                                                             |   `Y`    |   `Y`    | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id_nullable                    |                                                                                                                                               |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                     | height_nullable                       |                                                                                                                                               |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)           | game_segment_nullable                 |                                                `^((First Half)\|(Overtime)\|(Second Half))?$`                                                 |   `Y`    |   `Y`    | 
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)               | game_scope_simple_nullable            |                                                          `((Yesterday)\|(Last 10))?`                                                          |   `Y`    |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)               | draft_year_nullable                   |                                                                                                                                               |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)               | draft_pick_nullable                   |                                                                                                                                               |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_simple_nullable              |                                 `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                                  |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable                      |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable                    |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                   | country_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable                   |                                                              `((East)\|(West))?`                                                              |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                   | college_nullable                      |                                                                                                                                               |          |   `Y`    | 

## Data Sets
#### LeagueDashPlayerClutch `league_dash_player_clutch`
```text
['GROUP_SET', 'PLAYER_ID', 'PLAYER_NAME', 'TEAM_ID', 'TEAM_ABBREVIATION', 'AGE', 'GP', 'W', 'L', 'W_PCT', 'MIN', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PTS', 'PLUS_MINUS', 'NBA_FANTASY_PTS', 'DD2', 'TD3', 'GP_RANK', 'W_RANK', 'L_RANK', 'W_PCT_RANK', 'MIN_RANK', 'FGM_RANK', 'FGA_RANK', 'FG_PCT_RANK', 'FG3M_RANK', 'FG3A_RANK', 'FG3_PCT_RANK', 'FTM_RANK', 'FTA_RANK', 'FT_PCT_RANK', 'OREB_RANK', 'DREB_RANK', 'REB_RANK', 'AST_RANK', 'TOV_RANK', 'STL_RANK', 'BLK_RANK', 'BLKA_RANK', 'PF_RANK', 'PFD_RANK', 'PTS_RANK', 'PLUS_MINUS_RANK', 'NBA_FANTASY_PTS_RANK', 'DD2_RANK', 'TD3_RANK', 'CFID', 'CFPARAMS']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPlayerClutch": [
            "GROUP_SET",
            "PLAYER_ID",
            "PLAYER_NAME",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "AGE",
            "GP",
            "W",
            "L",
            "W_PCT",
            "MIN",
            "FGM",
            "FGA",
            "FG_PCT",
            "FG3M",
            "FG3A",
            "FG3_PCT",
            "FTM",
            "FTA",
            "FT_PCT",
            "OREB",
            "DREB",
            "REB",
            "AST",
            "TOV",
            "STL",
            "BLK",
            "BLKA",
            "PF",
            "PFD",
            "PTS",
            "PLUS_MINUS",
            "NBA_FANTASY_PTS",
            "DD2",
            "TD3",
            "GP_RANK",
            "W_RANK",
            "L_RANK",
            "W_PCT_RANK",
            "MIN_RANK",
            "FGM_RANK",
            "FGA_RANK",
            "FG_PCT_RANK",
            "FG3M_RANK",
            "FG3A_RANK",
            "FG3_PCT_RANK",
            "FTM_RANK",
            "FTA_RANK",
            "FT_PCT_RANK",
            "OREB_RANK",
            "DREB_RANK",
            "REB_RANK",
            "AST_RANK",
            "TOV_RANK",
            "STL_RANK",
            "BLK_RANK",
            "BLKA_RANK",
            "PF_RANK",
            "PFD_RANK",
            "PTS_RANK",
            "PLUS_MINUS_RANK",
            "NBA_FANTASY_PTS_RANK",
            "DD2_RANK",
            "TD3_RANK",
            "CFID",
            "CFPARAMS"
        ]
    },
    "endpoint": "LeagueDashPlayerClutch",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LeagueID",
        "Location",
        "Outcome",
        "PORound",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "AheadBehind": "^((Ahead or Behind)|(Behind or Tied)|(Ahead or Tied))?$",
        "ClutchTime": "^((Last 5 Minutes)|(Last 4 Minutes)|(Last 3 Minutes)|(Last 2 Minutes)|(Last 1 Minute)|(Last 30 Seconds)|(Last 10 Seconds))?$",
        "College": null,
        "Conference": "((East)|(West))?",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "DraftPick": null,
        "DraftYear": null,
        "GameScope": "((Yesterday)|(Last 10))?",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "Height": null,
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "MeasureType": "^(Base)|(Advanced)|(Misc)|(Four Factors)|(Scoring)|(Opponent)|(Usage)|(Defense)$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PaceAdjust": "^(Y)|(N)$",
        "PerMode": "^(Totals)|(PerGame)|(MinutesPer)|(Per48)|(Per40)|(Per36)|(PerMinute)|(PerPossession)|(PerPlay)|(Per100Possessions)|(Per100Plays)$",
        "Period": null,
        "PlayerExperience": "((Rookie)|(Sophomore)|(Veteran))?",
        "PlayerPosition": "((F)|(C)|(G)|(C-F)|(F-C)|(F-G)|(G-F))?",
        "PlusMinus": "^(Y)|(N)$",
        "PointDiff": null,
        "Rank": "^(Y)|(N)$",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": "((24-22)|(22-18 Very Early)|(18-15 Early)|(15-7 Average)|(7-4 Late)|(4-0 Very Late)|(ShotClock Off))?",
        "StarterBench": "((Starters)|(Bench))?",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "AheadBehind",
        "ClutchTime",
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "PointDiff",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "AheadBehind",
        "ClutchTime",
        "DateFrom",
        "DateTo",
        "GameScope",
        "GameSegment",
        "LastNGames",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "PointDiff",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "VsConference",
        "VsDivision"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashplayerptshot.md ---

# LeagueDashPlayerPtShot
##### [nba_api/stats/endpoints/leaguedashplayerptshot.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashplayerptshot.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashplayerptshot](https://stats.nba.com/stats/leaguedashplayerptshot)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashplayerptshot?CloseDefDistRange=&College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&DribbleRange=&GameSegment=&GeneralRange=&Height=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&PlayerExperience=&PlayerPosition=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&ShotDistRange=&StarterBench=&TeamID=&TouchTimeRange=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashplayerptshot?CloseDefDistRange=&College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&DribbleRange=&GameSegment=&GeneralRange=&Height=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&PlayerExperience=&PlayerPosition=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&ShotDistRange=&StarterBench=&TeamID=&TouchTimeRange=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                                | Python Parameter Variable     |                                            Pattern                                             | Required | Nullable |
|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------|:----------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                   | league_id                     |                                           `^\d{2}$`                                            |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                     | per_mode_simple               |                                    `^(Totals)\|(PerGame)$`                                     |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                       | season                        |                                                                                                |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)               | season_type_all_star          |                   `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                   |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                       | weight_nullable               |                                                                                                |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)               | vs_division_nullable          | `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$` |          |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)           | vs_conference_nullable        |                                     `^((East)\|(West))?$`                                      |          |   `Y`    | 
| [_**TouchTimeRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TouchTimeRange)       | touch_time_range_nullable     |                                                                                                |          |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                       | team_id_nullable              |                                                                                                |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)           | starter_bench_nullable        |                                                                                                |          |   `Y`    | 
| [_**ShotDistRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotDistRange)         | shot_dist_range_nullable      |                                                                                                |          |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)       | shot_clock_range_nullable     |                                                                                                |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)         | season_segment_nullable       |                             `^((Post All-Star)\|(Pre All-Star))?$`                             |          |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)       | player_position_nullable      |                                                                                                |          |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience)   | player_experience_nullable    |                                                                                                |          |   `Y`    | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                       | period_nullable               |                                                                                                |          |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                     | po_round_nullable             |                                                                                                |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                     | outcome_nullable              |                                        `^((W)\|(L))?$`                                         |          |   `Y`    | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)       | opponent_team_id_nullable     |                                                                                                |          |   `Y`    | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                         | month_nullable                |                                                                                                |          |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                   | location_nullable             |                                     `^((Home)\|(Road))?$`                                      |          |   `Y`    | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)               | last_n_games_nullable         |                                                                                                |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                       | height_nullable               |                                                                                                |          |   `Y`    | 
| [_**GeneralRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GeneralRange)           | general_range_nullable        |                                                                                                |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)             | game_segment_nullable         |                         `^((First Half)\|(Overtime)\|(Second Half))?$`                         |          |   `Y`    | 
| [_**DribbleRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DribbleRange)           | dribble_range_nullable        |                                                                                                |          |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)                 | draft_year_nullable           |                                                                                                |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)                 | draft_pick_nullable           |                                                                                                |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                   | division_nullable             | `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$` |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                       | date_to_nullable              |                                                                                                |          |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                   | date_from_nullable            |                                                                                                |          |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                     | country_nullable              |                                                                                                |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)               | conference_nullable           |                                     `^((East)\|(West))?$`                                      |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                     | college_nullable              |                                                                                                |          |   `Y`    | 
| [_**CloseDefDistRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#CloseDefDistRange) | close_def_dist_range_nullable |                                                                                                |          |   `Y`    | 

## Data Sets
#### LeagueDashPTShots `league_dash_ptshots`
```text
['PLAYER_ID', 'PLAYER_NAME', 'PLAYER_LAST_TEAM_ID', 'PLAYER_LAST_TEAM_ABBREVIATION', 'AGE', 'GP', 'G', 'FGA_FREQUENCY', 'FGM', 'FGA', 'FG_PCT', 'EFG_PCT', 'FG2A_FREQUENCY', 'FG2M', 'FG2A', 'FG2_PCT', 'FG3A_FREQUENCY', 'FG3M', 'FG3A', 'FG3_PCT']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPTShots": [
            "PLAYER_ID",
            "PLAYER_NAME",
            "PLAYER_LAST_TEAM_ID",
            "PLAYER_LAST_TEAM_ABBREVIATION",
            "AGE",
            "GP",
            "G",
            "FGA_FREQUENCY",
            "FGM",
            "FGA",
            "FG_PCT",
            "EFG_PCT",
            "FG2A_FREQUENCY",
            "FG2M",
            "FG2A",
            "FG2_PCT",
            "FG3A_FREQUENCY",
            "FG3M",
            "FG3A",
            "FG3_PCT"
        ]
    },
    "endpoint": "LeagueDashPlayerPtShot",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "CloseDefDistRange",
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "DribbleRange",
        "GameSegment",
        "GeneralRange",
        "Height",
        "LastNGames",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "ShotClockRange",
        "ShotDistRange",
        "StarterBench",
        "TeamID",
        "TouchTimeRange",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "CloseDefDistRange": null,
        "College": null,
        "Conference": "^((East)|(West))?$",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "Division": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "DraftPick": null,
        "DraftYear": null,
        "DribbleRange": null,
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "GeneralRange": null,
        "Height": null,
        "LastNGames": null,
        "LeagueID": "^\d{2}$",
        "Location": "^((Home)|(Road))?$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PerMode": "^(Totals)|(PerGame)$",
        "Period": null,
        "PlayerExperience": null,
        "PlayerPosition": null,
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": null,
        "ShotDistRange": null,
        "StarterBench": null,
        "TeamID": null,
        "TouchTimeRange": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "CloseDefDistRange",
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "DribbleRange",
        "GameSegment",
        "GeneralRange",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "ShotDistRange",
        "StarterBench",
        "TeamID",
        "TouchTimeRange",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "LeagueID",
        "PerMode",
        "Season",
        "SeasonType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashplayershotlocations.md ---

# LeagueDashPlayerShotLocations
##### [nba_api/stats/endpoints/leaguedashplayershotlocations.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashplayershotlocations.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashplayershotlocations](https://stats.nba.com/stats/leaguedashplayershotlocations)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashplayershotlocations?College=&Conference=&Country=&DateFrom=&DateTo=&DistanceRange=By+Zone&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashplayershotlocations?College=&Conference=&Country=&DateFrom=&DateTo=&DistanceRange=By+Zone&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable             |                                                                    Pattern                                                                    | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**DistanceRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DistanceRange)       | distance_range                        |                                                    `^(5ft Range)\|(8ft Range)\|(By Zone)$`                                                    |   `Y`    |          | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games                          |                                                                                                                                               |   `Y`    |          | 
| [_**MeasureType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#MeasureType)           | measure_type_simple                   |                                                            `^(Base)\|(Opponent)$`                                                             |   `Y`    |          | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month                                 |                                                                                                                                               |   `Y`    |          | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id                      |                                                                                                                                               |   `Y`    |          | 
| [_**PaceAdjust**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PaceAdjust)             | pace_adjust                           |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_detailed                     | `^(Totals)\|(PerGame)\|(MinutesPer)\|(Per48)\|(Per40)\|(Per36)\|(PerMinute)\|(PerPossession)\|(PerPlay)\|(Per100Possessions)\|(Per100Plays)$` |   `Y`    |          | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                     | period                                |                                                                                                                                               |   `Y`    |          | 
| [_**PlusMinus**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlusMinus)               | plus_minus                            |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Rank**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Rank)                         | rank                                  |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                                |                                                                                                                                               |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star                  |                                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                           |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                     | weight_nullable                       |                                                                                                                                               |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable                  |                        `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`                         |   `Y`    |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable                |                                                             `^((East)\|(West))?$`                                                             |   `Y`    |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable                |                                                           `((Starters)\|(Bench))?`                                                            |   `Y`    |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)     | shot_clock_range_nullable             |                 `((24-22)\|(22-18 Very Early)\|(18-15 Early)\|(15-7 Average)\|(7-4 Late)\|(4-0 Very Late)\|(ShotClock Off))?`                 |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable               |                                                    `^((Post All-Star)\|(Pre All-Star))?$`                                                     |   `Y`    |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_abbreviation_nullable |                                                `((F)\|(C)\|(G)\|(C-F)\|(F-C)\|(F-G)\|(G-F))?`                                                 |   `Y`    |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable            |                                                     `((Rookie)\|(Sophomore)\|(Veteran))?`                                                     |   `Y`    |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable                     |                                                                                                                                               |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable                      |                                                                `^((W)\|(L))?$`                                                                |   `Y`    |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable                     |                                                             `^((Home)\|(Road))?$`                                                             |   `Y`    |   `Y`    | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id_nullable                    |                                                                                                                                               |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                     | height_nullable                       |                                                                                                                                               |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)           | game_segment_nullable                 |                                                `^((First Half)\|(Overtime)\|(Second Half))?$`                                                 |   `Y`    |   `Y`    | 
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)               | game_scope_simple_nullable            |                                                          `((Yesterday)\|(Last 10))?`                                                          |   `Y`    |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)               | draft_year_nullable                   |                                                                                                                                               |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)               | draft_pick_nullable                   |                                                                                                                                               |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_simple_nullable              |                                 `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                                  |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable                      |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable                    |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                   | country_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable                   |                                                              `((East)\|(West))?`                                                              |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                   | college_nullable                      |                                                                                                                                               |          |   `Y`    | 

## Data Sets
#### ShotLocations `shot_locations`
```text
[{'columnNames': ['Restricted Area', 'In The Paint (Non-RA)', 'Mid-Range', 'Left Corner 3', 'Right Corner 3', 'Above the Break 3', 'Backcourt'], 'columnSpan': 3, 'columnsToSkip': 5, 'name': 'SHOT_CATEGORY'}, {'columnNames': ['PLAYER_ID', 'PLAYER_NAME', 'TEAM_ID', 'TEAM_ABBREVIATION', 'AGE', 'FGM', 'FGA', 'FG_PCT', 'FGM', 'FGA', 'FG_PCT', 'FGM', 'FGA', 'FG_PCT', 'FGM', 'FGA', 'FG_PCT', 'FGM', 'FGA', 'FG_PCT', 'FGM', 'FGA', 'FG_PCT', 'FGM', 'FGA', 'FG_PCT'], 'columnSpan': 1, 'name': 'columns'}]
```


## JSON
```json
{
    "data_sets": {
        "ShotLocations": [
            {
                "columnNames": [
                    "Restricted Area",
                    "In The Paint (Non-RA)",
                    "Mid-Range",
                    "Left Corner 3",
                    "Right Corner 3",
                    "Above the Break 3",
                    "Backcourt"
                ],
                "columnSpan": 3,
                "columnsToSkip": 5,
                "name": "SHOT_CATEGORY"
            },
            {
                "columnNames": [
                    "PLAYER_ID",
                    "PLAYER_NAME",
                    "TEAM_ID",
                    "TEAM_ABBREVIATION",
                    "AGE",
                    "FGM",
                    "FGA",
                    "FG_PCT",
                    "FGM",
                    "FGA",
                    "FG_PCT",
                    "FGM",
                    "FGA",
                    "FG_PCT",
                    "FGM",
                    "FGA",
                    "FG_PCT",
                    "FGM",
                    "FGA",
                    "FG_PCT",
                    "FGM",
                    "FGA",
                    "FG_PCT",
                    "FGM",
                    "FGA",
                    "FG_PCT"
                ],
                "columnSpan": 1,
                "name": "columns"
            }
        ]
    },
    "endpoint": "LeagueDashPlayerShotLocations",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LeagueID",
        "Location",
        "Outcome",
        "PORound",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "College": null,
        "Conference": "((East)|(West))?",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "DistanceRange": "^(5ft Range)|(8ft Range)|(By Zone)$",
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "DraftPick": null,
        "DraftYear": null,
        "GameScope": "((Yesterday)|(Last 10))?",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "Height": null,
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "MeasureType": "^(Base)|(Opponent)$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PaceAdjust": "^(Y)|(N)$",
        "PerMode": "^(Totals)|(PerGame)|(MinutesPer)|(Per48)|(Per40)|(Per36)|(PerMinute)|(PerPossession)|(PerPlay)|(Per100Possessions)|(Per100Plays)$",
        "Period": null,
        "PlayerExperience": "((Rookie)|(Sophomore)|(Veteran))?",
        "PlayerPosition": "((F)|(C)|(G)|(C-F)|(F-C)|(F-G)|(G-F))?",
        "PlusMinus": "^(Y)|(N)$",
        "Rank": "^(Y)|(N)$",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": "((24-22)|(22-18 Very Early)|(18-15 Early)|(15-7 Average)|(7-4 Late)|(4-0 Very Late)|(ShotClock Off))?",
        "StarterBench": "((Starters)|(Bench))?",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "DistanceRange",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "DateFrom",
        "DateTo",
        "DistanceRange",
        "GameScope",
        "GameSegment",
        "LastNGames",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "VsConference",
        "VsDivision"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashplayerstats.md ---

# LeagueDashPlayerStats
##### [nba_api/stats/endpoints/leaguedashplayerstats.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashplayerstats.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashplayerstats](https://stats.nba.com/stats/leaguedashplayerstats)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&TwoWay=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&TwoWay=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable             |                                                                    Pattern                                                                    | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games                          |                                                                                                                                               |   `Y`    |          | 
| [_**MeasureType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#MeasureType)           | measure_type_detailed_defense         |                           `^(Base)\|(Advanced)\|(Misc)\|(Four Factors)\|(Scoring)\|(Opponent)\|(Usage)\|(Defense)$`                           |   `Y`    |          | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month                                 |                                                                                                                                               |   `Y`    |          | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id                      |                                                                                                                                               |   `Y`    |          | 
| [_**PaceAdjust**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PaceAdjust)             | pace_adjust                           |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_detailed                     | `^(Totals)\|(PerGame)\|(MinutesPer)\|(Per48)\|(Per40)\|(Per36)\|(PerMinute)\|(PerPossession)\|(PerPlay)\|(Per100Possessions)\|(Per100Plays)$` |   `Y`    |          | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                     | period                                |                                                                                                                                               |   `Y`    |          | 
| [_**PlusMinus**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlusMinus)               | plus_minus                            |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Rank**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Rank)                         | rank                                  |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                                |                                                                                                                                               |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star                  |                                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                           |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                     | weight_nullable                       |                                                                                                                                               |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable                  |                        `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`                         |   `Y`    |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable                |                                                             `^((East)\|(West))?$`                                                             |   `Y`    |   `Y`    | 
| [_**TwoWay**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TwoWay)                     | two_way_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable                |                                                           `((Starters)\|(Bench))?`                                                            |   `Y`    |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)     | shot_clock_range_nullable             |                 `((24-22)\|(22-18 Very Early)\|(18-15 Early)\|(15-7 Average)\|(7-4 Late)\|(4-0 Very Late)\|(ShotClock Off))?`                 |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable               |                                                    `^((Post All-Star)\|(Pre All-Star))?$`                                                     |   `Y`    |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_abbreviation_nullable |                                                `((F)\|(C)\|(G)\|(C-F)\|(F-C)\|(F-G)\|(G-F))?`                                                 |   `Y`    |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable            |                                                     `((Rookie)\|(Sophomore)\|(Veteran))?`                                                     |   `Y`    |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable                     |                                                                                                                                               |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable                      |                                                                `^((W)\|(L))?$`                                                                |   `Y`    |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable                     |                                                             `^((Home)\|(Road))?$`                                                             |   `Y`    |   `Y`    | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id_nullable                    |                                                                                                                                               |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                     | height_nullable                       |                                                                                                                                               |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)           | game_segment_nullable                 |                                                `^((First Half)\|(Overtime)\|(Second Half))?$`                                                 |   `Y`    |   `Y`    | 
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)               | game_scope_simple_nullable            |                                                          `((Yesterday)\|(Last 10))?`                                                          |   `Y`    |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)               | draft_year_nullable                   |                                                                                                                                               |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)               | draft_pick_nullable                   |                                                                                                                                               |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_simple_nullable              |                                 `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                                  |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable                      |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable                    |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                   | country_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable                   |                                                              `((East)\|(West))?`                                                              |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                   | college_nullable                      |                                                                                                                                               |          |   `Y`    | 

## Data Sets
#### LeagueDashPlayerStats `league_dash_player_stats`
```text
['PLAYER_ID', 'PLAYER_NAME', 'TEAM_ID', 'TEAM_ABBREVIATION', 'AGE', 'GP', 'W', 'L', 'W_PCT', 'MIN', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PTS', 'PLUS_MINUS', 'NBA_FANTASY_PTS', 'DD2', 'TD3', 'GP_RANK', 'W_RANK', 'L_RANK', 'W_PCT_RANK', 'MIN_RANK', 'FGM_RANK', 'FGA_RANK', 'FG_PCT_RANK', 'FG3M_RANK', 'FG3A_RANK', 'FG3_PCT_RANK', 'FTM_RANK', 'FTA_RANK', 'FT_PCT_RANK', 'OREB_RANK', 'DREB_RANK', 'REB_RANK', 'AST_RANK', 'TOV_RANK', 'STL_RANK', 'BLK_RANK', 'BLKA_RANK', 'PF_RANK', 'PFD_RANK', 'PTS_RANK', 'PLUS_MINUS_RANK', 'NBA_FANTASY_PTS_RANK', 'DD2_RANK', 'TD3_RANK', 'CFID', 'CFPARAMS']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPlayerStats": [
            "PLAYER_ID",
            "PLAYER_NAME",
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "AGE",
            "GP",
            "W",
            "L",
            "W_PCT",
            "MIN",
            "FGM",
            "FGA",
            "FG_PCT",
            "FG3M",
            "FG3A",
            "FG3_PCT",
            "FTM",
            "FTA",
            "FT_PCT",
            "OREB",
            "DREB",
            "REB",
            "AST",
            "TOV",
            "STL",
            "BLK",
            "BLKA",
            "PF",
            "PFD",
            "PTS",
            "PLUS_MINUS",
            "NBA_FANTASY_PTS",
            "DD2",
            "TD3",
            "GP_RANK",
            "W_RANK",
            "L_RANK",
            "W_PCT_RANK",
            "MIN_RANK",
            "FGM_RANK",
            "FGA_RANK",
            "FG_PCT_RANK",
            "FG3M_RANK",
            "FG3A_RANK",
            "FG3_PCT_RANK",
            "FTM_RANK",
            "FTA_RANK",
            "FT_PCT_RANK",
            "OREB_RANK",
            "DREB_RANK",
            "REB_RANK",
            "AST_RANK",
            "TOV_RANK",
            "STL_RANK",
            "BLK_RANK",
            "BLKA_RANK",
            "PF_RANK",
            "PFD_RANK",
            "PTS_RANK",
            "PLUS_MINUS_RANK",
            "NBA_FANTASY_PTS_RANK",
            "DD2_RANK",
            "TD3_RANK",
            "CFID",
            "CFPARAMS"
        ]
    },
    "endpoint": "LeagueDashPlayerStats",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LeagueID",
        "Location",
        "Outcome",
        "PORound",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "TwoWay",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "College": null,
        "Conference": "((East)|(West))?",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "DraftPick": null,
        "DraftYear": null,
        "GameScope": "((Yesterday)|(Last 10))?",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "Height": null,
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "MeasureType": "^(Base)|(Advanced)|(Misc)|(Four Factors)|(Scoring)|(Opponent)|(Usage)|(Defense)$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PaceAdjust": "^(Y)|(N)$",
        "PerMode": "^(Totals)|(PerGame)|(MinutesPer)|(Per48)|(Per40)|(Per36)|(PerMinute)|(PerPossession)|(PerPlay)|(Per100Possessions)|(Per100Plays)$",
        "Period": null,
        "PlayerExperience": "((Rookie)|(Sophomore)|(Veteran))?",
        "PlayerPosition": "((F)|(C)|(G)|(C-F)|(F-C)|(F-G)|(G-F))?",
        "PlusMinus": "^(Y)|(N)$",
        "Rank": "^(Y)|(N)$",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": "((24-22)|(22-18 Very Early)|(18-15 Early)|(15-7 Average)|(7-4 Late)|(4-0 Very Late)|(ShotClock Off))?",
        "StarterBench": "((Starters)|(Bench))?",
        "TeamID": null,
        "TwoWay": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "GameSegment",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "TwoWay",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "DateFrom",
        "DateTo",
        "GameScope",
        "GameSegment",
        "LastNGames",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "VsConference",
        "VsDivision"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashptdefend.md ---

# LeagueDashPtDefend
##### [nba_api/stats/endpoints/leaguedashptdefend.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashptdefend.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashptdefend](https://stats.nba.com/stats/leaguedashptdefend)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashptdefend?College=&Conference=&Country=&DateFrom=&DateTo=&DefenseCategory=Overall&Division=&DraftPick=&DraftYear=&GameSegment=&Height=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&PlayerExperience=&PlayerID=&PlayerPosition=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashptdefend?College=&Conference=&Country=&DateFrom=&DateTo=&DefenseCategory=Overall&Division=&DraftPick=&DraftYear=&GameSegment=&Height=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&PlayerExperience=&PlayerID=&PlayerPosition=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable  |                                               Pattern                                                | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|----------------------------|:----------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**DefenseCategory**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DefenseCategory)   | defense_category           | `^((Overall)\|(3 Pointers)\|(2 Pointers)\|(Less Than 6Ft)\|(Less Than 10Ft)\|(Greater Than 15Ft))?$` |   `Y`    |          | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id                  |                                              `^\d{2}$`                                               |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_simple            |                                       `^(Totals)\|(PerGame)$`                                        |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                     |                                                                                                      |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star       |                      `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                      |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                     | weight_nullable            |                                                                                                      |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable       |    `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`    |          |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable     |                                        `^((East)\|(West))?$`                                         |          |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable           |                                                                                                      |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable     |                                                                                                      |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable    |                                `^((Post All-Star)\|(Pre All-Star))?$`                                |          |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_nullable   |                                                                                                      |          |   `Y`    | 
| [_**PlayerID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerID)                 | player_id_nullable         |                                                                                                      |          |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable |                                                                                                      |          |   `Y`    | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                     | period_nullable            |                                                                                                      |          |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable          |                                                                                                      |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable           |                                           `^((W)\|(L))?$`                                            |          |   `Y`    | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id_nullable  |                                                                                                      |          |   `Y`    | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month_nullable             |                                                                                                      |          |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable          |                                        `^((Home)\|(Road))?$`                                         |          |   `Y`    | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games_nullable      |                                                                                                      |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                     | height_nullable            |                                                                                                      |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)           | game_segment_nullable      |                            `^((First Half)\|(Overtime)\|(Second Half))?$`                            |          |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)               | draft_year_nullable        |                                                                                                      |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)               | draft_pick_nullable        |                                                                                                      |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_nullable          |    `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`    |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable           |                                                                                                      |          |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable         |                                                                                                      |          |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                   | country_nullable           |                                                                                                      |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable        |                                        `^((East)\|(West))?$`                                         |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                   | college_nullable           |                                                                                                      |          |   `Y`    | 

## Data Sets
#### LeagueDashPTDefend `league_dash_p_tdefend`
```text
['CLOSE_DEF_PERSON_ID', 'PLAYER_NAME', 'PLAYER_LAST_TEAM_ID', 'PLAYER_LAST_TEAM_ABBREVIATION', 'PLAYER_POSITION', 'AGE', 'GP', 'G', 'FREQ', 'D_FGM', 'D_FGA', 'D_FG_PCT', 'NORMAL_FG_PCT', 'PCT_PLUSMINUS']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPTDefend": [
            "CLOSE_DEF_PERSON_ID",
            "PLAYER_NAME",
            "PLAYER_LAST_TEAM_ID",
            "PLAYER_LAST_TEAM_ABBREVIATION",
            "PLAYER_POSITION",
            "AGE",
            "GP",
            "G",
            "FREQ",
            "D_FGM",
            "D_FGA",
            "D_FG_PCT",
            "NORMAL_FG_PCT",
            "PCT_PLUSMINUS"
        ]
    },
    "endpoint": "LeagueDashPtDefend",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameSegment",
        "Height",
        "LastNGames",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "Period",
        "PlayerExperience",
        "PlayerID",
        "PlayerPosition",
        "SeasonSegment",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "College": null,
        "Conference": "^((East)|(West))?$",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "DefenseCategory": "^((Overall)|(3 Pointers)|(2 Pointers)|(Less Than 6Ft)|(Less Than 10Ft)|(Greater Than 15Ft))?$",
        "Division": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "DraftPick": null,
        "DraftYear": null,
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "Height": null,
        "LastNGames": null,
        "LeagueID": "^\d{2}$",
        "Location": "^((Home)|(Road))?$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PerMode": "^(Totals)|(PerGame)$",
        "Period": null,
        "PlayerExperience": null,
        "PlayerID": null,
        "PlayerPosition": null,
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "StarterBench": null,
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "DefenseCategory",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameSegment",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerID",
        "PlayerPosition",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "DefenseCategory",
        "LeagueID",
        "PerMode",
        "Season",
        "SeasonType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashptstats.md ---

# LeagueDashPtStats
##### [nba_api/stats/endpoints/leaguedashptstats.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashptstats.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashptstats](https://stats.nba.com/stats/leaguedashptstats)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashptstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&Height=&LastNGames=0&LeagueID=&Location=&Month=0&OpponentTeamID=0&Outcome=&PORound=&PerMode=Totals&PlayerExperience=&PlayerOrTeam=Team&PlayerPosition=&PtMeasureType=SpeedDistance&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=](https://stats.nba.com/stats/leaguedashptstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&Height=&LastNGames=0&LeagueID=&Location=&Month=0&OpponentTeamID=0&Outcome=&PORound=&PerMode=Totals&PlayerExperience=&PlayerOrTeam=Team&PlayerPosition=&PtMeasureType=SpeedDistance&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&StarterBench=&TeamID=&VsConference=&VsDivision=&Weight=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable             |                                                                               Pattern                                                                               | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games                          |                                                                                                                                                                     |   `Y`    |          | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month                                 |                                                                                                                                                                     |   `Y`    |          | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id                      |                                                                                                                                                                     |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_simple                       |                                                                       `^(Totals)\|(PerGame)$`                                                                       |   `Y`    |          | 
| [_**PlayerOrTeam**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerOrTeam)         | player_or_team                        |                                                                        `^(Player)\|(Team)$`                                                                         |   `Y`    |          | 
| [_**PtMeasureType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PtMeasureType)       | pt_measure_type                       | `^(SpeedDistance)\|(Rebounding)\|(Possessions)\|(CatchShoot)\|(PullUpShot)\|(Defense)\|(Drives)\|(Passing)\|(ElbowTouch)\|(PostTouch)\|(PaintTouch)\|(Efficiency)$` |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                                |                                                                                                                                                                     |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star                  |                                                     `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                                      |   `Y`    |          | 
| [_**Weight**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Weight)                     | weight_nullable                       |                                                                                                                                                                     |          |   `Y`    | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable                  |                                   `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`                                    |   `Y`    |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable                |                                                                        `^((East)\|(West))?$`                                                                        |   `Y`    |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable                      |                                                                                                                                                                     |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable                |                                                                      `((Starters)\|(Bench))?`                                                                       |   `Y`    |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable               |                                                               `^((Post All-Star)\|(Pre All-Star))?$`                                                                |   `Y`    |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_abbreviation_nullable |                                                           `((F)\|(C)\|(G)\|(C-F)\|(F-C)\|(F-G)\|(G-F))?`                                                            |   `Y`    |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable            |                                                                `((Rookie)\|(Sophomore)\|(Veteran))?`                                                                |   `Y`    |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable                     |                                                                                                                                                                     |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable                      |                                                                           `^((W)\|(L))?$`                                                                           |   `Y`    |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable                     |                                                                        `^((Home)\|(Road))?$`                                                                        |   `Y`    |   `Y`    | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id_nullable                    |                                                                                                                                                                     |          |   `Y`    | 
| [_**Height**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Height)                     | height_nullable                       |                                                                                                                                                                     |          |   `Y`    | 
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)               | game_scope_simple_nullable            |                                                                     `((Yesterday)\|(Last 10))?`                                                                     |   `Y`    |   `Y`    | 
| [_**DraftYear**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftYear)               | draft_year_nullable                   |                                                                                                                                                                     |          |   `Y`    | 
| [_**DraftPick**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DraftPick)               | draft_pick_nullable                   |                                                                                                                                                                     |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_simple_nullable              |                                            `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                                             |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable                      |                                                                                                                                                                     |   `Y`    |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable                    |                                                                                                                                                                     |   `Y`    |   `Y`    | 
| [_**Country**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Country)                   | country_nullable                      |                                                                                                                                                                     |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable                   |                                                                         `((East)\|(West))?`                                                                         |          |   `Y`    | 
| [_**College**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#College)                   | college_nullable                      |                                                                                                                                                                     |          |   `Y`    | 

## Data Sets
#### LeagueDashPtStats `league_dash_pt_stats`
```text
['TEAM_ID', 'TEAM_ABBREVIATION', 'TEAM_NAME', 'GP', 'W', 'L', 'MIN', 'DIST_FEET', 'DIST_MILES', 'DIST_MILES_OFF', 'DIST_MILES_DEF', 'AVG_SPEED', 'AVG_SPEED_OFF', 'AVG_SPEED_DEF']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPtStats": [
            "TEAM_ID",
            "TEAM_ABBREVIATION",
            "TEAM_NAME",
            "GP",
            "W",
            "L",
            "MIN",
            "DIST_FEET",
            "DIST_MILES",
            "DIST_MILES_OFF",
            "DIST_MILES_DEF",
            "AVG_SPEED",
            "AVG_SPEED_OFF",
            "AVG_SPEED_DEF"
        ]
    },
    "endpoint": "LeagueDashPtStats",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "Height",
        "LeagueID",
        "Location",
        "Outcome",
        "PORound",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "parameter_patterns": {
        "College": null,
        "Conference": "((East)|(West))?",
        "Country": null,
        "DateFrom": null,
        "DateTo": null,
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "DraftPick": null,
        "DraftYear": null,
        "GameScope": "((Yesterday)|(Last 10))?",
        "Height": null,
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PerMode": "^(Totals)|(PerGame)$",
        "PlayerExperience": "((Rookie)|(Sophomore)|(Veteran))?",
        "PlayerOrTeam": "^(Player)|(Team)$",
        "PlayerPosition": "((F)|(C)|(G)|(C-F)|(F-C)|(F-G)|(G-F))?",
        "PtMeasureType": "^(SpeedDistance)|(Rebounding)|(Possessions)|(CatchShoot)|(PullUpShot)|(Defense)|(Drives)|(Passing)|(ElbowTouch)|(PostTouch)|(PaintTouch)|(Efficiency)$",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "StarterBench": "((Starters)|(Bench))?",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "Weight": null
    },
    "parameters": [
        "College",
        "Conference",
        "Country",
        "DateFrom",
        "DateTo",
        "Division",
        "DraftPick",
        "DraftYear",
        "GameScope",
        "Height",
        "LastNGames",
        "LeagueID",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PerMode",
        "PlayerExperience",
        "PlayerOrTeam",
        "PlayerPosition",
        "PtMeasureType",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision",
        "Weight"
    ],
    "required_parameters": [
        "DateFrom",
        "DateTo",
        "GameScope",
        "LastNGames",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PerMode",
        "PlayerExperience",
        "PlayerOrTeam",
        "PlayerPosition",
        "PtMeasureType",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "VsConference",
        "VsDivision"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashptteamdefend.md ---

# LeagueDashPtTeamDefend
##### [nba_api/stats/endpoints/leaguedashptteamdefend.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashptteamdefend.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashptteamdefend](https://stats.nba.com/stats/leaguedashptteamdefend)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashptteamdefend?Conference=&DateFrom=&DateTo=&DefenseCategory=Overall&Division=&GameSegment=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&TeamID=&VsConference=&VsDivision=](https://stats.nba.com/stats/leaguedashptteamdefend?Conference=&DateFrom=&DateTo=&DefenseCategory=Overall&Division=&GameSegment=&LastNGames=&LeagueID=00&Location=&Month=&OpponentTeamID=&Outcome=&PORound=&PerMode=Totals&Period=&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&TeamID=&VsConference=&VsDivision=)

## Parameters
| API Parameter Name                                                                                                            | Python Parameter Variable |                                               Pattern                                                | Required | Nullable |
|-------------------------------------------------------------------------------------------------------------------------------|---------------------------|:----------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**DefenseCategory**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DefenseCategory) | defense_category          | `^((Overall)\|(3 Pointers)\|(2 Pointers)\|(Less Than 6Ft)\|(Less Than 10Ft)\|(Greater Than 15Ft))?$` |   `Y`    |          | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)               | league_id                 |                                              `^\d{2}$`                                               |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                 | per_mode_simple           |                                       `^(Totals)\|(PerGame)$`                                        |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                   | season                    |                                                                                                      |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)           | season_type_all_star      |                      `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                      |   `Y`    |          | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)           | vs_division_nullable      |    `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`    |          |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)       | vs_conference_nullable    |                                        `^((East)\|(West))?$`                                         |          |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                   | team_id_nullable          |                                                                                                      |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)     | season_segment_nullable   |                                `^((Post All-Star)\|(Pre All-Star))?$`                                |          |   `Y`    | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                   | period_nullable           |                                                                                                      |          |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                 | po_round_nullable         |                                                                                                      |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                 | outcome_nullable          |                                           `^((W)\|(L))?$`                                            |          |   `Y`    | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)   | opponent_team_id_nullable |                                                                                                      |          |   `Y`    | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                     | month_nullable            |                                                                                                      |          |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)               | location_nullable         |                                        `^((Home)\|(Road))?$`                                         |          |   `Y`    | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)           | last_n_games_nullable     |                                                                                                      |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)         | game_segment_nullable     |                            `^((First Half)\|(Overtime)\|(Second Half))?$`                            |          |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)               | division_nullable         |    `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`    |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                   | date_to_nullable          |                                                                                                      |          |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)               | date_from_nullable        |                                                                                                      |          |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)           | conference_nullable       |                                        `^((East)\|(West))?$`                                         |          |   `Y`    | 

## Data Sets
#### LeagueDashPtTeamDefend `league_dash_pt_team_defend`
```text
['TEAM_ID', 'TEAM_NAME', 'TEAM_ABBREVIATION', 'GP', 'G', 'FREQ', 'D_FGM', 'D_FGA', 'D_FG_PCT', 'NORMAL_FG_PCT', 'PCT_PLUSMINUS']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashPtTeamDefend": [
            "TEAM_ID",
            "TEAM_NAME",
            "TEAM_ABBREVIATION",
            "GP",
            "G",
            "FREQ",
            "D_FGM",
            "D_FGA",
            "D_FG_PCT",
            "NORMAL_FG_PCT",
            "PCT_PLUSMINUS"
        ]
    },
    "endpoint": "LeagueDashPtTeamDefend",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "GameSegment",
        "LastNGames",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "Period",
        "SeasonSegment",
        "TeamID",
        "VsConference",
        "VsDivision"
    ],
    "parameter_patterns": {
        "Conference": "^((East)|(West))?$",
        "DateFrom": null,
        "DateTo": null,
        "DefenseCategory": "^((Overall)|(3 Pointers)|(2 Pointers)|(Less Than 6Ft)|(Less Than 10Ft)|(Greater Than 15Ft))?$",
        "Division": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "LastNGames": null,
        "LeagueID": "^\d{2}$",
        "Location": "^((Home)|(Road))?$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PerMode": "^(Totals)|(PerGame)$",
        "Period": null,
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$"
    },
    "parameters": [
        "Conference",
        "DateFrom",
        "DateTo",
        "DefenseCategory",
        "Division",
        "GameSegment",
        "LastNGames",
        "LeagueID",
        "Location",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PerMode",
        "Period",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "TeamID",
        "VsConference",
        "VsDivision"
    ],
    "required_parameters": [
        "DefenseCategory",
        "LeagueID",
        "PerMode",
        "Season",
        "SeasonType"
    ],
    "status": "success"
}
```

Last validated 2020-08-16

--- /Users/chapirou/dev/perso/stat-discute.be/nba_api/docs/nba_api/stats/endpoints/leaguedashteamclutch.md ---

# LeagueDashTeamClutch
##### [nba_api/stats/endpoints/leaguedashteamclutch.py](https://github.com/swar/nba_api/blob/master/src/nba_api/stats/endpoints/leaguedashteamclutch.py)

##### Endpoint URL
>[https://stats.nba.com/stats/leaguedashteamclutch](https://stats.nba.com/stats/leaguedashteamclutch)

##### Valid URL
>[https://stats.nba.com/stats/leaguedashteamclutch?AheadBehind=Ahead+or+Behind&ClutchTime=Last+5+Minutes&Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&PointDiff=5&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=](https://stats.nba.com/stats/leaguedashteamclutch?AheadBehind=Ahead+or+Behind&ClutchTime=Last+5+Minutes&Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&LastNGames=0&LeagueID=&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=&PaceAdjust=N&PerMode=Totals&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&PointDiff=5&Rank=N&Season=2019-20&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=&VsConference=&VsDivision=)

## Parameters
| API Parameter Name                                                                                                              | Python Parameter Variable             |                                                                    Pattern                                                                    | Required | Nullable |
|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:--------:|
| [_**AheadBehind**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#AheadBehind)           | ahead_behind                          |                                          `^((Ahead or Behind)\|(Behind or Tied)\|(Ahead or Tied))?$`                                          |   `Y`    |          | 
| [_**ClutchTime**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ClutchTime)             | clutch_time                           |     `^((Last 5 Minutes)\|(Last 4 Minutes)\|(Last 3 Minutes)\|(Last 2 Minutes)\|(Last 1 Minute)\|(Last 30 Seconds)\|(Last 10 Seconds))?$`      |   `Y`    |          | 
| [_**LastNGames**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LastNGames)             | last_n_games                          |                                                                                                                                               |   `Y`    |          | 
| [_**MeasureType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#MeasureType)           | measure_type_detailed_defense         |                           `^(Base)\|(Advanced)\|(Misc)\|(Four Factors)\|(Scoring)\|(Opponent)\|(Usage)\|(Defense)$`                           |   `Y`    |          | 
| [_**Month**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Month)                       | month                                 |                                                                                                                                               |   `Y`    |          | 
| [_**OpponentTeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#OpponentTeamID)     | opponent_team_id                      |                                                                                                                                               |   `Y`    |          | 
| [_**PaceAdjust**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PaceAdjust)             | pace_adjust                           |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PerMode**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PerMode)                   | per_mode_detailed                     | `^(Totals)\|(PerGame)\|(MinutesPer)\|(Per48)\|(Per40)\|(Per36)\|(PerMinute)\|(PerPossession)\|(PerPlay)\|(Per100Possessions)\|(Per100Plays)$` |   `Y`    |          | 
| [_**Period**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Period)                     | period                                |                                                                                                                                               |   `Y`    |          | 
| [_**PlusMinus**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlusMinus)               | plus_minus                            |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**PointDiff**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PointDiff)               | point_diff                            |                                                                                                                                               |   `Y`    |          | 
| [_**Rank**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Rank)                         | rank                                  |                                                                 `^(Y)\|(N)$`                                                                  |   `Y`    |          | 
| [_**Season**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Season)                     | season                                |                                                                                                                                               |   `Y`    |          | 
| [_**SeasonType**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonType)             | season_type_all_star                  |                                          `^(Regular Season)\|(Pre Season)\|(Playoffs)\|(All Star)$`                                           |   `Y`    |          | 
| [_**VsDivision**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsDivision)             | vs_division_nullable                  |                        `^((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest)\|(East)\|(West))?$`                         |   `Y`    |   `Y`    | 
| [_**VsConference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#VsConference)         | vs_conference_nullable                |                                                             `^((East)\|(West))?$`                                                             |   `Y`    |   `Y`    | 
| [_**TeamID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#TeamID)                     | team_id_nullable                      |                                                                                                                                               |          |   `Y`    | 
| [_**StarterBench**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#StarterBench)         | starter_bench_nullable                |                                                           `((Starters)\|(Bench))?`                                                            |   `Y`    |   `Y`    | 
| [_**ShotClockRange**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#ShotClockRange)     | shot_clock_range_nullable             |                 `((24-22)\|(22-18 Very Early)\|(18-15 Early)\|(15-7 Average)\|(7-4 Late)\|(4-0 Very Late)\|(ShotClock Off))?`                 |          |   `Y`    | 
| [_**SeasonSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#SeasonSegment)       | season_segment_nullable               |                                                    `^((Post All-Star)\|(Pre All-Star))?$`                                                     |   `Y`    |   `Y`    | 
| [_**PlayerPosition**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerPosition)     | player_position_abbreviation_nullable |                                                `((F)\|(C)\|(G)\|(C-F)\|(F-C)\|(F-G)\|(G-F))?`                                                 |   `Y`    |   `Y`    | 
| [_**PlayerExperience**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PlayerExperience) | player_experience_nullable            |                                                     `((Rookie)\|(Sophomore)\|(Veteran))?`                                                     |   `Y`    |   `Y`    | 
| [_**PORound**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#PORound)                   | po_round_nullable                     |                                                                                                                                               |          |   `Y`    | 
| [_**Outcome**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Outcome)                   | outcome_nullable                      |                                                                `^((W)\|(L))?$`                                                                |   `Y`    |   `Y`    | 
| [_**Location**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Location)                 | location_nullable                     |                                                             `^((Home)\|(Road))?$`                                                             |   `Y`    |   `Y`    | 
| [_**LeagueID**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#LeagueID)                 | league_id_nullable                    |                                                                                                                                               |          |   `Y`    | 
| [_**GameSegment**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameSegment)           | game_segment_nullable                 |                                                `^((First Half)\|(Overtime)\|(Second Half))?$`                                                 |   `Y`    |   `Y`    | 
| [_**GameScope**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#GameScope)               | game_scope_simple_nullable            |                                                          `((Yesterday)\|(Last 10))?`                                                          |   `Y`    |   `Y`    | 
| [_**Division**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Division)                 | division_simple_nullable              |                                 `((Atlantic)\|(Central)\|(Northwest)\|(Pacific)\|(Southeast)\|(Southwest))?`                                  |          |   `Y`    | 
| [_**DateTo**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateTo)                     | date_to_nullable                      |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**DateFrom**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#DateFrom)                 | date_from_nullable                    |                                                                                                                                               |   `Y`    |   `Y`    | 
| [_**Conference**_](https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/library/parameters.md#Conference)             | conference_nullable                   |                                                              `((East)\|(West))?`                                                              |          |   `Y`    | 

## Data Sets
#### LeagueDashTeamClutch `league_dash_team_clutch`
```text
['TEAM_ID', 'TEAM_NAME', 'GP', 'W', 'L', 'W_PCT', 'MIN', 'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PTS', 'PLUS_MINUS', 'GP_RANK', 'W_RANK', 'L_RANK', 'W_PCT_RANK', 'MIN_RANK', 'FGM_RANK', 'FGA_RANK', 'FG_PCT_RANK', 'FG3M_RANK', 'FG3A_RANK', 'FG3_PCT_RANK', 'FTM_RANK', 'FTA_RANK', 'FT_PCT_RANK', 'OREB_RANK', 'DREB_RANK', 'REB_RANK', 'AST_RANK', 'TOV_RANK', 'STL_RANK', 'BLK_RANK', 'BLKA_RANK', 'PF_RANK', 'PFD_RANK', 'PTS_RANK', 'PLUS_MINUS_RANK', 'CFID', 'CFPARAMS']
```


## JSON
```json
{
    "data_sets": {
        "LeagueDashTeamClutch": [
            "TEAM_ID",
            "TEAM_NAME",
            "GP",
            "W",
            "L",
            "W_PCT",
            "MIN",
            "FGM",
            "FGA",
            "FG_PCT",
            "FG3M",
            "FG3A",
            "FG3_PCT",
            "FTM",
            "FTA",
            "FT_PCT",
            "OREB",
            "DREB",
            "REB",
            "AST",
            "TOV",
            "STL",
            "BLK",
            "BLKA",
            "PF",
            "PFD",
            "PTS",
            "PLUS_MINUS",
            "GP_RANK",
            "W_RANK",
            "L_RANK",
            "W_PCT_RANK",
            "MIN_RANK",
            "FGM_RANK",
            "FGA_RANK",
            "FG_PCT_RANK",
            "FG3M_RANK",
            "FG3A_RANK",
            "FG3_PCT_RANK",
            "FTM_RANK",
            "FTA_RANK",
            "FT_PCT_RANK",
            "OREB_RANK",
            "DREB_RANK",
            "REB_RANK",
            "AST_RANK",
            "TOV_RANK",
            "STL_RANK",
            "BLK_RANK",
            "BLKA_RANK",
            "PF_RANK",
            "PFD_RANK",
            "PTS_RANK",
            "PLUS_MINUS_RANK",
            "CFID",
            "CFPARAMS"
        ]
    },
    "endpoint": "LeagueDashTeamClutch",
    "last_validated_date": "2020-08-15",
    "nullable_parameters": [
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "GameScope",
        "GameSegment",
        "LeagueID",
        "Location",
        "Outcome",
        "PORound",
        "PlayerExperience",
        "PlayerPosition",
        "SeasonSegment",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision"
    ],
    "parameter_patterns": {
        "AheadBehind": "^((Ahead or Behind)|(Behind or Tied)|(Ahead or Tied))?$",
        "ClutchTime": "^((Last 5 Minutes)|(Last 4 Minutes)|(Last 3 Minutes)|(Last 2 Minutes)|(Last 1 Minute)|(Last 30 Seconds)|(Last 10 Seconds))?$",
        "Conference": "((East)|(West))?",
        "DateFrom": null,
        "DateTo": null,
        "Division": "((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest))?",
        "GameScope": "((Yesterday)|(Last 10))?",
        "GameSegment": "^((First Half)|(Overtime)|(Second Half))?$",
        "LastNGames": null,
        "LeagueID": null,
        "Location": "^((Home)|(Road))?$",
        "MeasureType": "^(Base)|(Advanced)|(Misc)|(Four Factors)|(Scoring)|(Opponent)|(Usage)|(Defense)$",
        "Month": null,
        "OpponentTeamID": null,
        "Outcome": "^((W)|(L))?$",
        "PORound": null,
        "PaceAdjust": "^(Y)|(N)$",
        "PerMode": "^(Totals)|(PerGame)|(MinutesPer)|(Per48)|(Per40)|(Per36)|(PerMinute)|(PerPossession)|(PerPlay)|(Per100Possessions)|(Per100Plays)$",
        "Period": null,
        "PlayerExperience": "((Rookie)|(Sophomore)|(Veteran))?",
        "PlayerPosition": "((F)|(C)|(G)|(C-F)|(F-C)|(F-G)|(G-F))?",
        "PlusMinus": "^(Y)|(N)$",
        "PointDiff": null,
        "Rank": "^(Y)|(N)$",
        "Season": null,
        "SeasonSegment": "^((Post All-Star)|(Pre All-Star))?$",
        "SeasonType": "^(Regular Season)|(Pre Season)|(Playoffs)|(All Star)$",
        "ShotClockRange": "((24-22)|(22-18 Very Early)|(18-15 Early)|(15-7 Average)|(7-4 Late)|(4-0 Very Late)|(ShotClock Off))?",
        "StarterBench": "((Starters)|(Bench))?",
        "TeamID": null,
        "VsConference": "^((East)|(West))?$",
        "VsDivision": "^((Atlantic)|(Central)|(Northwest)|(Pacific)|(Southeast)|(Southwest)|(East)|(West))?$"
    },
    "parameters": [
        "AheadBehind",
        "ClutchTime",
        "Conference",
        "DateFrom",
        "DateTo",
        "Division",
        "GameScope",
        "GameSegment",
        "LastNGames",
        "LeagueID",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PORound",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "PointDiff",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "ShotClockRange",
        "StarterBench",
        "TeamID",
        "VsConference",
        "VsDivision"
    ],
    "required_parameters": [
        "AheadBehind",
        "ClutchTime",
        "DateFrom",
        "DateTo",
        "GameScope",
        "GameSegment",
        "LastNGames",
        "Location",
        "MeasureType",
        "Month",
        "OpponentTeamID",
        "Outcome",
        "PaceAdjust",
        "PerMode",
        "Period",
        "PlayerExperience",
        "PlayerPosition",
        "PlusMinus",
        "PointDiff",
        "Rank",
        "Season",
        "SeasonSegment",
        "SeasonType",
        "StarterBench",
        "VsConference",
        "VsDivision"
    ],
    "status": "success"
}
```

Last validated 2020-08-16


--- End of content ---