from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.routers import auth, users
import os

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StocKing API", version="3.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers API
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

# API endpoints
@app.get("/api")
def api_root():
    return {"message": "StocKing API v3.0", "status": "online"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

# Servir archivos estáticos del frontend
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/src", StaticFiles(directory=os.path.join(frontend_path, "src")), name="src")
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "public")), name="static")
    
    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(frontend_path, "public", "index.html"))

# Si no hay frontend, mostrar mensaje
else:
    @app.get("/")
    def root():
        return {"message": "StocKing API v3.0", "status": "online", "note": "Frontend not found"}
