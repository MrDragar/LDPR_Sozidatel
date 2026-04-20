from aiogram.dispatcher.router import Router

from .start import router as start_router, start_command_router

router = Router(name=__name__)

router.include_router(start_command_router)
router.include_router(start_router)
