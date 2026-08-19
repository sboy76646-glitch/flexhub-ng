@echo off
setlocal

set "ROOT=%~dp0"

if not exist "%ROOT%server\.env" (
  echo.
  echo Missing server\.env
  echo Copy server\.env.example to server\.env and add your MongoDB, JWT and Gemini settings first.
  echo.
  pause
  exit /b 1
)

start "FlexHub NG Backend" powershell -NoExit -Command "Set-Location '%ROOT%server'; npm install; npm run dev"
start "FlexHub NG Frontend - Port 5180" powershell -NoExit -Command "Set-Location '%ROOT%client'; npm install; Remove-Item -Recurse -Force '.\node_modules\.vite' -ErrorAction SilentlyContinue; npm run dev -- --force"

echo.
echo FlexHub NG is starting in two PowerShell windows.
echo Open http://localhost:5180 after both terminals finish starting.
echo.
pause
