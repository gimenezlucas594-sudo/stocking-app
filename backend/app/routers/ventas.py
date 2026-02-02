from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Venta, VentaItem, Producto
from app.schemas import VentaCreate, VentaRead
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=VentaRead)
def crear_venta(
    data: VentaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear nueva venta y descontar stock"""
    
    if not current_user.local_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene local asignado"
        )
    
    # Validar productos y calcular total
    items_data = []
    total = 0
    
    for item in data.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {item.producto_id} no encontrado"
            )
        
        # Verificar stock
        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}"
            )
        
        subtotal = producto.precio * item.cantidad
        total += subtotal
        
        items_data.append({
            "producto": producto,
            "cantidad": item.cantidad,
            "precio_unitario": producto.precio,
            "subtotal": subtotal
        })
    
  # Crear venta
   nueva_venta = Venta(
       total=total,
       vendedor_id=current_user.id,
       local_id=current_user.local_id,
       medio_pago=data.medio_pago,
       monto_efectivo=data.monto_efectivo,
       monto_tarjeta=data.monto_tarjeta,
       monto_mercadopago=data.monto_mercadopago
   )

    db.add(nueva_venta)
    db.flush()
    
    # Crear items y descontar stock
    for item_data in items_data:
        venta_item = VentaItem(
            venta_id=nueva_venta.id,
            producto_id=item_data["producto"].id,
            cantidad=item_data["cantidad"],
            precio_unitario=item_data["precio_unitario"],
            subtotal=item_data["subtotal"]
        )
        db.add(venta_item)
        
        # Descontar stock
        item_data["producto"].stock -= item_data["cantidad"]
    
    db.commit()
    db.refresh(nueva_venta)
    
    return nueva_venta

@router.get("/", response_model=List[VentaRead])
def listar_ventas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar ventas (jefes ven todas, empleados solo las suyas)"""
    
    if current_user.role.value in ["jefe_papa", "jefe_mama"]:
        ventas = db.query(Venta).order_by(Venta.created_at.desc()).limit(100).all()
    else:
        ventas = db.query(Venta).filter(
            Venta.vendedor_id == current_user.id
        ).order_by(Venta.created_at.desc()).limit(50).all()
    
    return ventas

@router.get("/{venta_id}", response_model=VentaRead)
def obtener_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener detalle de una venta"""
    
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venta no encontrada"
        )
    
    # Empleados solo pueden ver sus propias ventas
    if current_user.role == "empleado" and venta.vendedor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    return venta
