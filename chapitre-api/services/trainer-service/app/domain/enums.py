from enum import StrEnum


class TrainerStatus(StrEnum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


ALLOWED_TRANSITIONS: dict[TrainerStatus, frozenset[TrainerStatus]] = {
    TrainerStatus.PENDING_VERIFICATION: frozenset(
        {TrainerStatus.APPROVED, TrainerStatus.REJECTED}
    ),
    TrainerStatus.APPROVED: frozenset({TrainerStatus.SUSPENDED}),
    TrainerStatus.REJECTED: frozenset(),
    TrainerStatus.SUSPENDED: frozenset(),
}
