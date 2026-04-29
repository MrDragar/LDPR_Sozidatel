from fastapi import Depends

from src.application.dependencies.services import get_container
from src.core.containers import Container


def get_bot_name(container: Container = Depends(get_container)) -> str:
    return container.bot_name()

def get_vk_bot_id(container: Container = Depends(get_container)) -> str:
    return container.vk_bot_id()
