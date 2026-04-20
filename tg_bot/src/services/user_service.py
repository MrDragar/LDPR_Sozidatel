from uuid import UUID

from src.domain.entities import User
from src.domain.exceptions import (UserNotFoundError, TelegramIsAlreadyLinkedError,
                                   OKUserIsActivatedError, BadUserIsActivatedError)
from src.domain.interfaces import IUnitOfWork, IUserRepository
from src.services.interfaces import IUserService


class UserService(IUserService):
    __user_repo: IUserRepository
    __uow: IUnitOfWork

    def __init__(self, user_repo: IUserRepository, uow: IUnitOfWork):
        self.__user_repo = user_repo
        self.__uow = uow

    async def is_user_exists(self, user_id: UUID) -> bool:
        async with self.__uow.atomic():
            try:
                user = await self.__user_repo.get_user(user_id)
            except UserNotFoundError:
                return False
            except Exception:
                raise
            return True

    async def is_user_activated(self, user_id: UUID) -> bool:
        async with self.__uow.atomic():
            try:
                user = await self.__user_repo.get_user(user_id)
                if user.telegram_id is not None:
                    return True
                else:
                    return False
            except Exception:
                raise

    async def activate_user(
            self, user_id: UUID, telegram_id: int, username: str
    ) -> User:
        async with self.__uow.atomic():
            try:
                tg_user = await self.__user_repo.get_user_by_telegram_id(telegram_id)
            except UserNotFoundError:
                tg_user = None
            except:
                raise

            if tg_user is not None and tg_user.id != user_id:
                raise TelegramIsAlreadyLinkedError()
            if tg_user is not None and tg_user.id == user_id:
                raise OKUserIsActivatedError()
            user = await self.__user_repo.get_user(user_id)
            if user.telegram_id is not None:
                raise BadUserIsActivatedError()
                
            await self.__user_repo.set_telegram_id_and_username(
                user_id, telegram_id, username
            )
            user.telegram_id = telegram_id
            user.username = username
            return user

    async def is_tg_linked(self, telegram_id: int) -> bool:
        async with self.__uow.atomic():
            try:
                tg_user = await self.__user_repo.get_user_by_telegram_id(telegram_id)
            except UserNotFoundError:
                return False
            except:
                return False
            return True
    
