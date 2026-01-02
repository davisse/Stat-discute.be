# Stat-Discute : Spécifications Produit

> **Document de vision produit** - Créé le 2025-12-18
>
> Ce document définit la vision, l'UX/UI et les spécifications fonctionnelles de Stat-Discute.

---

## 1. Vision & Mission

### 1.1 Concept

**Stat-Discute** = Statistics + Discussion/Réflexion

Un site NBA francophone où l'analyse approfondie prime sur les simples chiffres bruts. Les statistiques sont un outil de réflexion, pas de validation d'impulsions.

### 1.2 Mission principale

Promouvoir une pratique **intelligente et raisonnée** du pari sportif NBA, en utilisant les statistiques comme support à la réflexion analytique.

### 1.3 Double impact social

| Cible | Objectif |
|-------|----------|
| **Parieurs experts** | Compléter leurs analyses avec des données profondes sur les dynamiques de jeu |
| **Joueurs vulnérables** | Ralentir le processus décisionnel, encourager la réflexion avant l'action |

### 1.4 Positionnement

| Concurrent | Approche | Stat-Discute |
|------------|----------|--------------|
| ESPN, Basketball-Reference | Données brutes | Analyse guidée avec contexte narratif |
| The Ringer, Cleaning the Glass | Analyses éditoriales | Visualisations dynamiques + IA conversationnelle |
| Sites de paris | Recommandations directes | Pas de verdict, probabilités neutres factuelles |

---

## 2. Public cible

### 2.1 Personas principaux

#### Persona A : Le Parieur Expert
- Cherche des données approfondies pour affiner ses analyses
- Veut accéder rapidement à l'information pertinente
- Apprécie les visualisations avancées et les données brutes
- Utilise le site comme complément à ses propres recherches

#### Persona B : Le Joueur Impulsif
- Tendance à parier sans analyse approfondie (< 2 minutes de réflexion)
- Victime potentielle d'addiction aux paris sportifs
- A besoin de friction positive pour ralentir le processus décisionnel
- Bénéficie d'un contenu qui force la lecture et la réflexion

### 2.2 Langue et marché

- **Langue principale** : Français
- **Marché** : Francophonie (France, Belgique, Suisse, Canada, Afrique francophone)

---

## 3. UX/UI : Principes fondamentaux

### 3.1 Double vitesse de lecture

Une seule interface servant deux modes de consommation :

| Mode | Comportement utilisateur | Réponse UX |
|------|--------------------------|------------|
| **Expert** | Scroll rapide, clic sur dots, navigation directe | Accès immédiat via sommaire cliquable |
| **Immersif** | Lecture séquentielle, découverte progressive | Storytelling horizontal, animations au scroll |

### 3.2 Anti-impulsivité : Friction légère universelle

Pas de blocage, mais des ralentisseurs intelligents :

- **Texte contextuel toujours avant les chiffres** : Le récit précède les données
- **Questions de réflexion** : En début de parcours, non bloquantes
- **Visualisations qui se construisent** : Animation séquentielle + déclenchement au scroll
- **Aucun verdict** : Pas de recommandation de pari
- **Probabilités neutres** : "60% des facteurs favorisent X" sans dire "pariez X"

---

## 4. Navigation : Storytelling horizontal

### 4.1 Concept

Chaque analyse est un **parcours horizontal** composé de séquences (pages) que l'utilisateur traverse comme un livre.

```
←―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――→
[Séquence 1] → [Séquence 2] → [Séquence 3] → [...] → [Synthèse]
     ●              ○              ○                      ○
```

### 4.2 Comportement du scroll

| Aspect | Spécification |
|--------|---------------|
| **Type** | Snap scroll horizontal (CSS `scroll-snap-type: x mandatory`) |
| **Effet** | "Page qui tourne" - jamais entre deux séquences |
| **Seuil** | À déterminer par tests utilisateurs (30% / 50% / 70%) |
| **Viewport** | Chaque séquence = 100vw × 100vh, pas de scroll vertical |

### 4.3 Indicateurs de progression

| Élément | Comportement |
|---------|--------------|
| **Dots de pagination** | Visibles en permanence, cliquables pour navigation directe |
| **Sommaire** | Menu cliquable listant toutes les séquences |
| **Position** | Dots en bas centre, sommaire accessible (header ou overlay) |

### 4.4 Densité d'information

- **Pas de scroll vertical** dans les séquences
- **Viewport fixe** : tout le contenu doit tenir dans la fenêtre visible
- **Densité variable** : certaines pages focales (1 élément), certaines plus denses
- **Adaptation** : le contenu s'ajuste au viewport disponible

---

## 5. Types d'analyses et séquences

