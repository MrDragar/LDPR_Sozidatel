import uuid
from dataclasses import dataclass, field
from datetime import date, datetime
from uuid import UUID


@dataclass
class User:
    is_member: bool
    surname: str
    name: str
    birth_date: date
    phone_number: str
    region: str
    email: str
    gender: str
    city: str
    wish_to_join: bool
    patronymic: str | None = None
    home_address: str | None = None
    telegram_id: int | None = None
    username: str | None = None
    id: UUID | None = field(default_factory=uuid.uuid4)
    news_subscription: bool = field(default=False)
    created_at: datetime = field(default_factory=lambda: datetime.now())
