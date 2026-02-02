from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    JEFE_PAPA = "jefe_papa"
    JEFE_MAMA = "jefe_mama"
    EMPLEADO = "empleado"

class TipoVenta(str, enum.Enum):
    UNIDAD = "unidad"
    PESO = "peso"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.EMPLEADO)
    is_active = Column(Boolean, default=True)
    local_id = Column(Integer, ForeignKey("locales.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    local = relationship("Local", back_populates="empleados")
    ventas = relationship("Venta", back_populates="vendedor")

class Local(Base):
    __tablename__ = "locales"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    direccion = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    empleados = relationship("User", back_populates="local")
    ventas = relationship("Venta", back_populates="local")

class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    codigo_barras = Column(String, unique=True, nullable=True, index=True)
    precio = Column(Float, nullable=False)
    stock = Column(Float, nullable=False, default=0)
    categoria = Column(String, nullable=True)
    tipo_venta = Column(SQLEnum(TipoVenta), nullable=False, default=TipoVenta.UNIDAD)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    items_venta = relationship("VentaItem", back_populates="producto")

class Venta(Base):
    __tablename__ = "ventas"
    
    id = Column(Integer, primary_key=True, index=True)
    total = Column(Float, nullable=False)
    vendedor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    local_id = Column(Integer, ForeignKey("locales.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    medio_pago = Column(String, nullable=True)
    monto_efectivo = Column(Float, nullable=True, default=0)
    monto_tarjeta = Column(Float, nullable=True, default=0)
    monto_mercadopago = Column(Float, nullable=True, default=0)
    
    vendedor = relationship("User", back_populates="ventas")
    local = relationship("Local", back_populates="ventas")
    items = relationship("VentaItem", back_populates="venta", cascade="all, delete-orphan")

class VentaItem(Base):
    __tablename__ = "venta_items"
    
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    
    venta = relationship("Venta", back_populates="items")
    producto = relationship("Producto", back_populates="items_venta")
