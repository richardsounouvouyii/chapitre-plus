"""Niveaux / classes pris en charge (MVP CHAPITRE+).

Périmètre validé : 3e + Terminale séries C et D uniquement.
Hors périmètre : Terminale A, B, E, « Terminale » sans série, etc.
Source de vérité pour la phase Identity+Catalog — le front miroite ces valeurs
tant que l’endpoint n’est pas branché.
"""

from __future__ import annotations

SUPPORTED_LEVELS: tuple[str, ...] = (
    "3e",
    "Terminale C",
    "Terminale D",
)

SUPPORTED_LEVELS_LABEL = "Classes prises en charge : 3e · Terminale C · D"


def is_supported_level(level: str) -> bool:
    return level in SUPPORTED_LEVELS
