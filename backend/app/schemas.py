from pydantic import BaseModel, Field
from typing import Optional
from app.models import UserRole

# ========== USER INFO (PRIMERO) ==========
class UserInfo(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: UserRole
    local_id: Optional[int] = None
    local_nombre: Optional[str] = None

# ========== AUTH ==========
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo

# ========== USERS ==========
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)
    full_name: Optional[str] = None
    role: UserRole = UserRole.EMPLEADO
    local_id: Optional[int] = None

class UserRead(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    local_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# ========== LOCALES ==========
class LocalCreate(BaseModel):
    nombre: str = Field(..., min_length=1)
    direccion: Optional[str] = None

class LocalRead(BaseModel):
    id: int
    nombre: str
    direccion: Optional[str] = None
    
    class Config:
        from_attributes = True

# ========== PRODUCTOS ==========
class ProductoCreate(BaseModel):
    nombre: str = Field(..., min_length=1)
    precio: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    categoria: Optional[str] = None

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    categoria: Optional[str] = None

class ProductoRead(BaseModel):
    id: int
    nombre: str
    precio: float
    stock: int
    categoria: Optional[str] = None
    
    class Config:
        from_attributes = True
