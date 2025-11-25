# Admin Dashboard - Prochaines Étapes

**Date**: 2025-11-19
**Phase Actuelle**: Implémentation terminée, validation en cours

## Étapes Immédiates (Cette Semaine)

### 1. Tests et Validation ⏳
- [ ] Exécuter plan de validation complet
- [ ] Tester toutes les API routes avec curl
- [ ] Vérifier UI sur différents navigateurs
- [ ] Tester responsive design (mobile/tablet)
- [ ] Vérifier logs database après sync
- [ ] Prendre captures d'écran pour documentation

**Fichier**: `3.ACTIVE_PLANS/admin_dashboard_validation.md`

### 2. Corrections Bugs (Si nécessaire)
- [ ] Fixer erreurs TypeScript détectées
- [ ] Corriger problèmes UI/UX identifiés
- [ ] Optimiser queries lentes
- [ ] Améliorer error handling

### 3. Documentation Utilisateur
- [ ] Créer guide utilisateur admin
- [ ] Documenter workflow sync complet
- [ ] Ajouter FAQ erreurs courantes
- [ ] Créer vidéo démo (optionnel)

## Améliorations Court Terme (2 Semaines)

### 4. Authentification Admin 🔐
**Priorité**: Haute

Implémenter authentification pour sécuriser l'accès admin.

**Technologies suggérées**:
- NextAuth.js v5
- OAuth providers (Google, GitHub)
- JWT tokens
- Protected routes middleware

**Fichiers à créer**:
```
frontend/src/
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/route.ts
├── middleware.ts (protect /admin routes)
└── lib/
    └── auth.ts
```

**Tasks**:
- [ ] Installer NextAuth.js
- [ ] Configurer providers
- [ ] Créer page login
- [ ] Protéger routes admin
- [ ] Ajouter logout button
- [ ] Tester avec différents users

### 5. Rate Limiting ⚡
**Priorité**: Moyenne

Limiter les requêtes sync pour éviter surcharge.

**Technologies suggérées**:
- upstash/ratelimit
- Redis cache
- IP-based limiting

**Implementation**:
```typescript
// api/admin/sync-games/route.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Continue with sync...
}
```

**Tasks**:
- [ ] Setup Upstash Redis
- [ ] Installer @upstash/ratelimit
- [ ] Implémenter limites par endpoint
- [ ] Ajouter UI feedback pour rate limit
- [ ] Tester limites

### 6. Real-time Updates 📡
**Priorité**: Basse

Afficher logs en temps réel pendant sync.

**Technologies suggérées**:
- Server-Sent Events (SSE)
- WebSocket (socket.io)
- Polling alternatif

**Implementation SSE**:
```typescript
// api/admin/sync-games-stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const python = spawn('python3', [...])

      python.stdout.on('data', (data) => {
        controller.enqueue(`data: ${data}\n\n`)
      })

      python.on('close', () => {
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

**Tasks**:
- [ ] Créer SSE endpoint
- [ ] Créer composant LogStream
- [ ] Afficher logs progressivement
- [ ] Gérer reconnexion
- [ ] Tester stabilité

## Améliorations Moyen Terme (1 Mois)

### 7. Graphiques et Visualisations 📊
**Priorité**: Moyenne

Ajouter charts pour tendances temporelles.

**Libraries suggérées**:
- recharts (léger, React-friendly)
- Chart.js (populaire)
- visx (D3 + React)

**Charts à implémenter**:
- Timeline matchs par jour
- Evolution moyennes joueurs
- Tendances standings
- Performance sync (durées)

**Tasks**:
- [ ] Installer recharts
- [ ] Créer composant LineChart
- [ ] Ajouter données temporelles queries
- [ ] Page admin/analytics
- [ ] Responsive charts

### 8. Export Données 💾
**Priorité**: Basse

Permettre export CSV/JSON des données.

**Implementation**:
```typescript
// api/admin/export/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'games' | 'players' | 'standings'
  const format = searchParams.get('format') // 'csv' | 'json'

  const data = await getExportData(type)

  if (format === 'csv') {
    return new Response(convertToCSV(data), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}.csv"`,
      },
    })
  }

  return NextResponse.json(data)
}
```

**Tasks**:
- [ ] Créer export routes
- [ ] Implémenter CSV conversion
- [ ] Ajouter boutons export UI
- [ ] Tester gros exports
- [ ] Optimiser mémoire

### 9. Recherche et Filtres 🔍
**Priorité**: Moyenne

Ajouter recherche et filtres sur tables.

**Features**:
- Search bar pour joueurs/équipes
- Filtres date pour matchs
- Tri colonnes DataTable
- Pagination serveur

**Implementation**:
```typescript
// composants/SearchableDataTable.tsx
'use client'

