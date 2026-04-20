import uuid
from datetime import date, datetime, UTC

from sqlalchemy import Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from src.domain.entities.user import User
from src.infrastructure.database import Base


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column("id", primary_key=True)
    telegram_id: Mapped[uuid.UUID] = mapped_column("telegram_id", unique=True, index=True,
                                                   nullable=True)
    is_member: Mapped[bool] = mapped_column("is_member", nullable=False)
    username: Mapped[str] = mapped_column("username", nullable=True)
    surname: Mapped[str] = mapped_column("surname", nullable=False)
    name: Mapped[str] = mapped_column("name", nullable=False)
    patronymic: Mapped[str] = mapped_column("patronymic", nullable=True)
    birth_date: Mapped[date] = mapped_column("birth_date", Date, nullable=False)
    phone_number: Mapped[str] = mapped_column("phone_number", nullable=False, unique=True)
    region: Mapped[str] = mapped_column("region", nullable=False)
    email: Mapped[str] = mapped_column("email", nullable=False)
    gender: Mapped[str] = mapped_column("gender", nullable=False)
    city: Mapped[str] = mapped_column("city", nullable=False)
    wish_to_join: Mapped[bool] = mapped_column("wish_to_join", nullable=False)
    home_address: Mapped[str] = mapped_column("home_address", nullable=True)
    news_subscription: Mapped[bool] = mapped_column("news_subscription", nullable=False)

    organization: Mapped[str] = mapped_column("organization", nullable=False)
    industry: Mapped[str] = mapped_column("industry", nullable=False)
    ogrn: Mapped[int] = mapped_column("ogrn", nullable=False)
    website: Mapped[str] = mapped_column("website", nullable=False)
    nomination: Mapped[str] = mapped_column("nomination", nullable=False)
    answer1: Mapped[str] = mapped_column("answer1", nullable=True)
    answer2: Mapped[str] = mapped_column("answer2", nullable=True)
    answer3: Mapped[str] = mapped_column("answer3", nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime,
        nullable=False,
        default=lambda: datetime.now(UTC)
    )

    async def to_domain(self) -> User:
        return User(
            id=self.id,
            telegram_id=self.telegram_id,
            is_member=self.is_member,
            username=self.username,
            surname=self.surname,
            name=self.name,
            patronymic=self.patronymic,
            birth_date=self.birth_date,
            phone_number=self.phone_number,
            region=self.region,
            email=self.email,
            gender=self.gender,
            city=self.city,
            wish_to_join=self.wish_to_join,
            home_address=self.home_address,
            news_subscription=self.news_subscription,
            organization=self.organization,
            industry=self.industry,
            ogrn=self.ogrn,
            website=self.website,
            nomination=self.nomination,
            answer1=self.answer1,
            answer2=self.answer2,
            answer3=self.answer3,
            created_at=self.created_at
        )

    @classmethod
    async def from_domain(cls, user: User) -> 'UserORM':
        return cls(
            id=user.id,
            telegram_id=user.telegram_id,
            is_member=user.is_member,
            username=user.username,
            surname=user.surname,
            name=user.name,
            patronymic=user.patronymic,
            birth_date=user.birth_date,
            phone_number=user.phone_number,
            region=user.region,
            email=user.email,
            gender=user.gender,
            city=user.city,
            wish_to_join=user.wish_to_join,
            home_address=user.home_address,
            news_subscription=user.news_subscription,
            created_at=user.created_at,
            organization=user.organization,
            industry=user.industry,
            ogrn=user.ogrn,
            website=user.website,
            nomination=user.nomination,
            answer1=user.answer1,
            answer2=user.answer2,
            answer3=user.answer3
        )
