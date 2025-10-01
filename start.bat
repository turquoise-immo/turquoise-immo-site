@echo off
REM Turquoise.Immo - Windows starter
echo Installing dependencies...
npm install
echo Starting server in a new window...
start "Turquoise.Immo - Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul
echo Opening Firefox (or default browser)...
start "" "firefox" "http://localhost:3000" "http://localhost:3000/admin.html" || start "" "http://localhost:3000" & start "" "http://localhost:3000/admin.html"
pause
