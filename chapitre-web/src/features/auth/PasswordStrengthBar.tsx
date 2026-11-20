import { passwordStrength } from './passwordStrength'

type PasswordStrengthBarProps = {
  password: string
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, barClass } = passwordStrength(password)
  if (!password) return null

  return (
    <div className="mt-2" aria-live="polite">
      <div
        className="grid h-1.5 grid-cols-4 gap-1"
        role="meter"
        aria-label="Force du mot de passe"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={label}
      >
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={['h-full', step <= score ? barClass : 'bg-slate-200'].join(' ')}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-body/60">Force : {label}</p>
    </div>
  )
}
