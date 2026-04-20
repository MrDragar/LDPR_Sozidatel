from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from src.domain.entities.user import User


class IUserService(ABC):
    @abstractmethod
    async def create_user(
            self, is_member: bool,
            surname: str, name: str, patronymic: str | None,
            birth_date: date, phone_number: str, region: str,
            email: str, gender: str, city: str, wish_to_join: bool,
            news_subscription: bool,
            home_address: str | None,
            organization: str,
            industry: str,
            ogrn: int,
            website: str,
            nomination: str,
            answer1: str | None,
            answer2: str | None,
            answer3: str | None,
    ) -> User:
        ...

    @abstractmethod
    async def is_user_activated(self, user_id: UUID) -> bool:
        ...

    @abstractmethod
    async def get_all_users(self) -> list[User]:
        ...
