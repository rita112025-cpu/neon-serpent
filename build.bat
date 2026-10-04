@echo off
cd /d D:\github\neon-serpent
set NODE_HOME=D:\tools\node-v22.23.3-win-x64
set PATH=%NODE_HOME%;%PATH%
echo [Neon Serpent] build + typecheck
%NODE_HOME%\node.exe -v
call %NODE_HOME%\npm.cmd -v
echo.
echo --- typecheck ---
call %NODE_HOME%\npm.cmd run typecheck
echo typecheck exit: %ERRORLEVEL%
echo.
echo --- build ---
call %NODE_HOME%\npm.cmd run build
echo build exit: %ERRORLEVEL%
echo.
if exist dist\index.html goto ok
echo ERROR: dist\index.html NOT generated.
pause
exit /b 1
:ok
echo OK: dist\index.html generated.
dir dist
pause
