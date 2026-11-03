"""Generic migration script template for Alembic."""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = ''
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
