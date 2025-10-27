# Instrucciones para subir el proyecto a GitHub

Sigue estos pasos para subir el proyecto al repositorio https://github.com/SolClaude33/ai16cz

## Comandos a ejecutar en PowerShell o CMD:

```powershell
# 1. Inicializar el repositorio git (si no existe)
git init

# 2. Agregar el remote de GitHub
git remote add origin https://github.com/SolClaude33/ai16cz.git

# O si ya existe, actualizarlo:
git remote set-url origin https://github.com/SolClaude33/ai16cz.git

# 3. Agregar todos los archivos al staging
git add .

# 4. Crear un commit con todos los cambios
git commit -m "Update: MaxAgentStream - AI interactive character with WebSocket support"

# 5. Cambiar a la rama main
git branch -M main

# 6. Subir los cambios a GitHub
git push -u origin main
```

## Si hay errores:

Si el repositorio remoto ya tiene contenido y hay conflictos:

```powershell
# Forzar el push (reemplaza todo en GitHub)
git push -u origin main --force
```

## Nota importante:

⚠️ **El flag --force sobrescribirá todo el contenido del repositorio remoto.** Úsalo con cuidado.

Si prefieres mergear en lugar de sobrescribir:

```powershell
# Traer los cambios del remoto
git pull origin main --allow-unrelated-histories

# Resolver conflictos si los hay, luego:
git push -u origin main
```

