from fastapi import APIRouter, status, Depends, HTTPException

from src.application.dependencies.constants import get_bot_name
from src.application.dependencies.services import get_user_service
from src.application.schema.user import UserCreateRequest, UserCreateResponse, ErrorResponse
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
