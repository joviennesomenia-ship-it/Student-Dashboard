@echo off
title Class Reminders
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Opening the download page...
  echo Install the LTS version, then double-click this file again.
  start https://nodejs.org/en/download
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages. This only happens the first time...
  call npm install
  if errorlevel 1 ( echo Install failed. & pause & exit /b 1 )
)

echo.
echo  1 = Start the site on this computer (preview your changes)
echo  2 = Build the site for publishing (creates the "dist" folder)
echo.
set /p choice="Type 1 or 2 then press Enter: "

if "%choice%"=="2" (
  call npm run build
  echo.
  echo Done. The finished site is in the "dist" folder.
  pause
  exit /b 0
)

echo Starting... your browser will open. Close this window to stop the site.
call npm run dev -- --open
pause
