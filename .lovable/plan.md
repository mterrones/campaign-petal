

## Plan: Editor de Email completo estilo Mailchimp

El editor actual tiene drag & drop basico con 6 tipos de bloques y propiedades limitadas. Falta mucho para igualar Mailchimp. Este plan cubre todas las funcionalidades faltantes.

---

### 1. Nuevos tipos de bloques

Agregar los bloques que Mailchimp ofrece y que faltan:

- **Spacer** - espaciador con altura configurable
- **Social** - iconos de redes sociales (Facebook, Instagram, X, LinkedIn, YouTube) con URLs editables
- **Footer** - bloque de pie con texto legal, enlace de baja, direccion fisica
- **Video** - embed de video (thumbnail con link a YouTube/Vimeo)
- **HTML personalizado** - bloque de codigo HTML libre
- **Logo/Header** - bloque de logo con nombre de empresa
- **Menu/Nav** - barra de navegacion con enlaces horizontales

### 2. Propiedades avanzadas por bloque

Actualmente solo se edita texto, URL y alineacion. Agregar:

- **Heading**: selector de nivel (H1-H4), color de texto, font-size, font-family, negrita/italica, padding
- **Text**: editor rich-text basico (negrita, italica, links, listas), color, font-size, line-height, padding
- **Image**: ancho (%), border-radius, link al hacer click, caption, alineacion, padding, alt text
- **Button**: color de fondo, color de texto, border-radius, ancho (auto/full), font-size, padding, estilo (filled/outline/pill)
- **Divider**: estilo de linea (solid/dashed/dotted), color, grosor, ancho (%), padding
- **Columns**: selector de layout (50/50, 33/33/33, 70/30, 30/70, 25/50/25), padding, gap, color de fondo por columna
- **Spacer**: altura en px
- **Social**: seleccion de redes, estilo de iconos (color/monocromo/outlined), tamaño, alineacion
- **Footer**: texto editable, mostrar/ocultar link de baja, color de texto
- **Video**: URL del video, thumbnail, texto del boton de play

### 3. Estilos globales del email

Panel de configuracion global (nuevo tab o seccion):

- **Color de fondo** del body y del contenedor
- **Font-family** global (Google Fonts: Inter, Roboto, Open Sans, etc.)
- **Ancho del email** (500-700px)
- **Padding general**
- **Color de enlaces** global
- **Preheader text** (texto oculto que aparece en la preview del inbox)
- **Nombre del remitente** y email de respuesta

### 4. Duplicar bloques

Boton para duplicar cualquier bloque (top-level o inner) con un click.

### 5. Undo/Redo (Ctrl+Z / Ctrl+Y)

Historial de cambios con stack de estados para deshacer/rehacer acciones.

### 6. Plantillas prediseñadas

Selector de plantillas al iniciar (Newsletter, Promocion, Bienvenida, Evento, Transaccional) que precarga bloques.

### 7. Vista previa mobile/desktop

Toggle en la vista previa para simular ancho mobile (375px) vs desktop (600px).

### 8. Exportar HTML

Boton para generar y copiar/descargar el HTML del email listo para enviar.

### 9. Editor inline en el canvas

Click en un texto/heading para editar directamente en el canvas (contentEditable), sin tener que ir al panel lateral.

### 10. Mejoras de UX del drag & drop

- Indicador visual mejorado al arrastrar (ghost preview del bloque)
- Animacion de reordenamiento suave
- Tooltip en hover de cada bloque del sidebar mostrando preview

---

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/pages/EmailEditor.tsx` | Refactorizacion completa: extraer componentes, agregar todos los bloques, propiedades, estilos globales, undo/redo, templates, export HTML, inline editing |
| `src/components/email-editor/BlockRenderer.tsx` | Nuevo - renderizado de cada tipo de bloque |
| `src/components/email-editor/PropertiesPanel.tsx` | Nuevo - panel de propiedades avanzado |
| `src/components/email-editor/BlockSidebar.tsx` | Nuevo - sidebar de bloques arrastrables |
| `src/components/email-editor/GlobalStyles.tsx` | Nuevo - panel de estilos globales |
| `src/components/email-editor/TemplateSelector.tsx` | Nuevo - selector de plantillas |
| `src/components/email-editor/types.ts` | Nuevo - tipos e interfaces |
| `src/components/email-editor/templates.ts` | Nuevo - datos de plantillas |
| `src/components/email-editor/useEmailEditor.ts` | Nuevo - hook con logica, undo/redo, drag state |
| `src/components/email-editor/htmlExport.ts` | Nuevo - generador de HTML exportable |

### Complejidad

Este es un cambio grande. El archivo actual de 743 lineas se refactorizara en ~8-10 archivos modulares. Se estima ~2000-2500 lineas totales de codigo nuevo.

