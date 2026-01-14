import { NavigationSection } from './NavigationSection'
import { navigationCards } from './data'

// ============================================================================
// NavigationGrid Component (Orchestrates 3 Sections)
// Server Component - No client-side logic needed
// ============================================================================

export function NavigationGrid() {
  const equipesCards = navigationCards.filter(c => c.section === 'equipes')
  const joueursCards = navigationCards.filter(c => c.section === 'joueurs')
  const bettingCards = navigationCards.filter(c => c.section === 'betting')

  return (
    <div id="navigation">
      <NavigationSection sectionKey="equipes" cards={equipesCards} isFirst />
      <NavigationSection sectionKey="joueurs" cards={joueursCards} />
      <NavigationSection sectionKey="betting" cards={bettingCards} />
    </div>
  )
}
