# Guía de Conversión FBX → GLB

## 🎯 Por qué convertir a GLB

El formato GLB (GLTF Binary) **no tiene el límite de 4 influencias de skinning** que tiene FBX en Three.js. Esto significa que tus modelos de CZ se verán **perfectos sin deformaciones**.

## ✅ Estado Actual

El código ya está preparado para soportar **ambos formatos** (FBX y GLB). Solo necesitas:
1. Convertir los archivos
2. Cambiar la extensión en las URLs

## 🛠️ Métodos de Conversión

### Opción 1: Herramienta Online (Más Rápido)
1. **Visita**: https://products.aspose.app/3d/conversion/fbx-to-glb
2. **Sube** tus archivos FBX uno por uno
3. **Descarga** los archivos GLB resultantes
4. **Renombra** para que coincidan:
   - `idle.fbx` → `idle.glb`
   - `talking.fbx` → `talking.glb`
   - `thinking.fbx` → `thinking.glb`
   - `angry.fbx` → `angry.glb`
   - `celebrating.fbx` → `celebrating.glb`
   - `crazy_dance.fbx` → `crazy_dance.glb`
   - `confused.fbx` → `confused.glb`

### Opción 2: Blender (Más Control)
1. **Descarga Blender**: https://www.blender.org/download/
2. **Para cada archivo FBX**:
   - File → Import → FBX (.fbx)
   - Selecciona tu archivo
   - File → Export → glTF 2.0 (.glb/.gltf)
   - **Importante**: En las opciones de exportación:
     - Formato: **glTF Binary (.glb)**
     - Include: Selected Objects ✅
     - Transform: +Y Up ✅
     - Geometry: Apply Modifiers ✅
     - Animation: Animation ✅
   - Exporta como `nombre.glb`

### Opción 3: FBX2glTF CLI (Para Múltiples Archivos)
```bash
# Instalar
npm install -g fbx2gltf

# Convertir todos los archivos
fbx2gltf -i idle.fbx -o idle.glb
fbx2gltf -i talking.fbx -o talking.glb
fbx2gltf -i thinking.fbx -o thinking.glb
fbx2gltf -i angry.fbx -o angry.glb
fbx2gltf -i celebrating.fbx -o celebrating.glb
fbx2gltf -i crazy_dance.fbx -o crazy_dance.glb
fbx2gltf -i confused.fbx -o confused.glb
```

## 🚀 Aplicar en el Proyecto

Una vez que tengas los archivos GLB:

1. **Reemplaza** los archivos FBX en la carpeta `public/` con los GLB
2. **Actualiza** las URLs en `client/src/components/CZ3DViewer.tsx`:

```typescript
// Cambiar esto:
loadModel('/idle.fbx', 'idle').then(() => {
  // ...
  Promise.all([
    loadModel('/talking.fbx', 'talking'),
    loadModel('/thinking.fbx', 'thinking'),
    loadModel('/angry.fbx', 'angry'),
    loadModel('/celebrating.fbx', 'celebrating'),
    loadModel('/crazy_dance.fbx', 'crazy_dance'),
    loadModel('/confused.fbx', 'confused')
  ]);
});

// Por esto:
loadModel('/idle.glb', 'idle').then(() => {
  // ...
  Promise.all([
    loadModel('/talking.glb', 'talking'),
    loadModel('/thinking.glb', 'thinking'),
    loadModel('/angry.glb', 'angry'),
    loadModel('/celebrating.glb', 'celebrating'),
    loadModel('/crazy_dance.glb', 'crazy_dance'),
    loadModel('/confused.glb', 'confused')
  ]);
});
```

## ✨ Beneficios Esperados

Después de la conversión:
- ✅ **Sin deformaciones**: Todas las influencias de skinning preservadas
- ✅ **Archivos más pequeños**: GLB es más compacto que FBX
- ✅ **Carga más rápida**: Formato binario optimizado
- ✅ **Mejor rendimiento**: GLTFLoader es más eficiente
- ✅ **Sin warnings**: No más mensajes de "Deleting additional weights"

## 🔍 Verificación

Después de aplicar los cambios, busca en la consola del navegador:
- ✅ `"✅ Loaded GLB model for idle (supports unlimited skinning weights)"`
- ❌ No deberías ver warnings de skinning weights

## 📝 Notas

- El código actual **ya soporta GLB automáticamente**
- La detección de formato es por extensión del archivo
- No necesitas cambiar nada más en el código
- Los archivos FBX seguirán funcionando (con las limitaciones actuales)
