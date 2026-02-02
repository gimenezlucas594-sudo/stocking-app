FROM python:3.11-slim

WORKDIR /app

# Copiar requirements e instalar dependencias
COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar backend
COPY back-end/ .

# Copiar frontend
COPY front-end/ ./frontend/

# Inicializar base de datos
RUN python init_db.py || true

EXPOSE 10000

# Ejecutar servidor
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
