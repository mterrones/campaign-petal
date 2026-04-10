

## Plan: Upload de archivos para imágenes en el editor de email

Actualmente los bloques de imagen y logo solo aceptan una URL manual. Se necesita agregar un botón de upload que convierta el archivo a base64 (o Object URL) para usarlo directamente en el editor.

### Cambios

**`src/components/email-editor/PropertiesPanel.tsx`**
- Crear un componente helper `ImageUpload` que muestre:
  - Un área de drop / botón "Subir imagen" con `<input type="file" accept="image/*">`
  - Preview thumbnail de la imagen actual
  - Campo de URL manual como alternativa (para pegar URLs externas)
- Al seleccionar archivo, convertirlo a base64 con `FileReader.readAsDataURL()` y actualizar `content.url`
- Aplicar este componente en los bloques `image`, `logo` y `video` (para thumbnail)

**Detalles técnicos:**
- Se usa base64 porque no hay backend de storage conectado; si se conecta Supabase Storage en el futuro, se puede cambiar a upload real
- El componente soportará drag & drop de archivos sobre el área de upload
- Se mostrará preview de la imagen seleccionada con opción de cambiar/eliminar

### Archivos a modificar
| Archivo | Cambio |
|---|---|
| `src/components/email-editor/PropertiesPanel.tsx` | Agregar componente `ImageUpload` y usarlo en bloques image, logo y video |

