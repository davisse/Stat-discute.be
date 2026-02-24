import { NavigationSection } from './NavigationSection'
import { navigationCards } from './data'

// ============================================================================
// NavigationGrid Component (Orchestrates 4 Sections)
// Server Component - No client-side logic needed
// ============================================================================

export function NavigationGrid() {
  const equipesCards = navigationCards.filter(c => c.section === 'equipes')
  const joueursCards = navigationCards.filter(c => c.section === 'joueurs')
  const bettingCards = navigationCards.filter(c => c.section === 'betting')
  const analyseCards = navigationCards.filter(c => c.section === 'analyse')

  return (
    <div id="navigation">
      <NavigationSection sectionKey="equipes" cards={equipesCards} isFirst />
      <NavigationSection sectionKey="joueurs" cards={joueursCards} />
      <NavigationSection sectionKey="betting" cards={bettingCards} />
      <NavigationSection sectionKey="analyse" cards={analyseCards} />
    </div>
  )
}
