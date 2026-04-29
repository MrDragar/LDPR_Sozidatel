from abc import ABC, abstractmethod
from contextlib import _AsyncGeneratorContextManager
from datetime import timedelta
from typing import Optional
from uuid import UUID

from .entities import User, Sources


class IUnitOfWork(ABC):
    @abstractmethod
    def atomic(self) -> _AsyncGeneratorContextManager[None, None]:
        ...


class IUserRepository(ABC):
    @abstractmethod
    async def get_user(self, user_id: UUID) -> User:
        ...

    @abstractmethod
    async def get_users(
        self, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> list[User]:
        ...

    @abstractmethod
    async def set_telegram_id_and_username(
            self, user_id: UUID, telegram_id: int, username: str, source: Sources
    ) -> None:
        ...
    
    @abstractmethod
    async def get_user_by_telegram_id(
            self, telegram_id: int, source: Sources
    ) -> User:
        ...
