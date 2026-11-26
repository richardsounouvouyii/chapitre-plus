/**
 * Lieux catalogue mock (centres partenaires).
 * Distinct du dossier formateur : le formateur choisit, l’admin gère le référentiel.
 */

export type TrainerVenue = {
  id: string
  name: string
  address: string
  city: string
  capacityHint: number
}

export const TRAINER_VENUES: TrainerVenue[] = [
  {
    id: 'venue-akpakpa',
    name: 'Centre Akpakpa',
    address: 'Rue des Écoles, Akpakpa',
    city: 'Cotonou',
    capacityHint: 20,
  },
  {
    id: 'venue-ganhi',
    name: 'Salle Ganhi',
    address: 'Boulevard St Michel, Ganhi',
    city: 'Cotonou',
    capacityHint: 12,
  },
  {
    id: 'venue-porto',
    name: 'Centre Porto-Novo Est',
    address: 'Quartier Ouando',
    city: 'Porto-Novo',
    capacityHint: 15,
  },
  {
    id: 'venue-parakou',
    name: 'Centre Parakou Nord',
    address: 'Quartier Zongo',
    city: 'Parakou',
    capacityHint: 18,
  },
]

export function getVenueById(id: string): TrainerVenue | undefined {
  return TRAINER_VENUES.find((venue) => venue.id === id)
}

export function formatVenueLabel(venue: TrainerVenue): string {
  return `${venue.name} · ${venue.city}`
}
