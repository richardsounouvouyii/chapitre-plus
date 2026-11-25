"""rename token_plain -> token_ciphertext (Fernet at rest)

Revision ID: 20261121_0004
Revises: 20261120_0003
Create Date: 2026-11-21
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261121_0004"
down_revision: Union[str, None] = "20261120_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agrandit la colonne puis renomme — les anciennes valeurs clair
    # restent lisibles via decrypt_invitation_token (fallback) jusqu'au re-invite.
    op.alter_column(
        "invitation_delivery_secrets",
        "token_plain",
        new_column_name="token_ciphertext",
        existing_type=sa.String(length=200),
        type_=sa.String(length=512),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "invitation_delivery_secrets",
        "token_ciphertext",
        new_column_name="token_plain",
        existing_type=sa.String(length=512),
        type_=sa.String(length=200),
        existing_nullable=False,
    )
