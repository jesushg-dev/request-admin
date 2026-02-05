@echo off
REM Local shim to forward npm calls to pnpm when npm isn't installed
where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo "pnpm not found in PATH. Please install pnpm or configure the Jest extension to use pnpm."
  exit /b 1
)
REM Forward all arguments to pnpm
pnpm %*
