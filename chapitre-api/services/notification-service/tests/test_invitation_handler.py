from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

from app.application.invitation_handler import handle_user_invited
from app.infrastructure.email_adapter import list_delivered, reset_delivered_for_tests
from app.infrastructure.inbox import already_processed


def setup_function() -> None:
    reset_delivered_for_tests()


def test_handle_user_invited_claims_and_sends_with_durable_inbox() -> None:
    envelope = {
        "event_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "event_type": "identity.user.invited.v1",
        "payload": {"invitation_id": "11111111-1111-1111-1111-111111111111"},
    }
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "invitation_id": "11111111-1111-1111-1111-111111111111",
        "email": "formateur@exemple.bj",
        "role": "TRAINER",
        "invitation_token": "tok_" + ("x" * 28),
        "expires_at": datetime.now(UTC).isoformat(),
    }

    with patch("app.application.invitation_handler.httpx.post", return_value=mock_response):
        handle_user_invited(envelope)
        handle_user_invited(envelope)  # 2e passage = inbox durable

    assert already_processed(envelope["event_id"]) is True
    assert len(list_delivered()) == 1
    assert list_delivered()[0].to_email == "formateur@exemple.bj"
