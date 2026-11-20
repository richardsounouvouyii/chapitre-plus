import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'

const steps = [
  {
    title: 'Décrivez votre difficulté',
    text: 'Niveau, matière, chapitre, notion et disponibilités — uniquement du texte, aucun fichier à envoyer.',
    image: ILLUSTRATIONS.exercices,
    imageAlt: 'Illustration — checklist et crayon pour décrire une difficulté',
  },
  {
    title: 'Choisissez une séance',
    text: 'Un formateur vérifié propose une séance ; l’admin valide le tarif avant publication.',
    image: ILLUSTRATIONS.calendrier,
    imageAlt: 'Illustration — calendrier et horloge pour réserver une séance',
  },
  {
    title: 'Participez en présentiel',
    text: 'Séance physique en centre ou établissement, puis supports PDF/images pour les inscrits autorisés.',
    image: ILLUSTRATIONS.coursCollectif,
    imageAlt: 'Photo — séance de renforcement scolaire en présentiel',
  },
]

export function HowItWorksPage() {
  return (
    <div className="bg-page">
      <div className="bg-soft-blue/50">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-14">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-heading md:text-4xl">
              Comment ça fonctionne
            </h1>
            <div className="mt-3 h-1 w-16 rounded-full bg-primary" />
            <p className="mt-4 max-w-xl text-body/80">
              CHAPITRE+ organise le renforcement scolaire <strong>en présentiel</strong>. Aucun
              cours vidéo, quiz en ligne ou devoir remis sur la plateforme.
            </p>
          </div>
          <img
            src={ILLUSTRATIONS.livresDiplome}
            alt="Illustration — livres et toque de diplomation"
            width={320}
            height={320}
            className="mx-auto w-full max-w-[280px] object-contain drop-shadow-sm md:max-w-[320px]"
            decoding="async"
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-10 md:px-6">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="grid items-center gap-4 rounded-2xl border border-border-light bg-surface p-5 shadow-sm sm:grid-cols-[140px_1fr] sm:gap-6 md:p-6"
          >
            <img
              src={step.image}
              alt={step.imageAlt}
              width={140}
              height={140}
              className="mx-auto size-[120px] object-contain sm:size-[140px]"
              decoding="async"
              loading="lazy"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">
                  {index + 1}
                </span>
                <h2 className="text-lg font-bold text-heading">{step.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-body/75 md:text-base">{step.text}</p>
            </div>
          </article>
        ))}

        <ul className="space-y-2 rounded-2xl border border-border-light bg-surface p-5 text-sm text-body/80">
          {[
            'Pas de messagerie libre élève–formateur',
            'Tarifs en XOF entiers, validés par l’admin',
            'Paiement confirmé uniquement côté serveur',
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/catalogue" className="btn btn-primary rounded-xl">
            Parcourir les séances
          </Link>
          <Link to="/inscription" className="btn btn-outline btn-primary rounded-xl">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
