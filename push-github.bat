@echo off
cd /d D:\github\neon-serpent
set NODE_HOME=D:\tools\node-v22.23.3-win-x64
set PATH=%NODE_HOME%;%PATH%
echo [Neon Serpent] push to GitHub
echo.
%NODE_HOME%\node.exe -v
call %NODE_HOME%\npm.cmd -v
echo.
git status --short --branch
echo.
echo --- files to be committed ---
git add -A
git status --short
echo.
set /p MSG=Commit message (default: update): 
if "%MSG%"=="" set MSG=update
git commit -m "%MSG%"
if errorlevel 1 goto maybeempty
goto dopush
:maybeempty
echo No new commit (maybe nothing changed). Trying push anyway...
:dopush
echo.
echo --- remote ---
git remote -v
echo.
echo --- push ---
git push -u origin HEAD
echo.
echo push exit: %ERRORLEVEL%
pause
