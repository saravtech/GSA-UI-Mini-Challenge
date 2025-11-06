# GSA Opportunity Search UI

A modern, accessible React + TypeScript + Tailwind application for searching and managing GSA-style opportunities.

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## UX Decisions

- **Parameter Panel**: Left sidebar on desktop, stacks on mobile. All filter options dynamically extracted from data (NAICS, Vehicle, Agency, Set-Aside).
- **Results View**: Toggle between card and table views. Cards show key info at a glance; table provides detailed comparison.
- **Quick Filters**: One-click filters for common scenarios (Due in 30/60/90 days, ≥80 Fit Score).
- **AI Integration**: Includes mock AI assistant panel (simulating OpenAI integration) for contextual queries related to opportunities. Provides contextual responses with placeholder code for OpenAI API integration.
- **Details Drawer**: Slide-in from right with status timeline visualization. Shows progression: Draft → Ready → Submitted → Awarded/Lost.
- **Loading States**: Skeleton loaders with pulse animation during filter application (300-600ms simulated delay).
- **Dark Mode**: System preference detection with manual toggle. Persisted to localStorage.
- **Toast Notifications**: Non-intrusive feedback for actions (preset save/load, status updates, CSV export).

## Accessibility

- **Keyboard Navigation**: Full keyboard support with Tab navigation, Enter/Space for actions, ESC to close modals/drawers.
- **Focus Management**: Focus trap in Details Drawer and AI Modal. Focus restored to previous element on close.
- **ARIA Labels**: All interactive elements have descriptive labels. Semantic HTML (buttons, labels, roles).
- **Color Contrast**: AA-compliant contrast ratios throughout. Status indicators use both color and icons/text.
- **Screen Reader Support**: Proper heading hierarchy, alt text for icons, descriptive button labels.

## State Management

- **Local State**: React hooks (`useState`, `useMemo`) for component-level state (filters, view mode, selected items).
- **Persistence**: 
  - `localStorage` for filters, view mode (card/table), and dark mode preference.
  - URL parameters sync with active filters for shareable/bookmarkable links.
- **Data Flow**: Unidirectional - filters flow down from App → ParameterPanel, results flow up via callbacks.
- **Optimizations**: `useMemo` for expensive computations (filtering, sorting, option extraction). Prevents unnecessary re-renders.

