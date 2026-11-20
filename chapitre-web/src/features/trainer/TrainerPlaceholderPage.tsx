type TrainerPlaceholderPageProps = {
  title: string
  description: string
}

export function TrainerPlaceholderPage({ title, description }: TrainerPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-body/70">{description}</p>
      </header>
      <p className="mt-8 border border-dashed border-border-light bg-page px-5 py-10 text-center text-sm text-body/60">
        Écran formateur — contenu métier aux prochaines itérations (Trainer / Scheduling /
        Resource).
      </p>
    </div>
  )
}
