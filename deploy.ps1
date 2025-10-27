# Script para subir el proyecto a GitHub

Write-Host "Inicializando repositorio git..." -ForegroundColor Green

# Inicializar git si no existe
if (-not (Test-Path ".git")) {
    git init
}

# Verificar si el remote ya existe
$remoteUrl = git remote get-url origin 2>$null

if (-not $remoteUrl) {
    Write-Host "Agregando remote origin..." -ForegroundColor Green
    git remote add origin https://github.com/SolClaude33/ai16cz.git
} else {
    Write-Host "Actualizando remote origin..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/SolClaude33/ai16cz.git
}

# Agregar todos los archivos
Write-Host "Agregando archivos..." -ForegroundColor Green
git add .

# Verificar si hay cambios para commit
$status = git status --porcelain

if ($status) {
    Write-Host "Creando commit..." -ForegroundColor Green
    git commit -m "Initial commit: MaxAgentStream - AI interactive character with WebSocket support"
    
    Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Green
    git push -u origin main
    
    Write-Host "¡Proyecto subido exitosamente a GitHub!" -ForegroundColor Green
} else {
    Write-Host "No hay cambios para subir" -ForegroundColor Yellow
}

Write-Host "Proceso completado" -ForegroundColor Green

