from typing import Literal
from pydantic import BaseModel, Field

OrderStatus = Literal["pending", "processing", "completed", "cancelled"]


class OrderCreate(BaseModel):
    customerName: str = Field(..., min_length=1, examples=["Juan Pérez"])
    items: list[str] = Field(..., min_length=1, examples=[["Camiseta", "Zapatos"]])


class OrderUpdate(BaseModel):
    customerName: str = Field(..., min_length=1)
    items: list[str] = Field(..., min_length=1)
    status: OrderStatus = "pending"


class Order(OrderCreate):
    id: int
    status: OrderStatus = "pending"

    model_config = {"from_attributes": True}
