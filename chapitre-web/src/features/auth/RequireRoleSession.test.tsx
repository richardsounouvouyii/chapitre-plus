import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthSessionProvider } from './AuthSessionProvider'
import { clearDemoAuthSession, writeDemoAuthSession } from './demoSession'
import { RequireRoleSession } from './RequireRoleSession'
import { ROLES } from '@/lib/roles'

function renderGuarded(initialPath: string) {
  return render(
    <AuthSessionProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/connexion" element={<div>Connexion</div>} />
          <Route path="/dashboard/eleve" element={<div>Espace élève</div>} />
          <Route path="/dashboard/formateur" element={<div>Espace formateur</div>} />
          <Route
            path="/dashboard/admin"
            element={
              <RequireRoleSession role={ROLES.ADMIN}>
                <div>Espace admin</div>
              </RequireRoleSession>
            }
          />
          <Route
            path="/dashboard/parent"
            element={
              <RequireRoleSession role={ROLES.PARENT}>
                <div>Espace parent</div>
              </RequireRoleSession>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthSessionProvider>,
  )
}

describe('RequireRoleSession', () => {
  beforeEach(() => {
    clearDemoAuthSession()
  })

  it('redirige vers connexion sans session', () => {
    renderGuarded('/dashboard/admin')
    expect(screen.getByText('Connexion')).toBeInTheDocument()
  })

  it('autorise le bon rôle', () => {
    writeDemoAuthSession({ role: ROLES.ADMIN })
    renderGuarded('/dashboard/admin')
    expect(screen.getByText('Espace admin')).toBeInTheDocument()
  })

  it('renvoie un autre rôle vers son propre espace', () => {
    writeDemoAuthSession({ role: ROLES.TRAINER })
    renderGuarded('/dashboard/admin')
    expect(screen.getByText('Espace formateur')).toBeInTheDocument()
  })
})
