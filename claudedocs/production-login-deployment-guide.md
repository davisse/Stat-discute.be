# Production Login Deployment Guide

> Documentation technique du système d'authentification après déploiement en production sur stats.defendini.be

**Date**: 2025-01-06
**Version**: 1.0
**Statut**: Vérifié et fonctionnel

---

## Table des matières

1. [Architecture d'authentification](#architecture-dauthentification)
2. [Configuration JWT pour Docker](#configuration-jwt-pour-docker)
3. [Flux d'authentification](#flux-dauthentification)
4. [Sécurité et Rate Limiting](#sécurité-et-rate-limiting)
5. [Troubleshooting](#troubleshooting)
6. [Checklist de déploiement](#checklist-de-déploiement)

---

## Architecture d'authentification

### Stack technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Hachage mot de passe** | Argon2id | OWASP 2025 recommandé, 300x plus résistant aux GPU que bcrypt |
| **Tokens JWT** | EdDSA (Ed25519) | Signatures compactes, haute performance |
| **Bibliothèque JWT** | `jose` | Standard, support EdDSA natif |
| **Sessions** | PostgreSQL | Persistance, device fingerprinting |

### Fichiers clés

```
frontend/src/
├── app/api/auth/
│   └── login/route.ts       # Endpoint POST /api/auth/login
└── lib/auth/
    ├── jwt.ts               # Génération/vérification JWT + normalizeKey()
    ├── password.ts          # Argon2id hashing
    └── rate-limit.ts        # Rate limiting IP et compte
```

---

## Configuration JWT pour Docker

### Problème résolu

**Symptôme**: Erreur 500 lors du login en production
**Cause**: Les clés JWT étaient vides dans le conteneur Docker
**Message d'erreur**: `JWT_PRIVATE_KEY environment variable is not set`

### Solution: Format `.env` correct

Les clés PEM doivent avoir les retours à la ligne échappés comme **chaînes littérales** `\n`:

```env
# ✅ CORRECT - Format pour Docker Compose
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIBxecXWCWpUwkgcmJt2Eq54yGsZc3H6fp3ZeLbCyLR7U\n-----END PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA0cp6fw9UCSism8IMlM/nAzqlPeoTzeEqGLGUYNlUiJ0=\n-----END PUBLIC KEY-----
```

```env
# ❌ INCORRECT - Retours à la ligne réels (échoue dans Docker)
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIBxecXWCWpUwkgcmJt2Eq54yGsZc3H6fp3ZeLbCyLR7U
-----END PRIVATE KEY-----
```

### Fonction `normalizeKey()`

Le fichier `frontend/src/lib/auth/jwt.ts` contient une fonction critique qui convertit les `\n` échappés en vrais retours à la ligne:

```typescript
// frontend/src/lib/auth/jwt.ts:15-17
function normalizeKey(pem: string): string {
  return pem.replace(/\\n/g, '\n')
}
```

Cette fonction est appelée lors de l'import des clés:

```typescript
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  if (!pem) {
    throw new Error('JWT_PRIVATE_KEY environment variable is not set')
  }
  try {
    return await jose.importPKCS8(normalizeKey(pem), 'EdDSA')
  } catch (error) {
    throw new Error(`Failed to import private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
```

### Configuration des tokens

```typescript
// frontend/src/lib/auth/jwt.ts
export const ACCESS_TOKEN_CONFIG = {
  algorithm: 'EdDSA' as const,
  expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '30d',  // DEV: 30 jours
  issuer: 'stat-discute.be',
  audience: 'stat-discute-api'
}

export const REFRESH_TOKEN_CONFIG = {
  algorithm: 'EdDSA' as const,
  expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '90d', // DEV: 90 jours
  issuer: 'stat-discute.be',
  audience: 'stat-discute-api'
}
```

---

## Flux d'authentification

### Endpoint: `POST /api/auth/login`

```
frontend/src/app/api/auth/login/route.ts
```

### Étapes du flux

```
1. VALIDATION INPUT (Zod schema)
   └─ email: string.email().toLowerCase()
   └─ password: string.min(1)
   └─ rememberMe: boolean (optionnel)

2. RATE LIMITING
   └─ checkLoginRateLimit(email, ipAddress)
   └─ Vérifie limites IP et compte

3. RECHERCHE UTILISATEUR
   └─ SELECT * FROM users WHERE email = $1

4. VÉRIFICATIONS STATUT
   └─ Utilisateur existe?
   └─ Compte actif (is_active)?
   └─ Compte vérifié (email_verified)?
   └─ Compte verrouillé (locked_until)?

5. VÉRIFICATION MOT DE PASSE
   └─ argon2.verify(hash, password)
   └─ Algorithme: Argon2id

6. LOGIN RÉUSSI
   └─ Création session (user_sessions table)
   └─ Génération tokens JWT (access + refresh)
   └─ Reset compteur échecs

7. SET COOKIES
   └─ access_token: HttpOnly, Secure, SameSite=Lax
   └─ refresh_token: HttpOnly, Secure, SameSite=Lax
```

### Réponses

```typescript
// Succès (200)
{
  success: true,
  user: {
    userId: bigint,
    email: string,
    fullName: string,
    role: 'admin' | 'user',
    isActive: boolean,
    emailVerified: boolean
  }
}

// Erreurs (400, 401, 403, 429, 500)
{
  error: string,         // Code d'erreur
  message: string,       // Message utilisateur (FR)
  resetAt?: Date,        // Pour rate limiting
  lockedUntil?: Date     // Pour lockout
}
```

---

## Sécurité et Rate Limiting

### Configuration Rate Limiting

```typescript
// frontend/src/lib/auth/rate-limit.ts
const RATE_LIMIT_CONFIG = {
  // Limites IP
  maxAttemptsPerIp: 10,        // 10 tentatives
  ipWindowMinutes: 15,         // par 15 minutes

  // Limites compte
  maxAttemptsPerAccount: 5,    // 5 tentatives
  accountWindowMinutes: 15,    // par 15 minutes

  // Verrouillage
  lockoutDurationMinutes: 30,  // 30 minutes
  lockoutThreshold: 5,         // après 5 échecs
}
```

### Comportement

| Scénario | Action |
|----------|--------|
| 10 échecs depuis même IP | Blocage IP 15 minutes |
| 5 échecs même compte | Blocage compte 15 minutes |
| 5 échecs consécutifs | Verrouillage compte 30 minutes |
| Login réussi | Reset compteurs |

### Configuration Argon2id

```typescript
// frontend/src/lib/auth/password.ts
const ARGON2_CONFIG: argon2.Options = {
  type: argon2.argon2id,  // Recommandé OWASP 2025
  memoryCost: 65536,      // 64 MB RAM
  timeCost: 3,            // 3 itérations
  parallelism: 4,         // 4 threads
  hashLength: 32,         // 256 bits
}
```

---

## Troubleshooting

### Erreur: "JWT_PRIVATE_KEY environment variable is not set"

**Cause**: Variable d'environnement vide ou mal formatée

**Solution**:
1. Vérifier le format `.env` (voir section Configuration JWT)
2. S'assurer que les `\n` sont des chaînes littérales
3. Reconstruire l'image Docker: `docker compose build --no-cache`
4. Redémarrer: `docker compose up -d`

### Erreur: "Failed to import private key"

**Cause**: Format de clé invalide

**Solution**:
1. Regénérer les clés EdDSA:
```bash
# Générer clé privée
openssl genpkey -algorithm ed25519 -out private.pem

# Extraire clé publique
openssl pkey -in private.pem -pubout -out public.pem

# Convertir en une ligne avec \n
cat private.pem | tr '\n' '\\' | sed 's/\\/\\n/g' | sed 's/\\n$//'
```

2. Mettre à jour `.env` avec les nouvelles clés

### Erreur: "Trop de tentatives" (429)

**Cause**: Rate limiting déclenché

**Solution**:
- Attendre le délai indiqué dans `resetAt`
- Ou reset manuel en base:
```sql
-- Reset rate limiting pour une IP
DELETE FROM login_attempts WHERE ip_address = '1.2.3.4';

-- Reset verrouillage compte
UPDATE users SET locked_until = NULL, failed_login_attempts = 0
WHERE email = 'user@example.com';
```

### Erreur: "Compte verrouillé"

**Cause**: 5 tentatives échouées consécutives

**Solution**:
```sql
UPDATE users
SET locked_until = NULL, failed_login_attempts = 0
WHERE email = 'user@example.com';
```

### Debug: Vérifier les logs Docker

```bash
# Logs du conteneur frontend
docker compose logs -f frontend

# Filtrer erreurs auth
docker compose logs frontend 2>&1 | grep -E '\[AUTH\]|\[JWT\]|error'
```

---

## Checklist de déploiement

### Pré-déploiement

- [ ] Clés JWT générées (EdDSA/Ed25519)
- [ ] `.env` formaté correctement (voir section Configuration JWT)
- [ ] Variables d'environnement définies:
  - [ ] `JWT_PRIVATE_KEY`
  - [ ] `JWT_PUBLIC_KEY`
  - [ ] `JWT_ACCESS_TOKEN_EXPIRES_IN` (optionnel)
  - [ ] `JWT_REFRESH_TOKEN_EXPIRES_IN` (optionnel)
- [ ] Base de données avec tables auth:
  - [ ] `users`
  - [ ] `user_sessions`
  - [ ] `login_attempts`

### Déploiement

```bash
# 1. Copier .env sur le serveur
scp .env user@server:/path/to/project/

# 2. Build et déploiement
docker compose build --no-cache
docker compose up -d

# 3. Vérifier les logs
docker compose logs -f frontend
```

### Post-déploiement

- [ ] Tester login avec compte admin
- [ ] Vérifier redirection après login
- [ ] Vérifier cookies dans DevTools (access_token, refresh_token)
- [ ] Tester logout
- [ ] Tester rate limiting (optionnel)

### Comptes de démo

```
Admin: admin@stat-discute.be / Admin123!
User:  demo@stat-discute.be / Demo123!
```

---

## Références

| Fichier | Description |
|---------|-------------|
| `frontend/src/app/api/auth/login/route.ts` | Endpoint login |
| `frontend/src/lib/auth/jwt.ts` | Gestion JWT + normalizeKey() |
| `frontend/src/lib/auth/password.ts` | Hachage Argon2id |
| `frontend/src/lib/auth/rate-limit.ts` | Rate limiting |
| `1.DATABASE/migrations/008_authentication_system.sql` | Schema auth |
| `1.DATABASE/migrations/016_seed_demo_users.sql` | Comptes démo |
