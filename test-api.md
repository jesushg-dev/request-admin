# Guía para Probar la API con tu API Key

## Tu API Key

```
appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz
```

## Endpoints Disponibles

### 1. Obtener Tenants Disponibles

Primero, necesitas obtener el `tenantId` al que tienes acceso:

```bash
curl -X GET \
  -H "Authorization: Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz" \
  "http://localhost:3000/api/tenants"
```

**Respuesta esperada:**

```json
{
  "data": [
    {
      "id": "tenant-id-here",
      "name": "Nombre del Tenant",
      "description": "Descripción",
      "logo": "url-del-logo"
    }
  ]
}
```

### 2. Listar Formularios

```bash
curl -X GET \
  -H "Authorization: Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz" \
  "http://localhost:3000/api/forms?tenantId=TU_TENANT_ID"
```

### 3. Obtener un Formulario Específico

```bash
curl -X GET \
  -H "Authorization: Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz" \
  "http://localhost:3000/api/forms/FORM_ID?tenantId=TU_TENANT_ID"
```

### 4. Obtener Submissions de un Formulario

```bash
curl -X GET \
  -H "Authorization: Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz" \
  "http://localhost:3000/api/forms/FORM_ID/submissions?tenantId=TU_TENANT_ID"
```

### 5. Obtener una Submission Específica

```bash
curl -X GET \
  -H "Authorization: Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz" \
  "http://localhost:3000/api/submissions/SUBMISSION_ID?tenantId=TU_TENANT_ID"
```

### 6. Obtener Menu Items

```bash
curl -X GET \
  -H "Authorization: Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz" \
  "http://localhost:3000/api/menu-items?tenantId=TU_TENANT_ID"
```

## Usando los Scripts de Prueba

### En Linux/Mac (Bash)

```bash
chmod +x test-api.sh
./test-api.sh
```

### En Windows (PowerShell)

**Opción 1: Usar el script wrapper (recomendado)**

```powershell
# Ejecutar con bypass de política automático
.\test-api-run.ps1

# Con tenantId
.\test-api-run.ps1 "tenant-id-here"

# Con tenantId y API key
.\test-api-run.ps1 "tenant-id-here" "your-api-key"
```

**Opción 2: Usar el archivo .bat (más fácil)**

```cmd
test-api-run.bat
test-api-run.bat "tenant-id-here"
test-api-run.bat "tenant-id-here" "your-api-key"
```

**Opción 3: Ejecutar directamente con bypass**

```powershell
powershell -ExecutionPolicy Bypass -File .\test-api.ps1
powershell -ExecutionPolicy Bypass -File .\test-api.ps1 -TenantId "tenant-id-here"
```

**Opción 4: Cambiar la política de ejecución (requiere permisos de administrador)**

```powershell
# Solo para el usuario actual (más seguro)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Luego puedes ejecutar normalmente
.\test-api.ps1
```

**Nota:** Si tienes problemas con la política de ejecución, usa `test-api-run.ps1` o `test-api-run.bat` que automáticamente hacen bypass de la política.

## Usando Postman o Thunder Client

1. **Método:** GET
2. **URL:** `http://localhost:3000/api/tenants` (para empezar)
3. **Headers:**
   - `Authorization`: `Bearer appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz`

## Notas Importantes

- Reemplaza `TU_TENANT_ID` con el ID real que obtengas del primer endpoint
- Si estás en producción, cambia `http://localhost:3000` por tu dominio
- Todos los endpoints (excepto `/api/tenants`) requieren el parámetro `tenantId` en la query string
- El header `Authorization` puede usar el formato `Bearer <key>` o simplemente `<key>`
