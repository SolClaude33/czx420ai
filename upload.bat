@echo off
echo Inicializando repositorio git...
git init

echo Agregando remote origin...
git remote add origin https://github.com/SolClaude33/ai16cz.git 2>nul
git remote set-url origin https://github.com/SolClaude33/ai16cz.git 2>nul

echo Agregando archivos...
git add .

echo Creando commit...
git commit -m "Update: MaxAgentStream - AI interactive character with WebSocket support"

echo Cambiando a rama main...
git branch -M main

echo Subiendo a GitHub...
git push -u origin main --force

echo Proceso completado!
pause

