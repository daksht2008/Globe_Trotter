from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

class SignupSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TripCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    cover_url: Optional[str] = None

class CitySearchQuerySchema(BaseModel):
    q: Optional[str] = ""
    country: Optional[str] = None
    region: Optional[str] = None
    limit: Optional[int] = 20
