# type: ignore
"""empty message

Revision ID: e87b259ca49b
Revises: 673454264cce
Create Date: 2023-12-05 10:05:48.586351

"""
import fastapi_users_db_sqlalchemy
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "e87b259ca49b"
down_revision = "673454264cce"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "joins",
        "request_user_id",
        existing_type=sa.VARCHAR(length=36),
        type_=fastapi_users_db_sqlalchemy.generics.GUID(),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "ride_user_id",
        existing_type=sa.VARCHAR(length=36),
        type_=fastapi_users_db_sqlalchemy.generics.GUID(),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "pick_up_time",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "drop_off_time",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "created_at",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "messages",
        "user_id",
        existing_type=sa.VARCHAR(length=36),
        type_=fastapi_users_db_sqlalchemy.generics.GUID(),
        existing_nullable=False,
    )
    op.alter_column(
        "messages",
        "created_at",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "requests",
        "user_id",
        existing_type=sa.VARCHAR(length=36),
        type_=fastapi_users_db_sqlalchemy.generics.GUID(),
        existing_nullable=False,
    )
    op.alter_column(
        "requests",
        "start_time",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "requests",
        "created_at",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.add_column("rides", sa.Column("num_seats_left", sa.Integer(), nullable=False))
    op.alter_column(
        "rides",
        "user_id",
        existing_type=sa.VARCHAR(length=36),
        type_=fastapi_users_db_sqlalchemy.generics.GUID(),
        existing_nullable=False,
    )
    op.alter_column(
        "rides",
        "departure_time",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "rides",
        "last_update_time",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "rides",
        "created_at",
        existing_type=sa.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "user",
        "avatar",
        existing_type=sa.BLOB(),
        type_=sa.LargeBinary(),
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "id",
        existing_type=sa.VARCHAR(length=36),
        type_=fastapi_users_db_sqlalchemy.generics.GUID(),
        existing_nullable=False,
    )
    op.drop_index("ix_user_email", table_name="user", postgresql_using="prefix")
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.create_index(
        "ix_user_email",
        "user",
        [sa.text("email NULLS FIRST")],
        unique=False,
        postgresql_using="prefix",
    )
    op.alter_column(
        "user",
        "id",
        existing_type=fastapi_users_db_sqlalchemy.generics.GUID(),
        type_=sa.VARCHAR(length=36),
        existing_nullable=False,
    )
    op.alter_column(
        "user",
        "avatar",
        existing_type=sa.LargeBinary(),
        type_=sa.BLOB(),
        existing_nullable=True,
    )
    op.alter_column(
        "rides",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "rides",
        "last_update_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
    )
    op.alter_column(
        "rides",
        "departure_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
    )
    op.alter_column(
        "rides",
        "user_id",
        existing_type=fastapi_users_db_sqlalchemy.generics.GUID(),
        type_=sa.VARCHAR(length=36),
        existing_nullable=False,
    )
    op.drop_column("rides", "num_seats_left")
    op.alter_column(
        "requests",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "requests",
        "start_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
    )
    op.alter_column(
        "requests",
        "user_id",
        existing_type=fastapi_users_db_sqlalchemy.generics.GUID(),
        type_=sa.VARCHAR(length=36),
        existing_nullable=False,
    )
    op.alter_column(
        "messages",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "messages",
        "user_id",
        existing_type=fastapi_users_db_sqlalchemy.generics.GUID(),
        type_=sa.VARCHAR(length=36),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "joins",
        "drop_off_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "pick_up_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.TIMESTAMP(),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "ride_user_id",
        existing_type=fastapi_users_db_sqlalchemy.generics.GUID(),
        type_=sa.VARCHAR(length=36),
        existing_nullable=False,
    )
    op.alter_column(
        "joins",
        "request_user_id",
        existing_type=fastapi_users_db_sqlalchemy.generics.GUID(),
        type_=sa.VARCHAR(length=36),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
