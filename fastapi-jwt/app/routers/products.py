from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.product import Product, ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["Productos"])

# ── Datos en memoria ──────────────────────────────────────────────────────────

_products: list[dict] = [
    {"id": 1, "name": "Laptop Pro 15",      "category": "Electrónica",  "price": 1299.99, "stock": 15},
    {"id": 2, "name": "Mouse Inalámbrico",  "category": "Electrónica",  "price": 29.99,   "stock": 100},
    {"id": 3, "name": "Teclado Mecánico",   "category": "Electrónica",  "price": 89.99,   "stock": 50},
    {"id": 4, "name": "Silla Ergonómica",   "category": "Mobiliario",   "price": 349.99,  "stock": 20},
    {"id": 5, "name": "Escritorio Standing","category": "Mobiliario",   "price": 599.99,  "stock": 10},
]


def _next_id() -> int:
    return max((p["id"] for p in _products), default=0) + 1


def _find(product_id: int) -> dict | None:
    return next((p for p in _products if p["id"] == product_id), None)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=list[Product],
    summary="Listar productos",
    description="Retorna todos los productos almacenados en memoria.",
)
async def list_products(current_user: dict = Depends(get_current_user)):
    return _products


@router.get(
    "/{product_id}",
    response_model=Product,
    summary="Obtener producto por ID",
)
async def get_product(product_id: int, current_user: dict = Depends(get_current_user)):
    product = _find(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado",
        )
    return product


@router.post(
    "",
    response_model=Product,
    status_code=status.HTTP_201_CREATED,
    summary="Crear producto",
    description="Crea un nuevo producto y lo almacena en memoria.",
)
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(get_current_user),
):
    new_product = {"id": _next_id(), **product.model_dump()}
    _products.append(new_product)
    return new_product


@router.patch(
    "/{product_id}",
    response_model=Product,
    summary="Actualizar producto",
    description="Actualiza los campos de un producto existente.",
)
async def update_product(
    product_id: int,
    product: ProductUpdate,
    current_user: dict = Depends(get_current_user),
):
    idx = next((i for i, p in enumerate(_products) if p["id"] == product_id), None)
    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado",
        )
    updated = {"id": product_id, **product.model_dump()}
    _products[idx] = updated
    return updated
