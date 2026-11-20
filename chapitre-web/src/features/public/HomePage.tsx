import {
  ArrowDown,
  CalendarDays,
  FileText,
  GraduationCap,
  Layers,
  MapPin,
  PencilLine,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import heroStudents640 from '@/assets/01_photo_accueil_eleves-640.webp'
import heroStudents960 from '@/assets/01_photo_accueil_eleves-960.webp'
import heroStudents1280 from '@/assets/01_photo_accueil_eleves-1280.webp'
import { SkeletonCard } from '@/components/ui'

const features = [
  {
    title: 'Formateurs vérifiés',
    text: 'Enseignants qualifiés et validés par la plateforme',
    Icon: GraduationCap,
  },
  {
    title: 'Séances en présentiel',
    text: 'Dans un centre, un établissement ou un lieu autorisé',
    Icon: MapPin,
  },
  {
    title: 'Ressources efficaces',
    text: 'Résumés, exercices et corrections après chaque séance',
    Icon: Layers,
  },
  {
    title: 'Cadre sûr et fiable',
    text: 'Suivi, autorisation parentale et paiement sécurisé',
    Icon: ShieldCheck,
  },
]

const steps = [
  {
    n: 1,
    title: 'Décrivez votre difficulté',
    text: 'Indiquez la matière, le chapitre et ce que vous n’avez pas compris.',
    Icon: FileText,
  },
  {
    n: 2,
    title: 'Choisissez une séance',
    text: 'Consultez les séances proposées et réservez votre place.',
    Icon: CalendarDays,
  },
  {
    n: 3,
    title: 'Participez en présentiel',
    text: 'Assistez à la séance avec le formateur et récupérez les supports.',
    Icon: Users,
  },
]

const delayClass = ['animate-delay-1', 'animate-delay-2', 'animate-delay-3', 'animate-delay-4']

export function HomePage() {
  // Skeleton : court chargement initial (simule fetch ; plus tard = vraie API).
  const [featuresReady, setFeaturesReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setFeaturesReady(true), 650)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="bg-page">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-soft-blue/80 blur-3xl md:size-[28rem]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:gap-12 md:px-6 md:py-16 lg:py-20">
          <div className="relative z-10 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-soft-blue px-3 py-1.5 text-sm font-medium text-primary">
              <GraduationCap className="size-4" aria-hidden />
              3e et Terminale C·D • Présentiel uniquement
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-heading md:text-5xl lg:text-[3.25rem]">
              Maîtrisez vos chapitres avec{' '}
              <span className="text-primary-light">CHAPITRE+</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-body/80 md:text-lg">
              Plateforme de renforcement scolaire en présentiel pour les élèves de 3<sup>e</sup> et
              terminale au Bénin. Trouvez un formateur qualifié pour le chapitre que vous n’avez
              pas compris.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/inscription" className="btn btn-primary h-12 gap-2 px-5 text-base">
                <PencilLine className="size-4" />
                Créer un compte élève
              </Link>
              <Link
                to="/catalogue"
                className="btn btn-outline btn-primary h-12 gap-2 px-5 text-base"
              >
                <CalendarDays className="size-4" />
                Voir les séances
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg animate-fade-up animate-delay-2 md:max-w-none">
            <div className="absolute -left-6 -top-6 size-40 rounded-[2rem] bg-primary/15 md:size-56" />
            <div className="absolute -bottom-4 -right-4 size-28 rounded-full bg-accent/30 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(13,71,161,0.45)] ring-1 ring-border-light transition duration-500 hover:shadow-[0_24px_60px_-18px_rgba(13,71,161,0.55)]">
              <img
                src={heroStudents960}
                srcSet={`${heroStudents640} 640w, ${heroStudents960} 960w, ${heroStudents1280} 1280w`}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 560px"
                width={960}
                height={532}
                alt="Élèves en révision en présentiel"
                className="aspect-[4/3] w-full object-cover"
                decoding="async"
                fetchPriority="high"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-primary/25 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 md:px-6 md:pb-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!featuresReady
            ? Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} className="min-h-[160px]" />
              ))
            : features.map(({ title, text, Icon }, index) => (
                <article
                  key={title}
                  className={`animate-fade-up rounded-2xl border border-border-light bg-surface p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md ${delayClass[index]}`}
                >
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-soft-blue text-primary transition group-hover:scale-105">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h2 className="text-base font-bold text-heading">{title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-body/75">{text}</p>
                </article>
              ))}
        </div>
      </section>

      <section className="bg-soft-blue/60">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <div className="animate-fade-up text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading md:text-4xl">
              Comment ça fonctionne&nbsp;?
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary" />
            <p className="mx-auto mt-4 max-w-2xl text-body/75">
              Un parcours simple, du chapitre non compris jusqu’à la séance en présentiel.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-3">
            {steps.map((step, index) => (
              <div key={step.n} className="contents">
                <article
                  className={`animate-fade-up relative flex flex-1 gap-4 rounded-2xl border border-border-light bg-surface p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md md:flex-col md:gap-3 md:p-6 ${delayClass[index]}`}
                >
                  <div className="flex items-start gap-3 md:w-full md:justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-soft-blue text-primary">
                      <step.Icon className="size-6" aria-hidden />
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                      {step.n}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-heading">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-body/75">{step.text}</p>
                  </div>
                </article>

                {index < steps.length - 1 ? (
                  <>
                    <div className="flex justify-center md:hidden" aria-hidden>
                      <ArrowDown className="size-5 text-primary" />
                    </div>
                    <div className="hidden shrink-0 items-center text-primary md:flex" aria-hidden>
                      <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                        <path
                          d="M0 8h22M16 2l8 6-8 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link to="/comment-ca-marche" className="btn btn-primary px-6">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
