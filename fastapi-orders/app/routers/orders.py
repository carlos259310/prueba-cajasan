from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.schemas.order import Order, OrderCreate, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Órdenes"])

_orders: list[dict] = [
    {"id": 1, "customerName": "Juan Pérez",    "items": ["Camiseta", "Zapatos"],                    "status": "PENDING"},
    {"id": 2, "customerName": "María García",  "items": ["Laptop Pro 15"],                          "status": "CONFIRMED"},
    {"id": 3, "customerName": "Carlos López",  "items": ["Mouse Inalámbrico", "Teclado Mecánico"],  "status": "SHIPPED"},
]


def _next_id() -> int:
    return max((o["id"] for o in _orders), default=0) + 1


@router.get("", response_model=list[Order], summary="Listar todas las órdenes")
async def list_orders(current_user: dict = Depends(get_current_user)):
    return _orders


@router.get("/{order_id}", response_model=Order, summary="Obtener una orden por ID")
async def get_order(order_id: int, current_user: dict = Depends(get_current_user)):
    order = next((o for o in _orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Orden {order_id} no encontrada")
    return order


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED, summary="Crear una nueva orden")
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    new_order = {"id": _next_id(), "status": "PENDING", **order.model_dump()}
    _orders.append(new_order)
    return new_order


@router.patch("/{order_id}/status", response_model=Order, summary="Actualizar estado de una orden")
async def update_order_status(order_id: int, body: OrderStatusUpdate, current_user: dict = Depends(get_current_user)):
    idx = next((i for i, o in enumerate(_orders) if o["id"] == order_id), None)
    if idx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Orden {order_id} no encontrada")
    _orders[idx]["status"] = body.status
    return _orders[idx]
