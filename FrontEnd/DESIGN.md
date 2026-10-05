# DESIGN: Premium Tattoo

**Lectura del encargo**: portfolio de un estudio de tatuaje local, para clientes de Palma y visitantes que buscan black & grey. Lenguaje editorial oscuro, guiado por la imagen, con tipografía condensada y movimiento contenido.

Diales (design-taste-frontend): VARIANCE 7, MOTION 5, DENSITY 3. Es una galería, y el protagonismo lo tienen los tatuajes.

## De dónde sale la dirección

- **Material real**: el logo del estudio es un escudo negro con "PREMIUM" en champán y "TATTOO" en blanco, en letra alta y condensada. Casi todo el trabajo publicado es black & grey sobre fondos oscuros, con algunas piezas a color: rojos, morados y el Gengar. La hipótesis inicial (negro tinta, blanco cálido y un acento de su identidad) se confirma, y el acento sale del propio logo.
- **Sistema de referencia de [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)**: **Bugatti**. Se adaptan su monocromo estricto, en el que el color lo ponen las fotos, la tipografía display en mayúsculas sin negritas de relleno, las esquinas a 0 salvo en los botones píldora y la base de espaciado de 4 px. Se toma también de **Runway** la rejilla editorial de imágenes de distintos tamaños. No se copia ningún componente.
- **Referencias estudiadas**:

| Referencia | Patrón adoptado | Qué se evita |
| --- | --- | --- |
| Monolith Studio | Imagen grande y jerarquía editorial. Artistas con estilos y enlace a Instagram. Una única llamada a la acción repetida de forma coherente | 3D, audio ambiente y scroll suave pesado |
| Lass Tattoo | La consulta siempre a mano (CTA en la cabecera). Unir trabajo, artista y solicitud | Titulares como imagen o SVG: aquí todo es texto real |
| Perfection Laboratory | Composición de revista: titulares grandes y bloques de información con línea lateral (`.facts`) | Parallax excesivo y arquitectura de 15 páginas: aquí es una sola página |
| The Cove Spa | Contacto y horario agrupados y fáciles de encontrar, con enlaces directos a Maps y a la ruta | Carrusel en portada y menú de 8 o más elementos |

## Paleta

| Token | Valor | Uso |
| --- | --- | --- |
| `--ink` | `#0e0d0c` | Fondo de página. Negro tinta: no es negro puro |
| `--ink-2` / `--ink-3` | `#161513` / `#201e1b` | Paneles y fondo mientras cargan las imágenes |
| `--line` / `--line-strong` | `#34312c` / `#76716a` | Separadores decorativos / bordes de controles (chips, campos, botones redondos: 4,0:1 sobre tinta, 3,8:1 sobre panel) |
| `--paper` | `#f1ede6` | Texto principal (≈16:1 sobre el fondo) |
| `--muted` | `#c4bdb1` | Texto secundario (10,4:1 sobre tinta, 9,8:1 sobre panel) |
| `--accent` | `#b3a27f` | Champán muestreado del logo: CTA principal, etiquetas y subrayados (≈8:1) |
| `--accent-strong` | `#cbbb94` | Hover y anillo de foco |
| `--error` | `#ff9a8a` | Errores de formulario (≈8:1) |

Hay un solo acento en toda la página. Es un tema oscuro único (`color-scheme: dark`): la identidad del estudio es negra y una versión clara la diluiría.

## Tipografía

- **Display**: Archivo Variable con eje de anchura (`font-stretch: 68%`), peso 800, en mayúsculas. Recuerda a la rotulación alta del logo sin imitarla. Se usa en titulares, nombres de artistas, menú móvil y numeración de los pasos.
- **Texto**: Geist Variable, en 400, 500 y 600.
- Ambas fuentes están autoalojadas en `public/fonts/` (copiadas de `@fontsource-variable`), con `font-display: swap`. El latín de Archivo se precarga porque el titular de portada es el elemento LCP en móvil. Sin serif: el encargo no la justifica.
- **Escala fluida**:

