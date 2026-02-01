from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, UserRole, Local
from app.schemas import UserCreate, UserRead, LocalCreate, LocalRead, UserInfo
from app.auth import get_current_user, require_role, hash_password

router = APIRouter()

@router.get("/me", response_model=UserInfo)
def get_me(current_user: User = Depends(get_current_user)):
    """Obtener info del usuario actual"""
    return UserInfo(
        id=current_user.id,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        local_id=current_user.local_id,
        local_nombre=current_user.local.nombre if current_user.local else None
    )

@router.post("/", response_model=UserRead)
def crear_usuario(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.JEFE_PAPA, UserRole.JEFE_MAMA))
):
    """Crear nuevo usuario (solo jefes)"""
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese nombre"
        )
    
    if data.local_id:
        local = db.query(Local).filter(Local.id == data.local_id).first()
        if not local:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Local no encontrado"
            )
    
    new_user = User(
        username=data.username,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        local_id=data.local_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/", response_model=List[UserRead])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.JEFE_PAPA, UserRole.JEFE_MAMA))
):
    """Listar todos los usuarios (solo jefes)"""
    users = db.query(User).order_by(User.id).all()
    return users

@router.post("/locales", response_model=LocalRead)
def crear_local(
    data: LocalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.JEFE_PAPA, UserRole.JEFE_MAMA))
):
    """Crear nuevo local (solo jefes)"""
    existing = db.query(Local).filter(Local.nombre == data.nombre).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un local con ese nombre"
        )
    
    new_local = Local(nombre=data.nombre, direccion=data.direccion)
    db.add(new_local)
    db.commit()
    db.refresh(new_local)
    
    return new_local

@router.get("/locales", response_model=List[LocalRead])
def listar_locales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar locales"""
    locales = db.query(Local).order_by(Local.id).all()
    return locales
