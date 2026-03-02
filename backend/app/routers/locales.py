from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, UserRole, Local
from app.schemas import LocalCreate, LocalRead
from app.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[LocalRead])
def listar_locales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todos los locales"""
    locales = db.query(Local).all()
    return locales

@router.post("/", response_model=LocalRead)
def crear_local(
    data: LocalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear nuevo local (solo jefes)"""
    
    if current_user.role not in [UserRole.JEFE_PAPA, UserRole.JEFE_MAMA]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    # Verificar si ya existe
    existe = db.query(Local).filter(Local.nombre == data.nombre).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El local '{data.nombre}' ya existe"
        )
    
    nuevo_local = Local(
        nombre=data.nombre,
        direccion=data.direccion
    )
    
    db.add(nuevo_local)
    db.commit()
    db.refresh(nuevo_local)
    
    return nuevo_local
