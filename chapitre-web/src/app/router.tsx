import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DismissToastsOnNavigate } from '@/components/ui'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { AdminPlaceholderPage } from '@/features/admin/AdminPlaceholderPage'
import { AdminSessionsPage } from '@/features/admin/AdminSessionsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ParentDashboard } from '@/features/parent/ParentDashboard'
import { ParentPlaceholderPage } from '@/features/parent/ParentPlaceholderPage'
import { CatalogPage } from '@/features/public/CatalogPage'
import { HomePage } from '@/features/public/HomePage'
import { HowItWorksPage } from '@/features/public/HowItWorksPage'
import { LegalPage } from '@/features/public/LegalPage'
import { PlaceholderPage } from '@/features/public/PlaceholderPage'
import { SessionDetailPage } from '@/features/public/SessionDetailPage'
import { TrainerProfilePage } from '@/features/public/TrainerProfilePage'
import { TrainersPage } from '@/features/public/TrainersPage'
import { RequireRoleSession } from '@/features/auth/RequireRoleSession'
import { StudentDashboard } from '@/features/student/StudentDashboard'
import { StudentDifficultiesPage } from '@/features/student/StudentDifficultiesPage'
import { StudentDifficultyFormPage } from '@/features/student/StudentDifficultyFormPage'
import { StudentProfilePage } from '@/features/student/StudentProfilePage'
import { StudentResourcesPage } from '@/features/student/StudentResourcesPage'
import { StudentSessionsPage } from '@/features/student/StudentSessionsPage'
import { RoleProfilePage } from '@/features/shared/RoleProfilePage'
import { TrainerAvailabilityPage } from '@/features/trainer/TrainerAvailabilityPage'
import { TrainerDashboard } from '@/features/trainer/TrainerDashboard'
import { TrainerDossierPage } from '@/features/trainer/TrainerDossierPage'
import { TrainerDocumentsPage } from '@/features/trainer/TrainerDocumentsPage'
import { TrainerSessionCreatePage } from '@/features/trainer/TrainerSessionCreatePage'
import { TrainerSessionDetailPage } from '@/features/trainer/TrainerSessionDetailPage'
import { TrainerSessionsPage } from '@/features/trainer/TrainerSessionsPage'
import { ROLES } from '@/lib/roles'

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

        <Route
          path="/dashboard/eleve"
          element={
            <RequireRoleSession role={ROLES.STUDENT}>
              <AppShell role={ROLES.STUDENT} />
            </RequireRoleSession>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="demandes" element={<StudentDifficultiesPage />} />
          <Route path="demandes/nouvelle" element={<StudentDifficultyFormPage />} />
          <Route path="seances" element={<StudentSessionsPage />} />
          <Route path="ressources" element={<StudentResourcesPage />} />
          <Route path="profil" element={<StudentProfilePage />} />
          <Route path="difficultes" element={<Navigate to="/dashboard/eleve/demandes" replace />} />
          <Route path="documents" element={<Navigate to="/dashboard/eleve/ressources" replace />} />
        </Route>

        <Route
          path="/dashboard/formateur"
          element={
            <RequireRoleSession role={ROLES.TRAINER}>
              <AppShell role={ROLES.TRAINER} />
            </RequireRoleSession>
          }
        >
          <Route index element={<TrainerDashboard />} />
          <Route path="dossier" element={<TrainerDossierPage />} />
          <Route path="disponibilites" element={<TrainerAvailabilityPage />} />
          <Route path="seances" element={<TrainerSessionsPage />} />
          <Route path="seances/nouvelle" element={<TrainerSessionCreatePage />} />
          <Route path="seances/:sessionId" element={<TrainerSessionDetailPage />} />
          <Route path="documents" element={<TrainerDocumentsPage />} />
          <Route
            path="profil"
            element={
              <RoleProfilePage
                role={ROLES.TRAINER}
                spaceEyebrow="Espace formateur"
                description=""
              />
            }
          />
        </Route>

        <Route
          path="/dashboard/parent"
          element={
            <RequireRoleSession role={ROLES.PARENT}>
              <AppShell role={ROLES.PARENT} />
            </RequireRoleSession>
          }
        >
          <Route index element={<ParentDashboard />} />
          <Route
            path="enfants"
            element={
              <ParentPlaceholderPage
                title="Enfants liés"
                description="Lien parent–enfant vérifié et consentements de réservation."
              />
            }
          />
          <Route
            path="paiements"
            element={
              <ParentPlaceholderPage
                title="Paiements"
                description="Suivi des paiements et remboursements liés à votre enfant."
              />
            }
          />
          <Route
            path="profil"
            element={
              <RoleProfilePage
                role={ROLES.PARENT}
                spaceEyebrow="Espace parent / tuteur"
                description="Compte parent mock — consentements et enfants liés à brancher sur Identity."
              />
            }
          />
        </Route>

        <Route
          path="/dashboard/admin"
          element={
            <RequireRoleSession role={ROLES.ADMIN}>
              <AppShell role={ROLES.ADMIN} />
            </RequireRoleSession>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route
            path="formateurs"
            element={
              <AdminPlaceholderPage
                title="Formateurs"
                description="Validation, rejet ou suspension des dossiers formateurs."
              />
            }
          />
          <Route path="seances" element={<AdminSessionsPage />} />
          <Route
            path="profil"
            element={
              <RoleProfilePage
                role={ROLES.ADMIN}
                spaceEyebrow="Espace administrateur"
                description="Compte admin mock — audit et validations aux prochaines itérations."
              />
            }
          />
        </Route>

        {/* Anciennes URLs /app/* → /dashboard/* */}
        <Route path="/app/eleve/*" element={<Navigate to="/dashboard/eleve" replace />} />
        <Route path="/app/formateur/*" element={<Navigate to="/dashboard/formateur" replace />} />
        <Route path="/app/parent/*" element={<Navigate to="/dashboard/parent" replace />} />
        <Route path="/app/admin/*" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/app/eleve" element={<Navigate to="/dashboard/eleve" replace />} />
        <Route path="/app/formateur" element={<Navigate to="/dashboard/formateur" replace />} />
        <Route path="/app/parent" element={<Navigate to="/dashboard/parent" replace />} />
        <Route path="/app/admin" element={<Navigate to="/dashboard/admin" replace />} />

        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
