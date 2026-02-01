from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    JEFE_PAPA = "jefe_papa"
    JEFE_MAMA = "jefe_mama"
    EMPLEADO = "empleado"

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

class Local(Base):
    __tablename__ = "locales"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    direccion = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    empleados = relationship("User", back_populates="local")
