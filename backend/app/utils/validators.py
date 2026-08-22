from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class SignupSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

UserRegisterSchema = SignupSchema

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

UserLoginSchema = LoginSchema

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

class StopCreateSchema(BaseModel):
    city_id: int
    order_index: int = 0
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    notes: Optional[str] = None

class StopActivityCreateSchema(BaseModel):
    activity_id: int
    day_number: Optional[int] = None
    time_slot: Optional[str] = None
    notes: Optional[str] = None