### 5.1 Principe

Chaque type d'analyse a sa propre structure de séquences, adaptée aux données pertinentes.

### 5.2 Analyse Totaux (Over/Under)

**Focus** : Scoring individuel, combiné, opponent defense, impact des absences.

```
Séquences :
┌──────────┬────────────┬────────────┬───────────┬────────────┬────────────┬───────────┐
│ ACCROCHE │ SCORING A  │ SCORING B  │ COMBINÉ   │ OPPONENT   │ ABSENCES   │ SYNTHÈSE  │
├──────────┼────────────┼────────────┼───────────┼────────────┼────────────┼───────────┤
│ Ligne    │ Points/    │ Points/    │ Pace      │ Points     │ Impact     │ Facteurs  │
│ O/U      │ match      │ match      │ combiné   │ concédés   │ projeté    │ clés      │
│          │            │            │           │            │            │           │
│ Tendance │ Par        │ Par        │ Historique│ Vs position│ Par joueur │ Probas    │
│ récente  │ quarter    │ quarter    │ H2H       │ défensif   │ absent     │ neutres   │
└──────────┴────────────┴────────────┴───────────┴────────────┴────────────┴───────────┘
```

### 5.3 Analyse Spread (ATS)

**Focus** : Forme récente, historique confrontations, matchups clés, contexte situationnel.

```
Séquences :
┌──────────┬──────────┬──────────┬──────────┬───────────┬───────────┬───────────┐
│ ACCROCHE │ FORME A  │ FORME B  │ H2H      │ MATCHUPS  │ CONTEXTE  │ SYNTHÈSE  │
├──────────┼──────────┼──────────┼──────────┼───────────┼───────────┼───────────┤
│ Spread   │ 10 last  │ 10 last  │ Historique│ Position  │ B2B       │ Facteurs  │
│ actuel   │ games    │ games    │ direct   │ vs        │ Voyages   │ clés      │
│          │          │          │          │ position  │ Repos     │           │
│ ATS      │ Home/    │ Home/    │ ATS      │ Clés du   │ Motivation│ Probas    │
│ tendance │ Away     │ Away     │ historique│ match    │           │ neutres   │
└──────────┴──────────┴──────────┴──────────┴───────────┴───────────┴───────────┘
```

### 5.4 Analyse Player Props

**Focus** : Tendances individuelles, matchup défensif, impact coéquipiers, minutes projetées.

```
Séquences :
┌──────────┬───────────┬────────────┬──────────────┬──────────┬───────────┐
│ JOUEUR   │ TENDANCES │ VS DÉFENSE │ SANS         │ MINUTES  │ SYNTHÈSE  │
│          │           │            │ COÉQUIPIER X │          │           │
├──────────┼───────────┼────────────┼──────────────┼──────────┼───────────┤
│ Ligne    │ 10 last   │ Vs équipe  │ Quand X      │ Minutes  │ Facteurs  │
│ prop     │ games     │ adverse    │ absent       │ projetées│ clés      │
│          │           │            │              │          │           │
│ Profil   │ Home/     │ Vs position│ Usage rate   │ Corrél.  │ Probas    │
│ joueur   │ Away      │ défensive  │ change       │ perf     │ neutres   │
└──────────┴───────────┴────────────┴──────────────┴──────────┴───────────┘
```

### 5.5 Extensibilité

D'autres types d'analyses pourront être ajoutés avec leur propre structure :
- **Analyse Quart-temps** (1Q, 1H props)
- **Analyse Équipe** (focus sur une franchise)
- **Analyse Back-to-Back / Rest days**

---

## 6. Design System

### 6.1 Palette de couleurs

| Couleur | Code | Usage sémantique |
|---------|------|------------------|
| **Noir** | Base actuelle (fond avec dots) | Fond principal, énergie |
| **Rouge** | `rgb(239, 45, 44)` / `#EF2D2C` | Négatif, baisse, under, défense adverse, alerte |
| **Vert** | `rgb(29, 193, 0)` / `#1DC100` | Positif, hausse, over, performance, opportunité |
| **Blanc** | `#FFFFFF` | Texte principal, éléments UI |
| **Gris** | Nuances à définir | Texte secondaire, bordures, états désactivés |

### 6.2 Signification fixe des couleurs

Les couleurs rouge et vert ont une **signification constante** dans tout le site :

```
ROUGE = Négatif / Défavorable / Baisse / Under / Risque
VERT  = Positif / Favorable / Hausse / Over / Opportunité
```

### 6.3 Typographie

