from datetime import date
from uuid import UUID

from pydantic import BaseModel


class UserCreateRequest(BaseModel):
    is_member: bool
    surname: str
    name: str
    patronymic: str | None = None
    birth_date: date
    phone_number: str
    region: str
    email: str
    gender: str
    city: str
    wish_to_join: bool = False
    organization: str
    industry: str
    ogrn: int
    website: str
    nomination: str
    answer1: str | None = None
    answer2: str | None = None
    answer3: str | None = None
    home_address: str | None = None
    news_subscription: bool


class UserCreateResponse(BaseModel):
    id: UUID
    link: str


class ErrorResponse(BaseModel):
    detail: str

