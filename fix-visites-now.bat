@echo off
echo ========================================
echo    CORRECTION TABLE VISITES
echo ========================================
echo.

echo Execution du script SQL...
mysql -u root -p < fix-visites-now.sql

echo.
echo ========================================
echo    CORRECTION TERMINEE
echo ========================================
pause