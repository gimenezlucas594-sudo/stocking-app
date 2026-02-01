from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse, UserInfo
from app.auth import verify_password, create_access_token

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login de usuarios"""
    user = db.query(User).filter(User.username == data.username).first()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )
    
    access_token = create_access_token(data={"sub": user.username})
    
    user_info = UserInfo(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        local_id=user.local_id,
        local_nombre=user.local.nombre if user.local else None
    )
    
    return LoginResponse(
        access_token=access_token,
        user=user_info
    )
