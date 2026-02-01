"""
Script para inicializar la base de datos con datos de prueba.
"""
from app.database import SessionLocal, engine, Base
from app.models import User, Local, UserRole
from app.auth import hash_password

def init_db():
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar si ya hay datos
        if db.query(User).first():
            print("✅ Base de datos ya inicializada")
            return
        
        # Crear locales
        local1 = Local(nombre="Local Centro", direccion="Av. Principal 123")
        local2 = Local(nombre="Local Norte", direccion="Calle Secundaria 456")
        
        db.add(local1)
        db.add(local2)
        db.commit()
        db.refresh(local1)
        db.refresh(local2)
        
        print(f"✅ Locales creados: {local1.nombre}, {local2.nombre}")
        
        # Crear usuarios de prueba
        users = [
            User(
                username="lucas",
                full_name="Lucas (Jefe Papá)",
                hashed_password=hash_password("1234"),
                role=UserRole.JEFE_PAPA,
                local_id=None
            ),
            User(
                username="jefe_mama",
                full_name="Mamá (Jefe Mamá)",
                hashed_password=hash_password("1234"),
                role=UserRole.JEFE_MAMA,
                local_id=None
            ),
            User(
                username="empleado1",
                full_name="Juan Pérez",
                hashed_password=hash_password("1234"),
                role=UserRole.EMPLEADO,
                local_id=local1.id
            ),
            User(
                username="empleado2",
                full_name="María González",
                hashed_password=hash_password("1234"),
                role=UserRole.EMPLEADO,
                local_id=local2.id
            ),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        
        print("✅ Usuarios creados:")
        for user in users:
            local_name = "Sin asignar" if not user.local_id else (local1.nombre if user.local_id == local1.id else local2.nombre)
            print(f"   - {user.username} ({user.role.value}) - Local: {local_name}")
        
        print("\n🎉 Base de datos inicializada correctamente!")
        print("\n📝 Credenciales de prueba:")
        print("   Usuario: lucas | Contraseña: 1234 (Jefe Papá)")
        print("   Usuario: jefe_mama | Contraseña: 1234 (Jefe Mamá)")
        print("   Usuario: empleado1 | Contraseña: 1234 (Empleado - Local Centro)")
        print("   Usuario: empleado2 | Contraseña: 1234 (Empleado - Local Norte)")
        
    except Exception as e:
        print(f"❌ Error inicializando DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
