'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlayerAdvancedSeasonStats } from '@/lib/queries'

interface UsageLeadersTableProps {
  data: PlayerAdvancedSeasonStats[]
}

export function UsageLeadersTable({ data }: UsageLeadersTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">#</TableHead>
            <TableHead className="text-gray-400">Player</TableHead>
            <TableHead className="text-gray-400">Pos</TableHead>
            <TableHead className="text-gray-400">Team</TableHead>
            <TableHead className="text-gray-400 text-center">GP</TableHead>
            <TableHead className="text-gray-400 text-center">Starter</TableHead>
            <TableHead className="text-gray-400 text-right">USG%</TableHead>
            <TableHead className="text-gray-400 text-right">PPG</TableHead>
            <TableHead className="text-gray-400 text-right">TS%</TableHead>
            <TableHead className="text-gray-400 text-right">eFG%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((player, index) => (
            <TableRow key={player.player_id} className="border-gray-700 hover:bg-gray-800/50">
              <TableCell className="text-gray-500 font-mono">{index + 1}</TableCell>
              <TableCell className="font-medium text-white">{player.full_name}</TableCell>
              <TableCell className="text-gray-400 text-xs">{player.position || '-'}</TableCell>
              <TableCell className="text-gray-400">{player.team_abbreviation}</TableCell>
              <TableCell className="text-center text-gray-400">{player.games}</TableCell>
              <TableCell className="text-center">
                {player.starter_pct === 100 ? (
                  <span className="text-green-500 font-medium">100%</span>
                ) : player.starter_pct > 0 ? (
                  <span className="text-yellow-500">{player.starter_pct.toFixed(0)}%</span>
                ) : (
                  <span className="text-gray-500">Bench</span>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold text-yellow-500">
                {player.avg_usage.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right text-white">{player.ppg.toFixed(1)}</TableCell>
              <TableCell className="text-right text-gray-300">
                {(player.avg_ts * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right text-gray-300">
                {(player.avg_efg * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