| Paso | Rango | Uso |
| --- | --- | --- |
| `--step--1` | 0,82–0,88 rem | Etiquetas |
| `--step-0` | 1–1,08 rem | Texto |
| `--step-1` | 1,2–1,45 rem | Entradillas |
| `--step-2` | 1,6–2,3 rem | Subtítulos y citas |
| `--step-3` | 2,4–4,4 rem | H2 |
| `--step-4` | 2,7–4,4 rem | H1 |

- `text-wrap: balance` en titulares y `pretty` en párrafos. Comillas tipográficas y "…".
- Solo hay una etiqueta pequeña tipo "eyebrow", en la portada. Las secciones llevan su título sin etiqueta encima.

## Espaciado y layout

- La base es de 4 px.
- **Escala de espaciado**:

| Token | Valor |
| --- | --- |
| `--space-1` | 0,5 rem |
| `--space-2` | 1 rem |
| `--space-3` | 1,5 rem |
| `--space-4` | 2,5 rem |
| `--space-5` | 4 rem |
| Entre secciones | 4,5–9 rem |

- El contenedor mide como máximo 1360 px, con un margen lateral `--gutter` de 16 a 48 px. Respeta las áreas seguras (`env(safe-area-inset-*)`).
- **Familias de layout**, una por sección:

| Sección | Layout |
| --- | --- |
| Portada | Dividida, con la imagen a sangre por la derecha |
| Trabajos | Cuadrícula de proporción fija 4:5 (2 / 3 / 4 columnas). Las filas cierran limpias y la última se centra. El alto se conoce antes de cargar, así que no hay CLS. En móvil se ven 6 piezas y "Ver N trabajos más". La foto completa, sin recorte, se abre en el lightbox |
| Artistas | 3 columnas en escritorio (2 en tablet, 1 en móvil), con foto 4:5 que no se repite en la galería |
| Estudio | Mapa estático oscuro (OpenStreetMap) enlazado a Google Maps, junto a los datos |
| Footer | Navegación, Instagram de los tres artistas, teléfono, enlaces legales y aviso de propuesta |
| Artistas | Filas índice imagen y texto |
| Estudio | Dividida, con los datos en `<dl>` |
| Cita | Tres pasos en fila y un panel con formulario |
| Preguntas | Columna con título y acordeón |
| Opiniones | Citas grandes en dos columnas |
| Contacto | Tres bloques |

## Botones y controles

- **Botones**: píldora (`999px`), de 48 px de alto (44 px el pequeño). El principal va en champán con texto tinta y el secundario es fantasma, con borde `paper/45%`. Al pasar el cursor suben 1 px y al pulsar se reducen a `scale(0.98)`.
- **Resto de controles**: todo lo demás tiene esquinas a 0, incluidos imágenes, paneles y campos. Los filtros son chips píldora con `aria-pressed`; el activo se invierte a papel sobre tinta.
- **Enlaces de texto**: subrayado champán de 1 px, con ↗ para los externos y aviso oculto "se abre en otra pestaña".
- **Foco**: `:focus-visible` con un anillo de 2 px en `--accent-strong`. Todas las zonas táctiles miden 44 px o más.
- **Una intención por llamada a la acción**:

| Intención | Etiquetas | Destino |
| --- | --- | --- |
| Consultar | "Consultar mi tattoo" (cabecera) y "Cuéntanos tu idea" (portada). Ambas las pide el encargo | `#cita` |
| Ver trabajo | "Ver trabajos" | `#trabajos` |
| Contacto directo | "Escribir por Instagram" y "Llamar al estudio" | Instagram y teléfono |

## Tratamiento de imágenes

- **Sin filtros, sin duotono y sin recortar en el portfolio**: se respeta la proporción original para conservar colores y detalles. Solo en la ficha de artista y en la sección Estudio se recorta con `object-fit: cover`.
- **Cada pieza tiene su propia foto** en la galería, y las fichas de artista y la sección Estudio no repiten ninguna (comprobado en `check:e2e`). La portada y el águila de la galería usan el mismo archivo.
- **Placeholder**: mientras carga, cada imagen muestra su color medio fundido al 65 % con el fondo. Es discreto, sin desenfoque, y lo genera `npm run images`.
- **Formato**: WebP en 480, 720, 960, 1280, 1600 y 2000 px (nunca por encima del original), con `srcset`, `sizes` calculado para el ancho real de cada pieza, `width`/`height` explícitos (contra el CLS), `loading="lazy"` y `fetchpriority="high"` únicamente en la imagen de portada. Las 3 primeras piezas de la galería se cargan en eager con prioridad baja para no competir con la portada.
- **Límite conocido**: seis portadas de reel solo existen a 540 px (o 480 y 720); en pantallas retina grandes se sirven a su tamaño máximo. Hace falta el original en alta del estudio.
- **Leyendas** debajo de la imagen, fuera de ella, con título y artista. No hay etiquetas superpuestas.
- **Ampliación**: `<dialog>` modal con flechas del teclado, Escape, botones de 48 px y devolución del foco al cerrar. El orden respeta el filtro activo.

