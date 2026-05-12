from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, examples=["Laptop Pro"])
    category: str = Field(..., min_length=1, examples=["Electronics"])
    price: float = Field(..., gt=0, examples=[1299.99])
    stock: int = Field(..., ge=0, examples=[15])


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    model_config = {"from_attributes": True}
