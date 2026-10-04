@echo off
cd /d D:\github\neon-serpent
set NODE_HOME=D:\tools\node-v22.23.3-win-x64
set PATH=%NODE_HOME%;%PATH%
echo [Neon Serpent]
echo Dir: %CD%
echo NODE_HOME: %NODE_HOME%
echo.
echo --- check node.exe ---
if exist %NODE_HOME%\node.exe goto havenode
echo ERROR: node.exe NOT FOUND at %NODE_HOME%\node.exe
echo --- listing D:\tools ---
dir D:\tools\
echo --- end listing ---
pause
exit /b 1
:havenode
echo found node.exe, testing...
%NODE_HOME%\node.exe -v
echo --- check npm ---
call %NODE_HOME%\npm.cmd -v
echo.
echo --- check package.json ---
if exist package.json goto havepkg
echo ERROR: package.json not found in %CD%
pause
exit /b 1
:havepkg
echo found package.json
echo --- check node_modules ---
if exist node_modules goto havenm
echo node_modules missing, running npm install...
call %NODE_HOME%\npm.cmd install
echo npm install exit code: %ERRORLEVEL%
goto rundev
:havenm
echo node_modules exists, skip install.
:rundev
echo.
echo --- check port 3000 ---
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do set PID3000=%%a
if defined PID3000 goto portbusy
echo Port 3000 is free.
goto startvite
:portbusy
echo Port 3000 is in use by PID %PID3000%.
echo Trying to kill it...
taskkill /F /PID %PID3000%
timeout /t 2 /nobreak
set PID3000=
:startvite
echo.
echo Starting Vite... open http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call %NODE_HOME%\npm.cmd run dev
echo.
echo Vite exited with code %ERRORLEVEL%.
pause