## Movimiento

- **Curva**: `cubic-bezier(0.16, 1, 0.3, 1)` en todas las transiciones. Solo se animan `transform` y `opacity`, y nunca con `transition: all`.
- **Animaciones**:

| Elemento | Animación | Duración |
| --- | --- | --- |
| Imagen de portada | Escala de 1,04 a 1, sin fundido (se pinta opaca desde el primer fotograma, por el LCP) | 1,2 s |
| Textos de portada | Desplazamiento de 16 px escalonado, sin fundido | 60 ms entre elementos |
| Bloques al hacer scroll | Desplazamiento de 28 px ligado a la posición de scroll (`animation-timeline: view()`, solo `transform`). El contenido es visible siempre: sin JavaScript, sin soporte del navegador, al saltar a un ancla o con movimiento reducido | Mientras el bloque entra |
| Menú móvil | Escalonado | 40 ms entre enlaces |

- `prefers-reduced-motion: reduce` desactiva todo y muestra el contenido sin animación. Incluye `scroll-behavior: smooth`, las View Transitions del filtro y la aparición al hacer scroll, que ahora solo afecta a 4 elementos: las 3 fichas de artista y el mapa.
- **Navegadores**: en Firefox, sin `animation-timeline`, el contenido se ve estático; en WebKit (Safari) se anima. Ambos están comprobados en `check:e2e`.
- **Móvil**: el menú incluye "Escribir por Instagram" y "Llamar al estudio". Una barra fija inferior con esos dos botones aparece al pasar la portada y se oculta mientras se escribe en un campo o con el menú abierto.
- **CSS en módulos** (`src/styles/`): `base`, `header`, `hero`, `works`, `sections`, `footer` y `motion`, todos por debajo de 800 líneas.
- **Rendimiento**: nada de `backdrop-filter`, `mix-blend-mode`, filtros ni capas de grano a pantalla completa. La cabecera fija es un color sólido y el fondo negro del logo se integra en la propia imagen.
- **Anclas**: el contenido de cada sección queda a ~35 px bajo la cabecera (`scroll-margin-top` en `.section`).

## Responsive

| Ancho | Comportamiento |
| --- | --- |
| < 360 px | Se oculta el CTA de la cabecera (la portada mantiene "Cuéntanos tu idea") |
| < 520 px | Solo el escudo del logo, sin el nombre en texto |
| < 560 px | Trabajos en 1 columna |
| < 900 px | La portada pasa a imagen de fondo con degradado y el texto abajo; los CTA caben en el primer pantallazo (comprobado a 390×844). Artistas, Estudio, Preguntas y Opiniones en una columna |
| < 960 px | Menú hamburguesa a pantalla completa: aria-expanded, se cierra con Escape y bloquea el scroll del fondo |
| ≥ 1000 px | Trabajos en 3 columnas |

## Idioma

ES/EN completos, incluidos botones, formulario, errores y estados.

- **Elección del idioma**, por orden de prioridad: el parámetro `?lang=`, la preferencia guardada (localStorage, con try/catch) y por último `navigator.languages` (es/ca → español; el resto, inglés).
- **Datos a medida**: las fechas se formatean con `Intl.DateTimeFormat`, y los nombres propios y la marca llevan `translate="no"`.
- **HTML prerenderizado** en español durante el build: el contenido es legible sin JavaScript. Los visitantes en inglés ven un instante el español antes de que se vuelva a renderizar; en producción se puede evitar generando `/en/` estático.
