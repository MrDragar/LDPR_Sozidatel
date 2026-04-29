import enum
from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from uuid import UUID, uuid4


class Sources(enum.Enum):
    VK = 'vk'
    TG = 'tg'
    MAX = 'max'


@dataclass
class User:
    is_member: bool
    surname: str
    name: str
    patronymic: str | None
    birth_date: date
    phone_number: str
    region: str
    email: str
    gender: str
    city: str
    wish_to_join: bool

    organization: str
    industry: str
    ogrn: int
    website: str
    nomination: str
    answer1: str | None
    answer2: str | None
    answer3: str | None

    home_address: str | None = None
    telegram_id: int | None = None
    source: Sources | None = None
    username: str | None = None
    id: UUID | None = field(default_factory=uuid4)
    news_subscription: bool = field(default=False)
    created_at: datetime = field(default_factory=lambda: datetime.now())

    def to_dict(self):
        data = asdict(self)
        if isinstance(data.get('birth_date'), date):
            data['birth_date'] = data['birth_date'].isoformat()
        if isinstance(data.get('created_at'), datetime):
            data['created_at'] = data['created_at'].isoformat()
        if isinstance(data.get('id'), UUID):
            data['id'] = str(data['id'])
        return data
