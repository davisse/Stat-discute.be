import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { query } from '@/lib/db'

interface BettingData {
  e: any[]
}

interface ParsedGame {
  gameId: string
  homeTeam: string
  awayTeam: string
  startTime: string
  homeOdds: {
    spread: string
    spreadOdds: string
    moneyline: string
    total: string
    overOdds: string
    underOdds: string
  }
  awayOdds: {
    spread: string
    spreadOdds: string
    moneyline: string
    total: string
    overOdds: string
    underOdds: string
  }
  playerProps?: Array<{
    playerId: string
    playerName: string
    market: string
    line: number
    overOdds: string
    underOdds: string
  }>
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') || 'auto' // 'database', 'live', 'file', 'mock', or 'auto'

  try {
    let jsonData: BettingData | null = null
    let dataSource = 'unknown'
    let dbGames: ParsedGame[] = []

    // Try database source first if source is 'database' or 'auto'
    if (source === 'database' || source === 'auto') {
      try {
        console.log('Attempting to fetch odds from database...')

        // Fetch games with betting data from database
        const gamesQuery = `
          SELECT DISTINCT
            be.event_id as "eventId",
            be.game_id as "gameId",
            be.event_start_time as "startTime",
            ht.full_name as "homeTeam",
            at.full_name as "awayTeam"
          FROM betting_events be
          LEFT JOIN games g ON be.game_id = g.game_id
          LEFT JOIN teams ht ON g.home_team_id = ht.team_id
          LEFT JOIN teams at ON g.away_team_id = at.team_id
          WHERE be.event_start_time >= NOW() - INTERVAL '24 hours'
            AND be.event_start_time <= NOW() + INTERVAL '48 hours'
            AND EXISTS (
              SELECT 1 FROM betting_markets bm
              WHERE bm.event_id = be.event_id
            )
          ORDER BY be.event_start_time
          LIMIT 10
        `

        const gamesResult = await query(gamesQuery)

        for (const game of gamesResult.rows) {
          // Fetch odds for each game
          const oddsQuery = `
            WITH latest_odds AS (
              SELECT DISTINCT ON (m.market_id, o.selection)
                m.market_id,
                m.market_type,
                m.market_name,
                o.selection,
                o.odds_decimal,
                o.odds_american,
                o.handicap
              FROM betting_markets m
              JOIN betting_odds o ON m.market_id = o.market_id
              WHERE m.event_id = $1
              ORDER BY m.market_id, o.selection, o.recorded_at DESC
            )
            SELECT * FROM latest_odds
          `

          const oddsResult = await query(oddsQuery, [game.eventId])

          // Also fetch player props for this game
          const playerPropsQuery = `
            SELECT DISTINCT ON (m.market_name, o.selection)
              m.market_name,
              o.selection,
              o.handicap,
              o.odds_decimal
            FROM betting_markets m
            JOIN betting_odds o ON m.market_id = o.market_id
            WHERE m.event_id = $1
              AND m.market_type = 'player_prop'
            ORDER BY m.market_name, o.selection, o.recorded_at DESC
          `
          const propsResult = await query(playerPropsQuery, [game.eventId])

          // Parse database results into game format
          const parsedGame = parseDBGame(game, oddsResult.rows)
          if (parsedGame) {
            // Add player props
            const propsByPlayer: Record<string, any> = {}

            for (const prop of propsResult.rows) {
              const match = prop.market_name?.match(/(.+?)\s*\((.+?)\)/)
              if (match) {
                const [, playerName, market] = match
                const key = `${playerName.trim()}_${market}`

                if (!propsByPlayer[key]) {
                  propsByPlayer[key] = {
                    playerId: key.replace(/\s+/g, '_').toLowerCase(),
                    playerName: playerName.trim(),
                    market,
                    line: prop.handicap || 0,
                    overOdds: '1.900',
                    underOdds: '1.900'
                  }
                }

                if (prop.selection?.toLowerCase() === 'over') {
                  propsByPlayer[key].overOdds = prop.odds_decimal?.toString() || '1.900'
                } else if (prop.selection?.toLowerCase() === 'under') {
                  propsByPlayer[key].underOdds = prop.odds_decimal?.toString() || '1.900'
                }
              }
            }

            parsedGame.playerProps = Object.values(propsByPlayer)
            dbGames.push(parsedGame)
          }
        }

        if (dbGames.length > 0) {
          console.log(`Fetched ${dbGames.length} games from database`)
          return NextResponse.json({
            games: dbGames,
            source: 'database',
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.log('Error fetching from database:', error)
        // Continue to other sources if auto mode
      }
    }

    // Try to fetch live data if source is 'live' or 'auto'
    if (source === 'live' || (source === 'auto' && dbGames.length === 0)) {
      try {
        console.log('Attempting to fetch live odds from ps3838.com...')

        // Construct the API URL with proper parameters
        const apiUrl = 'https://www.ps3838.com/sports-service/sv/compact/events'
        const params = new URLSearchParams({
          btg: '1',
          c: 'Others',
          cl: '3',
          hle: 'true',
          ic: 'false',
          ice: 'false',
          inl: 'false',
          l: '2',
          lg: '487', // NBA league ID
          lv: '',
          me: '0',
          mk: '3',
          more: 'true',
          o: '0',
          ot: '1',
          pa: '0',
          pimo: '0,1,2',
          pn: '-1',
          pv: '1',
          sp: '29', // Basketball sport ID
          tm: '0',
          v: '0',
          locale: 'en_US',
          _: Date.now().toString(),
          withCredentials: 'true'
        })

        const response = await fetch(`${apiUrl}?${params}`, {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.ps3838.com/',
            'Origin': 'https://www.ps3838.com'
          },
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Successfully fetched live data from ps3838.com')
          jsonData = data
          dataSource = 'live'
        } else {
          console.log(`Failed to fetch from ps3838.com: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.log('Error fetching live data:', error)
        // Continue to try file source if auto mode
      }
    }

    // If no live data and source is 'file' or 'auto', try local file
    if (!jsonData && (source === 'file' || source === 'auto')) {
      try {
        const filePath = path.join(process.cwd(), '..', '4.BETTING', 'all_markets.json')
        const fileContent = await fs.readFile(filePath, 'utf-8')
        jsonData = JSON.parse(fileContent)
        dataSource = 'file'
        console.log('Using local file data')
      } catch (error) {
        console.log('Error reading local file:', error)
      }
    }

    // If still no data, use mock data
    if (!jsonData) {
      console.log('Using mock data')
      return NextResponse.json({
        games: getMockGames(),
        source: 'mock',
        timestamp: new Date().toISOString()
      })
    }

    // Parse the games from the data
    const games = parseAllGames(jsonData)
    console.log(`Parsed ${games.length} games from ${dataSource}`)

    return NextResponse.json({
      games,
      source: dataSource,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in betting odds API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch betting odds', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function parseAllGames(data: any): ParsedGame[] {
  const games: ParsedGame[] = []

  try {
    // Check if data is an array directly (from API) or has 'e' property (from file)
    let events: any[] = []

    if (Array.isArray(data)) {
      // Direct array from API
      events = data
    } else if (data.e && Array.isArray(data.e)) {
      // File format with 'e' property
      if (data.e.length >= 4 && Array.isArray(data.e[3])) {
        // Single event in file format
        const game = parseGameData(data.e[3])
        if (game) games.push(game)
        return games
      }
      events = data.e
    } else if (data.events) {
      // Alternative API format
      events = data.events
    }

    // Parse multiple events
    for (const event of events) {
      if (Array.isArray(event)) {
        // Check if this is an event array (has at least 9 elements with markets at index 8)
        if (event.length >= 9 && event[8] && typeof event[8] === 'object') {
          const game = parseGameData(event)
          if (game) games.push(game)
        }
        // Check if it's a wrapper array containing events
        else if (event.length >= 4 && Array.isArray(event[3])) {
          for (const subEvent of event.slice(3)) {
            if (Array.isArray(subEvent) && subEvent.length >= 9) {
              const game = parseGameData(subEvent)
              if (game) games.push(game)
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('Error parsing games:', error)
  }

  // If no games parsed, check for specific structure
  if (games.length === 0 && data.e) {
    console.log('Attempting alternative parsing method...')
    // Try to find events in nested structure
    const findEvents = (obj: any, depth: number = 0): void => {
      if (depth > 5) return // Prevent infinite recursion

      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (Array.isArray(item) && item.length >= 9 && typeof item[1] === 'string' && typeof item[2] === 'string') {
            const game = parseGameData(item)
            if (game) games.push(game)
          } else {
            findEvents(item, depth + 1)
          }
        }
      } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
          findEvents(obj[key], depth + 1)
        }
      }
    }

    findEvents(data.e)
  }

  return games.length > 0 ? games : getMockGames()
}

function parseGameData(gameData: any[]): ParsedGame | null {
  try {
    // Validate basic structure
    if (!Array.isArray(gameData) || gameData.length < 9) {
      return null
    }

    const eventId = gameData[0]
    const homeTeam = gameData[1]  // e[3][1] = Home Team
    const awayTeam = gameData[2]  // e[3][2] = Away Team
    const startTime = new Date(gameData[4]).toISOString()
    const markets = gameData[8]

    // Validate required fields
    if (!eventId || !homeTeam || !awayTeam || !markets) {
      return null
    }

    // Get full game markets (period "0")
    const fullGameMarkets = markets["0"] || markets[0]
    if (!fullGameMarkets || !Array.isArray(fullGameMarkets)) {
      return null
    }

    // Parse handicap/spread (index 0)
    let spread = { home: "+0", away: "-0", homeOdds: "1.900", awayOdds: "1.900" }
    const handicapsData = fullGameMarkets[0]

    if (handicapsData) {
      let handicaps = handicapsData

      // Handle nested array structures
      if (Array.isArray(handicapsData)) {
        if (handicapsData.length > 0 && Array.isArray(handicapsData[0])) {
          if (Array.isArray(handicapsData[0][0])) {
            handicaps = handicapsData[0]
          } else {
            handicaps = handicapsData
          }
        }
      }

      // Find main line
      if (Array.isArray(handicaps) && handicaps.length > 0) {
        const mainLine = handicaps.find((h: any) =>
          Array.isArray(h) && h.length >= 5 && (h[6] === 0 || h[5] === 0)
        ) || handicaps[0]

        if (Array.isArray(mainLine) && mainLine.length >= 5) {
          const awaySpread = parseFloat(mainLine[0]) || 0
          const homeSpread = parseFloat(mainLine[1]) || 0
          spread = {
            away: awaySpread > 0 ? `+${awaySpread}` : `${awaySpread}`,
            home: homeSpread > 0 ? `+${homeSpread}` : `${homeSpread}`,
            awayOdds: mainLine[3] || "1.900",
            homeOdds: mainLine[4] || "1.900"
          }
        }
      }
    }

    // Parse totals (could be at index 1 or 2)
    let total = { line: "220.0", over: "1.900", under: "1.900" }
    const totalsData = fullGameMarkets[2] || fullGameMarkets[1]

    if (totalsData) {
      let totals = totalsData

      // Handle nested array structures
      if (Array.isArray(totalsData)) {
        if (totalsData.length > 0 && Array.isArray(totalsData[0])) {
          if (Array.isArray(totalsData[0][0])) {
            totals = totalsData[0]
          } else {
            totals = totalsData
          }
        }
      }

      // Find main total line
      if (Array.isArray(totals) && totals.length > 0) {
        const mainTotal = totals.find((t: any) =>
          Array.isArray(t) && t.length >= 4 && (t[5] === 0 || t[6] === 0)
        ) || totals[0]

        if (Array.isArray(mainTotal) && mainTotal.length >= 4) {
          const totalLine = mainTotal[0] || mainTotal[1]
          total = {
            line: String(totalLine),
            over: mainTotal[2] || "1.900",
            under: mainTotal[3] || "1.900"
          }
        }
      }
    }

    // Parse moneyline (usually at index 3)
    let ml = { away: "1.800", home: "2.100" }
    const moneylineData = fullGameMarkets[3] || fullGameMarkets[4]

    if (Array.isArray(moneylineData) && moneylineData.length >= 2) {
      ml = {
        away: moneylineData[0] || "1.800",
        home: moneylineData[1] || "2.100"
      }
    }

    // Parse player props (check multiple possible locations)
    const playerProps: ParsedGame['playerProps'] = []
    const propsLocations = [fullGameMarkets[1], fullGameMarkets[5], markets["1"]?.[1]]

    for (const propsData of propsLocations) {
      if (Array.isArray(propsData)) {
        propsData.forEach((propGroup: any) => {
          if (propGroup?.se && Array.isArray(propGroup.se)) {
            propGroup.se.forEach((prop: any) => {
              if (prop.n && prop.l && Array.isArray(prop.l)) {
                // Extract player name and market type
                const match = prop.n.match(/(.+?)\s*\((.+?)\)/)
                if (match) {
                  const [, playerName, market] = match
                  const overLine = prop.l.find((l: any) => l.n === "Over" || l.n === "O")
                  const underLine = prop.l.find((l: any) => l.n === "Under" || l.n === "U")

                  if (overLine && underLine) {
                    playerProps.push({
                      playerId: prop.si?.toString() || String(playerProps.length),
                      playerName: playerName.trim(),
                      market,
                      line: overLine.h || underLine.h || 0,
                      overOdds: String(overLine.p || "1.900"),
                      underOdds: String(underLine.p || "1.900")
                    })
                  }
                }
              }
            })
          }
        })
      }
    }

    return {
      gameId: eventId.toString(),
      homeTeam,
      awayTeam,
      startTime,
      homeOdds: {
        spread: spread.home,
        spreadOdds: spread.homeOdds,
        moneyline: ml.home,
        total: total.line,
        overOdds: total.over,
        underOdds: total.under
      },
      awayOdds: {
        spread: spread.away,
        spreadOdds: spread.awayOdds,
        moneyline: ml.away,
        total: total.line,
        overOdds: total.over,
        underOdds: total.under
      },
      playerProps: playerProps.slice(0, 15) // Limit to 15 props per game
    }

  } catch (error) {
    console.error('Error parsing game data:', error)
    return null
  }
}

function parseDBGame(game: any, odds: any[]): ParsedGame | null {
  try {
    // Initialize default values
    const result: ParsedGame = {
      gameId: game.eventId || game.gameId,
      homeTeam: game.homeTeam || 'Home Team',
      awayTeam: game.awayTeam || 'Away Team',
      startTime: game.startTime || new Date().toISOString(),
      homeOdds: {
        spread: '+0',
        spreadOdds: '1.900',
        moneyline: '2.000',
        total: '220.0',
        overOdds: '1.900',
        underOdds: '1.900'
      },
      awayOdds: {
        spread: '-0',
        spreadOdds: '1.900',
        moneyline: '2.000',
        total: '220.0',
        overOdds: '1.900',
        underOdds: '1.900'
      },
      playerProps: []
    }

    // Parse odds from database rows
    for (const row of odds) {
      const marketType = row.market_type
      const marketName = row.market_name?.toLowerCase() || ''
      const selection = row.selection?.toLowerCase() || ''

      if (marketType === 'moneyline') {
        // Check if it's a game moneyline (not 1st half or other period)
        if (marketName.includes('game total') || (!marketName.includes('1st half') && !marketName.includes('quarter'))) {
          // Check which team based on selection
          if (selection.includes('golden state') || selection.includes('warriors')) {
            result.homeOdds.moneyline = row.odds_decimal?.toString() || '2.000'
          } else if (selection.includes('denver') || selection.includes('nuggets')) {
            result.awayOdds.moneyline = row.odds_decimal?.toString() || '2.000'
          }
        }
      } else if (marketType === 'spread') {
        // Check if it's a full game spread (not 1st half or quarter)
        if (!marketName.includes('1st half') && !marketName.includes('quarter')) {
          const handicap = row.handicap
          // Check which team based on selection
          if (selection.includes('golden state') || selection.includes('warriors')) {
            result.homeOdds.spread = handicap > 0 ? `+${handicap}` : `${handicap}`
            result.homeOdds.spreadOdds = row.odds_decimal?.toString() || '1.900'
          } else if (selection.includes('denver') || selection.includes('nuggets')) {
            result.awayOdds.spread = handicap > 0 ? `+${handicap}` : `${handicap}`
            result.awayOdds.spreadOdds = row.odds_decimal?.toString() || '1.900'
          }
        }
      } else if (marketType === 'total') {
        // Parse game totals (not team-specific)
        if (marketName.includes('game total')) {
          const total = row.handicap?.toString() || '220.0'
          result.homeOdds.total = total
          result.awayOdds.total = total

          if (selection.includes('over')) {
            result.homeOdds.overOdds = row.odds_decimal?.toString() || '1.900'
            result.awayOdds.overOdds = row.odds_decimal?.toString() || '1.900'
          } else if (selection.includes('under')) {
            result.homeOdds.underOdds = row.odds_decimal?.toString() || '1.900'
            result.awayOdds.underOdds = row.odds_decimal?.toString() || '1.900'
          }
        }
      } else if (marketType === 'player_prop') {
        // Parse player props
        const match = row.market_name?.match(/(.+?)\s*\((.+?)\)/)
        if (match) {
          const [, playerName, market] = match

          // Check if we already have this prop
          const existingProp = result.playerProps?.find(
            p => p.playerName === playerName.trim() && p.market === market
          )

          if (!existingProp && result.playerProps) {
            const newProp: any = {
              playerId: `${playerName.replace(/\s+/g, '_').toLowerCase()}_${market.toLowerCase()}`,
              playerName: playerName.trim(),
              market,
              line: row.handicap || 0,
              overOdds: '1.900',
              underOdds: '1.900'
            }

            // Set the appropriate odds
            if (row.selection?.toLowerCase() === 'over') {
              newProp.overOdds = row.odds_decimal?.toString() || '1.900'
            } else if (row.selection?.toLowerCase() === 'under') {
              newProp.underOdds = row.odds_decimal?.toString() || '1.900'
            }

            result.playerProps.push(newProp)
          } else if (existingProp) {
            // Update existing prop with missing odds
            if (row.selection?.toLowerCase() === 'over') {
              existingProp.overOdds = row.odds_decimal?.toString() || '1.900'
            } else if (row.selection?.toLowerCase() === 'under') {
              existingProp.underOdds = row.odds_decimal?.toString() || '1.900'
            }
          }
        }
      }
    }

    return result
  } catch (error) {
    console.error('Error parsing DB game:', error)
    return null
  }
}

function getMockGames(): ParsedGame[] {
  // Return the two games you mentioned: IND vs OKC and GSW vs DEN
  return [
    {
      gameId: "1617585501",
      homeTeam: "Indiana Pacers",
      awayTeam: "Oklahoma City Thunder",
      startTime: new Date(Date.now() + 3600000).toISOString(),
      homeOdds: {
        spread: "+7.0",
        spreadOdds: "1.833",
        moneyline: "3.620",
        total: "232.5",
        overOdds: "1.990",
        underOdds: "1.892"
      },
      awayOdds: {
        spread: "-7.0",
        spreadOdds: "2.070",
        moneyline: "1.327",
        total: "232.5",
        overOdds: "1.990",
        underOdds: "1.892"
      },
      playerProps: [
        {
          playerId: "1",
          playerName: "Shai Gilgeous-Alexander",
          market: "Points",
          line: 32.5,
          overOdds: "1.925",
          underOdds: "1.813"
        },
        {
          playerId: "2",
          playerName: "Chet Holmgren",
          market: "Rebounds",
          line: 8.5,
          overOdds: "1.869",
          underOdds: "1.952"
        },
        {
          playerId: "3",
          playerName: "Pascal Siakam",
          market: "Points",
          line: 21.5,
          overOdds: "1.900",
          underOdds: "1.900"
        },
        {
          playerId: "4",
          playerName: "Tyrese Haliburton",
          market: "Assists",
          line: 8.5,
          overOdds: "1.833",
          underOdds: "2.000"
        }
      ]
    },
    {
      gameId: "1617585502",
      homeTeam: "Denver Nuggets",
      awayTeam: "Golden State Warriors",
      startTime: new Date(Date.now() + 7200000).toISOString(),
      homeOdds: {
        spread: "-5.5",
        spreadOdds: "1.952",
        moneyline: "1.476",
        total: "235.0",
        overOdds: "1.909",
        underOdds: "1.909"
      },
      awayOdds: {
        spread: "+5.5",
        spreadOdds: "1.952",
        moneyline: "2.800",
        total: "235.0",
        overOdds: "1.909",
        underOdds: "1.909"
      },
      playerProps: [
        {
          playerId: "5",
          playerName: "Nikola Jokić",
          market: "Points",
          line: 26.5,
          overOdds: "1.869",
          underOdds: "1.952"
        },
        {
          playerId: "6",
          playerName: "Stephen Curry",
          market: "Points",
          line: 28.5,
          overOdds: "1.952",
          underOdds: "1.869"
        },
        {
          playerId: "7",
          playerName: "Jamal Murray",
          market: "Points",
          line: 22.5,
          overOdds: "1.900",
          underOdds: "1.900"
        },
        {
          playerId: "8",
          playerName: "Draymond Green",
          market: "Rebounds",
          line: 6.5,
          overOdds: "1.813",
          underOdds: "2.020"
        },
        {
          playerId: "9",
          playerName: "Nikola Jokić",
          market: "Assists",
          line: 9.5,
          overOdds: "2.000",
          underOdds: "1.813"
        }
      ]
    }
  ]
}