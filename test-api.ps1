# PowerShell script para probar la API
# Uso: powershell -ExecutionPolicy Bypass -File .\test-api.ps1 [tenantId] [apiKey]
# O simplemente: .\test-api.ps1 [tenantId] [apiKey] (si la política lo permite)

param(
    [string]$TenantId = "",
    [string]$ApiKey = "appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz"
)

# API Key
$API_KEY = $ApiKey

# Base URL (ajusta según tu entorno)
$BASE_URL = "http://localhost:3000"
# $BASE_URL = "https://your-domain.com"

Write-Host "=== Testing API with API Key ===" -ForegroundColor Blue
Write-Host "Base URL: $BASE_URL" -ForegroundColor Cyan
Write-Host "API Key: $($API_KEY.Substring(0, [Math]::Min(20, $API_KEY.Length)))..." -ForegroundColor Cyan
Write-Host ""

# Headers para las peticiones
$headers = @{
    "Authorization" = "Bearer $API_KEY"
}

# Función helper para hacer peticiones con manejo de errores
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; Error = $null }
    } catch {
        $errorDetails = $_.Exception
        if ($_.ErrorDetails) {
            try {
                $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            } catch {
                $errorDetails = $_.ErrorDetails.Message
            }
        }
        return @{ Success = $false; Data = $null; Error = $errorDetails }
    }
}

# 1. Verificar que la API key funciona (obtener tenant asociado)
Write-Host "1. Verifying API key and getting associated tenant..." -ForegroundColor Green

# Intentar diferentes variantes de URL
$urls = @(
    "$BASE_URL/api/tenants",
    "$BASE_URL/en/api/tenants",
    "$BASE_URL/es/api/tenants"
)

$tenantsResponse = $null
$workingUrl = $null

foreach ($url in $urls) {
    Write-Host "  Trying: $url" -ForegroundColor Gray
    $result = Invoke-ApiRequest -Url $url -Method "GET" -Headers $headers
    
    if ($result.Success) {
        $tenantsResponse = $result.Data
        $workingUrl = $url -replace '/api/tenants', ''
        Write-Host "  ✓ Success!" -ForegroundColor Green
        break
    } else {
        Write-Host "  ✗ Failed" -ForegroundColor Yellow
    }
}

if (-not $tenantsResponse) {
    Write-Host ""
    Write-Host "Error: Could not connect to API. Make sure:" -ForegroundColor Red
    Write-Host "  1. The server is running (npm run dev)" -ForegroundColor Red
    Write-Host "  2. The server is accessible at $BASE_URL" -ForegroundColor Red
    Write-Host "  3. The API key is valid and associated with a tenant" -ForegroundColor Red
    exit 1
}

$tenantsResponse | ConvertTo-Json -Depth 10
Write-Host ""

# La API key ya está asociada a un tenant, no necesitamos especificarlo
Write-Host "API key is scoped to tenant automatically" -ForegroundColor Green
Write-Host ""

# 2. Listar formularios (tenantId ya está incluido en la API key)
Write-Host "2. Getting forms..." -ForegroundColor Green
$formsResult = Invoke-ApiRequest -Url "$workingUrl/api/forms" -Method "GET" -Headers $headers

if ($formsResult.Success) {
    $formsResponse = $formsResult.Data
    $formsResponse | ConvertTo-Json -Depth 10
    Write-Host ""
} else {
    Write-Host "  ✗ Error: $($formsResult.Error)" -ForegroundColor Red
    $formsResponse = $null
    Write-Host ""
}

# 3. Obtener menu items (tenantId ya está incluido en la API key)
Write-Host "3. Getting menu items..." -ForegroundColor Green
$menuItemsResult = Invoke-ApiRequest -Url "$workingUrl/api/menu-items" -Method "GET" -Headers $headers

if ($menuItemsResult.Success) {
    $menuItemsResponse = $menuItemsResult.Data
    $menuItemsResponse | ConvertTo-Json -Depth 10
    Write-Host ""
} else {
    Write-Host "  ✗ Error: $($menuItemsResult.Error)" -ForegroundColor Red
    Write-Host ""
}

# Si hay formularios, obtener el primero
if ($formsResponse -and $formsResponse.data -and $formsResponse.data.Count -gt 0) {
    $firstFormId = $formsResponse.data[0].id
    
    Write-Host "4. Getting form details (ID: $firstFormId)..." -ForegroundColor Green
    $formDetailsResult = Invoke-ApiRequest -Url "$workingUrl/api/forms/$firstFormId" -Method "GET" -Headers $headers
    
    if ($formDetailsResult.Success) {
      $formDetailsResult.Data | ConvertTo-Json -Depth 10
      Write-Host ""
    } else {
      Write-Host "  ✗ Error: $($formDetailsResult.Error)" -ForegroundColor Red
      Write-Host ""
    }
    
    Write-Host "5. Getting form submissions (ID: $firstFormId)..." -ForegroundColor Green
    $submissionsResult = Invoke-ApiRequest -Url "$workingUrl/api/forms/$firstFormId/submissions" -Method "GET" -Headers $headers
    
    if ($submissionsResult.Success) {
        $submissionsResult.Data | ConvertTo-Json -Depth 10
        Write-Host ""
    } else {
        Write-Host "  ✗ Error: $($submissionsResult.Error)" -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host "4. Skipping form details (no forms found)" -ForegroundColor Yellow
    Write-Host "5. Skipping form submissions (no forms found)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== Test completed ===" -ForegroundColor Blue
