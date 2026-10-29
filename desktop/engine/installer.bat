@echo off
cd /d "%~dp0"
echo === Installation du moteur Weechat Swap Live ===
where py >nul 2>nul || (echo Installez Python 3.10 depuis python.org puis relancez. & pause & exit /b 1)
py -3.10 -m venv venv || (echo Python 3.10 requis. & pause & exit /b 1)
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt || (echo Echec : installez "Microsoft C++ Build Tools" puis relancez. & pause & exit /b 1)
echo Installation terminee. Lancez demarrer.bat
pause
