from vkbottle.bot import BotLabeler
from .start import router as start_router, start_command_router

full_labeler = BotLabeler()

full_labeler.load(start_command_router)
full_labeler.load(start_router)
