@echo off
echo Arret de l'application...
taskkill /f /im java.exe
taskkill /f /im node.exe
echo Application arretee.
pause
