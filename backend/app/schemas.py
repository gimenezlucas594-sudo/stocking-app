from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, TipoVenta

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
    codigo_barras: Optional[str] = None
    precio: float = Field(..., ge=0)
    stock: float = Field(..., ge=0)
    categoria: Optional[str] = None
    tipo_venta: TipoVenta = TipoVenta.UNIDAD

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo_barras: Optional[str] = None
    precio: Optional[float] = Field(None, ge=0)
    stock: Optional[float] = Field(None, ge=0)
    categoria: Optional[str] = None
    tipo_venta: Optional[TipoVenta] = None

class ProductoRead(BaseModel):
    id: int
    nombre: str
    codigo_barras: Optional[str] = None
    precio: float
    stock: float
    categoria: Optional[str] = None
    tipo_venta: TipoVenta
    
    class Config:
        from_attributes = True

# ========== VENTAS ==========
class VentaItemCreate(BaseModel):
    producto_id: int
    cantidad: float = Field(..., gt=0)

class VentaCreate(BaseModel):
    items: List[VentaItemCreate]
    medio_pago: str  # "efectivo", "tarjeta", "mercadopago", "mixto"
    monto_efectivo: float = 0
    monto_tarjeta: float = 0
    monto_mercadopago: float = 0

class VentaItemRead(BaseModel):
    id: int
    producto_id: int
    cantidad: float
    precio_unitario: float
    subtotal: float
    
    class Config:
        from_attributes = True

class VentaRead(BaseModel):
    id: int
    total: float
    vendedor_id: int
    local_id: int
    created_at: datetime
    medio_pago: Optional[str] = None
    monto_efectivo: Optional[float] = 0
    monto_tarjeta: Optional[float] = 0
    monto_mercadopago: Optional[float] = 0
    items: List[VentaItemRead]
    
    class Config:
        from_attributes = True
    
    class Config:
        from_attributes = True
