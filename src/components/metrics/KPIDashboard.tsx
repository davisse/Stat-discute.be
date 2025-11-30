'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Award,
  Brain,
  Zap,
  Users,
  Code,
  Shield,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { Card, CardContent, CardHeader, Badge, Progress } from '../ui'
import { cn } from '@/lib/utils'

export function KPIDashboard() {
  const { kpiMetrics } = useAppStore()

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Tableau de Bord des KPIs
        </h2>
        <p className="text-gray-500">
          Métriques de performance pour Claude Next-Gen (Project Alexandria)
        </p>
      </div>

      {/* Benchmark scores */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Scores Benchmarks (A1)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <BenchmarkCard
            name="MMLU"
            score={kpiMetrics.benchmarkScores.mmlu}
            target={95}
            description="Connaissances générales"
            icon={Brain}
            trend={+2.3}
          />
          <BenchmarkCard
            name="GPQA"
            score={kpiMetrics.benchmarkScores.gpqa}
            target={70}
            description="Questions niveau PhD"
            icon={Target}
            trend={+5.1}
          />
          <BenchmarkCard
            name="HumanEval+"
            score={kpiMetrics.benchmarkScores.humanEval}
            target={92}
            description="Génération de code"
            icon={Code}
            trend={+3.8}
          />
        </div>
      </div>

      {/* Quality metrics */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Hallucination rate */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Taux d&apos;Hallucination RAG
              </h4>
              <Badge variant={kpiMetrics.hallucinationRate < 1 ? 'success' : 'warning'}>
                Objectif: {'<'}1%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold text-gray-900">
                {kpiMetrics.hallucinationRate}%
              </span>
              <span className="text-sm text-green-600 flex items-center gap-1 mb-1">
                <TrendingDown className="w-4 h-4" />
                -0.3% vs mois dernier
              </span>
            </div>
            <Progress
              value={kpiMetrics.hallucinationRate}
              max={5}
              variant={kpiMetrics.hallucinationRate < 1 ? 'success' : 'warning'}
              className="mt-4"
            />
            <p className="text-sm text-gray-500 mt-2">
              Mesuré par évaluation humaine sur 1000 résumés de documents
            </p>
          </CardContent>
        </Card>

        {/* TTFT */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Latence TTFT (A2)
              </h4>
              <Badge variant={kpiMetrics.avgTTFT < 300 ? 'success' : 'warning'}>
                Objectif: {'<'}300ms
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold text-gray-900">
                {kpiMetrics.avgTTFT}ms
              </span>
              <span className="text-sm text-green-600 flex items-center gap-1 mb-1">
                <TrendingDown className="w-4 h-4" />
                -50% vs Claude 3 Opus
              </span>
            </div>
            <Progress
              value={300 - kpiMetrics.avgTTFT}
              max={300}
              variant="success"
              className="mt-4"
            />
            <p className="text-sm text-gray-500 mt-2">
              Time To First Token moyen sur contextes {'>'}100k tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business KPIs */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          KPIs Produit & Business
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Long Contexte"
            value={`+${kpiMetrics.longContextUsage}%`}
            description="Requêtes >50k tokens"
            target="+40%"
            icon={Brain}
            achieved={kpiMetrics.longContextUsage >= 40}
          />
          <MetricCard
            title="Rétention Pro"
            value={`${kpiMetrics.proRetention}%`}
            description="Abonnés mensuels"
            target="+15%"
            icon={Users}
            achieved={kpiMetrics.proRetention >= 85}
          />
          <MetricCard
            title="Function Calling"
            value={`+${kpiMetrics.functionCallingGrowth}%`}
            description="Volume d'appels API"
            target="+100%"
            icon={Code}
            achieved={kpiMetrics.functionCallingGrowth >= 100}
          />
          <MetricCard
            title="Disponibilité"
            value={`${kpiMetrics.availability}%`}
            description="SLA API"
            target="99.9%"
            icon={Shield}
            achieved={kpiMetrics.availability >= 99.9}
          />
        </div>
      </div>

      {/* Requirements status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Statut des Exigences PRD
        </h3>
        <Card variant="bordered">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Fonctionnalité
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Priorité
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                <RequirementRow id="A1" name="Amélioration du Raisonnement" priority="MUST" status="completed" />
                <RequirementRow id="A2" name="Optimisation Latence Long Contexte" priority="MUST" status="completed" />
                <RequirementRow id="B1" name="OCR et Analyse Graphique Avancée" priority="MUST" status="in-progress" />
                <RequirementRow id="B2" name="Ingestion Documents Mixtes" priority="MUST" status="completed" />
                <RequirementRow id="C1" name="Citations Granulaires Obligatoires" priority="MUST" status="completed" />
                <RequirementRow id="C2" name="Détection d'Incertitude" priority="SHOULD" status="completed" />
                <RequirementRow id="D1" name="Function Calling Robuste" priority="MUST" status="completed" />
                <RequirementRow id="D2" name="Claude Connect" priority="COULD" status="beta" />
                <RequirementRow id="E1" name="Espace de Travail Projets" priority="SHOULD" status="completed" />
                <RequirementRow id="E2" name="Volet Visualisation Documents" priority="SHOULD" status="completed" />
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BenchmarkCard({
  name,
  score,
  target,
  description,
  icon: Icon,
  trend,
}: {
  name: string
  score: number
  target: number
  description: string
  icon: React.ElementType
  trend: number
}) {
  const achieved = score >= target

  return (
    <Card variant="elevated">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <Badge variant={achieved ? 'success' : 'warning'} size="sm">
            Cible: {target}%
          </Badge>
        </div>
        <h4 className="text-sm text-gray-500">{name}</h4>
        <div className="flex items-end justify-between mt-1">
          <span className="text-3xl font-bold text-gray-900">{score}%</span>
          <span
            className={cn(
              'text-sm flex items-center gap-1',
              trend > 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  title,
  value,
  description,
  target,
  icon: Icon,
  achieved,
}: {
  title: string
  value: string
  description: string
  target: string
  icon: React.ElementType
  achieved: boolean
}) {
  return (
    <Card variant="bordered" className={achieved ? 'border-green-200 bg-green-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={cn('w-5 h-5', achieved ? 'text-green-600' : 'text-gray-400')} />
          {achieved && <CheckCircle className="w-4 h-4 text-green-600" />}
        </div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">
          {description} (cible: {target})
        </p>
      </CardContent>
    </Card>
  )
}

function RequirementRow({
  id,
  name,
  priority,
  status,
}: {
  id: string
  name: string
  priority: 'MUST' | 'SHOULD' | 'COULD'
  status: 'completed' | 'in-progress' | 'pending' | 'beta'
}) {
  const priorityColors = {
    MUST: 'bg-red-100 text-red-700',
    SHOULD: 'bg-yellow-100 text-yellow-700',
    COULD: 'bg-blue-100 text-blue-700',
  }

  const statusConfig = {
    completed: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
    'in-progress': { label: 'En cours', color: 'bg-yellow-100 text-yellow-700' },
    pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
    beta: { label: 'Beta', color: 'bg-purple-100 text-purple-700' },
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-mono text-gray-600">{id}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            priorityColors[priority]
          )}
        >
          {priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            statusConfig[status].color
          )}
        >
          {statusConfig[status].label}
        </span>
      </td>
    </tr>
  )
}