export function SearchableDataTable({ ... }) {
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')

  // Filter + sort logic
  const filteredData = data
    .filter(row => ...)
    .sort((a, b) => ...)

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <DataTable
        data={filteredData}
        onSort={(column) => {...}}
      />
    </div>
  )
}
```

**Tasks**:
- [ ] Créer SearchableDataTable
- [ ] Implémenter tri côté client
- [ ] Ajouter debounce search
- [ ] Filtres date picker
- [ ] Pagination serveur

## Améliorations Long Terme (3 Mois)

### 10. Monitoring et Alertes 🚨
**Priorité**: Haute

Système d'alertes pour erreurs sync.

**Technologies**:
- Sentry (error tracking)
- Email notifications
- Slack webhooks
- Discord webhooks

**Tasks**:
- [ ] Setup Sentry
- [ ] Configurer email SMTP
- [ ] Webhooks pour erreurs critiques
- [ ] Dashboard health check
- [ ] Logs aggregation

### 11. Scheduling Automatique ⏰
**Priorité**: Haute

Automatiser les syncs quotidiennes.

**Technologies**:
- Vercel Cron Jobs
- Node-cron
- External cron (server)

**Implementation Vercel Cron**:
```typescript
// api/cron/daily-sync/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Run sync workflow
  await syncGames()
  await fetchPlayerStats()
  await calculateAnalytics()

  return NextResponse.json({ success: true })
}
```

**vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/daily-sync",
    "schedule": "0 6 * * *"
  }]
}
```

**Tasks**:
- [ ] Créer cron routes
- [ ] Configurer vercel.json
- [ ] Setup cron secret
- [ ] Tester executions
- [ ] Logging cron runs

### 12. Multi-Season Support 📅
**Priorité**: Moyenne

Gérer plusieurs saisons simultanément.

**Features**:
- Dropdown sélection saison
- Context provider saison
- Queries adaptées
- Archives saisons passées

**Tasks**:
- [ ] SeasonSelector component
- [ ] Season context provider
- [ ] Modifier queries filtre saison
- [ ] Page archives saisons
- [ ] Migration données historiques

## Optimisations Performance

### 13. Cache Layer 🚀
**Priorité**: Moyenne

Cacher données fréquemment accédées.

**Technologies**:
- Redis
- Next.js unstable_cache
- SWR client-side

**Implementation**:
```typescript
import { unstable_cache } from 'next/cache'

export const getCachedAdminStats = unstable_cache(
  async () => getAdminStats(),
  ['admin-stats'],
  { revalidate: 300 } // 5 minutes
)
```

**Tasks**:
- [ ] Setup Redis (optionnel)
- [ ] Implémenter unstable_cache
- [ ] Définir durées revalidation
- [ ] Invalidation cache après sync
- [ ] Mesurer gains performance

### 14. Pagination Serveur 📄
**Priorité**: Basse

Pagination efficace pour grandes tables.

**Implementation**:
```typescript
// api/admin/games/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    getGamesWithStats(limit, offset),
    getTotalGamesCount()
  ])

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}
```

**Tasks**:
- [ ] Ajouter count queries
- [ ] Pagination UI component
- [ ] Previous/Next buttons
- [ ] Jump to page
- [ ] URL state sync

## Sécurité

### 15. Input Validation ✅
**Priorité**: Haute

Valider tous les inputs utilisateur.

**Technologies**:
- Zod schemas
- Validation middleware

**Implementation**:
```typescript
import { z } from 'zod'

const GamesQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const validated = GamesQuerySchema.parse({
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
  })

  // Use validated.limit and validated.offset
}
```

**Tasks**:
- [ ] Installer Zod
- [ ] Créer schemas validation
- [ ] Valider tous endpoints
- [ ] Error messages clairs
- [ ] Tests validation

### 16. CSRF Protection 🛡️
**Priorité**: Haute

Protéger contre CSRF attacks.

**Implementation**:
- CSRF tokens
- SameSite cookies
- Origin header validation

**Tasks**:
- [ ] Implémenter CSRF middleware
- [ ] Ajouter tokens forms
- [ ] Tester protection
- [ ] Documentation sécurité

## Roadmap Timeline

```
Week 1-2:   Tests validation + Corrections bugs
Week 3-4:   Authentification + Rate limiting
Month 2:    Real-time updates + Charts
Month 3:    Export + Recherche/Filtres
Quarter 2:  Monitoring + Scheduling + Multi-season
```

## Priorités Globales

1. **Critique** (Faire maintenant):
   - ✅ Tests et validation
   - 🔐 Authentification
   - ⚡ Rate limiting

2. **Important** (2-4 semaines):
   - 📊 Charts et visualisations
   - 🔍 Recherche et filtres
   - 🚨 Monitoring

3. **Nice to Have** (Optionnel):
   - 📡 Real-time updates
   - 💾 Export données
   - 📅 Multi-season support

## Ressources

### Documentation
- NextAuth.js: https://next-auth.js.org
- Upstash Redis: https://upstash.com
- Recharts: https://recharts.org
- Sentry: https://sentry.io

### Tutorials
- Next.js Cron Jobs: https://vercel.com/docs/cron-jobs
- Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Rate Limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
