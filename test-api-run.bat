@echo off
REM Batch script para ejecutar test-api.ps1 con bypass de política
REM Uso: test-api-run.bat [tenantId] [apiKey]

if "%~1"=="" (
    powershell -ExecutionPolicy Bypass -File "%~dp0test-api.ps1"
) else if "%~2"=="" (
    powershell -ExecutionPolicy Bypass -File "%~dp0test-api.ps1" -TenantId "%~1"
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0test-api.ps1" -TenantId "%~1" -ApiKey "%~2"
)

