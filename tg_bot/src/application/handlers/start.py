import json
import logging
from dataclasses import asdict
from uuid import UUID

from aiogram import Router, types, filters
from aiogram.filters import CommandObject
from aiogram.types import BufferedInputFile

from src.domain.exceptions import (UserNotFoundError, OKUserIsActivatedError,
                                   BadUserIsActivatedError, TelegramIsAlreadyLinkedError)
from src.services.interfaces import IUserService

router = Router(name=__name__)
start_command_router = Router(name=__name__)
logger = logging.getLogger(__name__)


@start_command_router.message(filters.CommandStart())
async def start(
        message: types.Message, command: CommandObject, user_service: IUserService,
        log_chat: str
):
    if message.chat.id <= 0:
        return
    logger.debug(f"Start args: {command.args}")
    try:
        user_id = UUID(command.args)
    except ValueError as e:
        logger.debug(e)
        return await message.reply('Вы перешли по некорректной ссылке. Попробуйте вернуться на '
                                   'сайт и нажать на кнопку заново')

    try:
        user = await user_service.activate_user(user_id, message.from_user.id,
                                           message.from_user.username)
    except UserNotFoundError:
        return await message.reply('Вы перешли по некорректной ссылке. Попробуйте вернуться на '
                                   'сайт и нажать на кнопку заново')
    except TelegramIsAlreadyLinkedError:
        return await message.reply("К вашему аккаунту уже привязана заявка на участие в конкурсе")
    except OKUserIsActivatedError:
        return await message.reply("Вы уже подтвердили своё участие в конкурсе")
    except BadUserIsActivatedError:
        return await message.reply("Участие уже подтверждено с помощью другого аккаунта")
    await message.reply('Вы успешно подтвердили своё участие в конкурсе')

    json_string = json.dumps(user.to_dict(), indent=2, ensure_ascii=False)
    json_bytes = json_string.encode('utf-8')
    await message.bot.send_document(
        chat_id=log_chat, document=BufferedInputFile(json_bytes, filename="data.json"),
        caption=f"""
Новый пользователь {'@' + user.username if user.username else '<нет username>'} зарегистрировался.
Источник: ТГ
Является членом партии: {'Да' if user.is_member else 'Нет'}
ФИО: {user.surname} {user.name} {user.patronymic}
Пол: {user.gender}
Дата рождения: {user.birth_date.strftime('%d.%m.%Y')}
Почта: {user.email}
Номер телефона: {user.phone_number}
Регион: {user.region}
Город: {user.city}
Хочет присоединиться к команде ЛДПР: {'Да' if user.wish_to_join else 'Нет'}
Домашний адрес: {user.home_address or 'не указан'}
Подписка на новости: {'Есть' if user.news_subscription else 'Нет'}
Номер участника: Б{user.telegram_id}
""")


@router.message()
async def send_welcome_message(message: types.Message, user_service: IUserService):
    if message.chat.id <= 0:
        return
    if await user_service.is_tg_linked(message.from_user.id):
        return await message.reply('Спасибо за участие, ожидайте подведения результатов')

    return await message.reply('Для участия в конкурсе необходимо заполнить форму участия на '
                               'сайте https://созидательлдпр.рф')
