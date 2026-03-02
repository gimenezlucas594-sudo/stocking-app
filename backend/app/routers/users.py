from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserCreate, UserRead
from app.auth import get_current_user, hash_password

router = APIRouter()

@router.get("/", response_model=List[UserRead])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todos los usuarios (solo jefes)"""
    
    if current_user.role not in [UserRole.JEFE_PAPA, UserRole.JEFE_MAMA]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    usuarios = db.query(User).all()
    return usuarios

@router.post("/", response_model=UserRead)
def crear_usuario(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear nuevo usuario (solo jefes)"""
    
    if current_user.role not in [UserRole.JEFE_PAPA, UserRole.JEFE_MAMA]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    # Verificar si el username ya existe
    existe = db.query(User).filter(User.username == data.username).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario '{data.username}' ya existe"
        )
    
    nuevo_usuario = User(
        username=data.username,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        local_id=data.local_id
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario

@router.delete("/{user_id}")
def eliminar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar usuario (solo jefes, no puede eliminarse a sí mismo)"""
    
    if current_user.role not in [UserRole.JEFE_PAPA, UserRole.JEFE_MAMA]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminarte a ti mismo"
        )
    
    usuario = db.query(User).filter(User.id == user_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si tiene ventas asociadas
    from app.models import Venta
    tiene_ventas = db.query(Venta).filter(Venta.vendedor_id == user_id).first()
    
    if tiene_ventas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar a '{usuario.username}' porque tiene ventas registradas"
        )
    
    db.delete(usuario)
    db.commit()
    
    return {"message": "Usuario eliminado correctamente"}
