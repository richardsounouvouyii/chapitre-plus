from enum import StrEnum


class DifficultyStatus(StrEnum):
    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    PROPOSED = "PROPOSED"
    SCHEDULED = "SCHEDULED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


# Transitions autorisées (service propriétaire).
ALLOWED_TRANSITIONS: dict[DifficultyStatus, frozenset[DifficultyStatus]] = {
    DifficultyStatus.SUBMITTED: frozenset(
        {DifficultyStatus.IN_REVIEW, DifficultyStatus.CANCELLED}
    ),
    DifficultyStatus.IN_REVIEW: frozenset(
        {DifficultyStatus.PROPOSED, DifficultyStatus.CANCELLED}
    ),
    DifficultyStatus.PROPOSED: frozenset(
        {DifficultyStatus.SCHEDULED, DifficultyStatus.CANCELLED}
    ),
    DifficultyStatus.SCHEDULED: frozenset(
        {DifficultyStatus.CLOSED, DifficultyStatus.CANCELLED}
    ),
    DifficultyStatus.CLOSED: frozenset(),
    DifficultyStatus.CANCELLED: frozenset(),
}

STUDENT_CANCELLABLE = frozenset(
    {DifficultyStatus.SUBMITTED, DifficultyStatus.IN_REVIEW}
)
