import json
import logging
from uuid import UUID

from aiogram import Bot as TgBot
from aiogram.types import BufferedInputFile
from vkbottle.bot import BotLabeler, Message

from src.domain.exceptions import UserNotFoundError, TelegramIsAlreadyLinkedError, \
    OKUserIsActivatedError, BadUserIsActivatedError
from src.services.interfaces import IUserService

router = BotLabeler()
start_command_router = BotLabeler()
logger = logging.getLogger(__name__)


@start_command_router.message()
async def start(
        message: Message, user_service: IUserService,
        log_chat: str, tg_bot: TgBot
):
    logger.debug(f"Start args: {message.ref}")

    if await user_service.is_tg_linked(message.from_id):
        return await message.reply('Спасибо за участие, ожидайте подведения результатов')
    if not message.ref:
        return await message.reply('Для участия в конкурсе необходимо заполнить форму участия на '
                                   'сайте https://созидательлдпр.рф')
    try:
        user_id = UUID(message.ref)
    except ValueError as e:
        logger.debug(e)
        return await message.reply('Вы перешли по некорректной ссылке. Попробуйте вернуться на '
                                   'сайт и нажать на кнопку заново')

    try:
        user = await user_service.activate_user(
            user_id, message.from_id, None)
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
    await tg_bot.send_document(
        chat_id=log_chat, document=BufferedInputFile(json_bytes, filename="data.json"),
        caption=f"""
Новый пользователь {'@' + user.username if user.username else '<нет username>'} зарегистрировался.
Источник: ВК
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
