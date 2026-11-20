import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from '@/components/ui'
import { CatalogPage } from './CatalogPage'
import { fetchCatalogSessions } from './fetchCatalogSessions'

vi.mock('./fetchCatalogSessions', () => ({
  CATALOG_SESSIONS_QUERY_KEY: ['sessions', 'catalog'],
  fetchCatalogSessions: vi.fn(),
}))

function PushToastButton() {
  const { pushToast } = useToast()
  return (
    <button
      type="button"
      onClick={() =>
        pushToast({
          tone: 'info',
          title: 'Actualisé',
          message: 'Liste des séances mise à jour (mock).',
          durationMs: 5000,
        })
      }
    >
      Forcer toast
    </button>
  )
}

function renderCatalog(initialEntry = '/catalogue') {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ToastProvider>
          <PushToastButton />
          <CatalogPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CatalogPage — verrou pendant toast', () => {
  beforeEach(() => {
    vi.mocked(fetchCatalogSessions).mockResolvedValue({
      source: 'mock',
      sessions: [
        {
          id: 's1',
          title: 'Équations du second degré',
          subject: 'Mathématiques',
          level: 'Terminale C',
          area: 'Cotonou',
          dateLabel: 'Sam. 28 nov.',
          startsAt: '2026-11-28T09:00:00Z',
          tariffStatus: 'PROPOSED',
          priceXof: 500,
          seatsLeft: 4,
          capacity: 12,
          trainer: 'Formateur vérifié',
        },
      ],
    })
  })

  it('n’expose pas de lien Voir le détail tant qu’un toast est actif', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Voir le détail' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Forcer toast' }))

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Voir le détail' })).not.toBeInTheDocument()
    })
    expect(screen.getByText('Voir le détail')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: /Actualiser/i })).toBeDisabled()
  })
})

describe('CatalogPage — niveaux hors périmètre', () => {
  beforeEach(() => {
    vi.mocked(fetchCatalogSessions).mockResolvedValue({
      source: 'mock',
      sessions: [
        {
          id: 's1',
          title: 'Équations du second degré',
          subject: 'Mathématiques',
          level: 'Terminale C',
          area: 'Cotonou',
          dateLabel: 'Sam. 28 nov.',
          startsAt: '2026-11-28T09:00:00Z',
          tariffStatus: 'PROPOSED',
          priceXof: 500,
          seatsLeft: 4,
          capacity: 12,
          trainer: 'Formateur vérifié',
        },
        {
          id: 's-e',
          title: 'Hors périmètre',
          subject: 'Physique-Chimie',
          level: 'Terminale E',
          area: 'Cotonou',
          dateLabel: 'Lun. 1 déc.',
          startsAt: '2026-12-01T09:00:00Z',
          tariffStatus: 'PROPOSED',
          priceXof: 500,
          seatsLeft: 2,
          capacity: 10,
          trainer: 'Formateur vérifié',
        },
      ],
    })
  })

  it('refuse niveau=Terminale+E : URL nettoyée et liste des séances supportées', async () => {
    renderCatalog('/catalogue?niveau=Terminale+E')

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Voir le détail' })).toBeInTheDocument()
    })

    expect(screen.getByText('Équations du second degré')).toBeInTheDocument()
    expect(screen.queryByText('Hors périmètre')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Terminale E' })).not.toBeInTheDocument()
    expect(screen.getByText(/1 séance/)).toBeInTheDocument()

    const classeFilters = screen.getByRole('tablist', { name: 'Filtrer par classe' })
    expect(within(classeFilters).getByRole('tab', { name: 'Toutes' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})



