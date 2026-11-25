"""Données seed MVP — alignées sur le front mock (subjectsByLevel)."""

from __future__ import annotations

LEVELS: list[dict] = [
    {"code": "3e", "label": "Troisième", "sort_order": 1},
    {"code": "Terminale C", "label": "Terminale C", "sort_order": 2},
    {"code": "Terminale D", "label": "Terminale D", "sort_order": 3},
]

# matière → niveaux
SUBJECTS_BY_LEVEL: dict[str, list[str]] = {
    "3e": [
        "Mathématiques",
        "Physique-Chimie",
        "SVT",
        "Français",
        "Histoire-Géographie",
        "Anglais",
    ],
    "Terminale C": ["Mathématiques", "Physique-Chimie", "SVT", "Anglais"],
    "Terminale D": ["Mathématiques", "Physique-Chimie", "SVT", "Anglais"],
}

# Exemples de chapitres / notions (pas un programme officiel exhaustif).
SAMPLE_CHAPTERS: list[dict] = [
    {
        "level_code": "3e",
        "subject": "Mathématiques",
        "title": "Équations du second degré",
        "sort_order": 1,
        "notions": ["Discriminant", "Forme canonique", "Résolution"],
    },
    {
        "level_code": "3e",
        "subject": "Mathématiques",
        "title": "Fonctions linéaires et affines",
        "sort_order": 2,
        "notions": ["Coefficient directeur", "Ordonnée à l'origine"],
    },
    {
        "level_code": "3e",
        "subject": "Français",
        "title": "Analyse de texte",
        "sort_order": 1,
        "notions": ["Figures de style", "Thème et thèse"],
    },
    {
        "level_code": "Terminale C",
        "subject": "Mathématiques",
        "title": "Limites et continuité",
        "sort_order": 1,
        "notions": ["Limite en un point", "Continuité"],
    },
    {
        "level_code": "Terminale C",
        "subject": "Physique-Chimie",
        "title": "Mécanique — forces",
        "sort_order": 1,
        "notions": ["Principe fondamental", "Frottements"],
    },
    {
        "level_code": "Terminale D",
        "subject": "Physique-Chimie",
        "title": "Réactions d'oxydoréduction",
        "sort_order": 1,
        "notions": ["Oxydant / réducteur", "Équilibre de demi-équations"],
    },
    {
        "level_code": "Terminale D",
        "subject": "SVT",
        "title": "Génétique mendélienne",
        "sort_order": 1,
        "notions": ["Croisement monohybride", "Dominance"],
    },
]


def slugify(name: str) -> str:
    return (
        name.lower()
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .replace("à", "a")
        .replace("ù", "u")
        .replace("ô", "o")
        .replace(" ", "-")
        .replace("'", "-")
    )
