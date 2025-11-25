'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { TeammateAbsenceImpact } from '@/lib/queries'

interface Team {
  team_id: number
  abbreviation: string
  full_name: string
}

interface AbsenceImpactSectionProps {
  teams: Team[]
}

export function AbsenceImpactSection({ teams }: AbsenceImpactSectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('ATL')
  const [absenceData, setAbsenceData] = useState<TeammateAbsenceImpact[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/advanced-stats/absence-impact?team=${selectedTeam}`)
        if (response.ok) {
          const data = await response.json()
          setAbsenceData(data)
        }
      } catch (error) {
        console.error('Failed to fetch absence impact data:', error)
      }
      setLoading(false)
    }

    if (selectedTeam) {
      fetchData()
    }
  }, [selectedTeam])

  const getDeltaIcon = (delta: number) => {
    if (delta > 1) return <ArrowUp className="h-3 w-3 text-green-500 inline" />
    if (delta < -1) return <ArrowDown className="h-3 w-3 text-red-500 inline" />
    return <Minus className="h-3 w-3 text-gray-500 inline" />
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 2) return 'text-green-400'
    if (delta > 0) return 'text-green-500'
    if (delta < -2) return 'text-red-400'
    if (delta < 0) return 'text-red-500'
    return 'text-gray-400'
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-blue-500" />
              Teammate Absence Impact
            </CardTitle>
            <CardDescription className="text-gray-400">
              How player stats change when a teammate is out
            </CardDescription>
          </div>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-[180px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teams.map((team) => (
              <option key={team.team_id} value={team.abbreviation}>
                {team.abbreviation} - {team.full_name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : absenceData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No significant absence data available for this team yet.
            <br />
            <span className="text-sm">Requires at least 2 games without a starter.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Player</TableHead>
                  <TableHead className="text-gray-400">When Out</TableHead>
                  <TableHead className="text-gray-400 text-center">Games</TableHead>
                  <TableHead className="text-gray-400 text-right">USG% With</TableHead>
                  <TableHead className="text-gray-400 text-right">USG% Without</TableHead>
                  <TableHead className="text-gray-400 text-right">USG Delta</TableHead>
                  <TableHead className="text-gray-400 text-right">PTS Delta</TableHead>
                  <TableHead className="text-gray-400 text-right">AST Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absenceData.slice(0, 20).map((row, index) => (
                  <TableRow key={`${row.player_id}-${row.teammate_id}-${index}`} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">{row.player_name}</TableCell>
                    <TableCell className="text-orange-400">{row.teammate_name}</TableCell>
                    <TableCell className="text-center text-gray-400">
                      <span className="text-green-500">{row.games_with}</span>
                      {' / '}
                      <span className="text-red-500">{row.games_without}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {row.usg_with.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {row.usg_without.toFixed(1)}%
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getDeltaColor(row.usg_delta)}`}>
                      {getDeltaIcon(row.usg_delta)} {row.usg_delta > 0 ? '+' : ''}{row.usg_delta.toFixed(1)}%
                    </TableCell>
                    <TableCell className={`text-right ${getDeltaColor(row.pts_delta)}`}>
                      {getDeltaIcon(row.pts_delta)} {row.pts_delta > 0 ? '+' : ''}{row.pts_delta.toFixed(1)}
                    </TableCell>
                    <TableCell className={`text-right ${getDeltaColor(row.ast_delta)}`}>
                      {getDeltaIcon(row.ast_delta)} {row.ast_delta > 0 ? '+' : ''}{row.ast_delta.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