| Aspect | Spécification |
|--------|---------------|
| **Hiérarchie** | Typographie proéminente, texte mis en avant |
| **Ton** | Analytique, technique, factuel |
| **Police UI** | Inter (existant) |
| **Police Data** | JetBrains Mono (existant) |
| **Lisibilité** | Interligne généreux, largeur de colonne optimale |

### 6.4 Visualisations

| Aspect | Spécification |
|--------|---------------|
| **Animation** | Construction séquentielle des éléments |
| **Déclenchement** | Au scroll (intersection observer) |
| **Couleurs** | Rouge/Vert selon sémantique définie |
| **Interactivité** | Hover pour détails, pas de clic obligatoire |

### 6.5 Ambiance

- **Noir énergique** : Conserver le fond noir actuel avec dots
- **Pas de mode clair** pour l'instant
- **Contraste fort** : Lisibilité maximale sur fond sombre

---

## 7. Agent IA

### 7.1 Rôle

Agent **analytique** capable de :
- Comprendre les questions en langage naturel
- Extraire les données pertinentes de la base
- Générer des visualisations adaptées à la question
- Produire des textes descriptifs factuels

### 7.2 Intégration

| Aspect | Spécification |
|--------|---------------|
| **Emplacement** | Section dédiée (`/assistant` ou `/chat`) |
| **Pas de chatbot flottant** | Expérience focalisée, pas de distraction |
| **Génération de contenu** | L'agent génère aussi les textes des analyses automatiques |

### 7.3 Comportement

- **Factuel** : Pas d'opinions ni de recommandations
- **Contextuel** : Comprend le contexte NBA (équipes, joueurs, termes)
- **Visuel** : Propose des graphiques quand pertinent
- **Éducatif** : Peut expliquer les métriques et leur signification

---

## 8. Partage d'analyses

### 8.1 Fonctionnalité

- Analyses partageables publiquement (URL unique)
- Possibilité de créer ses propres analyses personnalisées
- Partage entre amis ou sur réseaux sociaux

### 8.2 Limitations (v1)

- **Pas de système tipster** : Pas de profils avec historique de performance
- **Pas de réputation** : Pas de scoring des analyses
- **Pas de monétisation** : Pas de tips payants

Ces fonctionnalités pourront être envisagées ultérieurement.

---

## 9. Responsive & Plateformes

### 9.1 Approche

| Aspect | Spécification |
|--------|---------------|
| **Priorité** | Desktop-first |
| **Mobile** | Expériences différenciées (pas simple adaptation) |
| **Scroll horizontal** | Plus naturel sur mobile/tactile |

### 9.2 Desktop (prioritaire)

- Storytelling horizontal complet
- Visualisations riches et détaillées
- Sommaire et navigation avancée

### 9.3 Mobile (v2)

- Parcours potentiellement simplifié
- Interactions tactiles natives (swipe)
- Visualisations adaptées (moins denses)
- Design spécifique à concevoir

---

## 10. Fonctionnalités futures (hors scope v1)

| Fonctionnalité | Priorité | Notes |
|----------------|----------|-------|
| Système tipster avec historique | Basse | Après validation du concept |
| Mode clair | Basse | Si demande utilisateur |
| Alertes personnalisées | Moyenne | Notifications sur critères |
| API publique | Basse | Pour intégrations tierces |
| App mobile native | Basse | Après succès web mobile |

---

## 11. Métriques de succès

### 11.1 Engagement

- Temps passé par analyse (objectif : augmenter)
- Taux de complétion des parcours horizontaux
- Retour utilisateurs (sessions répétées)

### 11.2 Anti-impulsivité

- Temps moyen avant action (si tracking possible)
- Taux de lecture des textes contextuels
- Utilisation de l'agent IA (réflexion approfondie)

### 11.3 Qualité

- Précision des données (vs sources officielles)
- Pertinence des textes générés par IA
- Satisfaction utilisateur (feedback)

---

## 12. Prochaines étapes

| Phase | Livrable | Priorité |
|-------|----------|----------|
| **Wireframes** | Maquettes des séquences horizontales | Haute |
| **Prototype navigation** | POC du snap scroll avec dots | Haute |
| **Design tokens** | Formalisation couleurs/typo/spacing | Moyenne |
| **Architecture agent IA** | Définition queries et prompts | Moyenne |
| **Test utilisateur** | Validation du seuil de snap scroll | Haute |

---

## Annexe : Stack technique existante

Référence : Le projet dispose déjà de :
- **Base de données** : PostgreSQL 18 avec 28 tables
- **Frontend** : Next.js 16 + React 19 + Tailwind v4
- **Design existant** : Fond noir avec dots, logo centré
- **ETL** : Pipeline Python pour données NBA

Cette vision s'intègre dans l'architecture existante.
