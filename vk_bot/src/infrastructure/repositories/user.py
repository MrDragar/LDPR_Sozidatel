import logging
from uuid import UUID

from sqlalchemy import select, exists

from src.domain import exceptions
from src.domain.entities import User, Sources
from src.domain.interfaces import IUserRepository
from ..interfaces import IDatabaseUnitOfWork
from ..models.user import UserORM


logger = logging.getLogger(__name__)


class UserRepository(IUserRepository):
    __uow: IDatabaseUnitOfWork

    def __init__(self, uow: IDatabaseUnitOfWork):
        self.__uow = uow

    async def get_user(self, user_id: int) -> User:
        logger.debug(f"Getting user by id={user_id}")
        session = self.__uow.get_session()
        stmt = select(UserORM).where(UserORM.id == user_id)
        user_orm = await session.scalar(stmt)
        if user_orm is None:
            logger.debug(f"Not found user with id={user_id}")
            raise exceptions.UserNotFoundError()
        logger.debug(f"Found user {await user_orm.to_domain()}")
        return await user_orm.to_domain()

    async def get_user_by_telegram_id(self, telegram_id: int, source: Sources) -> User:
        logger.debug(f"Getting user by id={telegram_id}")
        session = self.__uow.get_session()
        stmt = (select(UserORM).
                where(UserORM.telegram_id == telegram_id,
                      UserORM.source == source))
        user_orm = await session.scalar(stmt)
        if user_orm is None:
            logger.debug(f"Not found user with telegram_id={telegram_id}")
            raise exceptions.UserNotFoundError()
        logger.debug(f"Found user {await user_orm.to_domain()}")
        return await user_orm.to_domain()

    async def get_users(
            self,
            skip: int = 0,
            limit: int = 100,
            **filters
    ) -> list[User]:
        logger.debug(
            f"Getting users with filters={filters}, skip={skip}, limit={limit}")
        session = self.__uow.get_session()
        stmt = select(UserORM)

        for field, value in filters.items():
            if hasattr(UserORM, field):
                stmt = stmt.where(getattr(UserORM, field) == value)

        stmt = stmt.offset(skip)
        result = await session.execute(stmt)
        user_orms = result.scalars().all()

        users = []
        for user_orm in user_orms:
            users.append(await user_orm.to_domain())
        logger.debug(f"Found {len(users)} users")
        return users

    async def set_telegram_id_and_username(
        self, user_id: UUID, telegram_id: int, username: str, source: Sources
    ) -> User:
        session = self.__uow.get_session()

        stmt = select(UserORM).where(UserORM.id == user_id)
        user_orm = await session.scalar(stmt)

        if user_orm is None:
            logger.debug(f"Not found user with id={user_id}")
            raise exceptions.UserNotFoundError()
        if await session.scalar(select(exists(UserORM)).where(UserORM.telegram_id == telegram_id)):
            logger.debug(f"Already found user with telegram_id={user_id}")
            raise exceptions.TelegramIsAlreadyLinkedError()
        user_orm.telegram_id = telegram_id
        user_orm.username = username
        user_orm.source = source

        await session.commit()
        await session.refresh(user_orm)
        return await user_orm.to_domain()
