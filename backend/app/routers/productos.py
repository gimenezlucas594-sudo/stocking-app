from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, UserRole, Producto
from app.schemas import ProductoCreate, ProductoRead, ProductoUpdate
from app.auth import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todos los productos"""
    productos = db.query(Producto).order_by(Producto.nombre).all()
    return productos

@router.post("/", response_model=ProductoRead)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.JEFE_PAPA, UserRole.JEFE_MAMA))
):
    """Crear nuevo producto (solo jefes)"""
    existing = db.query(Producto).filter(Producto.nombre == data.nombre).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un producto con ese nombre"
        )
    
    nuevo_producto = Producto(
        nombre=data.nombre,
        precio=data.precio,
        stock=data.stock,
        categoria=data.categoria
    )
    
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    
    return nuevo_producto

@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.JEFE_PAPA, UserRole.JEFE_MAMA))
):
    """Actualizar producto (solo jefes)"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    if data.nombre is not None:
        producto.nombre = data.nombre
    if data.precio is not None:
        producto.precio = data.precio
    if data.stock is not None:
        producto.stock = data.stock
    if data.categoria is not None:
        producto.categoria = data.categoria
    
    db.commit()
    db.refresh(producto)
    
    return producto

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.JEFE_PAPA, UserRole.JEFE_MAMA))
):
    """Eliminar producto (solo jefes)"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    db.delete(producto)
    db.commit()
    
    return None
