# 🏪 StocKing - Sistema de Gestión v3.0

Sistema completo de gestión para locales con login, roles y panel de control.

## 🚀 Deploy en Render (GRATIS 24/7)

### Paso 1: Subir a GitHub

```bash
# En tu PC, en la carpeta stocking_final:
git init
git add .
git commit -m "Initial commit"

# Crear repo en https://github.com/new
# Nombre: stocking-final

git remote add origin https://github.com/TU_USUARIO/stocking-final.git
git branch -M main
git push -u origin main
```

### Paso 2: Deploy en Render

1. Andá a: **https://render.com**
2. Sign up con GitHub
3. **New +** → **Web Service**
4. Conectar repo **"stocking-final"**
5. Configuración:
   - **Name:** `stocking-final`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && python init_db.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

6. Agregar PostgreSQL:
   - New PostgreSQL → Name: `stocking-db`
   - Se conecta automáticamente

7. Variables de entorno:
   - `SECRET_KEY` = `tu-clave-super-secreta-123`
   - `PORT` = `10000`

8. **Create Web Service**

### Paso 3: Obtener URL

Una vez deployado:
1. Settings → Public URL
2. Copiá la URL (ej: `stocking-final.onrender.com`)

### Paso 4: Actualizar frontend

Editá `frontend/src/App.jsx`, línea 3:
```javascript
const API_URL = "https://TU-URL.onrender.com/api";
```

Subí el cambio:
```bash
git add .
git commit -m "Update API URL"
git push
```

---

## 🔄 Hack para que nunca se duerma (GRATIS)

### Opción 1: Cron-Job.org (Recomendado)

1. Andá a: **https://cron-job.org**
2. Sign up gratis
3. **Create cronjob:**
   - Title: `Keep Stocking Awake`
   - URL: `https://TU-URL.onrender.com/health`
   - Schedule: Every **10 minutes**
4. Save

¡Listo! Tu app nunca se dormirá.

### Opción 2: UptimeRobot

1. Andá a: **https://uptimerobot.com**
2. Sign up gratis
3. **Add Monitor:**
   - Monitor Type: HTTP(s)
   - URL: `https://TU-URL.onrender.com/health`
   - Monitoring Interval: **5 minutes**
4. Create

---

## 👥 Usuarios de prueba

| Usuario    | Contraseña | Rol         |
|------------|-----------|-------------|
| lucas      | 1234      | Jefe Papá   |
| jefe_mama  | 1234      | Jefe Mamá   |
| empleado1  | 1234      | Empleado    |
| empleado2  | 1234      | Empleado    |

---

## 📱 Acceso

Desde cualquier dispositivo: `https://TU-URL.onrender.com`

---

## 🎯 Próximos pasos

Una vez funcionando:
- ✅ Agregar productos
- ✅ Sistema de ventas
- ✅ Reportes por local
- ✅ Lo que necesites

---

## 🆘 Problemas?

**Error en build:**
- Verificá los logs en Render
- Asegurate que DATABASE_URL esté conectada

**No puedo logearme:**
- Verificá que `init_db.py` se haya ejecutado
- Mirá logs del servidor

**Se duerme la app:**
- Configurá Cron-Job.org o UptimeRobot

---

¡Todo listo! 🚀
