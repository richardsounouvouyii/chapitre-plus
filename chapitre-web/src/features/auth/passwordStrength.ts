export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  barClass: string
}

/** Score simple (longueur + diversité) — UI uniquement, pas une politique Identity. */
export function passwordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: '', barClass: 'bg-border-light' }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1

  const clamped = Math.min(4, score) as PasswordStrength['score']

  if (clamped <= 1) {
    return { score: clamped, label: 'Faible', barClass: 'bg-error' }
  }
  if (clamped === 2) {
    return { score: clamped, label: 'Moyen', barClass: 'bg-warning' }
  }
  if (clamped === 3) {
    return { score: clamped, label: 'Bon', barClass: 'bg-primary' }
  }
  return { score: 4, label: 'Fort', barClass: 'bg-success' }
}
