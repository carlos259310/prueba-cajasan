from typing import Literal
from pydantic import BaseModel, Field

OrderStatus = Literal["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]


class OrderCreate(BaseModel):
    customerName: str = Field(..., min_length=1, examples=["Juan Pérez"])
    items: list[str] = Field(..., min_length=1, examples=[["Camiseta", "Zapatos"]])


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class Order(OrderCreate):
    id: int
    status: OrderStatus = "PENDING"

    model_config = {"from_attributes": True}
