from enum import StrEnum


class SessionStatus(StrEnum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    PUBLISHED = "PUBLISHED"
    FULL = "FULL"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PriceStatus(StrEnum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"


ALLOWED_SESSION_TRANSITIONS: dict[SessionStatus, frozenset[SessionStatus]] = {
    SessionStatus.DRAFT: frozenset(
        {SessionStatus.PENDING_APPROVAL, SessionStatus.CANCELLED}
    ),
    SessionStatus.PENDING_APPROVAL: frozenset(
        {SessionStatus.PUBLISHED, SessionStatus.DRAFT, SessionStatus.CANCELLED}
    ),
    SessionStatus.PUBLISHED: frozenset(
        {SessionStatus.FULL, SessionStatus.COMPLETED, SessionStatus.CANCELLED}
    ),
    SessionStatus.FULL: frozenset(
        {SessionStatus.COMPLETED, SessionStatus.CANCELLED, SessionStatus.PUBLISHED}
    ),
    SessionStatus.COMPLETED: frozenset(),
    SessionStatus.CANCELLED: frozenset(),
}
