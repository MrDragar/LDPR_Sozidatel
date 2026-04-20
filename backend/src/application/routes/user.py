from uuid import UUID

from fastapi import APIRouter, status, Depends, HTTPException, Path

from src.application.dependencies.constants import get_bot_name
from src.application.dependencies.services import get_user_service
from src.application.schema.user import UserCreateRequest, UserCreateResponse, ErrorResponse, UserActivatedResponse
from src.services.interfaces import IUserService
from src.domain import exceptions

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/",
    response_model=UserCreateResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse},
    }
)
async def create_user(
    request: UserCreateRequest,
    user_service: IUserService = Depends(get_user_service),
    bot_name: str = Depends(get_bot_name)
):
    detail = None
    try:
        user = await user_service.create_user(
            **request.dict()
        )
        return UserCreateResponse(id=user.id, link=f"https://t.me/{bot_name}?start={user.id}")
    except exceptions.EmailBadFormatError:
        detail = "Некорректный формат почты"
    except exceptions.FioFormatError as e:
        detail = str(e)
    except exceptions.EmailAlreadyExistsError as e:
        detail = "Данная почта уже зарегистрирована в системе"
    except exceptions.PhoneAlreadyExistsError as e:
        detail = "Данный номер телефона уже зарегистрирован в системе"
    except exceptions.PhoneBadCountryError as e:
        detail = "Принимается только российские номера телефонов"
    except exceptions.PhoneBadFormatError as e:
        detail = "Неверный формат телефона"
    except Exception as e:
        detail = f"Ошибка при обработке запроса {e}"

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )


@router.get(
    "/{user_id}/is_activated",
    response_model=UserActivatedResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse}
    }
)
async def is_user_activated(
    user_id: UUID = Path(),
    user_service: IUserService = Depends(get_user_service)
):
    try:
        is_activated = await user_service.is_user_activated(user_id)
        return UserActivatedResponse(id=user_id, is_activated=is_activated)
    except exceptions.UserNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обработке запроса {e}"
        )