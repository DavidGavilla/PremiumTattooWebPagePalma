# Premium Tattoo: propuesta web

Propuesta de diseño para [Premium Tattoo](https://www.instagram.com/premium__tattoo/), el estudio de tatuajes de Santino Bartoli en la Plaça de Sant Antoni, 1, en Palma. **No es la web oficial del negocio**: está pendiente de revisión y de permisos, y se publicará después de que el estudio la apruebe. Además, la página lleva `noindex`.

## Ver en local

```bash
cd frontend
npm install
npm run dev          # http://localhost:5175   (inglés: http://localhost:5175/?lang=en)
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto **5175** (`strictPort`) |
| `npm run build` | Comprobación de tipos (`tsc`, strict) y build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` en el puerto 5175 |
| `npm run typecheck` | Solo TypeScript |
| `npm run images` | Regenera los WebP de `public/images/` a partir de `media/originals/` |
| `npm run map` | Vuelve a generar el mapa estático de la Plaça de Sant Antoni (OpenStreetMap). Después hay que ejecutar `npm run images` |
| `npm run check:e2e` | Pruebas con Playwright en Chromium, Firefox y WebKit, a 375, 390, 768 y 1440 px (requiere `npm run dev` en marcha). Guarda capturas en `frontend/screenshots/` (por sección en `sections/`; el estado anterior a los cambios, en `before/`) |

## Estructura

- `frontend/src/data/content.ts`: todos los datos del negocio (artistas, trabajos, horario, contacto, reseñas y FAQ) en ES/EN. Es el archivo que hay que editar para actualizar el contenido.
- `frontend/src/i18n.ts`: textos de la interfaz en ES/EN.
- `frontend/src/render.ts`: HTML. Se prerenderiza en el build y se vuelve a renderizar al cambiar de idioma.
- `frontend/src/main.ts`: comportamiento (menú, filtros, ampliación de imágenes, idioma).
- `frontend/src/consult.ts`: consulta guiada.
- `frontend/src/style.css`: punto de entrada de los estilos, organizados en módulos en `src/styles/`.
- `frontend/src/legal.ts` y `frontend/{aviso-legal,privacidad,cookies}.html`: plantillas legales, **pendientes de revisión**.
- `frontend/DESIGN.md`: dirección visual.
- `frontend/FUENTES.md`: fuentes y estado de cada dato.
- `frontend/IMAGENES.md`: origen, autoría y permisos de cada imagen.

## Cómo funciona la consulta

No hay un destino autorizado para formularios ni una plataforma de reservas. Por eso, la consulta guiada (idea, zona, tamaño, fechas y artista) **solo prepara un texto**. El visitante lo copia y lo envía él mismo por Instagram, que es el canal que el estudio usa ("Cuéntanos tu idea… 📩"). La página no envía nada y nunca muestra "enviado". En la sección de cita se explica que enviar una solicitud no es tener la cita reservada.

## Pendiente del estudio antes de publicar

1. **Permisos de imágenes**:
   - Autorización del estudio y de cada artista para usar sus trabajos.
   - Consentimiento de los clientes que son reconocibles en las fotos.
   - Confirmar el autor de la pieza hannya.
2. **Material**:
   - Fotos del local (no hay ninguna publicada).
   - Retratos de los tres artistas.
   - Logo en vector.
3. **Datos**:
   - Teléfono vigente: Instagram dice 683 192 892 y Maps 626 17 86 78.
   - Significado de "Home service".
   - Si ofrecen piercing.
   - Si existe un WhatsApp del estudio.
   - Relación con Mystic Tattoo Studio y Black Lotus Tattoo, que figuran en la misma dirección.
4. **Legal**:
   - Las plantillas de aviso legal, privacidad y cookies ya existen. Hay que completar los datos entre corchetes (titular, NIF, domicilio fiscal, correo, plazo de conservación) y que un profesional revise el texto.
   - Si el formulario pasa a enviar datos, también habrá que redactar la política de privacidad correspondiente.
5. **Producción**:
   - Dominio.
   - URLs absolutas para Open Graph, `canonical` y `hreflang`.
   - Quitar `noindex`.
   - Opcionalmente, generar `/en/` estático.
