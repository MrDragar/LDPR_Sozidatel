from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from src.domain.entities.user import User


class IUserService(ABC):

    @abstractmethod
    async def is_user_activated(self, user_id: UUID) -> bool:
        ...

    # @abstractmethod
    # async def get_all_users(self) -> list[User]:
    #     ...

    @abstractmethod
    async def activate_user(
            self, user_id: UUID, telegram_id: int, username: str
    ) -> User:
        ...

    @abstractmethod
    async def is_tg_linked(self, user_id: int) -> bool:
        ...
