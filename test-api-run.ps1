# Wrapper script para ejecutar test-api.ps1 con bypass de política
# Uso: .\test-api-run.ps1 [tenantId] [apiKey]

param(
    [string]$TenantId = "",
    [string]$ApiKey = ""
)

$scriptPath = Join-Path $PSScriptRoot "test-api.ps1"

if ($TenantId -and $ApiKey) {
    powershell -ExecutionPolicy Bypass -File $scriptPath -TenantId $TenantId -ApiKey $ApiKey
} elseif ($TenantId) {
    powershell -ExecutionPolicy Bypass -File $scriptPath -TenantId $TenantId
} else {
    powershell -ExecutionPolicy Bypass -File $scriptPath
}

