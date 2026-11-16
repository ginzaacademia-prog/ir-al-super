# Ir al Super

App para el celular: cargás cada producto a medida que lo metés al carrito, con su precio y foto, y el total se suma solo. Guarda el historial de precios y te muestra cuánto gastaste cada mes.

Es una web app instalable (PWA): se abre desde el navegador, se agrega a la pantalla de inicio y funciona sin internet. Todo queda guardado en el celular.

## Funciones

**Compra**
- Empezás una compra eligiendo el súper (opcional) y un presupuesto (opcional)
- Agregás productos con nombre, categoría, cantidad o kilos, precio y fotos (cámara o galería)
- Total en vivo, subtotal por categoría y barra de presupuesto
- Filtro por categoría
- Tildás lo que ya está en el carrito; lo que falta se muestra aparte
- Promociones por producto: 2x1, 3x2, 2da unidad con % off, % de descuento
- Descuento en el total (banco, billetera, jubilados) con tope de reintegro
- Compartir la lista por WhatsApp
- Al finalizar, cargás el total del ticket para ver si te cobraron bien

**Productos**
- Catálogo con todo lo que compraste: foto, marca, presentación, código de barras y notas
- Recuerda el último precio y el anterior, con cuánto subió o bajó
- Historial de precios con gráfico; podés cargar un precio nuevo a mano
- Comparación entre súpers: dónde está más barato
- Buscador, filtro por categoría y orden (A–Z, más comprados, recientes)
- Escaneo de código de barras (Chrome en Android; en iPhone se escribe a mano)
- Lectura del precio con la cámara (OCR, necesita internet la primera vez)
- "Lo que comprás seguido" para agregar con un toque

**Mis gastos**
- Total por mes, comparación con el mes anterior, ticket promedio y ahorro
- Gráfico de los últimos 6 meses y gasto por categoría
- Botón **Ver desglose del mes**: por categoría (con cada producto), por súper, todos los productos y todas las compras
- Detalle de cada compra: repetirla, reabrirla, editar súper o fecha, borrarla
- Presupuesto mensual

**Ajustes**
- Tema claro, oscuro o automático
- Exportar e importar una copia (con fotos), borrar todo

## Publicarla
En GitHub: **Settings → Pages → Deploy from a branch**, rama `main` y carpeta `/ (root)`. Queda en `https://<usuario>.github.io/<repo>/`.

## Archivos
- `index.html`: la estructura de la app
- `styles.css`: el diseño
- `app.js`: toda la lógica
- `manifest.webmanifest` y `icons/`: nombre e íconos para instalarla
- `sw.js`: guarda la app para usarla sin conexión
