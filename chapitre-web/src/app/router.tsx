import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DismissToastsOnNavigate } from '@/components/ui'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { RoleDashboard } from '@/features/dashboards/RoleDashboard'
import { CatalogPage } from '@/features/public/CatalogPage'
import { HomePage } from '@/features/public/HomePage'
import { HowItWorksPage } from '@/features/public/HowItWorksPage'
import { LegalPage } from '@/features/public/LegalPage'
import { PlaceholderPage } from '@/features/public/PlaceholderPage'
import { SessionDetailPage } from '@/features/public/SessionDetailPage'
import { TrainerProfilePage } from '@/features/public/TrainerProfilePage'
import { TrainersPage } from '@/features/public/TrainersPage'
import { ROLES } from '@/lib/roles'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-base-content/70">
        Écran réservé — contenu métier aux prochaines itérations front / API.
      </p>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <DismissToastsOnNavigate />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Navigate to="/accueil" replace />} />
          <Route path="accueil" element={<HomePage />} />
          <Route path="comment-ca-marche" element={<HowItWorksPage />} />
          <Route path="catalogue" element={<CatalogPage />} />
          <Route path="catalogue/:sessionId" element={<SessionDetailPage />} />
          <Route path="mentions-legales" element={<LegalPage />} />
          <Route path="formateurs" element={<TrainersPage />} />
          <Route path="formateurs/:trainerId" element={<TrainerProfilePage />} />
          <Route
            path="centres"
            element={
              <PlaceholderPage
                title="Centres partenaires"
                description="La liste des centres et établissements arrivera avec Scheduling / phase centres."
              />
            }
          />
          <Route
            path="aide"
            element={
              <PlaceholderPage
                title="Aide"
                description="FAQ et contact support — contenu à finaliser avec les mentions légales."
              />
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="connexion" element={<LoginPage />} />
          <Route path="inscription" element={<RegisterPage />} />
        </Route>

        <Route path="/app/eleve" element={<AppShell role={ROLES.STUDENT} />}>
          <Route index element={<RoleDashboard role={ROLES.STUDENT} />} />
          <Route path="difficultes" element={<Placeholder title="Mes demandes" />} />
          <Route path="seances" element={<Placeholder title="Mes séances" />} />
          <Route path="documents" element={<Placeholder title="Documents" />} />
          <Route path="paiements" element={<Placeholder title="Paiements" />} />
          <Route path="profil" element={<Placeholder title="Profil élève" />} />
        </Route>

        <Route path="/app/formateur" element={<AppShell role={ROLES.TRAINER} />}>
          <Route index element={<RoleDashboard role={ROLES.TRAINER} />} />
          <Route path="seances" element={<Placeholder title="Séances formateur" />} />
          <Route path="documents" element={<Placeholder title="Supports" />} />
          <Route path="profil" element={<Placeholder title="Profil formateur" />} />
        </Route>

        <Route path="/app/parent" element={<AppShell role={ROLES.PARENT} />}>
          <Route index element={<RoleDashboard role={ROLES.PARENT} />} />
          <Route path="enfants" element={<Placeholder title="Enfants liés" />} />
          <Route path="paiements" element={<Placeholder title="Paiements parent" />} />
        </Route>

        <Route path="/app/admin" element={<AppShell role={ROLES.ADMIN} />}>
          <Route index element={<RoleDashboard role={ROLES.ADMIN} />} />
          <Route path="formateurs" element={<Placeholder title="Formateurs" />} />
          <Route path="seances" element={<Placeholder title="Séances admin" />} />
        </Route>

        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
