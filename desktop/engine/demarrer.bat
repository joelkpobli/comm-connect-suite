@echo off
cd /d "%~dp0"
call venv\Scripts\activate.bat
set /p FACE=Glissez ici la photo du visage cible puis Entree : 
python weechat_swap.py --face %FACE%
pause
