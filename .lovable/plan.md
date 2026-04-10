

## Plan: Optimizar HTML export para compatibilidad con clientes de correo

### Problema actual
El HTML generado usa elementos y propiedades CSS que no son compatibles con clientes como Outlook, Gmail, Yahoo Mail y otros. Principales problemas:
- `<div>` en lugar de tablas (Outlook no los soporta bien)
- `border-radius` no funciona en Outlook
- `<hr>` inconsistente entre clientes
- Preheader text dentro de `<head>` (debe ir en `<body>`)
- `<style>` block limitado en Gmail (lo elimina)
- Spacer con `height` en div (inconsistente)
- Botones con `<a>` sin soporte VML para Outlook
- Falta de MSO conditionals para Outlook
- `max-width` no funciona en Outlook

### Cambios en `src/components/email-editor/htmlExport.ts`

**1. Estructura general del documento**
- Agregar `xmlns` y condicionales MSO (`<!--[if mso]>`) para fijar ancho en Outlook
- Mover preheader text al `<body>` (no `<head>`)
- Agregar CSS reset completo para email (normalize entre clientes)
- Usar `bgcolor` attribute además de `background-color` inline

**2. Todos los bloques: reemplazar `<div>` por tablas**
- Cada bloque se envuelve en `<table width="100%"><tr><td>...</td></tr></table>`
- Esto asegura layout consistente en Outlook y clientes antiguos

**3. Heading y Text**
- Agregar `mso-line-height-rule:exactly` para line-height
- Usar font-family con fallbacks web-safe

**4. Image**
- Quitar `border-radius` (no soportado en Outlook) o dejarlo como progressive enhancement
- Agregar `border="0"` al `<img>` para evitar bordes en enlaces
- Agregar `width` y `height` attributes en el tag HTML

**5. Button (bulletproof button)**
- Implementar patrón "bulletproof button" con padding en `<td>` + `<a>` con estilos inline
- Agregar condicional VML para Outlook que renderiza el botón correctamente

**6. Divider**
- Reemplazar `<hr>` por tabla con borde superior en celda (más consistente)

**7. Spacer**
- Usar `<td height="X" style="font-size:Xpx;line-height:Xpx;">` en lugar de div con height

**8. Columns**
- Agregar MSO conditional para ancho fijo en columnas
- Usar `role="presentation"` en tablas

**9. Footer / Logo / Menu**
- Envolver en tablas en lugar de divs
- Asegurar todos los estilos inline

**10. CSS Reset en `<head>`**
- Agregar estilos de reset para Yahoo, Outlook.com, Gmail
- `-webkit-text-size-adjust:100%`, `-ms-text-size-adjust:100%`
- Reset de `table` y `td` spacing

### Resultado
HTML que funciona correctamente en: Gmail (web/app), Outlook (2007-2023, 365, web), Apple Mail, Yahoo Mail, Samsung Mail, y clientes móviles.

