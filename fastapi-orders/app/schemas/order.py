from typing import Literal
from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    customerName: str = Field(..., min_length=1, examples=["Juan Pérez"])
    items: list[str] = Field(..., min_length=1, examples=[["Camiseta", "Zapatos"]])


class Order(OrderCreate):
    id: int
    status: Literal["pending", "processing", "completed", "cancelled"] = "pending"

    model_config = {"from_attributes": True}
