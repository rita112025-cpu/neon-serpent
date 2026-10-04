@echo off
cd /d D:\github\neon-serpent
set NODE_HOME=D:\tools\node-v22.23.3-win-x64
set PATH=%NODE_HOME%;%PATH%
echo [Neon Serpent] setup remote + push
echo.
echo --- current remote ---
git remote -v
echo.
echo --- set remote to github ---
git remote remove origin
git remote add origin https://github.com/rita112025-cpu/neon-serpent.git
git remote -v
echo.
echo --- branch ---
git branch --show-current
git status --short --branch
echo.
echo --- add + commit ---
git add -A
git status --short
set /p MSG=Commit message (default: update): 
if "%MSG%"=="" set MSG=update
git commit -m "%MSG%"
echo.
echo --- push to master ---
git branch -M master
git push -u origin master
echo.
echo push exit: %ERRORLEVEL%
pause
