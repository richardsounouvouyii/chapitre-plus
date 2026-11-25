"""Classes MVP acceptées à l'inscription élève (miroir catalog jusqu'à sync)."""

SUPPORTED_STUDENT_LEVELS = ("3e", "Terminale C", "Terminale D")


def is_supported_student_level(level: str) -> bool:
    return level in SUPPORTED_STUDENT_LEVELS
