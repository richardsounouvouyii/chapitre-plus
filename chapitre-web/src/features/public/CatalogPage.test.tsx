import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
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

function renderCatalog() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
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
    vi.mocked(fetchCatalogSessions).mockResolvedValue([
      {
        id: 's1',
        title: 'Équations du second degré',
        subject: 'Mathématiques',
        level: 'Terminale C',
        area: 'Cotonou',
        dateLabel: 'Sam. 28 nov.',
        priceXof: 2500,
        seatsLeft: 4,
        trainer: 'Formateur vérifié',
      },
    ])
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
